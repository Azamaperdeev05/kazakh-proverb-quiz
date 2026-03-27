import { useEffect, useMemo, useRef, useState } from 'react'
import { PROVERBS } from '@/data/proverbs'
import { getStoredState, saveSessionResult, updateSettings } from '@/services/quizStorage'
import type { GameMode, ProverbItem, QuizSessionResult, StoredQuizState } from '@/types/quiz'
import { getHintText, getPerformanceMessage, getQuestionsForMode, isAcceptedInput, normalizeText, shuffleArray } from '@/utils/quiz'

export function useQuizGame() {
  const [storedState, setStoredState] = useState<StoredQuizState | null>(null)
  const [screen, setScreen] = useState<'home' | 'game' | 'result'>('home')
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

  useEffect(() => {
    getStoredState().then(setStoredState)
  }, [])

  useEffect(() => {
    if (storedState && screen === 'home') {
      setMode(storedState.settings.lastMode)
    }
  }, [storedState, screen])

  useEffect(() => {
    if (screen !== 'game' || mode !== 'time_attack') return
    if (timeLeft <= 0) {
      finishSession()
      return
    }

    const timer = setTimeout(() => setTimeLeft((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [screen, mode, timeLeft])

  const currentQuestion = questions[index] ?? null

  const completionRatio = useMemo(() => {
    if (!storedState) return 0
    return storedState.progress.totalAnswered === 0
      ? 0
      : storedState.progress.totalCorrect / storedState.progress.totalAnswered
  }, [storedState])

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

  const goHome = () => {
    finishedRef.current = false
    setScreen('home')
    setFeedback(null)
    setInputValue('')
    setRevealedHint(null)
  }

  const nextQuestion = () => {
    if (mode !== 'time_attack' && index >= questions.length - 1) {
      finishSession()
      return
    }
    setIndex((value) => (mode === 'time_attack' ? value + 1 : Math.min(value + 1, questions.length - 1)))
    setInputValue('')
    setFeedback(null)
    setRevealedHint(null)
  }

  const submitAnswer = (answer: string) => {
    if (!currentQuestion || feedback) return
    const value = normalizeText(answer)
    if (!value) {
      setFeedback({ type: 'wrong', message: 'Жауапты бос қалдырмаңыз.' })
      return
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
        if (timeLeft <= 1 || index >= questions.length - 1) finishSession(isCorrect, gained)
        else nextQuestion()
      }, 650)
    }
  }

  const finishSession = async (lastCorrect = false, lastGain = 0) => {
    if (finishedRef.current) return
    finishedRef.current = true
    const total = mode === 'time_attack' ? Math.min(index + (feedback ? 1 : 0), questions.length) : questions.length
    const finalScore = score + (feedback ? 0 : lastGain)
    const finalCorrect = correctCount + (feedback ? 0 : (lastCorrect ? 1 : 0))
    const answeredIds = questions.slice(0, total).map((item) => item.id)
    const payload: QuizSessionResult = {
      mode,
      score: finalScore,
      correct: finalCorrect,
      total,
      answeredIds,
      durationMs: Date.now() - startedAt,
    }
    const nextState = await saveSessionResult(payload)
    setStoredState(nextState)
    setResult({
      ...payload,
      message: getPerformanceMessage(finalScore, total > 0 ? finalCorrect / total : 0),
    })
    setScreen('result')
  }

  const useHint = () => {
    if (!currentQuestion) return
    setRevealedHint(getHintText(currentQuestion.answer))
  }

  const multipleChoiceOptions = useMemo(() => {
    if (!currentQuestion) return []
    return shuffleArray(currentQuestion.options)
  }, [currentQuestion])

  return {
    storedState,
    screen,
    mode,
    currentQuestion,
    questionNumber: index + 1,
    totalQuestions: mode === 'time_attack' ? questions.length : questions.length,
    score,
    inputValue,
    setInputValue,
    feedback,
    timeLeft,
    revealedHint,
    completionRatio,
    multipleChoiceOptions,
    result,
    startGame,
    setMode,
    submitAnswer,
    nextQuestion,
    goHome,
    useHint,
  }
}
