import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import { Button, Card, Container } from '@/components/ui'
import { borderRadius, colors, iconSize, spacing, typography, withOpacity } from '@/constants/design'
import type { QuizSessionResult } from '@/types/quiz'

export function ResultView({ isDark, result, onRestart, onHome, onLeaderboard }: { isDark: boolean; result: (QuizSessionResult & { message: string }) | null; onRestart: () => void; onHome: () => void; onLeaderboard: () => void }) {
  if (!result) return null
  const ratio = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0
  const cardStyle = StyleSheet.flatten([styles.card, { backgroundColor: isDark ? colors.backgroundDarkSecondary : colors.background }])

  return (
    <Container safeArea padding="lg" backgroundColor={isDark ? colors.backgroundDark : colors.backgroundSecondary}>
      <View style={styles.wrapper}>
        <View style={styles.hero}>
          <View style={[styles.iconWrap, { backgroundColor: withOpacity(colors.success, 0.14) }]}>
            <Ionicons name="ribbon" size={iconSize.xl} color={colors.successDark} />
          </View>
          <Text style={[styles.title, { color: isDark ? colors.textDark : colors.text }]}>Нәтиже</Text>
          <Text style={[styles.subtitle, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>{result.message}</Text>
        </View>

        <Card variant="elevated" style={cardStyle}>
          <Card.Content>
            <View style={styles.metricRow}>
              <Metric label="Ұпай" value={String(result.score)} isDark={isDark} />
              <Metric label="Дұрыс" value={`${result.correct}/${result.total}`} isDark={isDark} />
              <Metric label="Дәлдік" value={`${ratio}%`} isDark={isDark} />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button fullWidth size="lg" onPress={onRestart}>Қайта ойнау</Button>
          <Button fullWidth size="lg" variant="secondary" onPress={onLeaderboard}>Leaderboard</Button>
          <Button fullWidth size="lg" variant="outline" onPress={onHome}>Басты бет</Button>
        </View>
      </View>
    </Container>
  )
}

function Metric({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color: isDark ? colors.textDark : colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.sm },
  iconWrap: { width: 72, height: 72, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, textAlign: 'center' },
  card: { borderRadius: borderRadius.xxl },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { ...typography.h2, marginBottom: spacing.xs },
  metricLabel: { ...typography.caption },
  actions: { gap: spacing.md },
})