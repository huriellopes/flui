import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Card, Chip, GhostButton, PrimaryButton, SectionTitle } from '@/components/ui';
import { ConfirmModal } from '@/components/ConfirmModal';
import { calcBMR, calcTDEE } from '@/domain/nutrition';
import { ACTIVITY_LABELS, ageFromBirthDate, GOAL_LABELS, SEX_LABELS } from '@/domain/profile';
import { useWaterReminders } from '@/hooks/useWaterReminders';
import { AuthScreen } from '@/screens/AuthScreen';
import { EditAccountScreen } from '@/screens/EditAccountScreen';
import { useAppData } from '@/state/AppDataProvider';
import { useAuth } from '@/state/AuthProvider';
import { radius, type Palette } from '@/theme/colors';
import { useTheme, useThemeControl, useThemedStyles } from '@/theme/ThemeProvider';
import type { ThemePreference } from '@/theme/theme';

const THEME_OPTIONS: { key: ThemePreference; label: string }[] = [
  { key: 'light', label: '☀️ Claro' },
  { key: 'dark', label: '🌙 Escuro' },
  { key: 'system', label: '⚙️ Sistema' },
];

export function ProfileScreen() {
  const { profile, targets, resetProfile } = useAppData();
  const { settings, toggleEnabled } = useWaterReminders();
  const { isLoggedIn, user, logout } = useAuth();
  const { preference, setPreference } = useThemeControl();
  const c = useTheme();
  const s = useThemedStyles(makeStyles);
  const [showAuth, setShowAuth] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  if (!profile || !targets) return null;

  if (showAuth) return <AuthScreen onClose={() => setShowAuth(false)} />;
  if (showEdit) return <EditAccountScreen onClose={() => setShowEdit(false)} />;

  return (
    <>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={s.avatar} />
          ) : (
            <View style={s.avatar}>
              <Text style={s.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={s.name}>{profile.name}</Text>
          <Text style={s.sub}>
            {ageFromBirthDate(profile.birthDate)} anos · {SEX_LABELS[profile.sex]}
          </Text>
          <View style={s.heroPills}>
            <View style={s.heroPill}>
              <Text style={s.heroPillText}>⚖️ {profile.weightKg} kg</Text>
            </View>
            <View style={s.heroPill}>
              <Text style={s.heroPillText}>🎯 {GOAL_LABELS[profile.goal]}</Text>
            </View>
          </View>
        </View>

        <SectionTitle>Aparência</SectionTitle>
        <Card>
          <View style={s.themeRow}>
            {THEME_OPTIONS.map((o) => (
              <View key={o.key} style={styles.flex}>
                <Chip label={o.label} full selected={preference === o.key} onPress={() => setPreference(o.key)} />
              </View>
            ))}
          </View>
        </Card>

        <SectionTitle>Conta</SectionTitle>
        <Card>
          {isLoggedIn ? (
            <View style={s.gap}>
              <Text style={s.rowLabel}>Conectado como</Text>
              <Text style={s.accountEmail}>{user?.email}</Text>
              <PrimaryButton label="Editar Perfil" onPress={() => setShowEdit(true)} />
              <GhostButton label="Sair da conta" onPress={() => setLogoutOpen(true)} tone="danger" />
            </View>
          ) : (
            <View>
              <Text style={s.hint}>
                Crie uma conta para sincronizar seu progresso e participar de grupos. Opcional — o
                app funciona offline.
              </Text>
              <View style={s.spacer} />
              <PrimaryButton label="Entrar / Criar conta" onPress={() => setShowAuth(true)} />
            </View>
          )}
        </Card>

        <SectionTitle>Seus dados</SectionTitle>
        <Card style={s.gap}>
          <Row s={s} label="Altura" value={`${profile.heightCm} cm`} />
          <Row s={s} label="Peso atual" value={`${profile.weightKg} kg`} />
          <Row s={s} label="Peso desejado" value={`${profile.targetWeightKg} kg`} />
          <Row s={s} label="Atividade" value={ACTIVITY_LABELS[profile.activityLevel]} />
          <Row s={s} label="Objetivo" value={GOAL_LABELS[profile.goal]} />
        </Card>

        <SectionTitle>Metas calculadas</SectionTitle>
        <Card style={s.gap}>
          <Row s={s} label="Metabolismo basal" value={`${Math.round(calcBMR(profile))} kcal`} />
          <Row s={s} label="Gasto diário (TDEE)" value={`${Math.round(calcTDEE(profile))} kcal`} />
          <Row s={s} label="Meta de calorias" value={`${targets.calories} kcal`} highlight />
          <Row s={s} label="Proteínas" value={`${targets.proteinG} g`} />
          <Row s={s} label="Carboidratos" value={`${targets.carbsG} g`} />
          <Row s={s} label="Gorduras" value={`${targets.fatG} g`} />
          <Row s={s} label="Água" value={`${targets.waterMl} ml`} highlight />
        </Card>

        <SectionTitle>Lembretes de água</SectionTitle>
        <Card>
          <View style={s.reminderRow}>
            <View style={styles.flex}>
              <Text style={s.reminderLabel}>Notificações de hidratação</Text>
              <Text style={s.reminderHint}>
                A cada {settings.intervalMinutes} min · {settings.enabled ? 'ativadas' : 'desativadas'}
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={toggleEnabled}
              trackColor={{ true: c.primary, false: c.track }}
              thumbColor={c.white}
            />
          </View>
        </Card>

        <View style={s.spacer} />
        <GhostButton label="Refazer questionário" onPress={() => setResetOpen(true)} />
        <View style={{ height: 8 }} />
      </ScrollView>

      <ConfirmModal
        visible={logoutOpen}
        icon="👋"
        title="Sair da conta?"
        message="Seus dados locais continuam no aparelho."
        confirmLabel="Sair"
        tone="danger"
        onConfirm={() => {
          setLogoutOpen(false);
          logout();
        }}
        onCancel={() => setLogoutOpen(false)}
      />
      <ConfirmModal
        visible={resetOpen}
        icon="🔄"
        title="Refazer questionário?"
        message="Isso apaga seu perfil e recalcula tudo do zero."
        confirmLabel="Refazer"
        tone="danger"
        onConfirm={() => {
          setResetOpen(false);
          resetProfile();
        }}
        onCancel={() => setResetOpen(false)}
      />
    </>
  );
}

type S = ReturnType<typeof makeStyles>;

function Row({ s, label, value, highlight }: { s: S; label: string; value: string; highlight?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, highlight && s.rowValueHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    gap: { gap: 12 },
    container: { padding: 20, paddingBottom: 28, gap: 12, backgroundColor: c.background },
    hero: { alignItems: 'center', paddingVertical: 12, gap: 6 },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: radius.pill,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: 32, fontWeight: '900', color: c.white },
    name: { fontSize: 22, fontWeight: '800', color: c.text },
    sub: { fontSize: 14, color: c.textMuted },
    heroPills: { flexDirection: 'row', gap: 8, marginTop: 6 },
    heroPill: {
      backgroundColor: c.primarySoft,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.pill,
    },
    heroPillText: { color: c.primary, fontWeight: '700', fontSize: 13 },
    themeRow: { flexDirection: 'row', gap: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    rowLabel: { fontSize: 15, color: c.textMuted, flexShrink: 0 },
    rowValue: { fontSize: 15, color: c.text, fontWeight: '700', flex: 1, textAlign: 'right' },
    rowValueHighlight: { color: c.primary, fontWeight: '800' },
    accountEmail: { fontSize: 16, color: c.text, fontWeight: '700' },
    hint: { fontSize: 14, color: c.textMuted, lineHeight: 21 },
    spacer: { height: 14 },
    reminderRow: { flexDirection: 'row', alignItems: 'center' },
    reminderLabel: { fontSize: 15, color: c.text, fontWeight: '600' },
    reminderHint: { fontSize: 13, color: c.textMuted, marginTop: 2 },
  });
