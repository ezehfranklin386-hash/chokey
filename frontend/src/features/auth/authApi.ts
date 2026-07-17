import { apiClient } from '@/shared/api/apiClient';
import type { User, AuthTokens } from '@/entities/user/user.types';

// ── Response types ─────────────────────────────────────────
interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  requiresTwoFactor?: boolean;
  tempToken?: string;
}

interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

interface TwoFactorResponse {
  user: User;
  tokens: AuthTokens;
}

interface VerifyEmailResponse {
  verified: boolean;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordResponse {
  message: string;
}

interface Setup2FAResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

interface Verify2FAResponse {
  enabled: boolean;
  recoveryCodes: string[];
}

// ── API functions ──────────────────────────────────────────

export const authApi = {
  /** Sign in with email + password */
  login: async (data: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<LoginResponse> => {
    const { data: body } = await apiClient.post('/auth/login', data);
    return body as unknown as LoginResponse;
  },

  /** Register a new account */
  register: async (data: {
    email: string;
    password: string;
    referralCode?: string;
  }): Promise<RegisterResponse> => {
    const { data: body } = await apiClient.post('/auth/register', data);
    return body as unknown as RegisterResponse;
  },

  /** Verify email with 6-digit code */
  verifyEmail: async (data: {
    code: string;
  }): Promise<VerifyEmailResponse> => {
    const { data: body } = await apiClient.post('/auth/verify-email', data);
    return body as unknown as VerifyEmailResponse;
  },

  /** Resend email verification code */
  resendVerification: async (): Promise<{ message: string }> => {
    const { data: body } = await apiClient.post('/auth/resend-verification');
    return body as unknown as { message: string };
  },

  /** Verify 2FA TOTP code */
  verifyTwoFactor: async (data: {
    code: string;
    tempToken: string;
    trustDevice?: boolean;
  }): Promise<TwoFactorResponse> => {
    const { data: body } = await apiClient.post('/auth/2fa/verify', data);
    return body as unknown as TwoFactorResponse;
  },

  /** Verify recovery code */
  verifyRecoveryCode: async (data: {
    recoveryCode: string;
    tempToken: string;
  }): Promise<TwoFactorResponse> => {
    const { data: body } = await apiClient.post('/auth/2fa/recovery', data);
    return body as unknown as TwoFactorResponse;
  },

  /** Forgot password — send reset email */
  forgotPassword: async (data: {
    email: string;
  }): Promise<ForgotPasswordResponse> => {
    const { data: body } = await apiClient.post('/auth/forgot-password', data);
    return body as unknown as ForgotPasswordResponse;
  },

  /** Reset password with token */
  resetPassword: async (data: {
    token: string;
    password: string;
  }): Promise<ResetPasswordResponse> => {
    const { data: body } = await apiClient.post('/auth/reset-password', data);
    return body as unknown as ResetPasswordResponse;
  },

  /** Refresh access token */
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const { data: body } = await apiClient.post('/auth/refresh', { refreshToken });
    return body as unknown as AuthTokens;
  },

  /** Logout — invalidate tokens server-side */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /** Get current user profile */
  getMe: async (): Promise<User> => {
    const { data: body } = await apiClient.get('/auth/me');
    return body as unknown as User;
  },

  /** Setup 2FA — get QR code and backup codes */
  setup2FA: async (): Promise<Setup2FAResponse> => {
    const { data: body } = await apiClient.post('/auth/2fa/setup');
    return body as unknown as Setup2FAResponse;
  },

  /** Confirm 2FA setup with TOTP code */
  confirm2FA: async (data: {
    code: string;
  }): Promise<Verify2FAResponse> => {
    const { data: body } = await apiClient.post('/auth/2fa/confirm', data);
    return body as unknown as Verify2FAResponse;
  },

  /** Disable 2FA */
  disable2FA: async (data: {
    code: string;
  }): Promise<{ disabled: boolean }> => {
    const { data: body } = await apiClient.post('/auth/2fa/disable', data);
    return body as unknown as { disabled: boolean };
  },
};
