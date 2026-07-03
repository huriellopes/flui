import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@notify-water/appLock';

/** Se o bloqueio do app (biometria/PIN) está ativo. */
export async function loadAppLock(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === '1';
  } catch {
    return false;
  }
}

export async function saveAppLock(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY, enabled ? '1' : '0');
}
