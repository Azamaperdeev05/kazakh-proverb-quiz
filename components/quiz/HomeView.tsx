import { Ionicons } from '@expo/vector-icons'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button, Card, Container } from '@/components/ui'
import { borderRadius, colors, iconSize, spacing, typography, withOpacity } from '@/constants/design'
import { TOTAL_PROVERBS } from '@/data/proverbs'
import type { GameMode, StoredQuizState } from '@/types/quiz'
import { ModeCard } from './ModeCard'

export function HomeView({ isDark, state, selectedMode, onSelectMode, onStart, onOpenProfile, onOpenLeaderboard, onOpenSettings }: {
  isDark: boolean
  state: StoredQuizState | null
  selectedMode: GameMode
  onSelectMode: (mode: GameMode) => void
  onStart: () => void
  onOpenProfile: () => void
  onOpenLeaderboard: () => void
  onOpenSettings: () => void
}) {
  const progress = state?.progress
  const accuracy = progress?.totalAnswered ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0
  const topScores = state?.leaderboard.slice(0, 5) ?? []
  const statsCardStyle = StyleSheet.flatten([styles.statsCard, { backgroundColor: isDark ? colors.backgroundDarkSecondary : colors.background }])
  const leaderboardStyle = StyleSheet.flatten([styles.leaderboard, { backgroundColor: isDark ? colors.backgroundDarkSecondary : colors.background }])

  return (
    <Container safeArea padding="lg" backgroundColor={isDark ? colors.backgroundDark : colors.backgroundSecondary}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={[styles.badge, { backgroundColor: withOpacity(colors.warning, 0.18) }]}>
            <Ionicons name="sparkles" size={iconSize.sm} color={colors.warning} />
            <Text style={[styles.badgeText, { color: colors.warningDark }]}>Қазақ тіліндегі танымдық ойын</Text>
          </View>
          <Text style={[styles.title, { color: isDark ? colors.textDark : colors.text }]}>Мақалды жалғастыр</Text>
          <Text style={[styles.subtitle, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>Мақалдың басын көріп, дұрыс жалғасын тап. Офлайн жұмыс істейді, күнделікті сынақ пен жеке рекордтарың сақталады.</Text>
        </View>

        <Card variant="elevated" style={statsCardStyle}>
          <Card.Content>
            <View style={styles.statsRow}>
              <StatItem label="Мақал саны" value={String(TOTAL_PROVERBS)} isDark={isDark} />
              <StatItem label="Дәлдік" value={`${accuracy}%`} isDark={isDark} />
              <StatItem label="Серия" value={`${progress?.streakDays ?? 0}`} isDark={isDark} />
            </View>
            <View style={[styles.progressBar, { backgroundColor: isDark ? colors.backgroundDarkTertiary : colors.backgroundTertiary }]}>
              <View style={[styles.progressFill, { width: `${((progress?.learnedIds.length ?? 0) / TOTAL_PROVERBS) * 100}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progressText, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>Меңгерілген мақалдар: {progress?.learnedIds.length ?? 0}/{TOTAL_PROVERBS}</Text>
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>Ойын режимін таңда</Text>
          <View style={styles.modeList}>
            {(['multiple_choice', 'input', 'time_attack', 'daily'] as GameMode[]).map((mode) => (
              <ModeCard key={mode} mode={mode} active={selectedMode === mode} onPress={() => onSelectMode(mode)} isDark={isDark} />
            ))}
          </View>
        </View>

        <Button size="lg" fullWidth onPress={onStart} rightIcon={<Ionicons name="arrow-forward" size={iconSize.md} color={colors.white} />}>Бастау</Button>

        <View style={styles.quickActions}>
          <Button variant="outline" onPress={onOpenProfile}>Профиль</Button>
          <Button variant="outline" onPress={onOpenLeaderboard}>Leaderboard</Button>
          <Button variant="outline" onPress={onOpenSettings}>Settings</Button>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>Үздік нәтижелер</Text>
          <Card variant="outlined" style={leaderboardStyle}>
            <Card.Content>
              {topScores.length === 0 ? (
                <Text style={[styles.emptyText, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>Әзірге нәтиже жоқ. Бірінші ойынды бастаңыз.</Text>
              ) : topScores.map((entry, idx) => (
                <View key={entry.id} style={[styles.rankRow, idx < topScores.length - 1 && styles.rankDivider]}>
                  <Text style={[styles.rankIndex, { color: colors.primary }]}>{idx + 1}</Text>
                  <View style={styles.rankContent}>
                    <Text style={[styles.rankMode, { color: isDark ? colors.textDark : colors.text }]}>{modeLabel(entry.mode)}</Text>
                    <Text style={[styles.rankMeta, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>{entry.correct}/{entry.total} дұрыс</Text>
                  </View>
                  <Text style={[styles.rankScore, { color: isDark ? colors.textDark : colors.text }]}>{entry.score}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </Container>
  )
}

function StatItem({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: isDark ? colors.textDark : colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>{label}</Text>
    </View>
  )
}

function modeLabel(mode: GameMode) {
  return ({ multiple_choice: 'Таңдау', input: 'Енгізу', time_attack: '30 секунд', daily: 'Күнделікті сынақ' })[mode]
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  hero: { gap: spacing.sm },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  badgeText: { ...typography.captionBold },
  title: { ...typography.display },
  subtitle: { ...typography.body },
  statsCard: { borderRadius: borderRadius.xxl },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.md },
  statItem: { flex: 1 },
  statValue: { ...typography.h2 },
  statLabel: { ...typography.caption },
  progressBar: { height: 10, borderRadius: borderRadius.full, overflow: 'hidden', marginBottom: spacing.sm },
  progressFill: { height: '100%', borderRadius: borderRadius.full },
  progressText: { ...typography.caption },
  section: { gap: spacing.md },
  sectionTitle: { ...typography.h3 },
  modeList: { gap: spacing.md },
  quickActions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  leaderboard: { borderRadius: borderRadius.xl },
  emptyText: { ...typography.body },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  rankDivider: { borderBottomWidth: 1, borderBottomColor: withOpacity(colors.secondary, 0.18) },
  rankIndex: { ...typography.bodyBold, width: 24 },
  rankContent: { flex: 1 },
  rankMode: { ...typography.bodyBold },
  rankMeta: { ...typography.caption },
  rankScore: { ...typography.h4 },
})
