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

/** Notificação imediata confirmando que os lembretes foram ativados. */
export async function notifyRemindersEnabled(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔔 Lembretes ativados!',
      body: 'Vamos te lembrar de beber água ao longo do dia. 💧',
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
    trigger: null,
  });
}

// Teto de segurança: o iOS limita ~64 notificações locais pendentes.
const MAX_DAILY_SLOTS = 60;

/**
 * Calcula os horários (em minutos desde a meia-noite) em que os lembretes
 * devem disparar, dentro da janela [startHour, endHour] e a cada intervalo.
 * Retorna uma lista vazia se a janela for inválida.
 */
export function buildReminderSlots(settings: ReminderSettings): number[] {
  const interval = Math.max(1, Math.round(settings.intervalMinutes));
  const start = Math.max(0, Math.min(23, settings.startHour)) * 60;
  const end = Math.max(0, Math.min(23, settings.endHour)) * 60;
  if (end <= start) return [];

  const slots: number[] = [];
  for (let mins = start; mins <= end && slots.length < MAX_DAILY_SLOTS; mins += interval) {
    slots.push(mins);
  }
  return slots;
}

/**
 * Reagenda todos os lembretes de água com base nas configurações atuais.
 * Cancela o que existia antes para evitar duplicidade.
 *
 * Estratégia: um gatilho diário recorrente para cada horário dentro da janela
 * [startHour, endHour], respeitando o intervalo. Assim os lembretes só chegam
 * no período desejado do dia (e não 24h).
 *
 * Retorna true se a permissão foi concedida e os lembretes foram agendados.
 */
export async function rescheduleReminders(settings: ReminderSettings): Promise<boolean> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!settings.enabled) return false;

  const granted = await ensureNotificationPermissions();
  if (!granted) return false;

  const slots = buildReminderSlots(settings);
  for (const mins of slots) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Hora de beber água',
        body: 'Faça uma pausa e hidrate-se para bater sua meta diária.',
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: Math.floor(mins / 60),
        minute: mins % 60,
      },
    });
  }
  return true;
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
