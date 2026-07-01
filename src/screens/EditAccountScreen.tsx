import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { updateAccount, updatePassword } from '@/api/account';
import { ApiError } from '@/api/client';
import { Card, Field, GhostButton, PrimaryButton, SectionTitle } from '@/components/ui';
import { useAuth } from '@/state/AuthProvider';
import { type Palette } from '@/theme/colors';
import { useThemedStyles } from '@/theme/ThemeProvider';

export function EditAccountScreen({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useAuth();
  const s = useThemedStyles(makeStyles);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const saveProfile = async () => {
    if (name.trim().length < 2) return Alert.alert('Ops', 'Nome muito curto.');
    if (!email.includes('@')) return Alert.alert('Ops', 'E-mail inválido.');
    setSavingProfile(true);
    try {
      const updated = await updateAccount({ name: name.trim(), email: email.trim() });
      await updateUser(updated);
      Alert.alert('Salvo! ✅', 'Seus dados foram atualizados.');
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Tente novamente.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (current.length < 8) return Alert.alert('Ops', 'Informe sua senha atual.');
    if (next.length < 8) return Alert.alert('Ops', 'A nova senha deve ter ao menos 8 caracteres.');
    if (next !== confirm) return Alert.alert('Ops', 'A confirmação não confere.');
    setSavingPass(true);
    try {
      await updatePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      Alert.alert('Senha alterada! 🔒', 'Use a nova senha no próximo login.');
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Tente novamente.');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Editar conta</Text>

        <SectionTitle>Dados</SectionTitle>
        <Card>
          <Field label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
          <Field
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PrimaryButton label="Salvar dados" onPress={saveProfile} loading={savingProfile} />
        </Card>

        <SectionTitle>Alterar senha</SectionTitle>
        <Card>
          <Field
            label="Senha atual"
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            autoCapitalize="none"
            placeholder="••••••••"
          />
          <Field
            label="Nova senha"
            value={next}
            onChangeText={setNext}
            secureTextEntry
            autoCapitalize="none"
            placeholder="mínimo 8 caracteres"
          />
          <Field
            label="Confirmar nova senha"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
            placeholder="repita a nova senha"
          />
          <PrimaryButton label="Alterar senha" onPress={savePassword} loading={savingPass} />
        </Card>

        <GhostButton label="← Voltar" onPress={onClose} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { padding: 20, paddingBottom: 28, gap: 12, backgroundColor: c.background },
    title: { fontSize: 24, fontWeight: '800', color: c.text },
  });
