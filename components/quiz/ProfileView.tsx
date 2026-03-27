import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import { Button, Card, Container } from '@/components/ui'
import { borderRadius, colors, iconSize, spacing, typography, withOpacity } from '@/constants/design'
import type { StoredQuizState } from '@/types/quiz'

export function ProfileView({ isDark, state, stats, onBack, onOpenLeaderboard, onOpenSettings }: {
  isDark: boolean
  state: StoredQuizState | null
  stats: { accuracyRate: number; averageScore: number; learnedCount: number; completionRate: number; gamesPlayed: number; streakDays: number; bestStreak: number; totalPlayTimeMs: number }
  onBack: () => void
  onOpenLeaderboard: () => void
  onOpenSettings: () => void
}) {
  const hours = Math.round(stats.totalPlayTimeMs / 60000)
  return (
    <Container safeArea padding="lg" backgroundColor={isDark ? colors.backgroundDark : colors.backgroundSecondary}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Button variant="ghost" onPress={onBack} leftIcon={<Ionicons name="arrow-back" size={iconSize.md} color={isDark ? colors.textDark : colors.text} />}>Артқа</Button>
          <Text style={[styles.title, { color: isDark ? colors.textDark : colors.text }]}>Профиль және статистика</Text>
        </View>

        <Card variant="elevated" style={StyleSheet.flatten([styles.heroCard, { backgroundColor: isDark ? colors.backgroundDarkSecondary : colors.background }])}>
          <Card.Content>
            <View style={styles.heroRow}>
              <View style={[styles.avatar, { backgroundColor: withOpacity(colors.primary, 0.14) }]}>
                <Ionicons name="person" size={iconSize.xl} color={colors.primary} />
              </View>
              <View style={styles.heroText}>
                <Text style={[styles.heroTitle, { color: isDark ? colors.textDark : colors.text }]}>Мақал шебері</Text>
                <Text style={[styles.heroSubtitle, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>Ойын саны: {stats.gamesPlayed} • Үйренгені: {stats.learnedCount}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.grid}>
          <MetricCard label="Дәлдік" value={`${Math.round(stats.accuracyRate * 100)}%`} isDark={isDark} />
          <MetricCard label="Орташа ұпай" value={Math.round(stats.averageScore).toString()} isDark={isDark} />
          <MetricCard label="Ағымдағы серия" value={stats.streakDays.toString()} isDark={isDark} />
          <MetricCard label="Үздік серия" value={stats.bestStreak.toString()} isDark={isDark} />
          <MetricCard label="Прогресс" value={`${Math.round(stats.completionRate * 100)}%`} isDark={isDark} />
          <MetricCard label="Ойнау уақыты" value={`${hours} мин`} isDark={isDark} />
        </View>

        <Card variant="outlined" style={StyleSheet.flatten([styles.modeCard, { backgroundColor: isDark ? colors.backgroundDarkSecondary : colors.background }])}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>Режимдер бойынша рекорд</Text>
            {Object.entries(state?.perModeBestScores ?? {}).map(([mode, score]) => (
              <View key={mode} style={styles.row}>
                <Text style={[styles.rowLabel, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>{mode}</Text>
                <Text style={[styles.rowValue, { color: isDark ? colors.textDark : colors.text }]}>{score}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button fullWidth onPress={onOpenLeaderboard}>Көшбасшылар кестесі</Button>
          <Button fullWidth variant="outline" onPress={onOpenSettings}>Баптаулар</Button>
        </View>
      </View>
    </Container>
  )
}

function MetricCard({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <Card variant="outlined" style={StyleSheet.flatten([styles.metricCard, { backgroundColor: isDark ? colors.backgroundDarkSecondary : colors.background }])}>
      <Card.Content>
        <Text style={[styles.metricValue, { color: isDark ? colors.textDark : colors.text }]}>{value}</Text>
        <Text style={[styles.metricLabel, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>{label}</Text>
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, gap: spacing.lg },
  header: { gap: spacing.sm },
  title: { ...typography.h2 },
  heroCard: { borderRadius: borderRadius.xxl },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 64, height: 64, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1 },
  heroTitle: { ...typography.h3, marginBottom: spacing.xs },
  heroSubtitle: { ...typography.caption },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metricCard: { width: '47%', borderRadius: borderRadius.xl },
  metricValue: { ...typography.h3 },
  metricLabel: { ...typography.caption, marginTop: spacing.xs },
  modeCard: { borderRadius: borderRadius.xl },
  sectionTitle: { ...typography.h4, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  rowLabel: { ...typography.body },
  rowValue: { ...typography.bodyBold },
  actions: { gap: spacing.md },
})
