import { z } from 'zod';

// ── Login ──────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ── Register ───────────────────────────────────────────────
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
    passwordConfirm: z.string().min(1, 'Please confirm your password'),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ── Two-Factor Auth ────────────────────────────────────────
export const twoFactorSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must be numeric'),
  trustDevice: z.boolean().optional().default(false),
});

export type TwoFactorFormData = z.infer<typeof twoFactorSchema>;

export const recoveryCodeSchema = z.object({
  recoveryCode: z.string().min(1, 'Recovery code is required'),
});

export type RecoveryCodeFormData = z.infer<typeof recoveryCodeSchema>;

// ── Forgot Password ────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ── Reset Password ─────────────────────────────────────────
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
    passwordConfirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ── Email Verification ─────────────────────────────────────
export const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must be numeric'),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

// ── Password Strength ──────────────────────────────────────
export type PasswordStrength = 'empty' | 'weak' | 'medium' | 'strong';

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 'empty';

  let score = 0;

  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score < 3) return 'weak';
  if (score < 5) return 'medium';
  return 'strong';
}

export const passwordStrengthLabels: Record<PasswordStrength, string> = {
  empty: '',
  weak: 'Weak',
  medium: 'Medium',
  strong: 'Strong',
};

export const passwordStrengthColors: Record<PasswordStrength, string> = {
  empty: 'bg-primary-500',
  weak: 'bg-market-red',
  medium: 'bg-warning',
  strong: 'bg-market-green',
};
