import { apiRequest } from './client';

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  _count?: { members: number };
}

export interface RankEntry {
  userId: string;
  name: string;
  xp: number;
  level: number;
  currentStreak: number;
}

export function createGroup(name: string) {
  return apiRequest<Group>('/groups', { method: 'POST', auth: true, body: { name } });
}

export function joinGroup(inviteCode: string) {
  return apiRequest<Group>('/groups/join', { method: 'POST', auth: true, body: { inviteCode } });
}

export function myGroups() {
  return apiRequest<Group[]>('/groups', { auth: true });
}

export function groupRanking(id: string) {
  return apiRequest<RankEntry[]>(`/groups/${id}/ranking`, { auth: true });
}

export function deleteGroup(id: string) {
  return apiRequest<{ ok: boolean }>(`/groups/${id}`, { method: 'DELETE', auth: true });
}
