// Motor de cálculo nutricional (espelhado na API em src/nutrition/nutrition.ts).
// Mifflin-St Jeor (BMR) + fatores de atividade + macros por g/kg.
import { ageFromBirthDate, type ActivityLevel, type Goal, type UserProfile } from './profile';

export interface DailyTargets {
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
}

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9,
};

const GOAL_CALORIE_FACTOR: Record<Goal, number> = {
  LOSE_FAT: 0.8,
  MAINTAIN: 1.0,
  GAIN_MUSCLE: 1.1,
};

export function calcBMR(p: UserProfile): number {
  const age = ageFromBirthDate(p.birthDate);
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * age;
  return p.sex === 'MALE' ? base + 5 : base - 161;
}

export function calcTDEE(p: UserProfile): number {
  return calcBMR(p) * ACTIVITY_FACTORS[p.activityLevel];
}

function proteinPerKg(p: UserProfile): number {
  if (p.activityLevel === 'SEDENTARY') return 1.6;
  return p.goal === 'MAINTAIN' ? 1.8 : 2.0;
}

export function calcTargets(p: UserProfile): DailyTargets {
  const bmr = calcBMR(p);
  const tdee = calcTDEE(p);
  const calories = tdee * GOAL_CALORIE_FACTOR[p.goal];

  const proteinG = proteinPerKg(p) * p.weightKg;
  const fatG = 0.9 * p.weightKg;
  const carbsKcal = Math.max(0, calories - proteinG * 4 - fatG * 9);
  const carbsG = carbsKcal / 4;
  const waterMl = 35 * p.weightKg;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories: Math.round(calories),
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
    waterMl: Math.round(waterMl / 50) * 50,
  };
}
