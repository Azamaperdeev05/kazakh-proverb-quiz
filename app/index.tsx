import { useColorScheme } from 'react-native'
import { HomeView } from '@/components/quiz/HomeView'
import { GameView } from '@/components/quiz/GameView'
import { ResultView } from '@/components/quiz/ResultView'
import { useQuizGame } from '@/hooks/useQuizGame'

export default function HomeScreen() {
  const systemScheme = useColorScheme()
  const {
    storedState,
    screen,
    mode,
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
    startGame,
    submitAnswer,
    nextQuestion,
    goHome,
    useHint,
  } = useQuizGame()

  const preferredTheme = storedState?.settings.preferredTheme ?? 'system'
  const isDark = preferredTheme === 'system' ? systemScheme === 'dark' : preferredTheme === 'dark'

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
        onSubmit={submitAnswer}
        onNext={nextQuestion}
        onUseHint={useHint}
        hint={storedState?.settings.inputHints ? revealedHint : null}
        options={multipleChoiceOptions}
      />
    )
  }

  if (screen === 'result') {
    return <ResultView isDark={isDark} result={result} onRestart={() => startGame(mode)} onHome={goHome} />
  }

  return (
    <HomeView
      isDark={isDark}
      state={storedState}
      selectedMode={mode}
      onSelectMode={setMode}
      onStart={() => startGame(mode)}
    />
  )
}
