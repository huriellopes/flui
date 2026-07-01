import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import {
  darkColors,
  lightColors,
  type ColorScheme,
  type Palette,
  type ThemePreference,
} from './theme';

const KEY = '@notify-water/theme';

interface ThemeContextValue {
  colors: Palette;
  scheme: ColorScheme; // resolvido (light|dark)
  preference: ThemePreference; // escolha do usuário (light|dark|system)
  setPreference: (p: ThemePreference) => void;
}

const Ctx = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [preference, setPref] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setPref(v);
    });
  }, []);

  const setPreference = (p: ThemePreference) => {
    setPref(p);
    AsyncStorage.setItem(KEY, p);
  };

  const scheme: ColorScheme =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: scheme === 'dark' ? darkColors : lightColors,
      scheme,
      preference,
      setPreference,
    }),
    [scheme, preference],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): Palette {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx.colors;
}

export function useThemeControl() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useThemeControl deve ser usado dentro de ThemeProvider');
  return { scheme: ctx.scheme, preference: ctx.preference, setPreference: ctx.setPreference };
}

export function useThemedStyles<T>(factory: (c: Palette) => T): T {
  const colors = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
