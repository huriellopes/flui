import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { updateAccount, updateAvatar, updatePassword } from '@/api/account';
import { ApiError } from '@/api/client';
import { Card, Field, GhostButton, PrimaryButton, SectionTitle } from '@/components/ui';
import { useAuth } from '@/state/AuthProvider';
import { radius, type Palette } from '@/theme/colors';
import { useThemedStyles } from '@/theme/ThemeProvider';
import { pickFromCamera, pickFromGallery } from '@/utils/imagePicker';

export function EditAccountScreen({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useAuth();
  const s = useThemedStyles(makeStyles);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const changeAvatar = async (from: 'camera' | 'gallery') => {
    const picked =
      from === 'camera'
        ? await pickFromCamera({ aspect: [1, 1] })
        : await pickFromGallery({ aspect: [1, 1] });
    if (picked === 'denied') return Alert.alert('Permissão', 'Precisamos da câmera.');
    if (!picked) return;
    setUploadingAvatar(true);
    try {
      const updated = await updateAvatar(picked.base64, picked.mime);
      await updateUser(updated);
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Não foi possível enviar a foto.');
    } finally {
      setUploadingAvatar(false);
    }
  };

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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Editar Perfil</Text>

        <SectionTitle>Foto de perfil</SectionTitle>
        <Card style={s.avatarCard}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={s.avatar} />
          ) : (
            <View style={s.avatar}>
              <Text style={s.avatarText}>{(user?.name ?? '?').charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={s.avatarBtns}>
            <Pressable onPress={() => changeAvatar('camera')} style={({ pressed }) => [s.avatarBtn, pressed && s.pressed]}>
              <Text style={s.avatarBtnText}>📷 Câmera</Text>
            </Pressable>
            <Pressable onPress={() => changeAvatar('gallery')} style={({ pressed }) => [s.avatarBtn, pressed && s.pressed]}>
              <Text style={s.avatarBtnText}>🖼️ Galeria</Text>
            </Pressable>
          </View>
          {uploadingAvatar && <Text style={s.uploading}>Enviando foto…</Text>}
        </Card>

        <SectionTitle>Dados</SectionTitle>
        <Card>
          <Field label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
          <Field label="E-mail" value={email} onChangeText={setEmail} placeholder="voce@email.com" keyboardType="email-address" autoCapitalize="none" />
          <PrimaryButton label="Salvar dados" onPress={saveProfile} loading={savingProfile} />
        </Card>

        <SectionTitle>Alterar senha</SectionTitle>
        <Card>
          <Field label="Senha atual" value={current} onChangeText={setCurrent} secureTextEntry autoCapitalize="none" placeholder="••••••••" />
          <Field label="Nova senha" value={next} onChangeText={setNext} secureTextEntry autoCapitalize="none" placeholder="mínimo 8 caracteres" />
          <Field label="Confirmar nova senha" value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" placeholder="repita a nova senha" />
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
    avatarCard: { alignItems: 'center', gap: 14 },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: radius.pill,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: 40, fontWeight: '900', color: c.white },
    avatarBtns: { flexDirection: 'row', gap: 10 },
    avatarBtn: {
      backgroundColor: c.surfaceAlt,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    avatarBtnText: { color: c.text, fontWeight: '700', fontSize: 14 },
    uploading: { color: c.textMuted, fontSize: 13 },
    pressed: { opacity: 0.7 },
  });
