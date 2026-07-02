// Lógica de gamificação offline: XP, nível, sequência (streak) e conquistas.

export interface GamificationState {
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDay: string | null; // yyyy-mm-dd
  achievements: string[];
}

export const INITIAL_GAMIFICATION: GamificationState = {
  xp: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDay: null,
  achievements: [],
};

export const XP_REWARDS = {
  WATER: 5,
  MEAL: 10,
  WORKOUT: 25,
} as const;

const XP_PER_LEVEL = 100;

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/** Progresso (0-1) dentro do nível atual. */
export function levelProgress(xp: number): number {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
}

export function xpIntoLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

function dayBefore(day: string): string {
  // Trabalha inteiramente em UTC para não deslocar a data conforme o fuso local.
  const d = new Date(day + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Atualiza a sequência quando o usuário faz alguma atividade em `today`. */
export function touchStreak(state: GamificationState, today: string): GamificationState {
  if (state.lastActiveDay === today) return state;

  const nextStreak = state.lastActiveDay === dayBefore(today) ? state.currentStreak + 1 : 1;
  return {
    ...state,
    currentStreak: nextStreak,
    longestStreak: Math.max(state.longestStreak, nextStreak),
    lastActiveDay: today,
  };
}

export function addXp(state: GamificationState, amount: number): GamificationState {
  return { ...state, xp: state.xp + amount };
}
