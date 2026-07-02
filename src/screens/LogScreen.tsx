import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ApiError } from '@/api/client';
import { analyzeMealPhoto } from '@/api/logs';
import { Card, Chip, Field, PrimaryButton, SectionTitle } from '@/components/ui';
import { useAppData } from '@/state/AppDataProvider';
import { type Palette } from '@/theme/colors';
import { useTheme, useThemedStyles } from '@/theme/ThemeProvider';
import { pickFromCamera, pickFromGallery } from '@/utils/imagePicker';

const WORKOUT_KINDS = ['Musculação', 'Corrida', 'Ciclismo', 'Funcional', 'Outro'];

export function LogScreen() {
  const { addMeal, addWorkout } = useAppData();
  const s = useThemedStyles(makeStyles);
  const c = useTheme();

  const [label, setLabel] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [scanning, setScanning] = useState(false);

  const [kind, setKind] = useState(WORKOUT_KINDS[0]);
  const [duration, setDuration] = useState('');

  const int = (v: string) => Math.max(0, Math.round(parseFloat(v.replace(',', '.')) || 0));

  const scanPhoto = () => {
    Alert.alert('Escanear prato', 'Tire uma foto ou escolha da galeria.', [
      { text: '📷 Câmera', onPress: () => void analyzeFrom('camera') },
      { text: '🖼️ Galeria', onPress: () => void analyzeFrom('gallery') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const analyzeFrom = async (source: 'camera' | 'gallery') => {
    const picked = source === 'camera' ? await pickFromCamera() : await pickFromGallery();
    if (picked === 'denied') {
      Alert.alert('Permissão', 'Precisamos da câmera para tirar a foto.');
      return;
    }
    if (!picked) return;

    setScanning(true);
    try {
      const r = await analyzeMealPhoto(picked.base64, picked.mime);
      // Pré-preenche o formulário para o usuário revisar/ajustar.
      setLabel(r.dish);
      setCalories(String(r.calories));
      setProtein(String(r.proteinG));
      setCarbs(String(r.carbsG));
      setFat(String(r.fatG));
      const conf =
        r.confidence === 'high' ? 'alta' : r.confidence === 'medium' ? 'média' : 'baixa';
      Alert.alert(
        'Estimativa pronta ✨',
        `${r.dish}\n~${r.calories} kcal · ${r.portion}\nConfiança: ${conf}.\n\nÉ uma estimativa — confira e ajuste antes de adicionar.`,
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 503) {
        Alert.alert('Em breve', 'A leitura por foto ainda não está ativada. Tente mais tarde.');
      } else if (e instanceof ApiError && e.status === 401) {
        Alert.alert('Entre na conta', 'Faça login para usar o scanner de foto.');
      } else {
        Alert.alert('Ops', e instanceof ApiError ? e.message : 'Não foi possível analisar a foto.');
      }
    } finally {
      setScanning(false);
    }
  };

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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>Registrar</Text>

        <SectionTitle>🍽️ Refeição</SectionTitle>
        <Card style={styles.gap}>
          <Pressable
            onPress={scanPhoto}
            disabled={scanning}
            style={({ pressed }) => [s.scanBtn, pressed && styles.pressed, scanning && styles.pressed]}
          >
            {scanning ? (
              <>
                <ActivityIndicator color={c.primary} />
                <Text style={s.scanBtnText}>Analisando a foto…</Text>
              </>
            ) : (
              <Text style={s.scanBtnText}>📷 Escanear prato (beta)</Text>
            )}
          </Pressable>
          <Text style={s.scanHint}>
            Tire uma foto do prato e a gente estima os macros pra você conferir e ajustar.
          </Text>
          <Field label="Nome" value={label} onChangeText={setLabel} placeholder="Ex: Almoço" />
          <Field
            label="Calorias (kcal)"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            placeholder="Ex: 650"
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <Field label="Proteína (g)" value={protein} onChangeText={setProtein} keyboardType="numeric" placeholder="0" />
            </View>
            <View style={styles.flex}>
              <Field label="Carboidrato (g)" value={carbs} onChangeText={setCarbs} keyboardType="numeric" placeholder="0" />
            </View>
            <View style={styles.flex}>
              <Field label="Gordura (g)" value={fat} onChangeText={setFat} keyboardType="numeric" placeholder="0" />
            </View>
          </View>
          <PrimaryButton label="Adicionar refeição" onPress={submitMeal} />
        </Card>

        <SectionTitle>🏋️ Treino</SectionTitle>
        <Card style={styles.gap}>
          <Text style={s.fieldLabel}>Tipo</Text>
          <View style={styles.chipWrap}>
            {WORKOUT_KINDS.map((k) => (
              <Chip key={k} label={k} selected={kind === k} onPress={() => setKind(k)} />
            ))}
          </View>
          <Field
            label="Duração (min)"
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            placeholder="Ex: 45"
          />
          <PrimaryButton label="Registrar treino" onPress={submitWorkout} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 4 },
  row: { flexDirection: 'row', gap: 8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  pressed: { opacity: 0.6 },
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { padding: 20, paddingBottom: 28, gap: 12, backgroundColor: c.background },
    title: { fontSize: 24, fontWeight: '800', color: c.text },
    fieldLabel: { fontSize: 13, color: c.textMuted, marginBottom: 8, fontWeight: '700' },
    scanBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: c.primarySoft,
      borderRadius: 12,
      paddingVertical: 12,
      marginBottom: 4,
    },
    scanBtnText: { color: c.primary, fontWeight: '800', fontSize: 15 },
    scanHint: { fontSize: 12, color: c.textMuted, marginBottom: 8 },
  });
