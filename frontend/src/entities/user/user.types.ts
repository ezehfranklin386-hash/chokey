export type KycLevel = 0 | 1 | 2 | 3 | 4;
export type KycStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  phone?: string;
  avatarUrl?: string;
  kycLevel: KycLevel;
  kycStatus: KycStatus;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  referralCode?: string;
}
