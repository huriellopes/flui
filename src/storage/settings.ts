import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Configurações do usuário para os lembretes de hidratação.
 * Mantido simples de propósito — os requisitos vão evoluir com o tempo.
 */
export type ReminderSettings = {
  /** Meta diária de água em mililitros. */
  dailyGoalMl: number;
  /** Intervalo entre lembretes, em minutos. */
  intervalMinutes: number;
  /** Hora (0-23) em que os lembretes começam no dia. */
  startHour: number;
  /** Hora (0-23) em que os lembretes param no dia. */
  endHour: number;
  /** Se os lembretes estão ativos. */
  enabled: boolean;
};

export const DEFAULT_SETTINGS: ReminderSettings = {
  dailyGoalMl: 2000,
  intervalMinutes: 60,
  startHour: 8,
  endHour: 22,
  enabled: false,
};

const STORAGE_KEY = '@notify-water/settings';

export async function loadSettings(): Promise<ReminderSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<ReminderSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: ReminderSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
