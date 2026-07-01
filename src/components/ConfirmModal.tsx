import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, type Palette } from '@/theme/colors';
import { useTheme, useThemedStyles } from '@/theme/ThemeProvider';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

/** Modal de confirmação estilizado (substitui o Alert nativo). */
export function ConfirmModal({
  visible,
  title,
  message,
  icon,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const s = useThemedStyles(makeStyles);
  const c = useTheme();
  const confirmColor = tone === 'danger' ? c.danger : c.primary;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <Pressable style={s.overlay} onPress={onCancel}>
        <Pressable style={s.card} onPress={(e) => e.stopPropagation()}>
          {icon ? <Text style={s.icon}>{icon}</Text> : null}
          <Text style={s.title}>{title}</Text>
          {message ? <Text style={s.message}>{message}</Text> : null}

          <View style={s.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [s.btn, s.cancelBtn, pressed && s.pressed]}
            >
              <Text style={s.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [s.btn, { backgroundColor: confirmColor }, pressed && s.pressed]}
            >
              <Text style={s.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(2, 6, 23, 0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 28,
    },
    card: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: c.surface,
      borderRadius: radius.xl,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 28,
      elevation: 12,
    },
    icon: { fontSize: 44, marginBottom: 8 },
    title: { fontSize: 19, fontWeight: '800', color: c.text, textAlign: 'center' },
    message: {
      fontSize: 15,
      color: c.textMuted,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 21,
    },
    actions: { flexDirection: 'row', gap: 12, marginTop: 22, width: '100%' },
    btn: { flex: 1, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
    cancelBtn: { backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border },
    cancelText: { color: c.text, fontWeight: '700', fontSize: 15 },
    confirmText: { color: c.white, fontWeight: '800', fontSize: 15 },
    pressed: { opacity: 0.8 },
  });
