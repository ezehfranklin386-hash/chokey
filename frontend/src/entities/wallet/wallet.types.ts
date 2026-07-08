export interface Wallet {
  id: string;
  asset: string;
  name: string;
  balance: string;
  locked: string;
  available: string;
  usdValue: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdraw' | 'transfer_in' | 'transfer_out';
  asset: string;
  amount: string;
  usdValue: string;
  fee: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  confirmations?: number;
  createdAt: string;
  completedAt?: string;
}

export interface PortfolioSummary {
  totalBalance: string;
  totalUsdValue: string;
  change24h: string;
  changePercent24h: string;
  inOrders: string;
  available: string;
}

export interface PortfolioHistoryPoint {
  time: string;
  value: number;
}
