import { useCallback, useEffect, useState } from 'react';

import {
  cancelAllReminders,
  notifyRemindersEnabled,
  rescheduleReminders,
} from '@/services/notifications';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type ReminderSettings,
} from '@/storage/settings';

/**
 * Estado central dos lembretes: carrega as configurações persistidas,
 * salva alterações e mantém o agendamento de notificações sincronizado.
 */
export function useWaterReminders() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadSettings().then((s) => {
      if (active) {
        setSettings(s);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback(
    async (patch: Partial<ReminderSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await saveSettings(next);
      if (next.enabled) await rescheduleReminders(next);
    },
    [settings],
  );

  /** Alterna os lembretes. Retorna true se ativou e a permissão foi concedida. */
  const toggleEnabled = useCallback(async (): Promise<boolean> => {
    const next = { ...settings, enabled: !settings.enabled };
    setSettings(next);
    await saveSettings(next);
    if (!next.enabled) {
      await cancelAllReminders();
      return true;
    }
    const granted = await rescheduleReminders(next);
    if (!granted) {
      // Permissão negada: reverte o toggle para não ficar "ligado" sem funcionar.
      const reverted = { ...next, enabled: false };
      setSettings(reverted);
      await saveSettings(reverted);
      return false;
    }
    await notifyRemindersEnabled();
    return true;
  }, [settings]);

  return { settings, loading, update, toggleEnabled };
}
