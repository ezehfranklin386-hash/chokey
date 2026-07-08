import type { KycLevel, KycStatus } from '@/entities/user/user.types';

export type KycStep = 'personal' | 'document' | 'selfie' | 'review' | 'submitted' | 'verified' | 'rejected';

export interface KycPersonalInfo {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
}

export interface KycDocument {
  type: 'passport' | 'national_id' | 'drivers_license' | 'residence_permit';
  frontImage: string;
  backImage?: string;
  documentNumber: string;
  expiryDate: string;
}

export interface KycSelfie {
  image: string;
  livenessStatus?: 'pending' | 'passed' | 'failed';
}

export interface KycSubmission {
  personalInfo: KycPersonalInfo;
  document: KycDocument;
  selfie: KycSelfie;
}

export interface KycStatusDetails {
  level: KycLevel;
  status: KycStatus;
  estimatedTime?: string;
  rejectionReason?: string;
  limits: {
    dailyWithdrawal: string;
    dailyDeposit: string;
    monthlyVolume: string;
  };
}
