import { useQuery } from '@tanstack/react-query';
import { walletApi } from '@/shared/api/wallet';

/** Fetch all wallets with portfolio summary */
export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: walletApi.getWallets,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Fetch single wallet by asset */
export function useWalletBalance(assetId: string) {
  return useQuery({
    queryKey: ['wallet', assetId],
    queryFn: () => walletApi.getWallet(assetId),
    enabled: !!assetId,
    staleTime: 10_000,
  });
}

/** Fetch recent transactions */
export function useTransactions(params?: {
  assetId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => walletApi.getTransactions(params ?? {}),
    staleTime: 15_000,
  });
}

/** Fetch portfolio history for chart */
export function usePortfolioHistory(params?: {
  interval?: string;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: ['portfolio-history', params],
    queryFn: () => walletApi.getPortfolioHistory(params),
    staleTime: 60_000,
  });
}
