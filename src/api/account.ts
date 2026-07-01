import type { AuthUser } from './auth';
import { apiRequest } from './client';

export function updateAccount(data: { name?: string; email?: string }) {
  return apiRequest<AuthUser>('/users/me', { method: 'PATCH', auth: true, body: data });
}

export function updatePassword(currentPassword: string, newPassword: string) {
  return apiRequest<{ ok: boolean }>('/users/me/password', {
    method: 'PATCH',
    auth: true,
    body: { currentPassword, newPassword },
  });
}
