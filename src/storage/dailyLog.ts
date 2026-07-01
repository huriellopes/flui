import AsyncStorage from '@react-native-async-storage/async-storage';

import { emptyLog, type DailyLog } from '@/domain/log';

const PREFIX = '@notify-water/log/';

export async function loadLog(date: string): Promise<DailyLog> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + date);
    return raw ? (JSON.parse(raw) as DailyLog) : emptyLog(date);
  } catch {
    return emptyLog(date);
  }
}

export async function saveLog(log: DailyLog): Promise<void> {
  await AsyncStorage.setItem(PREFIX + log.date, JSON.stringify(log));
}
