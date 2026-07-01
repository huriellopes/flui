import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { ReminderSettings } from '@/storage/settings';

const ANDROID_CHANNEL_ID = 'water-reminders';

// Como as notificações devem se comportar quando o app está em primeiro plano.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Solicita permissão de notificação e cria o canal no Android.
 * Retorna true se a permissão foi concedida.
 */
export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Lembretes de água',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0B7FAB',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  return status === 'granted';
}

/** Notificação imediata de comemoração ao bater a meta diária de água. */
export async function notifyWaterGoalReached(): Promise<void> {
  const granted = await ensureNotificationPermissions();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎉 Meta de água batida!',
      body: 'Mandou bem! Você atingiu sua meta de hidratação de hoje. 💧',
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
    trigger: null, // dispara imediatamente
  });
}

/**
 * Reagenda todos os lembretes de água com base nas configurações atuais.
 * Cancela o que existia antes para evitar duplicidade.
 */
export async function rescheduleReminders(settings: ReminderSettings): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!settings.enabled) return;

  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  // MVP: um lembrete recorrente a cada X minutos. A janela de horário
  // (startHour/endHour) será aplicada num próximo passo, quando decidirmos
  // a estratégia de agendamento (alarme exato vs. intervalos).
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💧 Hora de beber água',
      body: 'Faça uma pausa e hidrate-se para bater sua meta diária.',
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(60, settings.intervalMinutes * 60),
      repeats: true,
    },
  });
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
