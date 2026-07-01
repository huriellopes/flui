import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, CircularProgress, ProgressBar, SectionTitle } from '@/components/ui';
import { levelFromXp, xpIntoLevel } from '@/domain/gamification';
import { totalCalories, totalCarbs, totalFat, totalProtein } from '@/domain/log';
import { useAppData } from '@/state/AppDataProvider';
import { colors, radius } from '@/theme/colors';

const WATER_STEPS = [200, 300, 500];

export function DashboardScreen() {
  const { profile, targets, todayLog, gamification, addWater } = useAppData();
  if (!profile || !targets) return null;

  const kcal = totalCalories(todayLog);
  const protein = totalProtein(todayLog);
  const carbs = totalCarbs(todayLog);
  const fat = totalFat(todayLog);
  const level = levelFromXp(gamification.xp);
  const waterPct = todayLog.waterMl / targets.waterMl;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Olá, {profile.name.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Vamos bater as metas de hoje</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>Nv {level}</Text>
        </View>
      </View>

      {/* Gamificação */}
      <View style={styles.statsRow}>
        <StatPill icon="🔥" value={`${gamification.currentStreak}`} label="dias seguidos" />
        <StatPill icon="⭐" value={`${gamification.xp}`} label="XP total" />
        <StatPill icon="🏆" value={`${gamification.longestStreak}`} label="recorde" />
      </View>

      {/* Água — herói */}
      <Card style={styles.waterCard}>
        <CircularProgress size={196} strokeWidth={18} progress={waterPct} color={colors.water}>
          <Text style={styles.waterEmoji}>💧</Text>
          <Text style={styles.waterValue}>{todayLog.waterMl}</Text>
          <Text style={styles.waterUnit}>de {targets.waterMl} ml</Text>
        </CircularProgress>

        <View style={styles.waterBtns}>
          {WATER_STEPS.map((ml) => (
            <Pressable
              key={ml}
              onPress={() => addWater(ml)}
              style={({ pressed }) => [styles.waterBtn, pressed && styles.pressed]}
            >
              <Text style={styles.waterBtnText}>+{ml}</Text>
              <Text style={styles.waterBtnUnit}>ml</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Calorias */}
      <SectionTitle>Energia de hoje</SectionTitle>
      <Card>
        <View style={styles.calRow}>
          <Text style={styles.calValue}>{kcal}</Text>
          <Text style={styles.calGoal}>/ {targets.calories} kcal</Text>
        </View>
        <ProgressBar value={kcal / targets.calories} color={colors.calories} height={12} />
      </Card>

      {/* Macros */}
      <SectionTitle>Macronutrientes</SectionTitle>
      <View style={styles.macroGrid}>
        <MacroCard label="Proteína" value={protein} goal={targets.proteinG} color={colors.protein} />
        <MacroCard label="Carbo" value={carbs} goal={targets.carbsG} color={colors.carbs} />
        <MacroCard label="Gordura" value={fat} goal={targets.fatG} color={colors.fat} />
      </View>

      {/* Treino */}
      <SectionTitle>Treino</SectionTitle>
      <Card>
        {todayLog.workouts.length === 0 ? (
          <Text style={styles.empty}>Nenhum treino hoje. Registre na aba ➕.</Text>
        ) : (
          todayLog.workouts.map((w) => (
            <View key={w.id} style={styles.workoutRow}>
              <Text style={styles.workoutKind}>🏋️ {w.kind}</Text>
              <Text style={styles.workoutDur}>{w.durationMin} min</Text>
            </View>
          ))
        )}
      </Card>

      <Text style={styles.disclaimer}>
        Estimativas para orientação, não recomendação médica.
      </Text>
    </ScrollView>
  );
}

function StatPill({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MacroCard({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  return (
    <View style={styles.macroCard}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={[styles.macroValue, { color }]}>{value}g</Text>
      <Text style={styles.macroGoal}>de {goal}g</Text>
      <View style={styles.macroBar}>
        <ProgressBar value={goal > 0 ? value / goal : 0} color={color} height={6} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 28, gap: 14, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hello: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  levelBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  levelBadgeText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statPill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 2 },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  waterCard: { alignItems: 'center', paddingVertical: 24, gap: 20 },
  waterEmoji: { fontSize: 26 },
  waterValue: { fontSize: 40, fontWeight: '900', color: colors.text, marginTop: 2 },
  waterUnit: { fontSize: 14, color: colors.textMuted },
  waterBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  waterBtn: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  waterBtnText: { fontSize: 17, fontWeight: '800', color: colors.primaryDark },
  waterBtnUnit: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  pressed: { opacity: 0.7 },
  calRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12, gap: 6 },
  calValue: { fontSize: 30, fontWeight: '900', color: colors.text },
  calGoal: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
  macroGrid: { flexDirection: 'row', gap: 10 },
  macroCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  macroLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '700' },
  macroValue: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  macroGoal: { fontSize: 11, color: colors.textFaint },
  macroBar: { marginTop: 10 },
  empty: { color: colors.textMuted, fontSize: 14 },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  workoutKind: { fontSize: 15, color: colors.text, fontWeight: '600' },
  workoutDur: { fontSize: 14, color: colors.textMuted },
  disclaimer: { fontSize: 12, color: colors.textFaint, textAlign: 'center', marginTop: 6 },
});
