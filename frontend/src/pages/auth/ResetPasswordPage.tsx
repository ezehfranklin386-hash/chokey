import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Input } from '@/shared/ui';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/features/auth/validation';
import { useResetPassword } from '@/features/auth/useAuth';
import { PasswordStrengthIndicator } from '@/features/auth/PasswordStrengthIndicator';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const resetMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      token,
      password: '',
      passwordConfirm: '',
    },
  });

  const password = watch('password');

  const onSubmit = (data: ResetPasswordFormData) => {
    resetMutation.mutate(data);
  };

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-market-red/20">
            <svg className="h-7 w-7 text-market-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Invalid Link</h1>
          <p className="mt-2 text-sm text-ink-70 dark:text-white-70">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>

        <Link to="/auth/forgot-password">
          <Button variant="secondary" fullWidth size="lg">
            Request New Reset Link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/10">
          <svg className="h-7 w-7 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-ink dark:text-white">Reset Password</h1>
        <p className="mt-1 text-sm text-ink-70 dark:text-white-70">
          Choose a new password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            error={errors.password?.message}
            autoComplete="new-password"
            autoFocus
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-ink-50 dark:text-white-50 hover:text-ink-90 dark:hover:text-white-90 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            }
            {...register('password')}
          />
          <PasswordStrengthIndicator password={password} />
        </div>

        <Input
          label="Confirm New Password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Re-enter new password"
          error={errors.passwordConfirm?.message}
          autoComplete="new-password"
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-ink-50 dark:text-white-50 hover:text-ink-90 dark:hover:text-white-90 transition-colors"
              aria-label={showConfirm ? 'Hide confirmation' : 'Show confirmation'}
            >
              {showConfirm ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          }
          {...register('passwordConfirm')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={resetMutation.isPending}
          disabled={!isValid && resetMutation.isPending}
        >
          Reset Password
        </Button>
      </form>

      <p className="text-center text-sm text-ink-70 dark:text-white-70">
        <Link
          to="/auth/sign-in"
          className="text-brand-500 hover:text-brand-600 transition-colors"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
