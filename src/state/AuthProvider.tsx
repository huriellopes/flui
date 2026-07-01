import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { loginRequest, registerRequest, type AuthUser } from '@/api/auth';
import { setAuthToken } from '@/api/client';
import { clearSession, loadSession, saveSession } from '@/storage/authToken';

interface AuthState {
  loading: boolean;
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (u: AuthUser) => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const session = await loadSession();
      if (session) {
        setAuthToken(session.token);
        setToken(session.token);
        setUser(session.user);
      }
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (t: string, u: AuthUser) => {
    setAuthToken(t);
    setToken(t);
    setUser(u);
    await saveSession(t, u);
  }, []);

  // Atualiza os dados do usuário (após editar nome/e-mail) mantendo o token.
  const updateUser = useCallback(
    async (u: AuthUser) => {
      setUser(u);
      if (token) await saveSession(token, u);
    },
    [token],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginRequest(email, password);
      await persist(res.accessToken, res.user);
    },
    [persist],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await registerRequest(name, email, password);
      await persist(res.accessToken, res.user);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    await clearSession();
  }, []);

  return (
    <Ctx.Provider
      value={{ loading, user, isLoggedIn: user !== null, login, register, logout, updateUser }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
