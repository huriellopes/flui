export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  water: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  track: string;
  success: string;
  danger: string;
  white: string;
  shadow: string;
}

export const lightColors: Palette = {
  background: '#F3F6FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF3FB',
  primary: '#2F6BFF',
  primaryDark: '#1E4FD9',
  primarySoft: '#E5EDFF',
  water: '#2FA8F4',
  calories: '#FF7A45',
  protein: '#22C55E',
  carbs: '#F59E0B',
  fat: '#A855F7',
  text: '#0F172A',
  textMuted: '#64748B',
  textFaint: '#94A3B8',
  border: '#E6EAF2',
  track: '#E9EEF6',
  success: '#22C55E',
  danger: '#EF4444',
  white: '#FFFFFF',
  shadow: '#1E293B',
};

export const darkColors: Palette = {
  background: '#0B1220',
  surface: '#151E30',
  surfaceAlt: '#1E2940',
  primary: '#4F86FF',
  primaryDark: '#3A6BE0',
  primarySoft: '#1E2A47',
  water: '#38B0FF',
  calories: '#FF8A5C',
  protein: '#34D399',
  carbs: '#FBBF24',
  fat: '#C084FC',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textFaint: '#64748B',
  border: '#253044',
  track: '#253044',
  success: '#34D399',
  danger: '#F87171',
  white: '#FFFFFF',
  shadow: '#000000',
};

export type ColorScheme = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';
