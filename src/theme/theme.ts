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
  background: '#F2F8FB',
  surface: '#FFFFFF',
  surfaceAlt: '#E8F3F9',
  primary: '#1595CC',
  primaryDark: '#0E7AAD',
  primarySoft: '#DCF1FA',
  water: '#22B8D9',
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
  background: '#08151D',
  surface: '#10202B',
  surfaceAlt: '#172C3A',
  primary: '#35B4E0',
  primaryDark: '#1E93C0',
  primarySoft: '#123246',
  water: '#3CC6E6',
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
