import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/shared/ui';
import {
  registerSchema,
  type RegisterFormData,
} from '@/features/auth/validation';
import { useRegister } from '@/features/auth/useAuth';
import { PasswordStrengthIndicator } from '@/features/auth/PasswordStrengthIndicator';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const registerMutation = useRegister();
  const isSubmitting = registerMutation.isPending;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      referralCode: '',
    },
  });

  const password = watch('password');

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500 shadow-glow-brand">
          <span className="text-2xl font-bold text-white">C</span>
        </div>
        <h1 className="text-2xl font-bold text-ink dark:text-white">Create Account</h1>
        <p className="mt-1 text-sm text-ink-70 dark:text-white-70">
          Start your crypto journey
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          autoComplete="email"
          autoFocus
          {...register('email')}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            error={errors.password?.message}
            autoComplete="new-password"
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
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Re-enter your password"
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

        <Input
          label="Referral Code (optional)"
          placeholder="Enter referral code"
          error={errors.referralCode?.message}
          {...register('referralCode')}
        />

        {/* Terms */}
        <p className="text-xs text-ink-50 dark:text-white-50">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-brand-500 hover:text-brand-600">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-brand-500 hover:text-brand-600">
            Privacy Policy
          </a>
        </p>

        {/* Submit */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
          disabled={!isValid && isSubmitting}
        >
          Create Account
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-ink-70 dark:text-white-70">
        Already have an account?{' '}
        <Link
          to="/auth/sign-in"
          className="font-medium text-brand-500 hover:text-brand-600 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
