import { type PropsWithChildren, createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User, AuthTokens, KycLevel, KycStatus, LoginRequest } from '@/entities/user/user.types';
import { apiClient } from '@/shared/api/apiClient';
import { IS_DEMO_MODE } from '@/shared/api/demo/demoConfig';
import { DEMO_USER, DEMO_TOKENS } from '@/shared/api/demo/demoData';

// ── Backend-to-frontend user mapper ───────────────────────────
// Backend returns snake_case fields with different naming; this
// normalizes them to the frontend's camelCase User type.

const KYC_LEVEL_MAP: Record<string, KycLevel> = {
  NONE: 0, BASIC: 1, VERIFIED: 2, ADVANCED: 3,
};
const KYC_STATUS_MAP: Record<string, KycStatus> = {
  NONE: 'none', PENDING: 'pending', VERIFIED: 'verified', REJECTED: 'rejected',
};

function mapBackendUser(raw: Record<string, unknown>): User {
  const kycLevel = raw.kycLevel ?? raw.kyc_level ?? 'NONE';
  return {
    id: (raw.id as string) ?? '',
    email: (raw.email as string) ?? '',
    fullName: (raw.fullName as string) ?? (raw.displayName as string) ?? (raw.display_name as string) ?? '',
    username: (raw.username as string) ?? (raw.email as string)?.split('@')[0] ?? '',
    phone: (raw.phone as string) ?? undefined,
    avatarUrl: (raw.avatarUrl as string) ?? (raw.avatar_url as string) ?? undefined,
    kycLevel: KYC_LEVEL_MAP[String(kycLevel).toUpperCase()] ?? 0,
    kycStatus: KYC_STATUS_MAP[String(kycLevel).toUpperCase()] ?? 'none',
    twoFactorEnabled: !!(raw.twoFactorEnabled ?? raw.two_factor_enabled),
    createdAt: (raw.createdAt as string) ?? (raw.created_at as string) ?? '',
  };
}

function mapBackendTokens(raw: Record<string, unknown>): AuthTokens {
  return {
    accessToken: (raw.accessToken as string) ?? (raw.access_token as string) ?? '',
    refreshToken: (raw.refreshToken as string) ?? (raw.refresh_token as string) ?? '',
    expiresIn: (raw.expiresIn as number) ?? (raw.expires_in as number) ?? 1800,
  };
}

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
      const res = await apiClient.get('/auth/me');
      return mapBackendUser(res.data as unknown as Record<string, unknown>);
    },
    enabled: !!tokens,
    staleTime: 5 * 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      if (IS_DEMO_MODE) return { user: DEMO_USER, tokens: DEMO_TOKENS };
      const res = await apiClient.post('/auth/login', data);
      return {
        user: mapBackendUser((res.data.user ?? res.data) as unknown as Record<string, unknown>),
        tokens: mapBackendTokens(res.data as unknown as Record<string, unknown>),
      };
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
