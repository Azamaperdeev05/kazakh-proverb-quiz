import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import { Card } from '@/components/ui'
import { borderRadius, colors, iconSize, spacing, typography, withOpacity } from '@/constants/design'
import type { GameMode } from '@/types/quiz'

const labels: Record<GameMode, { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; tint: string }> = {
  multiple_choice: { title: 'Таңдау', subtitle: '4 нұсқадан дұрыс жалғасын тап', icon: 'apps', tint: colors.primary },
  input: { title: 'Енгізу', subtitle: 'Жауапты өзің теріп жаз', icon: 'create', tint: colors.accent },
  time_attack: { title: '30 секунд', subtitle: 'Жылдамдық пен дәлдік сыналады', icon: 'flash', tint: colors.warning },
  daily: { title: 'Күнделікті сынақ', subtitle: 'Бүгінгі 5 мақал', icon: 'sunny', tint: colors.success },
}

export function ModeCard({ mode, active, onPress, isDark }: { mode: GameMode; active: boolean; onPress: () => void; isDark: boolean }) {
  const meta = labels[mode]
  const cardStyle = StyleSheet.flatten([
    styles.card,
    { backgroundColor: active ? withOpacity(meta.tint, isDark ? 0.18 : 0.1) : isDark ? colors.backgroundDarkSecondary : colors.background },
    active && { borderWidth: 1, borderColor: meta.tint, borderRadius: borderRadius.xl },
  ])

  return (
    <Card variant={active ? 'elevated' : 'outlined'} onPress={onPress} style={cardStyle}>
      <Card.Content>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: withOpacity(meta.tint, 0.16) }]}>
            <Ionicons name={meta.icon} size={iconSize.lg} color={meta.tint} />
          </View>
          <View style={styles.content}>
            <Text style={[styles.title, { color: isDark ? colors.textDark : colors.text }]}>{meta.title}</Text>
            <Text style={[styles.subtitle, { color: isDark ? colors.textDarkSecondary : colors.textSecondary }]}>{meta.subtitle}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: borderRadius.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: { width: 52, height: 52, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  title: { ...typography.h4, marginBottom: spacing.xs },
  subtitle: { ...typography.caption },
})
