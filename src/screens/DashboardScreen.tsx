import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, CircularProgress, ProgressBar, SectionTitle } from '@/components/ui';
import { levelFromXp, xpIntoLevel } from '@/domain/gamification';
import { totalCalories, totalCarbs, totalFat, totalProtein } from '@/domain/log';
import { useAppData } from '@/state/AppDataProvider';
import { radius, type Palette } from '@/theme/colors';
import { useTheme, useThemedStyles } from '@/theme/ThemeProvider';

const WATER_STEPS = [200, 300, 500];

export function DashboardScreen() {
  const { profile, targets, todayLog, gamification, addWater } = useAppData();
  const s = useThemedStyles(makeStyles);
  const c = useTheme();
  if (!profile || !targets) return null;

  const kcal = totalCalories(todayLog);
  const protein = totalProtein(todayLog);
  const carbs = totalCarbs(todayLog);
  const fat = totalFat(todayLog);
  const level = levelFromXp(gamification.xp);
  const waterPct = todayLog.waterMl / targets.waterMl;

  return (
    <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View>
          <Text style={s.hello}>Olá, {profile.name.split(' ')[0]} 👋</Text>
          <Text style={s.subtitle}>Vamos bater as metas de hoje</Text>
        </View>
        <View style={s.levelBadge}>
          <Text style={s.levelBadgeText}>Nv {level}</Text>
        </View>
      </View>

      <View style={s.statsRow}>
        <StatPill icon="🔥" value={`${gamification.currentStreak}`} label="dias seguidos" s={s} />
        <StatPill icon="⭐" value={`${gamification.xp}`} label="XP total" s={s} />
        <StatPill icon="🏆" value={`${gamification.longestStreak}`} label="recorde" s={s} />
      </View>

      <Card style={s.waterCard}>
        <CircularProgress size={196} strokeWidth={18} progress={waterPct} color={c.water}>
          <Text style={s.waterEmoji}>💧</Text>
          <Text style={s.waterValue}>{todayLog.waterMl}</Text>
          <Text style={s.waterUnit}>de {targets.waterMl} ml</Text>
        </CircularProgress>

        <View style={s.waterBtns}>
          {WATER_STEPS.map((ml) => (
            <Pressable
              key={ml}
              onPress={() => addWater(ml)}
              style={({ pressed }) => [s.waterBtn, pressed && s.pressed]}
            >
              <Text style={s.waterBtnText}>+{ml}</Text>
              <Text style={s.waterBtnUnit}>ml</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <SectionTitle>Energia de hoje</SectionTitle>
      <Card>
        <View style={s.calRow}>
          <Text style={s.calValue}>{kcal}</Text>
          <Text style={s.calGoal}>/ {targets.calories} kcal</Text>
        </View>
        <ProgressBar value={kcal / targets.calories} color={c.calories} height={12} />
      </Card>

      <SectionTitle>Macronutrientes</SectionTitle>
      <View style={s.macroGrid}>
        <MacroCard label="Proteína" value={protein} goal={targets.proteinG} color={c.protein} s={s} />
        <MacroCard label="Carbo" value={carbs} goal={targets.carbsG} color={c.carbs} s={s} />
        <MacroCard label="Gordura" value={fat} goal={targets.fatG} color={c.fat} s={s} />
      </View>

      <SectionTitle>Treino</SectionTitle>
      <Card>
        {todayLog.workouts.length === 0 ? (
          <Text style={s.empty}>Nenhum treino hoje. Registre na aba ➕.</Text>
        ) : (
          todayLog.workouts.map((w) => (
            <View key={w.id} style={s.workoutRow}>
              <Text style={s.workoutKind}>🏋️ {w.kind}</Text>
              <Text style={s.workoutDur}>{w.durationMin} min</Text>
            </View>
          ))
        )}
      </Card>

      <Text style={s.disclaimer}>Estimativas para orientação, não recomendação médica.</Text>
    </ScrollView>
  );
}

type S = ReturnType<typeof makeStyles>;

function StatPill({ icon, value, label, s }: { icon: string; value: string; label: string; s: S }) {
  return (
    <View style={s.statPill}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function MacroCard({
  label,
  value,
  goal,
  color,
  s,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
  s: S;
}) {
  return (
    <View style={s.macroCard}>
      <Text style={s.macroLabel}>{label}</Text>
      <Text style={[s.macroValue, { color }]}>{value}g</Text>
      <Text style={s.macroGoal}>de {goal}g</Text>
      <View style={s.macroBar}>
        <ProgressBar value={goal > 0 ? value / goal : 0} color={color} height={6} />
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { padding: 20, paddingBottom: 28, gap: 14, backgroundColor: c.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    hello: { fontSize: 24, fontWeight: '800', color: c.text },
    subtitle: { fontSize: 14, color: c.textMuted, marginTop: 2 },
    levelBadge: {
      backgroundColor: c.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: radius.pill,
    },
    levelBadgeText: { color: c.white, fontWeight: '800', fontSize: 14 },
    statsRow: { flexDirection: 'row', gap: 10 },
    statPill: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    statIcon: { fontSize: 18 },
    statValue: { fontSize: 18, fontWeight: '800', color: c.text, marginTop: 2 },
    statLabel: { fontSize: 11, color: c.textMuted, marginTop: 1 },
    waterCard: { alignItems: 'center', paddingVertical: 24, gap: 20 },
    waterEmoji: { fontSize: 26 },
    waterValue: { fontSize: 40, fontWeight: '900', color: c.text, marginTop: 2 },
    waterUnit: { fontSize: 14, color: c.textMuted },
    waterBtns: { flexDirection: 'row', gap: 12, width: '100%' },
    waterBtn: {
      flex: 1,
      backgroundColor: c.primarySoft,
      borderRadius: radius.md,
      paddingVertical: 12,
      alignItems: 'center',
    },
    waterBtnText: { fontSize: 17, fontWeight: '800', color: c.primary },
    waterBtnUnit: { fontSize: 11, color: c.primary, fontWeight: '600' },
    pressed: { opacity: 0.7 },
    calRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12, gap: 6 },
    calValue: { fontSize: 30, fontWeight: '900', color: c.text },
    calGoal: { fontSize: 15, color: c.textMuted, fontWeight: '600' },
    macroGrid: { flexDirection: 'row', gap: 10 },
    macroCard: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      padding: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    macroLabel: { fontSize: 12, color: c.textMuted, fontWeight: '700' },
    macroValue: { fontSize: 22, fontWeight: '900', marginTop: 4 },
    macroGoal: { fontSize: 11, color: c.textFaint },
    macroBar: { marginTop: 10 },
    empty: { color: c.textMuted, fontSize: 14 },
    workoutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    workoutKind: { fontSize: 15, color: c.text, fontWeight: '600' },
    workoutDur: { fontSize: 14, color: c.textMuted },
    disclaimer: { fontSize: 12, color: c.textFaint, textAlign: 'center', marginTop: 6 },
  });
