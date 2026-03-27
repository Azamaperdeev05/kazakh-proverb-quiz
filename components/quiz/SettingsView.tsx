import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Switch, Text, View } from 'react-native'
import { Button, Card, Container } from '@/components/ui'
import { borderRadius, colors, iconSize, spacing, typography } from '@/constants/design'
import type { ThemePreference } from '@/types/quiz'

export function SettingsView({
  isDark,
  theme,
  soundEnabled,
  hapticsEnabled,
  hintsEnabled,
  onBack,
  onThemeChange,
  onToggleSound,
  onToggleHaptics,
  onToggleHints,
}: {
  isDark: boolean
  theme: ThemePreference
  soundEnabled: boolean
  hapticsEnabled: boolean
  hintsEnabled: boolean
  onBack: () => void
  onThemeChange: (value: ThemePreference) => void
  onToggleSound: (value: boolean) => void
  onToggleHaptics: (value: boolean) => void
  onToggleHints: (value: boolean) => void
}) {
  return (
    <Container safeArea padding="lg" backgroundColor={isDark ? colors.backgroundDark : colors.backgroundSecondary}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Button variant="ghost" onPress={onBack} leftIcon={<Ionicons name="arrow-back" size={iconSize.md} color={isDark ? colors.textDark : colors.text} />}>Артқа</Button>
          <Text style={[styles.title, { color: isDark ? colors.textDark : colors.text }]}>Баптаулар</Text>
        </View>

        <Card variant="elevated" style={StyleSheet.flatten([styles.card, { backgroundColor: isDark ? colors.backgroundDarkSecondary : colors.background }])}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>Тақырып</Text>
            <View style={styles.segmentWrap}>
              {(['system', 'light', 'dark'] as ThemePreference[]).map((item) => (
                <Button key={item} size="sm" variant={theme === item ? 'primary' : 'outline'} onPress={() => onThemeChange(item)}>{item}</Button>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card variant="outlined" style={StyleSheet.flatten([styles.card, { backgroundColor: isDark ? colors.backgroundDarkSecondary : colors.background }])}>
          <Card.Content>
            <ToggleRow label="Дыбыс" value={soundEnabled} onChange={onToggleSound} isDark={isDark} />
            <ToggleRow label="Haptic / vibration" value={hapticsEnabled} onChange={onToggleHaptics} isDark={isDark} />
            <ToggleRow label="Hint көрсету" value={hintsEnabled} onChange={onToggleHints} isDark={isDark} />
          </Card.Content>
        </Card>
      </View>
    </Container>
  )
}

function ToggleRow({ label, value, onChange, isDark }: { label: string; value: boolean; onChange: (value: boolean) => void; isDark: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: isDark ? colors.textDark : colors.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} thumbColor={value ? colors.primary : colors.secondaryLight} trackColor={{ false: colors.border, true: colors.primaryLight }} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, gap: spacing.lg },
  header: { gap: spacing.sm },
  title: { ...typography.h2 },
  card: { borderRadius: borderRadius.xxl },
  sectionTitle: { ...typography.h4, marginBottom: spacing.md },
  segmentWrap: { flexDirection: 'row', gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  label: { ...typography.body },
})
