import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Button, Card, Container, Input } from '@/components/ui'
import { borderRadius, colors, iconSize, spacing, typography, withOpacity } from '@/constants/design'
import type { GameMode, ProverbItem } from '@/types/quiz'

export function GameView({
  isDark,
  mode,
  question,
  score,
  questionNumber,
  totalQuestions,
  timeLeft,
  feedback,
  inputValue,
  onChangeInput,
  onSubmit,
  onNext,
  onUseHint,
  hint,
  options,
}: {
  isDark: boolean
  mode: GameMode
  question: ProverbItem | null
  score: number
  questionNumber: number
  totalQuestions: number
  timeLeft: number
  feedback: { type: 'correct' | 'wrong'; message: string } | null
  inputValue: string
  onChangeInput: (value: string) => void
  onSubmit: (value: string) => void
  onNext: () => void
  onUseHint: () => void
  hint: string | null
  options: string[]
}) {
  if (!question) return null
  const feedbackColor = feedback?.type === 'correct' ? colors.success : colors.error
  const questionCardStyle = StyleSheet.flatten([styles.questionCard, { backgroundColor: isDark ? colors.backgroundDarkSecondary : colors.background }])

  return (
    <Container safeArea padding="lg" backgroundColor={isDark ? colors.backgroundDark : colors.backgroundSecondary}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.meta, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>{modeTitle(mode)}</Text>
            <Text style={[styles.progress, { color: isDark ? colors.textDark : colors.text }]}>{mode === 'time_attack' ? `Қалғаны: ${timeLeft} сек` : `${questionNumber}/${totalQuestions}`}</Text>
          </View>
          <View style={[styles.scoreChip, { backgroundColor: withOpacity(colors.primary, 0.14) }]}>
            <Ionicons name="trophy" size={iconSize.sm} color={colors.primary} />
            <Text style={[styles.scoreText, { color: colors.primaryDark }]}>{score} ұпай</Text>
          </View>
        </View>

        <Animated.View entering={FadeInDown.duration(350)} style={styles.main}>
          <Card variant="elevated" style={questionCardStyle}>
            <Card.Content>
              <Text style={[styles.promptLabel, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>Мақалды жалғастыр</Text>
              <Text style={[styles.prompt, { color: isDark ? colors.textDark : colors.text }]}>{question.start}</Text>
              {feedback && (
                <View style={[styles.feedbackBox, { backgroundColor: withOpacity(feedbackColor, 0.14) }]}>
                  <Text style={[styles.feedbackText, { color: feedbackColor }]}>{feedback.message}</Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {(mode === 'multiple_choice' || mode === 'daily' || mode === 'time_attack') ? (
            <View style={styles.optionsList}>
              {options.map((option) => (
                <Button
                  key={option}
                  variant="outline"
                  size="lg"
                  fullWidth
                  onPress={() => onSubmit(option)}
                  disabled={Boolean(feedback)}
                >
                  {option}
                </Button>
              ))}
            </View>
          ) : (
            <View style={styles.inputArea}>
              <Input
                label="Жауап"
                placeholder="Мақалдың жалғасын жазыңыз"
                value={inputValue}
                onChangeText={onChangeInput}
                clearable
                autoCapitalize="sentences"
              />
              <View style={styles.inputActions}>
                <Button variant="outline" onPress={onUseHint} leftIcon={<Ionicons name="bulb-outline" size={iconSize.md} color={colors.primary} />}>Көмек</Button>
                <Button onPress={() => onSubmit(inputValue)}>Тексеру</Button>
              </View>
              {hint ? <Text style={[styles.hint, { color: colors.warningDark }]}>Көмек: {hint}</Text> : null}
            </View>
          )}
        </Animated.View>

        {feedback ? <Button fullWidth size="lg" onPress={onNext}>{mode === 'time_attack' ? 'Жалғастыру' : 'Келесі сұрақ'}</Button> : null}
      </View>
    </Container>
  )
}

function modeTitle(mode: GameMode) {
  return ({ multiple_choice: 'Таңдау режимі', input: 'Енгізу режимі', time_attack: 'Time Attack', daily: 'Күнделікті сынақ' })[mode]
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, justifyContent: 'space-between', gap: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { ...typography.captionBold, marginBottom: spacing.xs },
  progress: { ...typography.h3 },
  scoreChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  scoreText: { ...typography.captionBold },
  main: { gap: spacing.lg },
  questionCard: { borderRadius: borderRadius.xxl },
  promptLabel: { ...typography.captionBold, marginBottom: spacing.sm },
  prompt: { ...typography.h2 },
  feedbackBox: { marginTop: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg },
  feedbackText: { ...typography.bodyBold },
  optionsList: { gap: spacing.md },
  inputArea: { gap: spacing.md },
  inputActions: { flexDirection: 'row', gap: spacing.md },
  hint: { ...typography.captionBold },
})
