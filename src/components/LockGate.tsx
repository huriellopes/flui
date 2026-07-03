import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';

import { authenticate } from '@/services/biometrics';
import { loadAppLock } from '@/storage/security';
import { radius, type Palette } from '@/theme/colors';
import { useThemedStyles } from '@/theme/ThemeProvider';

/**
 * Gate de bloqueio do app. Quando o bloqueio está ativo, exige biometria
 * (face/digital) ou PIN/senha do aparelho para acessar o conteúdo — na abertura
 * e ao voltar do segundo plano.
 */
export function LockGate({ children }: { children: ReactNode }) {
  const s = useThemedStyles(makeStyles);
  const [enabled, setEnabled] = useState<boolean | null>(null); // null = carregando
  const [unlocked, setUnlocked] = useState(false);
  const promptingRef = useRef(false);

  const tryUnlock = useCallback(async () => {
    if (promptingRef.current) return; // evita prompts sobrepostos
    promptingRef.current = true;
    const ok = await authenticate('Desbloquear o Flui');
    promptingRef.current = false;
    if (ok) setUnlocked(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadAppLock().then((on) => {
      if (!mounted) return;
      setEnabled(on);
      if (on) tryUnlock();
      else setUnlocked(true);
    });

    const sub = AppState.addEventListener('change', async (state) => {
      // Reavalia o flag (o usuário pode ter ligado/desligado nas configurações).
      const on = await loadAppLock();
      if (!mounted) return;
      setEnabled(on);
      if (!on) {
        setUnlocked(true);
        return;
      }
      if (state === 'active') tryUnlock();
      else if (state === 'background') setUnlocked(false); // trava ao sair
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, [tryUnlock]);

  if (enabled === null) return null; // aguardando o flag carregar
  if (!enabled || unlocked) return <>{children}</>;

  return (
    <View style={s.container}>
      <Text style={s.emoji}>🔒</Text>
      <Text style={s.title}>Flui bloqueado</Text>
      <Text style={s.sub}>Use sua biometria ou a senha do aparelho para entrar.</Text>
      <Pressable style={({ pressed }) => [s.btn, pressed && s.pressed]} onPress={tryUnlock}>
        <Text style={s.btnText}>Desbloquear</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      gap: 8,
    },
    emoji: { fontSize: 56, marginBottom: 8 },
    title: { fontSize: 22, fontWeight: '800', color: c.text },
    sub: { fontSize: 15, color: c.textMuted, textAlign: 'center', marginBottom: 20 },
    btn: {
      backgroundColor: c.primary,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: radius.md,
    },
    btnText: { color: c.white, fontSize: 16, fontWeight: '800' },
    pressed: { opacity: 0.85 },
  });
