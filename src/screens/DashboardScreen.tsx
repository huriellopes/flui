import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, ProgressBar, SectionTitle } from '@/components/ui';
import { levelFromXp, xpIntoLevel } from '@/domain/gamification';
import { totalCalories, totalCarbs, totalFat, totalProtein } from '@/domain/log';
import { useAppData } from '@/state/AppDataProvider';
import { colors } from '@/theme/colors';

const WATER_STEPS = [200, 300, 500];

export function DashboardScreen() {
  const { profile, targets, todayLog, gamification, addWater } = useAppData();
  if (!profile || !targets) return null;

  const kcal = totalCalories(todayLog);
  const protein = totalProtein(todayLog);
  const carbs = totalCarbs(todayLog);
  const fat = totalFat(todayLog);
  const level = levelFromXp(gamification.xp);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Olá, {profile.name.split(' ')[0]} 👋</Text>

      {/* Gamificação */}
      <Card style={styles.gamiCard}>
        <View style={styles.gamiRow}>
          <View>
            <Text style={styles.gamiLabel}>Nível</Text>
            <Text style={styles.gamiValue}>{level}</Text>
          </View>
          <View>
            <Text style={styles.gamiLabel}>Sequência</Text>
            <Text style={styles.gamiValue}>🔥 {gamification.currentStreak}</Text>
          </View>
          <View>
            <Text style={styles.gamiLabel}>XP total</Text>
            <Text style={styles.gamiValue}>{gamification.xp}</Text>
          </View>
        </View>
        <View style={styles.xpBar}>
          <ProgressBar value={xpIntoLevel(gamification.xp) / 100} color={colors.accent} />
          <Text style={styles.xpHint}>{xpIntoLevel(gamification.xp)}/100 XP para o próximo nível</Text>
        </View>
      </Card>

      {/* Água */}
      <SectionTitle>Hidratação</SectionTitle>
      <Card>
        <View style={styles.metricHeader}>
          <Text style={styles.metricBig}>💧 {todayLog.waterMl} ml</Text>
          <Text style={styles.metricGoal}>meta {targets.waterMl} ml</Text>
        </View>
        <ProgressBar value={todayLog.waterMl / targets.waterMl} />
        <View style={styles.waterBtns}>
          {WATER_STEPS.map((ml) => (
            <View key={ml} style={styles.flex}>
              <PrimaryButton label={`+${ml}ml`} onPress={() => addWater(ml)} />
            </View>
          ))}
        </View>
      </Card>

      {/* Nutrição */}
      <SectionTitle>Nutrição de hoje</SectionTitle>
      <Card style={styles.gap}>
        <MacroRow label="🔥 Calorias" value={kcal} goal={targets.calories} unit="kcal" color={colors.primary} />
        <MacroRow label="🍗 Proteínas" value={protein} goal={targets.proteinG} unit="g" color={colors.success} />
        <MacroRow label="🍞 Carboidratos" value={carbs} goal={targets.carbsG} unit="g" color={colors.accent} />
        <MacroRow label="🥑 Gorduras" value={fat} goal={targets.fatG} unit="g" color="#E8A33D" />
      </Card>

      {/* Treino */}
      <SectionTitle>Treino</SectionTitle>
      <Card>
        {todayLog.workouts.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum treino registrado hoje. Use a aba Registrar.</Text>
        ) : (
          todayLog.workouts.map((w) => (
            <Text key={w.id} style={styles.workoutItem}>
              🏋️ {w.kind} — {w.durationMin} min
            </Text>
          ))
        )}
      </Card>

      <Text style={styles.disclaimer}>
        Valores são estimativas para orientação, não recomendação médica. Consulte um profissional.
      </Text>
    </ScrollView>
  );
}

function MacroRow({
  label,
  value,
  goal,
  unit,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
}) {
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroHead}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>
          {value} / {goal} {unit}
        </Text>
      </View>
      <ProgressBar value={goal > 0 ? value / goal : 0} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 14 },
  container: { padding: 20, gap: 12, backgroundColor: colors.background },
  greeting: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  gamiCard: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  gamiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  gamiLabel: { color: '#B9E0EF', fontSize: 12, fontWeight: '600' },
  gamiValue: { color: colors.white, fontSize: 22, fontWeight: '800' },
  xpBar: { gap: 6 },
  xpHint: { color: '#B9E0EF', fontSize: 12 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  metricBig: { fontSize: 22, fontWeight: '800', color: colors.text },
  metricGoal: { fontSize: 14, color: colors.textMuted },
  waterBtns: { flexDirection: 'row', gap: 10, marginTop: 14 },
  macroRow: { gap: 6 },
  macroHead: { flexDirection: 'row', justifyContent: 'space-between' },
  macroLabel: { fontSize: 15, color: colors.text, fontWeight: '600' },
  macroValue: { fontSize: 14, color: colors.textMuted },
  emptyText: { color: colors.textMuted, fontSize: 14 },
  workoutItem: { fontSize: 15, color: colors.text, paddingVertical: 2 },
  disclaimer: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 8, paddingHorizontal: 10 },
});
