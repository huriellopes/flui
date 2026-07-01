import { StyleSheet, Switch, Text, View } from 'react-native';

import { useWaterReminders } from '@/hooks/useWaterReminders';
import { colors } from '@/theme/colors';

export function HomeScreen() {
  const { settings, loading, toggleEnabled } = useWaterReminders();

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>Carregando…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>💧</Text>
        <Text style={styles.title}>Notify Water Health</Text>
        <Text style={styles.subtitle}>Beba água na hora certa, todos os dias.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Meta diária</Text>
        <Text style={styles.cardValue}>{settings.dailyGoalMl} ml</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Intervalo dos lembretes</Text>
        <Text style={styles.cardValue}>{settings.intervalMinutes} min</Text>
      </View>

      <View style={[styles.card, styles.rowBetween]}>
        <View>
          <Text style={styles.cardLabel}>Lembretes</Text>
          <Text style={styles.muted}>
            {settings.enabled ? 'Ativados' : 'Desativados'}
          </Text>
        </View>
        <Switch
          value={settings.enabled}
          onValueChange={toggleEnabled}
          trackColor={{ true: colors.accent, false: colors.border }}
          thumbColor={colors.white}
        />
      </View>

      <Text style={styles.footnote}>
        As telas de configuração e o registro de consumo chegam nos próximos passos.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    gap: 4,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  muted: {
    fontSize: 14,
    color: colors.textMuted,
  },
  footnote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 'auto',
  },
});
