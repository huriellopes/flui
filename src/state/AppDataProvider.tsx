import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { pushWater, pushMeal, pushWorkout } from '@/api/logs';
import { pushProfile } from '@/api/profile';
import { notifyWaterGoalReached } from '@/services/notifications';
import {
  addXp,
  touchStreak,
  INITIAL_GAMIFICATION,
  XP_REWARDS,
  type GamificationState,
} from '@/domain/gamification';
import { emptyLog, todayKey, type DailyLog, type MealEntry, type WorkoutEntry } from '@/domain/log';
import { calcTargets, type DailyTargets } from '@/domain/nutrition';
import type { UserProfile } from '@/domain/profile';
import { useAuth } from '@/state/AuthProvider';
import { loadLog, saveLog } from '@/storage/dailyLog';
import { loadGamification, saveGamification } from '@/storage/gamification';
import { clearProfile, loadProfile, saveProfile } from '@/storage/profile';

// Sincronização best-effort: nunca quebra o fluxo offline se a API falhar.
function syncSafe(run: () => Promise<unknown>) {
  run().catch(() => undefined);
}

interface AppData {
  loading: boolean;
  profile: UserProfile | null;
  targets: DailyTargets | null;
  todayLog: DailyLog;
  gamification: GamificationState;
  saveUserProfile: (p: UserProfile) => Promise<void>;
  resetProfile: () => Promise<void>;
  resetAllLocal: () => Promise<void>;
  addWater: (ml: number) => Promise<void>;
  addMeal: (meal: Omit<MealEntry, 'id' | 'at'>) => Promise<void>;
  addWorkout: (w: Omit<WorkoutEntry, 'id' | 'at'>) => Promise<void>;
}

const Ctx = createContext<AppData | null>(null);

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog>(emptyLog(todayKey()));
  const [gamification, setGamification] = useState<GamificationState>(INITIAL_GAMIFICATION);

  // Espelho síncrono do log do dia. Garante que registros disparados em sequência
  // (ex.: dois toques rápidos em +água) acumulem em vez de sobrescrever, já que o
  // estado do React só reflete a mudança no próximo render.
  const logRef = useRef<DailyLog>(todayLog);

  useEffect(() => {
    (async () => {
      const [p, log, g] = await Promise.all([
        loadProfile(),
        loadLog(todayKey()),
        loadGamification(),
      ]);
      setProfile(p);
      logRef.current = log;
      setTodayLog(log);
      setGamification(g);
      setLoading(false);
    })();
  }, []);

  // Virada de dia com o app aberto. Recarrega o log do dia atual para não
  // registrar no dia anterior. Dois gatilhos complementares:
  //  - AppState: cobre voltar ao primeiro plano após a virada;
  //  - timer para a próxima meia-noite: cobre o app aberto e visível na virada.
  useEffect(() => {
    const refreshIfDayChanged = () => {
      const key = todayKey();
      if (logRef.current.date === key) return;
      loadLog(key).then((log) => {
        logRef.current = log;
        setTodayLog(log);
      });
    };

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshIfDayChanged();
    });

    let timer: ReturnType<typeof setTimeout>;
    const scheduleMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0); // próxima meia-noite no horário local
      // +1s de folga para garantir que todayKey() já virou.
      timer = setTimeout(() => {
        refreshIfDayChanged();
        scheduleMidnight();
      }, nextMidnight.getTime() - now.getTime() + 1000);
    };
    scheduleMidnight();

    return () => {
      sub.remove();
      clearTimeout(timer);
    };
  }, []);

  const targets = useMemo(() => (profile ? calcTargets(profile) : null), [profile]);

  const persistLog = useCallback(async (next: DailyLog) => {
    logRef.current = next;
    setTodayLog(next);
    await saveLog(next);
  }, []);

  const reward = useCallback(async (amount: number) => {
    setGamification((prev) => {
      const next = addXp(touchStreak(prev, todayKey()), amount);
      saveGamification(next);
      return next;
    });
  }, []);

  const saveUserProfile = useCallback(
    async (p: UserProfile) => {
      setProfile(p);
      await saveProfile(p);
      if (isLoggedIn) syncSafe(() => pushProfile(p));
    },
    [isLoggedIn],
  );

  // Ao logar, envia o perfil local para o servidor recalcular/guardar as metas.
  useEffect(() => {
    if (isLoggedIn && profile) syncSafe(() => pushProfile(profile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const resetProfile = useCallback(async () => {
    await clearProfile();
    setProfile(null);
  }, []);

  // Apaga TODOS os dados locais do usuário (perfil/questionário, registros,
  // gamificação, ajustes, tema, bloqueio) e reseta o estado em memória.
  // Usado na exclusão de conta.
  const resetAllLocal = useCallback(async () => {
    try {
      await AsyncStorage.clear();
    } catch {
      // ignora falha de limpeza; o reset em memória abaixo já esvazia a sessão
    }
    const empty = emptyLog(todayKey());
    logRef.current = empty;
    setTodayLog(empty);
    setGamification(INITIAL_GAMIFICATION);
    setProfile(null);
  }, []);

  const addWater = useCallback(
    async (ml: number) => {
      const before = logRef.current.waterMl;
      const after = before + ml;
      await persistLog({ ...logRef.current, waterMl: after });
      await reward(XP_REWARDS.WATER);
      if (isLoggedIn) syncSafe(() => pushWater(ml));
      // Comemora ao cruzar a meta diária (uma vez).
      if (targets && before < targets.waterMl && after >= targets.waterMl) {
        notifyWaterGoalReached().catch(() => undefined);
      }
    },
    [persistLog, reward, isLoggedIn, targets],
  );

  const addMeal = useCallback(
    async (meal: Omit<MealEntry, 'id' | 'at'>) => {
      const entry: MealEntry = { ...meal, id: newId(), at: new Date().toISOString() };
      await persistLog({ ...logRef.current, meals: [...logRef.current.meals, entry] });
      await reward(XP_REWARDS.MEAL);
      if (isLoggedIn) syncSafe(() => pushMeal(meal));
    },
    [persistLog, reward, isLoggedIn],
  );

  const addWorkout = useCallback(
    async (w: Omit<WorkoutEntry, 'id' | 'at'>) => {
      const entry: WorkoutEntry = { ...w, id: newId(), at: new Date().toISOString() };
      await persistLog({ ...logRef.current, workouts: [...logRef.current.workouts, entry] });
      await reward(XP_REWARDS.WORKOUT);
      if (isLoggedIn) syncSafe(() => pushWorkout(w));
    },
    [persistLog, reward, isLoggedIn],
  );

  const value: AppData = {
    loading,
    profile,
    targets,
    todayLog,
    gamification,
    saveUserProfile,
    resetProfile,
    resetAllLocal,
    addWater,
    addMeal,
    addWorkout,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData(): AppData {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppData deve ser usado dentro de AppDataProvider');
  return ctx;
}
