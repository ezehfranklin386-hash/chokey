import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from './authApi';
import { useAuth } from '@/app/providers/AuthProvider';
import type { LoginFormData, RegisterFormData } from './validation';

// ── Login hook ─────────────────────────────────────────────
export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: (response) => {
      // If 2FA is required, redirect with temp token
      if (response.requiresTwoFactor) {
        navigate('/auth/2fa', {
          state: { tempToken: response.tempToken },
        });
        return;
      }

      // Save tokens
      sessionStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
      queryClient.setQueryData(['auth', 'me'], response.user);
      toast.success('Welcome back!');
      navigate('/app/dashboard', { replace: true });
    },
    onError: (error: { code?: string; message?: string }) => {
      const msg = error?.message ?? 'Login failed. Please try again.';

      // Handle specific error codes
      if (error?.code === 'ACCOUNT_LOCKED') {
        toast.error('Account locked. Please contact support or reset your password.');
      } else if (error?.code === 'RATE_LIMITED') {
        toast.error('Too many attempts. Please wait a moment.');
      } else {
        toast.error(msg);
      }
    },
  });
}

// ── Register hook ──────────────────────────────────────────
export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterFormData) => authApi.register(data),
    onSuccess: () => {
      toast.success('Account created! Please check your email for the verification code.');
      navigate('/auth/verify-email', { replace: true });
    },
    onError: (error: { code?: string; message?: string }) => {
      const msg = error?.message ?? 'Registration failed. Please try again.';

      if (error?.code === 'EMAIL_EXISTS') {
        toast.error('An account with this email already exists.');
      } else {
        toast.error(msg);
      }
    },
  });
}

// ── Logout hook ────────────────────────────────────────────
export function useLogout() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Clear all cached data
      queryClient.clear();
      logout();
      navigate('/auth/sign-in', { replace: true });
      toast.success('Logged out successfully');
    },
  });
}

// ── Email verification hook ────────────────────────────────
export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { code: string }) => authApi.verifyEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Email verified!');
    },
    onError: () => {
      toast.error('Invalid verification code. Please try again.');
    },
  });
}

// ── Resend verification hook ───────────────────────────────
export function useResendVerification() {
  return useMutation({
    mutationFn: () => authApi.resendVerification(),
    onSuccess: () => {
      toast.success('Verification code resent!');
    },
    onError: () => {
      toast.error('Failed to resend code. Please try again later.');
    },
  });
}

// ── 2FA verification hook ──────────────────────────────────
export function useVerifyTwoFactor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      code: string;
      tempToken: string;
      trustDevice?: boolean;
    }) => authApi.verifyTwoFactor(data),
    onSuccess: (response) => {
      sessionStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
      queryClient.setQueryData(['auth', 'me'], response.user);
      toast.success('Verified!');
      navigate('/app/dashboard', { replace: true });
    },
    onError: () => {
      toast.error('Invalid code. Please try again.');
    },
  });
}

// ── 2FA recovery code hook ─────────────────────────────────
export function useRecoveryCode() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      recoveryCode: string;
      tempToken: string;
    }) => authApi.verifyRecoveryCode(data),
    onSuccess: (response) => {
      sessionStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
      queryClient.setQueryData(['auth', 'me'], response.user);
      toast.success('Recovery code accepted. Please set up a new 2FA method.');
      navigate('/auth/2fa/setup', { replace: true });
    },
    onError: () => {
      toast.error('Invalid recovery code.');
    },
  });
}

// ── Forgot password hook ───────────────────────────────────
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.forgotPassword(data),
    onSuccess: () => {
      toast.success('If an account exists, you will receive a password reset email.');
    },
    onError: () => {
      toast.error('Failed to send reset email. Please try again.');
    },
  });
}

// ── Reset password hook ────────────────────────────────────
export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      authApi.resetPassword(data),
    onSuccess: () => {
      toast.success('Password reset successfully! Please sign in.');
      navigate('/auth/sign-in', { replace: true });
    },
    onError: () => {
      toast.error('Invalid or expired reset token. Please request a new one.');
    },
  });
}
