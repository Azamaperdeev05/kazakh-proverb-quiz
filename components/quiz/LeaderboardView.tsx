import { StyleSheet, Text, View } from 'react-native'
import { Button, Card, Container } from '@/components/ui'
import { borderRadius, colors, spacing, typography, withOpacity } from '@/constants/design'
import type { GameMode, LeaderboardEntry } from '@/types/quiz'

const segments: Array<{ id: 'overall' | 'recent' | GameMode; label: string }> = [
  { id: 'overall', label: 'Жалпы' },
  { id: 'multiple_choice', label: 'Таңдау' },
  { id: 'input', label: 'Енгізу' },
  { id: 'time_attack', label: '30 сек' },
  { id: 'daily', label: 'Daily' },
  { id: 'recent', label: 'Соңғысы' },
]

export function LeaderboardView({ isDark, active, onChange, onBack, rows }: {
  isDark: boolean
  active: 'overall' | 'recent' | GameMode
  onChange: (value: 'overall' | 'recent' | GameMode) => void
  onBack: () => void
  rows: LeaderboardEntry[]
}) {
  return (
    <Container safeArea padding="lg" backgroundColor={isDark ? colors.backgroundDark : colors.backgroundSecondary}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Button variant="ghost" onPress={onBack}>Артқа</Button>
          <Text style={[styles.title, { color: isDark ? colors.textDark : colors.text }]}>Advanced leaderboard</Text>
        </View>

        <View style={styles.segmentWrap}>
          {segments.map((segment) => {
            const selected = segment.id === active
            return (
              <Button
                key={segment.id}
                size="sm"
                variant={selected ? 'primary' : 'outline'}
                onPress={() => onChange(segment.id)}
              >
                {segment.label}
              </Button>
            )
          })}
        </View>

        <Card variant="elevated" style={StyleSheet.flatten([styles.listCard, { backgroundColor: isDark ? colors.backgroundDarkSecondary : colors.background }])}>
          <Card.Content>
            {rows.length === 0 ? (
              <Text style={[styles.empty, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>Бұл бөлімде әзірге нәтиже жоқ.</Text>
            ) : rows.map((row, index) => (
              <View key={row.id} style={[styles.row, index < rows.length - 1 && styles.divider]}>
                <View style={[styles.rank, { backgroundColor: withOpacity(colors.primary, 0.12) }]}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={[styles.mode, { color: isDark ? colors.textDark : colors.text }]}>{row.mode}</Text>
                  <Text style={[styles.meta, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>{row.correct}/{row.total} дұрыс • {Math.round(row.durationMs / 1000)} сек</Text>
                </View>
                <Text style={[styles.score, { color: isDark ? colors.textDark : colors.text }]}>{row.score}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </View>
    </Container>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, gap: spacing.lg },
  header: { gap: spacing.sm },
  title: { ...typography.h2 },
  segmentWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  listCard: { borderRadius: borderRadius.xxl },
  empty: { ...typography.body },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  divider: { borderBottomWidth: 1, borderBottomColor: withOpacity(colors.secondary, 0.18) },
  rank: { width: 34, height: 34, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  rankText: { ...typography.captionBold, color: colors.primaryDark },
  rowContent: { flex: 1 },
  mode: { ...typography.bodyBold },
  meta: { ...typography.caption },
  score: { ...typography.h4 },
})
