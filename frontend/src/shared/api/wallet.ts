import { apiClient } from '@/shared/api/apiClient';
import type { Wallet, Transaction, PortfolioSummary, PortfolioHistoryPoint } from '@/entities/wallet/wallet.types';
import type { PaginationMeta } from '@/entities/common/api.types';

export const walletApi = {
  /** Get all wallets/balances */
  getWallets: async (): Promise<{ wallets: Wallet[]; summary: PortfolioSummary }> => {
    const res = await apiClient.get('/wallets');
    return res as unknown as { wallets: Wallet[]; summary: PortfolioSummary };
  },

  /** Get single wallet by asset */
  getWallet: async (assetId: string): Promise<Wallet> => {
    const res = await apiClient.get(`/wallets/${assetId}`);
    return res as unknown as Wallet;
  },

  /** Get transactions with pagination */
  getTransactions: async (params: {
    assetId?: string;
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<{ transactions: Transaction[]; meta: PaginationMeta }> => {
    const res = await apiClient.get('/wallets/transactions', { params });
    return res as unknown as { transactions: Transaction[]; meta: PaginationMeta };
  },

  /** Get portfolio history for chart */
  getPortfolioHistory: async (params?: {
    interval?: string;
    from?: string;
    to?: string;
  }): Promise<PortfolioHistoryPoint[]> => {
    const res = await apiClient.get('/wallets/portfolio-history', { params });
    return res as unknown as PortfolioHistoryPoint[];
  },

  /** Generate deposit address */
  getDepositAddress: async (assetId: string, network?: string): Promise<{
    address: string;
    network: string;
    memo?: string;
    qrCode?: string;
    minDeposit?: string;
    estimatedArrival?: string;
  }> => {
    const res = await apiClient.get(`/wallets/${assetId}/deposit`, { params: { network } });
    return res as unknown as { address: string; network: string; memo?: string; qrCode?: string; minDeposit?: string; estimatedArrival?: string };
  },

  /** Get supported deposit networks */
  getDepositNetworks: async (assetId: string): Promise<Array<{
    network: string;
    name: string;
    fee: string;
    minConfirmations: number;
    isRecommended: boolean;
  }>> => {
    const res = await apiClient.get(`/wallets/${assetId}/deposit/networks`);
    return res as unknown as Array<{ network: string; name: string; fee: string; minConfirmations: number; isRecommended: boolean }>;
  },

  /** Submit withdrawal request */
  withdraw: async (data: {
    assetId: string;
    address: string;
    amount: string;
    network: string;
    twoFactorCode?: string;
  }): Promise<{ id: string; status: string; estimatedArrival?: string }> => {
    const res = await apiClient.post('/wallets/withdraw', data);
    return res as unknown as { id: string; status: string; estimatedArrival?: string };
  },

  /** Get withdrawal fee estimate */
  getWithdrawEstimate: async (assetId: string, amount: string, network: string): Promise<{
    fee: string;
    total: string;
    receiving: string;
    minWithdraw: string;
    maxWithdraw: string;
  }> => {
    const res = await apiClient.get(`/wallets/${assetId}/withdraw/estimate`, { params: { amount, network } });
    return res as unknown as { fee: string; total: string; receiving: string; minWithdraw: string; maxWithdraw: string };
  },
};
