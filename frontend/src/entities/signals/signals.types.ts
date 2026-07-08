export type SignalDirection = 'STRONG_BUY' | 'BUY' | 'SELL' | 'STRONG_SELL';
export type SignalStatus = 'active' | 'filled' | 'partial' | 'expired' | 'cancelled';
export type SignalTimeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';

export interface Signal {
  id: string;
  asset: string;
  assetName: string;
  direction: SignalDirection;
  status: SignalStatus;
  confidence: number;
  entryPrice: string;
  currentPrice?: string;
  targetPrice1: string;
  targetPrice2?: string;
  stopLoss: string;
  timeframe: SignalTimeframe;
  strategy: string;
  rationale: string;
  provider: SignalProvider;
  createdAt: string;
  expiresAt?: string;
  isBookmarked?: boolean;
  performance?: {
    pnl: string;
    pnlPercent: string;
    hitTarget1: boolean;
    hitTarget2?: boolean;
  };
}

export interface SignalProvider {
  id: string;
  name: string;
  avatarUrl?: string;
  winRate: number;
  totalSignals: number;
  totalPnl: string;
  followers: number;
  isVerified: boolean;
}

export interface SignalFilters {
  direction?: SignalDirection | 'all';
  asset?: string;
  timeframe?: SignalTimeframe | 'all';
  status?: SignalStatus | 'all';
  sortBy?: 'date' | 'confidence' | 'pnl';
}
