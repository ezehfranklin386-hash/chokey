import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/shared/api/wallet';
import { showSuccessToast, showErrorToast } from '@/shared/ui';
import { useNavigate } from 'react-router-dom';

/** Hook for fetching deposit address and network info */
export function useDepositAddress(assetId: string) {
  return {
    getAddress: async (network?: string) => {
      try {
        const result = await walletApi.getDepositAddress(assetId, network);
        return result;
      } catch (err: any) {
        showErrorToast(err?.response?.data?.message || 'Failed to get deposit address');
        throw err;
      }
    },
    getNetworks: async () => {
      try {
        return await walletApi.getDepositNetworks(assetId);
      } catch (err: any) {
        showErrorToast(err?.response?.data?.message || 'Failed to get deposit networks');
        throw err;
      }
    },
  };
}

/** Hook for withdrawal mutations */
export function useWithdraw() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: {
      assetId: string;
      address: string;
      amount: string;
      network: string;
      twoFactorCode?: string;
    }) => walletApi.withdraw(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      showSuccessToast('Withdrawal submitted successfully');
      navigate(`/app/wallet/${result.id}`, { replace: true });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Withdrawal failed. Please try again.';
      showErrorToast(message);
    },
  });
}

/** Hook for withdrawal fee estimates */
export function useWithdrawEstimate() {
  return useMutation({
    mutationFn: (data: { assetId: string; amount: string; network: string }) =>
      walletApi.getWithdrawEstimate(data.assetId, data.amount, data.network),
    onError: () => {
      // Silent fail — estimates are non-critical
    },
  });
}
