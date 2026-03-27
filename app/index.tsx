import { useColorScheme } from 'react-native'
import { LeaderboardView } from '@/components/quiz/LeaderboardView'
import { ProfileView } from '@/components/quiz/ProfileView'
import { SettingsView } from '@/components/quiz/SettingsView'
import { HomeView } from '@/components/quiz/HomeView'
import { GameView } from '@/components/quiz/GameView'
import { ResultView } from '@/components/quiz/ResultView'
import { useQuizGame } from '@/hooks/useQuizGame'
import { playQuizFeedback } from '@/services/quizFeedback'
import type { GameMode } from '@/types/quiz'
import { useState } from 'react'

export default function HomeScreen() {
  const systemScheme = useColorScheme()
  const {
    storedState,
    screen,
    mode,
    modeLabels,
    setMode,
    currentQuestion,
    questionNumber,
    totalQuestions,
    score,
    inputValue,
    setInputValue,
    feedback,
    timeLeft,
    revealedHint,
    multipleChoiceOptions,
    result,
    stats,
    leaderboardOverall,
    leaderboardRecent,
    getModeLeaderboard,
    navigateTo,
    startGame,
    submitAnswer,
    nextQuestion,
    goHome,
    useHint,
    setThemePreference,
    toggleSound,
    toggleHaptics,
    toggleHints,
  } = useQuizGame()

  const preferredTheme = storedState?.settings.preferredTheme ?? 'system'
  const isDark = preferredTheme === 'system' ? systemScheme === 'dark' : preferredTheme === 'dark'
  const [leaderboardFilter, setLeaderboardFilter] = useState<'overall' | 'recent' | GameMode>('overall')

  const handleSubmit = async (value: string) => {
    const outcome = submitAnswer(value)
    if (!outcome || !storedState) return
    await playQuizFeedback(outcome.correct ? 'correct' : 'wrong', storedState.settings.soundEnabled, storedState.settings.hapticsEnabled)
  }

  const leaderboardRows = leaderboardFilter === 'overall'
    ? leaderboardOverall
    : leaderboardFilter === 'recent'
      ? leaderboardRecent
      : getModeLeaderboard(leaderboardFilter)

  if (screen === 'game') {
    return (
      <GameView
        isDark={isDark}
        mode={mode}
        question={currentQuestion}
        score={score}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        feedback={feedback}
        inputValue={inputValue}
        onChangeInput={setInputValue}
        onSubmit={handleSubmit}
        onNext={nextQuestion}
        onUseHint={useHint}
        hint={storedState?.settings.inputHints ? revealedHint : null}
        options={multipleChoiceOptions}
      />
    )
  }

  if (screen === 'profile') {
    return <ProfileView isDark={isDark} state={storedState} stats={stats} onBack={goHome} onOpenLeaderboard={() => navigateTo('leaderboard')} onOpenSettings={() => navigateTo('settings')} />
  }

  if (screen === 'leaderboard') {
    return <LeaderboardView isDark={isDark} active={leaderboardFilter} onChange={setLeaderboardFilter} onBack={goHome} rows={leaderboardRows} />
  }

  if (screen === 'settings') {
    return (
      <SettingsView
        isDark={isDark}
        theme={preferredTheme}
        soundEnabled={storedState?.settings.soundEnabled ?? true}
        hapticsEnabled={storedState?.settings.hapticsEnabled ?? true}
        hintsEnabled={storedState?.settings.inputHints ?? true}
        onBack={goHome}
        onThemeChange={setThemePreference}
        onToggleSound={toggleSound}
        onToggleHaptics={toggleHaptics}
        onToggleHints={toggleHints}
      />
    )
  }

  if (screen === 'result') {
    return <ResultView isDark={isDark} result={result} onRestart={() => startGame(mode)} onHome={goHome} onLeaderboard={() => navigateTo('leaderboard')} />
  }

  return (
    <HomeView
      isDark={isDark}
      state={storedState}
      selectedMode={mode}
      onSelectMode={setMode}
      onStart={() => startGame(mode)}
      onOpenProfile={() => navigateTo('profile')}
      onOpenLeaderboard={() => navigateTo('leaderboard')}
      onOpenSettings={() => navigateTo('settings')}
    />
  )
}