import { useEffect, useMemo, useRef, useState } from 'react'
import { PROVERBS, TOTAL_PROVERBS } from '@/data/proverbs'
import { getStoredState, saveSessionResult, updateSettings } from '@/services/quizStorage'
import type { AppScreen, GameMode, ProverbItem, QuizSessionResult, StoredQuizState, ThemePreference } from '@/types/quiz'
import { getHintText, getPerformanceMessage, getQuestionsForMode, isAcceptedInput, normalizeText, shuffleArray } from '@/utils/quiz'

const MODE_LABELS: Record<GameMode, string> = {
  multiple_choice: 'Таңдау',
  input: 'Енгізу',
  time_attack: '30 секунд',
  daily: 'Күнделікті сынақ',
}

export function useQuizGame() {
  const [storedState, setStoredState] = useState<StoredQuizState | null>(null)
  const [screen, setScreen] = useState<AppScreen>('home')
  const [mode, setMode] = useState<GameMode>('multiple_choice')
  const [questions, setQuestions] = useState<ProverbItem[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; message: string } | null>(null)
  const [revealedHint, setRevealedHint] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [startedAt, setStartedAt] = useState<number>(0)
  const [result, setResult] = useState<(QuizSessionResult & { message: string }) | null>(null)
  const finishedRef = useRef(false)

  const refreshStoredState = async () => {
    const next = await getStoredState()
    setStoredState(next)
    if (screen === 'home') setMode(next.settings.lastMode)
    return next
  }

  useEffect(() => {
    void refreshStoredState()
  }, [])

  useEffect(() => {
    if (screen !== 'game' || mode !== 'time_attack') return
    if (timeLeft <= 0) {
      void finishSession()
      return
    }

    const timer = setTimeout(() => setTimeLeft((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [screen, mode, timeLeft])

  const currentQuestion = questions[index] ?? null

  const stats = useMemo(() => {
    const progress = storedState?.progress
    const recentResults = storedState?.recentResults ?? []
    const accuracyRate = progress?.totalAnswered ? progress.totalCorrect / progress.totalAnswered : 0
    const averageScore = recentResults.length
      ? recentResults.reduce((sum, entry) => sum + entry.score, 0) / recentResults.length
      : 0

    return {
      accuracyRate,
      averageScore,
      learnedCount: progress?.learnedIds.length ?? 0,
      completionRate: TOTAL_PROVERBS ? (progress?.learnedIds.length ?? 0) / TOTAL_PROVERBS : 0,
      gamesPlayed: progress?.gamesPlayed ?? 0,
      streakDays: progress?.streakDays ?? 0,
      bestStreak: progress?.bestStreak ?? 0,
      totalPlayTimeMs: progress?.totalPlayTimeMs ?? 0,
      perModeBestScores: storedState?.perModeBestScores ?? { multiple_choice: 0, input: 0, time_attack: 0, daily: 0 },
    }
  }, [storedState])

  const leaderboardOverall = storedState?.leaderboard ?? []
  const leaderboardRecent = storedState?.recentResults ?? []
  const getModeLeaderboard = (targetMode: GameMode) => leaderboardOverall.filter((entry) => entry.mode === targetMode)

  const startGame = async (nextMode: GameMode) => {
    finishedRef.current = false
    const queue = getQuestionsForMode(PROVERBS, nextMode)
    setMode(nextMode)
    setQuestions(queue)
    setIndex(0)
    setScore(0)
    setCorrectCount(0)
    setInputValue('')
    setFeedback(null)
    setRevealedHint(null)
    setTimeLeft(30)
    setStartedAt(Date.now())
    setScreen('game')
    const nextState = await updateSettings({ lastMode: nextMode })
    setStoredState(nextState)
  }

  const navigateTo = (nextScreen: AppScreen) => {
    setScreen(nextScreen)
    if (nextScreen !== 'game') {
      setFeedback(null)
      setInputValue('')
      setRevealedHint(null)
    }
  }

  const goHome = async () => {
    finishedRef.current = false
    await refreshStoredState()
    navigateTo('home')
  }

  const nextQuestion = () => {
    if (mode !== 'time_attack' && index >= questions.length - 1) {
      void finishSession()
      return
    }

    setIndex((value) => (mode === 'time_attack' ? value + 1 : Math.min(value + 1, questions.length - 1)))
    setInputValue('')
    setFeedback(null)
    setRevealedHint(null)
  }

  const submitAnswer = (answer: string) => {
    if (!currentQuestion || feedback) return null
    const value = normalizeText(answer)
    if (!value) {
      setFeedback({ type: 'wrong', message: 'Жауапты бос қалдырмаңыз.' })
      return { correct: false }
    }

    const isCorrect = mode === 'input'
      ? isAcceptedInput(value, currentQuestion.answer)
      : normalizeText(currentQuestion.answer) === value

    const speedBonus = mode === 'time_attack' ? Math.max(0, Math.ceil(timeLeft / 3)) : 0
    const gained = isCorrect ? 10 + speedBonus : 0

    setScore((prev) => prev + gained)
    setCorrectCount((prev) => prev + (isCorrect ? 1 : 0))
    setFeedback({
      type: isCorrect ? 'correct' : 'wrong',
      message: isCorrect ? `Дұрыс! +${gained} ұпай` : `Дұрыс жауап: ${currentQuestion.answer}`,
    })

    if (mode === 'time_attack') {
      setTimeout(() => {
        if (timeLeft <= 1 || index >= questions.length - 1) void finishSession(isCorrect, gained)
        else nextQuestion()
      }, 650)
    }

    return { correct: isCorrect, gained }
  }

  const finishSession = async (lastCorrect = false, lastGain = 0) => {
    if (finishedRef.current) return
    finishedRef.current = true
    const total = mode === 'time_attack' ? Math.min(index + (feedback ? 1 : 0), questions.length) : questions.length
    const finalScore = score + (feedback ? 0 : lastGain)
    const finalCorrect = correctCount + (feedback ? 0 : (lastCorrect ? 1 : 0))
    const payload: QuizSessionResult = {
      mode,
      score: finalScore,
      correct: finalCorrect,
      total,
      answeredIds: questions.slice(0, total).map((item) => item.id),
      durationMs: Date.now() - startedAt,
    }

    const nextState = await saveSessionResult(payload)
    setStoredState(nextState)
    setResult({ ...payload, message: getPerformanceMessage(finalScore, total > 0 ? finalCorrect / total : 0) })
    setScreen('result')
  }

  const useHint = () => {
    if (!currentQuestion || !storedState?.settings.inputHints) return
    setRevealedHint(getHintText(currentQuestion.answer))
  }

  const updateAppSettings = async (patch: Partial<StoredQuizState['settings']>) => {
    const next = await updateSettings(patch)
    setStoredState(next)
  }

  const setThemePreference = (preferredTheme: ThemePreference) => updateAppSettings({ preferredTheme })
  const toggleSound = (soundEnabled: boolean) => updateAppSettings({ soundEnabled })
  const toggleHaptics = (hapticsEnabled: boolean) => updateAppSettings({ hapticsEnabled })
  const toggleHints = (inputHints: boolean) => updateAppSettings({ inputHints })

  return {
    storedState,
    screen,
    mode,
    modeLabels: MODE_LABELS,
    currentQuestion,
    questionNumber: index + 1,
    totalQuestions: questions.length,
    score,
    inputValue,
    setInputValue,
    feedback,
    timeLeft,
    revealedHint,
    multipleChoiceOptions: currentQuestion ? shuffleArray(currentQuestion.options) : [],
    result,
    stats,
    leaderboardOverall,
    leaderboardRecent,
    getModeLeaderboard,
    refreshStoredState,
    navigateTo,
    startGame,
    setMode,
    submitAnswer,
    nextQuestion,
    goHome,
    useHint,
    setThemePreference,
    toggleSound,
    toggleHaptics,
    toggleHints,
  }
}