import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { pushWater, pushMeal, pushWorkout } from '@/api/logs';
import { pushProfile } from '@/api/profile';
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

  useEffect(() => {
    (async () => {
      const [p, log, g] = await Promise.all([
        loadProfile(),
        loadLog(todayKey()),
        loadGamification(),
      ]);
      setProfile(p);
      setTodayLog(log);
      setGamification(g);
      setLoading(false);
    })();
  }, []);

  const targets = useMemo(() => (profile ? calcTargets(profile) : null), [profile]);

  const persistLog = useCallback(async (next: DailyLog) => {
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

  const addWater = useCallback(
    async (ml: number) => {
      await persistLog({ ...todayLog, waterMl: todayLog.waterMl + ml });
      await reward(XP_REWARDS.WATER);
      if (isLoggedIn) syncSafe(() => pushWater(ml));
    },
    [persistLog, reward, todayLog, isLoggedIn],
  );

  const addMeal = useCallback(
    async (meal: Omit<MealEntry, 'id' | 'at'>) => {
      const entry: MealEntry = { ...meal, id: newId(), at: new Date().toISOString() };
      await persistLog({ ...todayLog, meals: [...todayLog.meals, entry] });
      await reward(XP_REWARDS.MEAL);
      if (isLoggedIn) syncSafe(() => pushMeal(meal));
    },
    [persistLog, reward, todayLog, isLoggedIn],
  );

  const addWorkout = useCallback(
    async (w: Omit<WorkoutEntry, 'id' | 'at'>) => {
      const entry: WorkoutEntry = { ...w, id: newId(), at: new Date().toISOString() };
      await persistLog({ ...todayLog, workouts: [...todayLog.workouts, entry] });
      await reward(XP_REWARDS.WORKOUT);
      if (isLoggedIn) syncSafe(() => pushWorkout(w));
    },
    [persistLog, reward, todayLog, isLoggedIn],
  );

  const value: AppData = {
    loading,
    profile,
    targets,
    todayLog,
    gamification,
    saveUserProfile,
    resetProfile,
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
