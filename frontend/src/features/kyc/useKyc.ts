import { useQuery, useMutation } from '@tanstack/react-query';
import { kycApi } from '@/shared/api/kyc';
import type { KycSubmission } from '@/entities/kyc/kyc.types';
import { showSuccessToast, showErrorToast } from '@/shared/ui';

/** Fetch KYC status */
export function useKycStatus() {
  return useQuery({
    queryKey: ['kyc-status'],
    queryFn: kycApi.getStatus,
    staleTime: 30_000,
  });
}

/** Submit KYC application */
export function useSubmitKyc() {
  return useMutation({
    mutationFn: (data: KycSubmission) => kycApi.submitKyc(data),
    onSuccess: () => {
      showSuccessToast('KYC application submitted successfully');
    },
    onError: (err: any) => {
      showErrorToast(err?.response?.data?.message || 'Failed to submit KYC');
    },
  });
}

/** Upload a document file */
export function useUploadDocument() {
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) => kycApi.uploadDocument(file, type),
    onError: () => {
      showErrorToast('Failed to upload file');
    },
  });
}
