import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Card, GhostButton, PrimaryButton, SectionTitle } from '@/components/ui';
import { calcBMR, calcTDEE } from '@/domain/nutrition';
import { ACTIVITY_LABELS, ageFromBirthDate, GOAL_LABELS, SEX_LABELS } from '@/domain/profile';
import { useWaterReminders } from '@/hooks/useWaterReminders';
import { AuthScreen } from '@/screens/AuthScreen';
import { useAppData } from '@/state/AppDataProvider';
import { useAuth } from '@/state/AuthProvider';
import { colors, radius } from '@/theme/colors';

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

  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.sub}>
          {ageFromBirthDate(profile.birthDate)} anos · {SEX_LABELS[profile.sex]}
        </Text>
      </View>

      <SectionTitle>Conta</SectionTitle>
      <Card>
        {isLoggedIn ? (
          <View>
            <Text style={styles.rowLabel}>Conectado como</Text>
            <Text style={styles.accountEmail}>{user?.email}</Text>
            <View style={styles.spacer} />
            <GhostButton label="Sair da conta" onPress={confirmLogout} tone="danger" />
          </View>
        ) : (
          <View>
            <Text style={styles.hint}>
              Crie uma conta para sincronizar seu progresso e participar de grupos. Opcional — o app
              funciona offline.
            </Text>
            <View style={styles.spacer} />
            <PrimaryButton label="Entrar / Criar conta" onPress={() => setShowAuth(true)} />
          </View>
        )}
      </Card>

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
        <Row label="Metabolismo basal" value={`${Math.round(calcBMR(profile))} kcal`} />
        <Row label="Gasto diário (TDEE)" value={`${Math.round(calcTDEE(profile))} kcal`} />
        <Row label="Meta de calorias" value={`${targets.calories} kcal`} highlight />
        <Row label="Proteínas" value={`${targets.proteinG} g`} />
        <Row label="Carboidratos" value={`${targets.carbsG} g`} />
        <Row label="Gorduras" value={`${targets.fatG} g`} />
        <Row label="Água" value={`${targets.waterMl} ml`} highlight />
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
            trackColor={{ true: colors.primary, false: colors.track }}
            thumbColor={colors.white}
          />
        </View>
      </Card>

      <View style={styles.spacer} />
      <GhostButton label="Refazer questionário" onPress={confirmReset} />
      <View style={{ height: 8 }} />
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
  gap: { gap: 12 },
  container: { padding: 20, paddingBottom: 28, gap: 12, backgroundColor: colors.background },
  hero: { alignItems: 'center', paddingVertical: 12, gap: 6 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: colors.white },
  name: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 14, color: colors.textMuted },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: colors.textMuted },
  rowValue: { fontSize: 15, color: colors.text, fontWeight: '700' },
  rowValueHighlight: { color: colors.primary, fontWeight: '800' },
  accountEmail: { fontSize: 16, color: colors.text, fontWeight: '700', marginTop: 2 },
  hint: { fontSize: 14, color: colors.textMuted, lineHeight: 21 },
  spacer: { height: 14 },
  reminderRow: { flexDirection: 'row', alignItems: 'center' },
  reminderLabel: { fontSize: 15, color: colors.text, fontWeight: '600' },
  reminderHint: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
