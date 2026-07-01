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
