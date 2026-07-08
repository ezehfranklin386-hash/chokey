import { type PropsWithChildren, createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User, AuthTokens, LoginRequest } from '@/entities/user/user.types';
import { IS_DEMO_MODE } from '@/shared/api/demo/demoConfig';
import { DEMO_USER, DEMO_TOKENS } from '@/shared/api/demo/demoData';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  tokens: AuthTokens | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'auth_tokens';

function loadTokens(): AuthTokens | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveTokens(tokens: AuthTokens) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

function clearTokens() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();

  // ── Demo mode: auto-login ───────────────────────────────
  useEffect(() => {
    if (IS_DEMO_MODE) {
      saveTokens(DEMO_TOKENS);
      queryClient.setQueryData(['auth', 'me'], DEMO_USER);
    }
  }, [queryClient]);

  const tokens = useMemo(() => {
    if (IS_DEMO_MODE) return DEMO_TOKENS;
    return loadTokens();
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (IS_DEMO_MODE) return DEMO_USER;
      // Stub: replace with actual API call
      // const res = await apiClient.get('/auth/me');
      // return res.data;
      return null as User | null;
    },
    enabled: !!tokens,
    staleTime: 5 * 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: async (_data: LoginRequest) => {
      if (IS_DEMO_MODE) return { user: DEMO_USER, tokens: DEMO_TOKENS };
      // Stub: replace with actual API call
      // const res = await apiClient.post('/auth/login', data);
      // return res.data;
      throw new Error('API not connected');
    },
    onSuccess: (result: { user: User; tokens: AuthTokens }) => {
      saveTokens(result.tokens);
      queryClient.setQueryData(['auth', 'me'], result.user);
    },
  });

  const logout = useCallback(() => {
    clearTokens();
    queryClient.setQueryData(['auth', 'me'], null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isLoading,
      login: async (data: LoginRequest) => {
        await loginMutation.mutateAsync(data);
      },
      logout,
      tokens,
    }),
    [user, isLoading, loginMutation, logout, tokens],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
