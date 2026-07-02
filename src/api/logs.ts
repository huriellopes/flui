import type { MealEntry, WorkoutEntry } from '@/domain/log';
import { apiRequest } from './client';

export function pushWater(waterMl: number) {
  return apiRequest('/logs/water', { method: 'POST', auth: true, body: { waterMl } });
}

export function pushMeal(meal: Omit<MealEntry, 'id' | 'at'>) {
  return apiRequest('/logs/meal', {
    method: 'POST',
    auth: true,
    body: {
      label: meal.label,
      calories: meal.calories,
      proteinG: meal.proteinG,
      carbsG: meal.carbsG,
      fatG: meal.fatG,
    },
  });
}

export function pushWorkout(workout: Omit<WorkoutEntry, 'id' | 'at'>) {
  return apiRequest('/logs/workout', {
    method: 'POST',
    auth: true,
    body: { workoutKind: workout.kind, durationMin: workout.durationMin },
  });
}

/** Estimativa de macros a partir de uma foto (retorno do backend de visão). */
export type MealAnalysis = {
  dish: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  portion: string;
  confidence: 'low' | 'medium' | 'high';
  provider: string;
};

/** Envia a foto do prato e recebe a estimativa de prato + macros (não registra). */
export function analyzeMealPhoto(imageBase64: string, imageMime?: string) {
  return apiRequest<MealAnalysis>('/logs/analyze-meal-photo', {
    method: 'POST',
    auth: true,
    body: { imageBase64, imageMime },
  });
}
