import { apiClient } from '@/shared/api/apiClient';
import type { KycStatusDetails, KycSubmission } from '@/entities/kyc/kyc.types';

export const kycApi = {
  /** Get current KYC status and limits */
  getStatus: async (): Promise<KycStatusDetails> => {
    const res = await apiClient.get('/kyc/status');
    return res as unknown as KycStatusDetails;
  },

  /** Submit KYC application */
  submitKyc: async (data: KycSubmission): Promise<{ id: string; status: string; estimatedTime: string }> => {
    const res = await apiClient.post('/kyc/submit', data);
    return res as unknown as { id: string; status: string; estimatedTime: string };
  },

  /** Upload document file */
  uploadDocument: async (file: File, type: string): Promise<{ url: string }> => {
    const form = new FormData();
    form.append('file', file);
    form.append('type', type);
    const res = await apiClient.post('/kyc/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res as unknown as { url: string };
  },

  /** Resubmit after rejection */
  resubmitKyc: async (data: Partial<KycSubmission>): Promise<{ id: string; status: string; estimatedTime: string }> => {
    const res = await apiClient.put('/kyc/resubmit', data);
    return res as unknown as { id: string; status: string; estimatedTime: string };
  },
};
