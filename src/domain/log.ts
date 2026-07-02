import { dayKeyInTZ } from './datetime';

export interface MealEntry {
  id: string;
  label: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  at: string; // ISO
}

export interface WorkoutEntry {
  id: string;
  kind: string;
  durationMin: number;
  at: string; // ISO
}

export interface DailyLog {
  date: string; // yyyy-mm-dd
  waterMl: number;
  meals: MealEntry[];
  workouts: WorkoutEntry[];
}

export function emptyLog(date: string): DailyLog {
  return { date, waterMl: 0, meals: [], workouts: [] };
}

export function totalCalories(log: DailyLog): number {
  return log.meals.reduce((s, m) => s + m.calories, 0);
}
export function totalProtein(log: DailyLog): number {
  return log.meals.reduce((s, m) => s + m.proteinG, 0);
}
export function totalCarbs(log: DailyLog): number {
  return log.meals.reduce((s, m) => s + m.carbsG, 0);
}
export function totalFat(log: DailyLog): number {
  return log.meals.reduce((s, m) => s + m.fatG, 0);
}

/**
 * Chave do dia (yyyy-mm-dd) no fuso do usuário (dispositivo, com fallback
 * America/Sao_Paulo). Evita virar o dia às 21h como acontecia usando UTC.
 */
export function todayKey(now = new Date()): string {
  return dayKeyInTZ(now);
}
