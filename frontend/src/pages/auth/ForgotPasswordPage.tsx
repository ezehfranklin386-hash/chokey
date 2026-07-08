import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/shared/ui';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/features/auth/validation';
import { useForgotPassword } from '@/features/auth/useAuth';

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const forgotMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotMutation.mutate(data, {
      onSuccess: () => setEmailSent(true),
    });
  };

  if (emailSent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-market-green/20">
            <svg
              className="h-7 w-7 text-market-green"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Check Your Email</h1>
          <p className="mt-2 text-sm text-white-70">
            If an account with that email exists, we&apos;ve sent a password
            reset link. Please check your inbox and follow the instructions.
          </p>
          <p className="mt-4 text-xs text-white-50">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <button
              type="button"
              onClick={() => setEmailSent(false)}
              className="text-gold-500 hover:text-gold-400 transition-colors"
            >
              try again
            </button>
          </p>
        </div>

        <Link to="/auth/sign-in">
          <Button variant="secondary" fullWidth size="lg">
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-500/10">
          <svg
            className="h-7 w-7 text-gold-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
        <p className="mt-1 text-sm text-white-70">
          Enter your email address and we&apos;ll send you a reset link
        </p>
      </div>

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

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={forgotMutation.isPending}
          disabled={!isValid && forgotMutation.isPending}
        >
          Send Reset Link
        </Button>
      </form>

      <p className="text-center text-sm text-white-70">
        Remember your password?{' '}
        <Link
          to="/auth/sign-in"
          className="font-medium text-gold-500 hover:text-gold-400 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
