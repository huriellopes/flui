import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Chip, Field, GhostButton, PrimaryButton, ProgressBar } from '@/components/ui';
import { calcTargets } from '@/domain/nutrition';
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  SEX_LABELS,
  type ActivityLevel,
  type Goal,
  type Sex,
  type UserProfile,
} from '@/domain/profile';
import { useAppData } from '@/state/AppDataProvider';
import { colors } from '@/theme/colors';

const TOTAL_STEPS = 6;

export function OnboardingScreen() {
  const { saveUserProfile } = useAppData();
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [sex, setSex] = useState<Sex | null>(null);
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [targetWeightKg, setTargetWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  const num = (s: string) => parseFloat(s.replace(',', '.'));

  const canAdvance = (): boolean => {
    switch (step) {
      case 0:
        return name.trim().length >= 2;
      case 1:
        return sex !== null;
      case 2:
        return Number.isFinite(num(age)) && num(age) > 5 && num(age) < 120;
      case 3:
        return [heightCm, weightKg, targetWeightKg].every((v) => Number.isFinite(num(v)) && num(v) > 0);
      case 4:
        return activityLevel !== null;
      case 5:
        return goal !== null;
      default:
        return false;
    }
  };

  const finish = async () => {
    const year = new Date().getFullYear() - Math.round(num(age));
    const profile: UserProfile = {
      name: name.trim(),
      sex: sex!,
      birthDate: `${year}-06-15`,
      heightCm: num(heightCm),
      weightKg: num(weightKg),
      targetWeightKg: num(targetWeightKg),
      activityLevel: activityLevel!,
      goal: goal!,
      createdAt: new Date().toISOString(),
    };
    await saveUserProfile(profile);
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else finish();
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBlock}>
          <Text style={styles.stepCount}>
            Passo {step + 1} de {TOTAL_STEPS}
          </Text>
          <ProgressBar value={(step + 1) / TOTAL_STEPS} />
        </View>

        {step === 0 && (
          <View>
            <Text style={styles.title}>Como podemos te chamar?</Text>
            <Text style={styles.subtitle}>Vamos personalizar sua jornada de hidratação e treino.</Text>
            <Field label="Seu nome" value={name} onChangeText={setName} placeholder="Ex: Huriel" autoFocus />
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.title}>Qual seu sexo biológico?</Text>
            <Text style={styles.subtitle}>Usado na fórmula do metabolismo basal (Mifflin-St Jeor).</Text>
            <View style={styles.chipWrap}>
              {(Object.keys(SEX_LABELS) as Sex[]).map((s) => (
                <Chip key={s} label={SEX_LABELS[s]} selected={sex === s} onPress={() => setSex(s)} />
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.title}>Quantos anos você tem?</Text>
            <Text style={styles.subtitle}>A idade influencia seu gasto calórico diário.</Text>
            <Field
              label="Idade (anos)"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="Ex: 29"
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.title}>Suas medidas</Text>
            <Text style={styles.subtitle}>Base para calcular água, calorias e macros.</Text>
            <Field
              label="Altura (cm)"
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
              placeholder="Ex: 178"
            />
            <Field
              label="Peso atual (kg)"
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="numeric"
              placeholder="Ex: 82"
            />
            <Field
              label="Peso desejado (kg)"
              value={targetWeightKg}
              onChangeText={setTargetWeightKg}
              keyboardType="numeric"
              placeholder="Ex: 75"
            />
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.title}>Nível de atividade</Text>
            <Text style={styles.subtitle}>Com que frequência você treina/se movimenta?</Text>
            <View style={styles.chipCol}>
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((a) => (
                <Chip
                  key={a}
                  label={ACTIVITY_LABELS[a]}
                  selected={activityLevel === a}
                  onPress={() => setActivityLevel(a)}
                />
              ))}
            </View>
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={styles.title}>Qual seu objetivo?</Text>
            <Text style={styles.subtitle}>Ajustamos suas calorias e proteínas de acordo.</Text>
            <View style={styles.chipCol}>
              {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
                <Chip key={g} label={GOAL_LABELS[g]} selected={goal === g} onPress={() => setGoal(g)} />
              ))}
            </View>

            {goal && sex && Number.isFinite(num(age)) && (
              <PreviewTargets
                draft={{
                  name,
                  sex,
                  birthDate: `${new Date().getFullYear() - Math.round(num(age))}-06-15`,
                  heightCm: num(heightCm),
                  weightKg: num(weightKg),
                  targetWeightKg: num(targetWeightKg),
                  activityLevel: activityLevel!,
                  goal,
                  createdAt: '',
                }}
              />
            )}
          </View>
        )}

        <View style={styles.actions}>
          {step > 0 && <GhostButton label="Voltar" onPress={back} />}
          <View style={styles.flex}>
            <PrimaryButton
              label={step === TOTAL_STEPS - 1 ? 'Calcular minhas metas' : 'Continuar'}
              onPress={next}
              disabled={!canAdvance()}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PreviewTargets({ draft }: { draft: UserProfile }) {
  const t = calcTargets(draft);
  return (
    <View style={styles.preview}>
      <Text style={styles.previewTitle}>Prévia das suas metas diárias</Text>
      <Text style={styles.previewRow}>💧 Água: {t.waterMl} ml</Text>
      <Text style={styles.previewRow}>🔥 Calorias: {t.calories} kcal</Text>
      <Text style={styles.previewRow}>
        🍗 P {t.proteinG}g · 🍞 C {t.carbsG}g · 🥑 G {t.fatG}g
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: 24,
    paddingTop: 16,
    gap: 20,
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  headerBlock: { gap: 8 },
  stepCount: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginBottom: 20 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chipCol: { gap: 10 },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 'auto' },
  preview: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#E3F3FA',
    gap: 6,
  },
  previewTitle: { fontSize: 14, fontWeight: '700', color: colors.primaryDark, marginBottom: 4 },
  previewRow: { fontSize: 15, color: colors.text },
});
