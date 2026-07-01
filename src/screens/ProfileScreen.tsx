import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Card, GhostButton, PrimaryButton, SectionTitle } from '@/components/ui';
import { calcBMR, calcTDEE } from '@/domain/nutrition';
import {
  ACTIVITY_LABELS,
  ageFromBirthDate,
  GOAL_LABELS,
  SEX_LABELS,
} from '@/domain/profile';
import { useWaterReminders } from '@/hooks/useWaterReminders';
import { AuthScreen } from '@/screens/AuthScreen';
import { useAppData } from '@/state/AppDataProvider';
import { useAuth } from '@/state/AuthProvider';
import { colors } from '@/theme/colors';

export function ProfileScreen() {
  const { profile, targets, resetProfile } = useAppData();
  const { settings, toggleEnabled } = useWaterReminders();
  const { isLoggedIn, user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  if (!profile || !targets) return null;

  if (showAuth) return <AuthScreen onClose={() => setShowAuth(false)} />;

  const confirmLogout = () => {
    Alert.alert('Sair da conta?', 'Seus dados locais continuam no aparelho.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const confirmReset = () => {
    Alert.alert('Refazer questionário?', 'Isso apaga seu perfil e recalcula tudo do zero.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Refazer', style: 'destructive', onPress: () => resetProfile() },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{profile.name}</Text>
      <Text style={styles.subtitle}>
        {ageFromBirthDate(profile.birthDate)} anos · {SEX_LABELS[profile.sex]}
      </Text>

      <SectionTitle>Seus dados</SectionTitle>
      <Card style={styles.gap}>
        <Row label="Altura" value={`${profile.heightCm} cm`} />
        <Row label="Peso atual" value={`${profile.weightKg} kg`} />
        <Row label="Peso desejado" value={`${profile.targetWeightKg} kg`} />
        <Row label="Atividade" value={ACTIVITY_LABELS[profile.activityLevel]} />
        <Row label="Objetivo" value={GOAL_LABELS[profile.goal]} />
      </Card>

      <SectionTitle>Metas calculadas</SectionTitle>
      <Card style={styles.gap}>
        <Row label="Metabolismo basal (BMR)" value={`${Math.round(calcBMR(profile))} kcal`} />
        <Row label="Gasto diário (TDEE)" value={`${Math.round(calcTDEE(profile))} kcal`} />
        <Row label="Meta de calorias" value={`${targets.calories} kcal`} highlight />
        <Row label="Proteínas" value={`${targets.proteinG} g`} />
        <Row label="Carboidratos" value={`${targets.carbsG} g`} />
        <Row label="Gorduras" value={`${targets.fatG} g`} />
        <Row label="Água" value={`${targets.waterMl} ml`} highlight />
      </Card>

      <SectionTitle>Conta</SectionTitle>
      <Card>
        {isLoggedIn ? (
          <View>
            <Text style={styles.accountLabel}>Conectado como</Text>
            <Text style={styles.accountEmail}>{user?.email}</Text>
            <View style={styles.spacer} />
            <GhostButton label="Sair da conta" onPress={confirmLogout} />
          </View>
        ) : (
          <View>
            <Text style={styles.accountHint}>
              Crie uma conta para sincronizar seu progresso e participar de grupos. Opcional — o app
              funciona offline.
            </Text>
            <View style={styles.spacer} />
            <PrimaryButton label="Entrar / Criar conta" onPress={() => setShowAuth(true)} />
          </View>
        )}
      </Card>

      <SectionTitle>Lembretes de água</SectionTitle>
      <Card>
        <View style={styles.reminderRow}>
          <View style={styles.flex}>
            <Text style={styles.reminderLabel}>Notificações de hidratação</Text>
            <Text style={styles.reminderHint}>
              A cada {settings.intervalMinutes} min · {settings.enabled ? 'ativadas' : 'desativadas'}
            </Text>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={toggleEnabled}
            trackColor={{ true: colors.accent, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>

      <View style={styles.resetBlock}>
        <GhostButton label="Refazer questionário" onPress={confirmReset} />
      </View>
    </ScrollView>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 10 },
  container: { padding: 20, gap: 12, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: colors.textMuted },
  rowValue: { fontSize: 15, color: colors.text, fontWeight: '600' },
  rowValueHighlight: { color: colors.primary, fontWeight: '800' },
  accountLabel: { fontSize: 13, color: colors.textMuted },
  accountEmail: { fontSize: 16, color: colors.text, fontWeight: '700', marginTop: 2 },
  accountHint: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  spacer: { height: 12 },
  reminderRow: { flexDirection: 'row', alignItems: 'center' },
  reminderLabel: { fontSize: 15, color: colors.text, fontWeight: '600' },
  reminderHint: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  resetBlock: { marginTop: 10 },
});
