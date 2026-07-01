import AsyncStorage from '@react-native-async-storage/async-storage';

import { INITIAL_GAMIFICATION, type GamificationState } from '@/domain/gamification';

const KEY = '@notify-water/gamification';

export async function loadGamification(): Promise<GamificationState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw
      ? { ...INITIAL_GAMIFICATION, ...(JSON.parse(raw) as Partial<GamificationState>) }
      : INITIAL_GAMIFICATION;
  } catch {
    return INITIAL_GAMIFICATION;
  }
}

export async function saveGamification(state: GamificationState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
