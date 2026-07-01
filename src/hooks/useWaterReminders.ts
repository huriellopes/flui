import { useCallback, useEffect, useState } from 'react';

import { cancelAllReminders, rescheduleReminders } from '@/services/notifications';
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

  const update = useCallback(async (patch: Partial<ReminderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      rescheduleReminders(next);
      return next;
    });
  }, []);

  const toggleEnabled = useCallback(async () => {
    setSettings((prev) => {
      const next = { ...prev, enabled: !prev.enabled };
      saveSettings(next);
      if (next.enabled) {
        rescheduleReminders(next);
      } else {
        cancelAllReminders();
      }
      return next;
    });
  }, []);

  return { settings, loading, update, toggleEnabled };
}
