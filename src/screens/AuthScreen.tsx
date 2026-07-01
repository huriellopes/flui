import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import { Field, GhostButton, PrimaryButton } from '@/components/ui';
import { useAuth } from '@/state/AuthProvider';
import { colors } from '@/theme/colors';

export function AuthScreen({ onClose }: { onClose: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === 'register';

  const submit = async () => {
    setError(null);
    if (isRegister && name.trim().length < 2) return setError('Informe seu nome.');
    if (!email.includes('@')) return setError('E-mail inválido.');
    if (password.length < 8) return setError('A senha deve ter ao menos 8 caracteres.');

    setBusy(true);
    try {
      if (isRegister) await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.emoji}>💧</Text>
        <Text style={styles.title}>{isRegister ? 'Criar conta' : 'Entrar'}</Text>
        <Text style={styles.subtitle}>
          Sincronize seu progresso e participe de grupos. É opcional — o app funciona offline.
        </Text>

        {isRegister && (
          <Field label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
        )}
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="mínimo 8 caracteres"
          secureTextEntry
          autoCapitalize="none"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <PrimaryButton
          label={busy ? 'Aguarde…' : isRegister ? 'Criar conta' : 'Entrar'}
          onPress={submit}
          disabled={busy}
        />
        <View style={styles.spacer} />
        <GhostButton
          label={isRegister ? 'Já tenho conta — Entrar' : 'Não tenho conta — Criar'}
          onPress={() => {
            setError(null);
            setMode(isRegister ? 'login' : 'register');
          }}
        />
        <View style={styles.spacer} />
        <GhostButton label="Continuar offline" onPress={onClose} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, gap: 8, flexGrow: 1, justifyContent: 'center' },
  emoji: { fontSize: 48, textAlign: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
  error: { color: '#C0392B', fontSize: 14, marginBottom: 8, textAlign: 'center' },
  spacer: { height: 10 },
});
