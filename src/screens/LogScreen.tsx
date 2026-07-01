import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Chip, Field, PrimaryButton, SectionTitle } from '@/components/ui';
import { useAppData } from '@/state/AppDataProvider';
import { colors } from '@/theme/colors';

const WORKOUT_KINDS = ['Musculação', 'Corrida', 'Ciclismo', 'Funcional', 'Outro'];

export function LogScreen() {
  const { addMeal, addWorkout } = useAppData();

  const [label, setLabel] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const [kind, setKind] = useState(WORKOUT_KINDS[0]);
  const [duration, setDuration] = useState('');

  const int = (s: string) => Math.max(0, Math.round(parseFloat(s.replace(',', '.')) || 0));

  const submitMeal = async () => {
    if (label.trim().length < 2 || int(calories) <= 0) {
      Alert.alert('Ops', 'Informe ao menos um nome e as calorias da refeição.');
      return;
    }
    await addMeal({
      label: label.trim(),
      calories: int(calories),
      proteinG: int(protein),
      carbsG: int(carbs),
      fatG: int(fat),
    });
    setLabel('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    Alert.alert('Registrado! 🍽️', 'Refeição adicionada. +10 XP');
  };

  const submitWorkout = async () => {
    if (int(duration) <= 0) {
      Alert.alert('Ops', 'Informe a duração do treino.');
      return;
    }
    await addWorkout({ kind, durationMin: int(duration) });
    setDuration('');
    Alert.alert('Bora! 🏋️', 'Treino registrado. +25 XP');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Registrar</Text>

        <SectionTitle>Refeição</SectionTitle>
        <Card>
          <Field label="Nome" value={label} onChangeText={setLabel} placeholder="Ex: Almoço" />
          <Field label="Calorias (kcal)" value={calories} onChangeText={setCalories} keyboardType="numeric" placeholder="Ex: 650" />
          <View style={styles.row}>
            <View style={styles.flex}>
              <Field label="Proteína (g)" value={protein} onChangeText={setProtein} keyboardType="numeric" placeholder="0" />
            </View>
            <View style={styles.flex}>
              <Field label="Carbo (g)" value={carbs} onChangeText={setCarbs} keyboardType="numeric" placeholder="0" />
            </View>
            <View style={styles.flex}>
              <Field label="Gordura (g)" value={fat} onChangeText={setFat} keyboardType="numeric" placeholder="0" />
            </View>
          </View>
          <PrimaryButton label="Adicionar refeição" onPress={submitMeal} />
        </Card>

        <SectionTitle>Treino</SectionTitle>
        <Card>
          <Text style={styles.fieldLabel}>Tipo</Text>
          <View style={styles.chipWrap}>
            {WORKOUT_KINDS.map((k) => (
              <Chip key={k} label={k} selected={kind === k} onPress={() => setKind(k)} />
            ))}
          </View>
          <View style={styles.spacer} />
          <Field label="Duração (min)" value={duration} onChangeText={setDuration} keyboardType="number-pad" placeholder="Ex: 45" />
          <PrimaryButton label="Registrar treino" onPress={submitWorkout} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, gap: 12, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fieldLabel: { fontSize: 13, color: colors.textMuted, marginBottom: 8, fontWeight: '600' },
  spacer: { height: 14 },
});
