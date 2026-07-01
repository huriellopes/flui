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
import { radius, type Palette } from '@/theme/colors';
import { useThemedStyles } from '@/theme/ThemeProvider';

const TOTAL_STEPS = 6;

export function OnboardingScreen() {
  const { saveUserProfile } = useAppData();
  const s = useThemedStyles(makeStyles);
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [sex, setSex] = useState<Sex | null>(null);
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [targetWeightKg, setTargetWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  const num = (v: string) => parseFloat(v.replace(',', '.'));

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
    const p: UserProfile = {
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
    await saveUserProfile(p);
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep((v) => v + 1);
    else finish();
  };
  const back = () => setStep((v) => Math.max(0, v - 1));

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBlock}>
          <Text style={s.stepCount}>
            Passo {step + 1} de {TOTAL_STEPS}
          </Text>
          <ProgressBar value={(step + 1) / TOTAL_STEPS} />
        </View>

        {step === 0 && (
          <View>
            <Text style={s.title}>Como podemos te chamar?</Text>
            <Text style={s.subtitle}>Vamos personalizar sua jornada.</Text>
            <Field label="Seu nome" value={name} onChangeText={setName} placeholder="Ex: Huriel" autoFocus />
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={s.title}>Qual seu sexo biológico?</Text>
            <Text style={s.subtitle}>Usado na fórmula do metabolismo basal.</Text>
            <View style={styles.chipWrap}>
              {(Object.keys(SEX_LABELS) as Sex[]).map((k) => (
                <Chip key={k} label={SEX_LABELS[k]} selected={sex === k} onPress={() => setSex(k)} />
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={s.title}>Quantos anos você tem?</Text>
            <Text style={s.subtitle}>A idade influencia seu gasto calórico.</Text>
            <Field label="Idade (anos)" value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="Ex: 29" />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={s.title}>Suas medidas</Text>
            <Text style={s.subtitle}>Base para calcular água, calorias e macros.</Text>
            <Field label="Altura (cm)" value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" placeholder="Ex: 178" />
            <Field label="Peso atual (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" placeholder="Ex: 82" />
            <Field label="Peso desejado (kg)" value={targetWeightKg} onChangeText={setTargetWeightKg} keyboardType="numeric" placeholder="Ex: 75" />
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={s.title}>Nível de atividade</Text>
            <Text style={s.subtitle}>Com que frequência você treina?</Text>
            <View style={styles.chipCol}>
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((k) => (
                <Chip key={k} label={ACTIVITY_LABELS[k]} full selected={activityLevel === k} onPress={() => setActivityLevel(k)} />
              ))}
            </View>
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={s.title}>Qual seu objetivo?</Text>
            <Text style={s.subtitle}>Ajustamos suas calorias e proteínas.</Text>
            <View style={styles.chipCol}>
              {(Object.keys(GOAL_LABELS) as Goal[]).map((k) => (
                <Chip key={k} label={GOAL_LABELS[k]} full selected={goal === k} onPress={() => setGoal(k)} />
              ))}
            </View>

            {goal && sex && Number.isFinite(num(age)) && (
              <PreviewTargets
                s={s}
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
          {step > 0 && (
            <View style={styles.flex}>
              <GhostButton label="Voltar" onPress={back} />
            </View>
          )}
          <View style={styles.flex2}>
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

type S = ReturnType<typeof makeStyles>;

function PreviewTargets({ draft, s }: { draft: UserProfile; s: S }) {
  const t = calcTargets(draft);
  return (
    <View style={s.preview}>
      <Text style={s.previewTitle}>Prévia das suas metas diárias</Text>
      <Text style={s.previewRow}>💧 Água: {t.waterMl} ml</Text>
      <Text style={s.previewRow}>🔥 Calorias: {t.calories} kcal</Text>
      <Text style={s.previewRow}>🍗 P {t.proteinG}g · 🍞 C {t.carbsG}g · 🥑 G {t.fatG}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex2: { flex: 2 },
  headerBlock: { gap: 8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chipCol: { gap: 10 },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 'auto' },
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      padding: 24,
      paddingTop: 16,
      gap: 20,
      flexGrow: 1,
      backgroundColor: c.background,
    },
    stepCount: { fontSize: 13, color: c.textMuted, fontWeight: '600' },
    title: { fontSize: 25, fontWeight: '800', color: c.text, marginBottom: 6 },
    subtitle: { fontSize: 15, color: c.textMuted, marginBottom: 20 },
    preview: {
      marginTop: 20,
      padding: 16,
      borderRadius: radius.lg,
      backgroundColor: c.primarySoft,
      gap: 6,
    },
    previewTitle: { fontSize: 14, fontWeight: '800', color: c.primary, marginBottom: 4 },
    previewRow: { fontSize: 15, color: c.text },
  });
