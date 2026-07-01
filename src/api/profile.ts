import type { UserProfile } from '@/domain/profile';
import { apiRequest } from './client';

/** Envia o perfil ao servidor; ele recalcula e persiste as metas. */
export function pushProfile(p: UserProfile) {
  return apiRequest('/profile', {
    method: 'PUT',
    auth: true,
    body: {
      sex: p.sex,
      birthDate: p.birthDate,
      heightCm: p.heightCm,
      weightKg: p.weightKg,
      targetWeightKg: p.targetWeightKg,
      activityLevel: p.activityLevel,
      goal: p.goal,
    },
  });
}
