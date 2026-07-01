export type Sex = 'MALE' | 'FEMALE';
export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
export type Goal = 'LOSE_FAT' | 'MAINTAIN' | 'GAIN_MUSCLE';

export interface UserProfile {
  name: string;
  sex: Sex;
  birthDate: string; // ISO yyyy-mm-dd
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  createdAt: string;
}

/** Retorna o primeiro e o último nome (ex.: "Huriel Lopes"). */
export function shortName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

export function ageFromBirthDate(birthDate: string, now = new Date()): number {
  const b = new Date(birthDate);
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export const SEX_LABELS: Record<Sex, string> = {
  MALE: 'Masculino',
  FEMALE: 'Feminino',
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: 'Sedentário',
  LIGHT: 'Leve (1 a 2x por semana)',
  MODERATE: 'Moderado (3 a 4x por semana)',
  ACTIVE: 'Ativo (5 a 6x por semana)',
  VERY_ACTIVE: 'Muito ativo (2x por dia)',
};

export const GOAL_LABELS: Record<Goal, string> = {
  LOSE_FAT: 'Perder gordura',
  MAINTAIN: 'Manter peso',
  GAIN_MUSCLE: 'Ganhar massa',
};
