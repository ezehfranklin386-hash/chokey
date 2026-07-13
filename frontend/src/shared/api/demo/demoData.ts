// @ts-nocheck
/**
 * Demo Mode — Realistic mock data for every API endpoint.
 * Only loaded when VITE_DEMO_MODE=true.
 */
import type { User, AuthTokens } from '@/entities/user/user.types';
import type { Wallet, Transaction, PortfolioSummary, PortfolioHistoryPoint } from '@/entities/wallet/wallet.types';
import type { Asset, Candle, PriceUpdate } from '@/entities/market/asset.types';
import type { Order, TradingPair, OrderBookData, OrderBookEntry, RecentTrade, Position } from '@/entities/trading/trading.types';
import type { Signal, SignalProvider, SignalDirection, SignalTimeframe } from '@/entities/signals/signals.types';
import type { KycStatusDetails } from '@/entities/kyc/kyc.types';
import type { PaginationMeta } from '@/entities/common/api.types';

// ── Fake user ─────────────────────────────────────────────────
export const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@chokey.io',
  fullName: 'Alex Demo',
  username: 'alex_demo',
  phone: '+1-555-0100',
  avatarUrl: undefined,
  kycLevel: 2,
  kycStatus: 'verified',
  twoFactorEnabled: false,
  createdAt: '2026-01-15T08:30:00Z',
};

export const DEMO_TOKENS: AuthTokens = {
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
  expiresIn: 86400,
};

// ── Prices / Assets ───────────────────────────────────────────
const BASE_PRICES: Record<string, { price: number; change24h: number; changePercent: number }> = {
  BTC:   { price: 67432,  change24h: 1234,   changePercent: 1.86 },
  ETH:   { price: 3456,   change24h: -45,    changePercent: -1.29 },
  SOL:   { price: 187,    change24h: 12,     changePercent: 6.95 },
  BNB:   { price: 578,    change24h: -3,     changePercent: -0.52 },
  XRP:   { price: 0.512,  change24h: 0.023,  changePercent: 4.71 },
  ADA:   { price: 0.382,  change24h: -0.008, changePercent: -2.05 },
  DOT:   { price: 5.23,   change24h: 0.15,   changePercent: 2.99 },
  MATIC: { price: 0.415,  change24h: -0.012, changePercent: -2.81 },
  LINK:  { price: 14.78,  change24h: 0.92,   changePercent: 6.64 },
  AVAX:  { price: 38.56,  change24h: 2.14,   changePercent: 5.88 },
  ATOM:  { price: 8.91,   change24h: -0.31,  changePercent: -3.36 },
  UNI:   { price: 12.34,  change24h: 0.45,   changePercent: 3.78 },
  USDT:  { price: 1.0001, change24h: 0,      changePercent: 0 },
  USDC:  { price: 1,      change24h: 0,      changePercent: 0 },
};

const ASSET_NAMES: Record<string, string> = {
  BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana', BNB: 'BNB',
  XRP: 'Ripple', ADA: 'Cardano', DOT: 'Polkadot', MATIC: 'Polygon',
  LINK: 'Chainlink', AVAX: 'Avalanche', ATOM: 'Cosmos', UNI: 'Uniswap',
  USDT: 'Tether', USDC: 'USD Coin',
};

function randomPrice(base: number, variance = 0.02): number {
  return Math.round(base * (1 + (Math.random() - 0.5) * variance) * 100) / 100;
}

export function generatePrices(): Asset[] {
  return Object.entries(BASE_PRICES).map(([symbol, data]) => ({
    symbol,
    name: ASSET_NAMES[symbol],
    price: String(randomPrice(data.price)),
    change24h: String(data.change24h),
    changePercent24h: String(data.changePercent),
    volume24h: String(Math.round(Math.random() * 2_000_000_000 + 100_000_000)),
    marketCap: String(Math.round(Math.random() * 500_000_000_000 + 1_000_000_000)),
    high24h: String(data.price * 1.03),
    low24h: String(data.price * 0.97),
  }));
}

export function generatePriceUpdate(symbol: string): PriceUpdate {
  const base = BASE_PRICES[symbol] ?? BASE_PRICES.BTC;
  return {
    symbol,
    price: String(randomPrice(base.price)),
    change24h: String(base.change24h),
    changePercent24h: String(base.changePercent),
    timestamp: Date.now(),
  };
}

// ── Candles ───────────────────────────────────────────────────
export function generateCandles(symbol: string, count = 200): Candle[] {
  const base = BASE_PRICES[symbol.replace(/USDT|USD|BUSD|EUR/g, '')] ?? BASE_PRICES.BTC;
  let price = base.price;
  const now = Math.floor(Date.now() / 1000);
  const candles: Candle[] = [];

  for (let i = count; i > 0; i--) {
    const change = (Math.random() - 0.48) * price * 0.02;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * price * 0.01;
    const low = Math.min(open, close) - Math.random() * price * 0.01;
    price = close;

    candles.push({
      time: now - i * 900,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.round(Math.random() * 10_000 + 100),
    });
  }
  return candles;
}

// ── Trading Pairs ─────────────────────────────────────────────
export function generateTradingPairs(): TradingPair[] {
  const symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOT', 'AVAX', 'LINK', 'MATIC', 'ATOM', 'UNI'];
  return symbols.map((base) => {
    const data = BASE_PRICES[base];
    const price = randomPrice(data.price);
    return {
      symbol: `${base}USDT`,
      baseAsset: base,
      quoteAsset: 'USDT',
      price: String(price),
      change24h: String(data.change24h),
      changePercent24h: String(data.changePercent),
      volume24h: String(Math.round(Math.random() * 5_000_000 + 100_000)),
      high24h: String(data.price * 1.03),
      low24h: String(data.price * 0.97),
      isFavorite: ['BTC', 'ETH', 'SOL'].includes(base),
    };
  });
}

// ── Order Book ────────────────────────────────────────────────
export function generateOrderBook(symbol: string): OrderBookData {
  const baseSym = symbol.replace(/USDT|USD|BUSD|EUR/g, '');
  const basePrice = (BASE_PRICES[baseSym] ?? BASE_PRICES.BTC).price;
  const currentPrice = randomPrice(basePrice);

  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  let bidPrice = currentPrice * 0.998;
  let askPrice = currentPrice * 1.002;

  for (let i = 0; i < 25; i++) {
    const bidAmount = Math.round(Math.random() * 10 * 1000) / 1000;
    const prevBid = bids[i - 1];
    const bidTotal = prevBid ? prevBid.total + bidAmount * bidPrice : bidAmount * bidPrice;
    bids.push({ price: String(bidPrice), amount: String(bidAmount), total: String(Math.round(bidTotal * 100) / 100) });
    bidPrice -= currentPrice * 0.0002;

    const askAmount = Math.round(Math.random() * 8 * 1000) / 1000;
    const prevAsk = asks[i - 1];
    const askTotal = prevAsk ? prevAsk.total + askAmount * askPrice : askAmount * askPrice;
    asks.push({ price: String(askPrice), amount: String(askAmount), total: String(Math.round(askTotal * 100) / 100) });
    askPrice += currentPrice * 0.0002;
  }

  const spread = askPrice - bidPrice;
  return {
    bids,
    asks,
    spread: String(spread),
    spreadPercent: String((spread / currentPrice) * 100),
  };
}

// ── Recent Trades ─────────────────────────────────────────────
export function generateRecentTrades(symbol: string, limit = 50): RecentTrade[] {
  const baseSym = symbol.replace(/USDT|USD|BUSD|EUR/g, '');
  const price = randomPrice((BASE_PRICES[baseSym] ?? BASE_PRICES.BTC).price);
  const now = Date.now();

  return Array.from({ length: limit }, (_, i) => ({
    id: `trade-${now}-${i}`,
    price: String(randomPrice(price, 0.005)),
    quantity: String(Math.round(Math.random() * 5 * 10000) / 10000),
    time: new Date(now - i * 2000).toISOString(),
    side: Math.random() > 0.5 ? 'buy' : 'sell' as 'buy' | 'sell',
  }));
}

// ── Wallets / Balances ────────────────────────────────────────
const WALLET_HOLDINGS: Record<string, { balance: number; locked: number }> = {
  BTC:  { balance: 0.5432, locked: 0.05 },
  ETH:  { balance: 4.25,   locked: 0.5 },
  SOL:  { balance: 28,     locked: 0 },
  USDT: { balance: 12450,  locked: 2000 },
  USDC: { balance: 5000,   locked: 0 },
  ADA:  { balance: 1500,   locked: 200 },
  LINK: { balance: 85,     locked: 0 },
  MATIC:{ balance: 1200,   locked: 0 },
};

export function generateWallets(): { wallets: Wallet[]; summary: PortfolioSummary } {
  let totalUsdValue = 0;
  let totalInOrders = 0;
  let prevTotal = 0;

  const wallets = Object.entries(WALLET_HOLDINGS).map(([asset, data]) => {
    const price = BASE_PRICES[asset]?.price ?? 1;
    const balance = data.balance;
    const locked = data.locked;
    const available = balance - locked;
    const usdValue = balance * price;
    totalUsdValue += usdValue;
    totalInOrders += locked * price;
    prevTotal += balance * (price * (1 - (BASE_PRICES[asset]?.changePercent ?? 0) / 100));

    return {
      id: `wallet-${asset}`,
      asset,
      name: ASSET_NAMES[asset],
      balance: String(balance),
      locked: String(locked),
      available: String(available),
      usdValue: String(Math.round(usdValue * 100) / 100),
    };
  });

  const summary: PortfolioSummary = {
    totalBalance: String(wallets.length),
    totalUsdValue: String(Math.round(totalUsdValue * 100) / 100),
    change24h: String(Math.round((totalUsdValue - prevTotal) * 100) / 100),
    changePercent24h: String(Math.round(((totalUsdValue - prevTotal) / prevTotal) * 10000) / 100),
    inOrders: String(Math.round(totalInOrders * 100) / 100),
    available: String(Math.round((totalUsdValue - totalInOrders) * 100) / 100),
  };

  return { wallets, summary };
}

export function generateWallet(asset: string): Wallet {
  const holding = WALLET_HOLDINGS[asset];
  if (!holding) {
    return {
      id: `wallet-${asset}`,
      asset,
      name: ASSET_NAMES[asset] ?? asset,
      balance: '0',
      locked: '0',
      available: '0',
      usdValue: '0',
    };
  }
  const price = BASE_PRICES[asset]?.price ?? 1;
  const available = holding.balance - holding.locked;
  return {
    id: `wallet-${asset}`,
    asset,
    name: ASSET_NAMES[asset],
    balance: String(holding.balance),
    locked: String(holding.locked),
    available: String(available),
    usdValue: String(Math.round(holding.balance * price * 100) / 100),
  };
}

// ── Transactions ──────────────────────────────────────────────
const TX_TYPES: Array<Transaction['type']> = ['buy', 'sell', 'deposit', 'withdraw'];
const TX_STATUSES: Array<Transaction['status']> = ['completed', 'pending', 'failed'];

export function generateTransactions(params?: {
  assetId?: string;
  page?: number;
  limit?: number;
}): { transactions: Transaction[]; meta: PaginationMeta } {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const count = 50;
  const start = (page - 1) * limit;
  const end = start + limit;
  const now = Date.now();

  const all: Transaction[] = Array.from({ length: count }, (_, i) => {
    const assets = params?.assetId ? [params.assetId] : Object.keys(WALLET_HOLDINGS);
    const asset = assets[i % assets.length];
    const basePrice = BASE_PRICES[asset]?.price ?? 1;
    const type = TX_TYPES[i % TX_TYPES.length];
    const amount = Math.round((Math.random() * (type === 'deposit' ? 2 : 0.5) + 0.01) * 10000) / 10000;

    return {
      id: `tx-${now - i * 60000}`,
      type,
      asset,
      amount: String(amount),
      usdValue: String(Math.round(amount * basePrice * 100) / 100),
      fee: String(Math.round(Math.random() * 10 * 100) / 100),
      status: i < 3 ? (['pending', 'failed'] as Transaction['status'])[i % 2] : 'completed',
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      fromAddress: type === 'withdraw' ? undefined : `0x${Math.random().toString(16).slice(2, 42)}`,
      toAddress: type === 'deposit' ? undefined : `0x${Math.random().toString(16).slice(2, 42)}`,
      confirmations: type === 'deposit' ? Math.floor(Math.random() * 50) : undefined,
      createdAt: new Date(now - i * 3600000).toISOString(),
      completedAt: type !== 'pending' ? new Date(now - i * 3600000 + 300000).toISOString() : undefined,
    };
  });

  return {
    transactions: all.slice(start, end),
    meta: { page, limit, total: count },
  };
}

// ── Portfolio History ─────────────────────────────────────────
export function generatePortfolioHistory(params?: {
  interval?: string;
  from?: string;
  to?: string;
}): PortfolioHistoryPoint[] {
  const count = 180;
  const points: PortfolioHistoryPoint[] = [];
  let value = 45000;
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    value = value * (1 + (Math.random() - 0.48) * 0.02);
    points.push({
      time: new Date(now - i * 86400000).toISOString(),
      value: Math.round(value * 100) / 100,
    });
  }

  return points;
}

// ── Deposit / Withdraw ────────────────────────────────────────
export function generateDepositAddress(assetId: string, network?: string) {
  const net = network ?? 'BITCOIN';
  return {
    address: `bc1q${Math.random().toString(36).slice(2, 42)}`,
    network: net,
    memo: assetId === 'XRP' ? String(Math.floor(Math.random() * 1000000)) : undefined,
    qrCode: undefined,
    minDeposit: '0.001',
    estimatedArrival: '30 minutes',
  };
}

export function generateDepositNetworks(assetId: string) {
  const networks: Record<string, { name: string; fee: string; minConfirmations: number }> = {
    BITCOIN: { name: 'Bitcoin', fee: '0.0005', minConfirmations: 3 },
    ERC20: { name: 'Ethereum (ERC-20)', fee: '0.01', minConfirmations: 12 },
    BEP20: { name: 'BNB Smart Chain (BEP-20)', fee: '0.001', minConfirmations: 15 },
    SOLANA: { name: 'Solana', fee: '0.0001', minConfirmations: 1 },
    POLYGON: { name: 'Polygon', fee: '0.1', minConfirmations: 100 },
  };
  const entries = Object.entries(networks).slice(0, Math.floor(Math.random() * 4) + 1);
  return entries.map(([network, info], i) => ({
    network,
    name: info.name,
    fee: info.fee,
    minConfirmations: info.minConfirmations,
    isRecommended: i === 0,
  }));
}

export function generateWithdrawEstimate(assetId: string, amount: string, network: string) {
  const amt = Number(amount);
  const fee = Math.round(amt * 0.001 * 10000) / 10000;
  return {
    fee: String(fee),
    total: String(amt + fee),
    receiving: String(amt),
    minWithdraw: '0.01',
    maxWithdraw: String(Math.round((BASE_PRICES[assetId]?.price ?? 1) * 100) / 100),
  };
}

// ── Orders ────────────────────────────────────────────────────
export function generateOrders(symbol?: string): Order[] {
  const pairs = generateTradingPairs();
  const filtered = symbol ? pairs.filter((p) => p.symbol === symbol) : pairs;
  return filtered.slice(0, 5).map((pair, i) => ({
    id: `order-${Date.now()}-${i}`,
    symbol: pair.symbol,
    side: i % 2 === 0 ? 'buy' : 'sell' as 'buy' | 'sell',
    type: 'limit' as const,
    price: String(Number(pair.price) * (i % 2 === 0 ? 0.99 : 1.01)),
    quantity: String(Math.round(Math.random() * 2 * 1000) / 1000),
    filledQuantity: '0',
    remainingQuantity: String(Math.round(Math.random() * 2 * 1000) / 1000),
    status: 'open' as const,
    timeInForce: 'GTC' as const,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - i * 1800000).toISOString(),
  }));
}

// ── Positions ─────────────────────────────────────────────────
export function generatePositions(): Position[] {
  return generateTradingPairs().slice(0, 3).map((pair, i) => {
    const entry = Number(pair.price) * (1 - (i + 1) * 0.02);
    const mark = Number(pair.price);
    const pnl = (mark - entry) / entry;
    return {
      id: `pos-${pair.symbol}`,
      symbol: pair.symbol,
      side: i % 2 === 0 ? 'buy' : 'sell' as 'buy' | 'sell',
      quantity: String(Math.round(Math.random() * 5 * 1000) / 1000),
      entryPrice: String(entry),
      markPrice: String(mark),
      liquidationPrice: String(entry * 0.85),
      pnl: String(Math.round((mark - entry) * 100) / 100),
      pnlPercent: String(Math.round(pnl * 10000) / 100),
      leverage: [3, 5, 10][i],
      margin: String(Math.round(Math.random() * 500 * 100) / 100),
      createdAt: new Date(Date.now() - 86400000 * (i + 1)).toISOString(),
    };
  });
}

// ── Signals ───────────────────────────────────────────────────
const PROVIDERS: SignalProvider[] = [
  { id: 'prov-1', name: 'AlphaQuant', winRate: 78.5, totalSignals: 342, totalPnl: '+$12,450', followers: 8300, isVerified: true },
  { id: 'prov-2', name: 'CryptoPulse', winRate: 72.1, totalSignals: 561, totalPnl: '+$8,720', followers: 5400, isVerified: true },
  { id: 'prov-3', name: 'ChainWhisper', winRate: 65.8, totalSignals: 189, totalPnl: '+$4,310', followers: 2100, isVerified: false },
  { id: 'prov-4', name: 'WaveTrader', winRate: 81.2, totalSignals: 95, totalPnl: '+$6,890', followers: 3600, isVerified: true },
];

const DIRECTIONS: SignalDirection[] = ['STRONG_BUY', 'BUY', 'SELL', 'STRONG_SELL'];
const TIMEFRAMES: SignalTimeframe[] = ['15m', '30m', '1h', '4h', '1d'];
const STRATEGIES = ['MACD Cross', 'RSI Divergence', 'Bollinger Bounce', 'Moving Average Crossover',
  'Support/Resistance Break', 'Volume Spike', 'Fibonacci Retrace', 'Ichimoku Cloud', 'Parabolic SAR'];

export function generateSignals(filters?: { direction?: string; asset?: string; timeframe?: string; sortBy?: string; limit?: number; page?: number }): {
  signals: Signal[];
  total: number;
  page: number;
} {
  const limit = filters?.limit ?? 50;
  const page = filters?.page ?? 1;
  const allSignals: Signal[] = [];

  const assets = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'LINK', 'AVAX'];
  for (let i = 0; i < 80; i++) {
    const asset = assets[i % assets.length];
    const provider = PROVIDERS[i % PROVIDERS.length];
    const direction = DIRECTIONS[i % DIRECTIONS.length];
    const price = BASE_PRICES[asset]?.price ?? 100;
    const entryPrice = price * (1 + (Math.random() - 0.5) * 0.05);

    allSignals.push({
      id: `signal-${i}`,
      asset,
      assetName: ASSET_NAMES[asset] ?? asset,
      direction,
      status: i < 10 ? 'active' : i < 30 ? 'filled' : i < 50 ? 'partial' : 'expired',
      confidence: Math.round(Math.random() * 30 + 60 + (direction.includes('STRONG') ? 15 : 0)),
      entryPrice: String(Math.round(entryPrice * 100) / 100),
      currentPrice: String(Math.round(price * (1 + (Math.random() - 0.5) * 0.04) * 100) / 100),
      targetPrice1: String(Math.round(entryPrice * (direction.includes('BUY') ? 1.05 : 0.95) * 100) / 100),
      targetPrice2: String(Math.round(entryPrice * (direction.includes('BUY') ? 1.12 : 0.88) * 100) / 100),
      stopLoss: String(Math.round(entryPrice * (direction.includes('BUY') ? 0.96 : 1.04) * 100) / 100),
      timeframe: TIMEFRAMES[i % TIMEFRAMES.length],
      strategy: STRATEGIES[i % STRATEGIES.length],
      rationale: `${direction.includes('BUY') ? 'Bullish' : 'Bearish'} momentum detected via ${STRATEGIES[i % STRATEGIES.length]} on ${asset}/${TIMEFRAMES[i % TIMEFRAMES.length]} with strong volume confirmation.`,
      provider,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      isBookmarked: i < 5,
      performance: i > 10 ? {
        pnl: i % 2 === 0 ? '+$245' : '-$89',
        pnlPercent: i % 2 === 0 ? '+12.4' : '-4.8',
        hitTarget1: i % 3 !== 0,
        hitTarget2: i % 5 === 0,
      } : undefined,
    });
  }

  let filtered = [...allSignals];
  if (filters?.direction && filters.direction !== 'all') {
    filtered = filtered.filter((s) => s.direction === filters.direction);
  }
  if (filters?.asset) {
    filtered = filtered.filter((s) => s.asset.toLowerCase().includes(filters.asset!.toLowerCase()));
  }
  if (filters?.timeframe && filters.timeframe !== 'all') {
    filtered = filtered.filter((s) => s.timeframe === filters.timeframe);
  }
  if (filters?.sortBy === 'confidence') {
    filtered.sort((a, b) => b.confidence - a.confidence);
  } else if (filters?.sortBy === 'pnl') {
    filtered.sort((a, b) => ((b.performance?.pnlPercent ?? '0') > (a.performance?.pnlPercent ?? '0') ? 1 : -1));
  } else {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const start = (page - 1) * limit;
  return {
    signals: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
  };
}

export function generateSignal(signalId: string): Signal {
  return generateSignals({ limit: 1 }).signals[0];
}

export function generateRelatedSignals(signalId: string): Signal[] {
  return generateSignals({ limit: 4 }).signals;
}

export function generateSignalProvider(providerId: string): SignalProvider {
  return PROVIDERS[0];
}

// ── KYC ───────────────────────────────────────────────────────
export function generateKycStatus(): KycStatusDetails {
  return {
    level: 2,
    status: 'verified',
    estimatedTime: undefined,
    limits: {
      dailyWithdrawal: '$50,000',
      dailyDeposit: '$100,000',
      monthlyVolume: '$500,000',
    },
  };
}

export function generateKycSubmit() {
  return { id: 'kyc-demo-001', status: 'pending', estimatedTime: '24-48 hours' };
}

export function generateKycUpload() {
  return { url: 'https://picsum.photos/800/600' };
}

// ── User / Settings ───────────────────────────────────────────
export function generateSettings(): Record<string, any> {
  return {
    theme: 'dark',
    language: 'en',
    currency: 'USD',
    notifications: {
      push: true,
      email: true,
      sms: false,
      priceAlerts: true,
      signalAlerts: true,
      withdrawalConfirmation: true,
    },
    privacy: {
      showBalance: true,
      showPortfolio: true,
      analytics: false,
    },
    trading: {
      defaultSlippage: 0.5,
      confirmOrders: true,
      showConfirmations: true,
    },
  };
}

// ── Place Order (mutation mock) ───────────────────────────────
export function generatePlaceOrder(data: any): Order {
  return {
    id: `order-${Date.now()}`,
    symbol: data.symbol,
    side: data.side,
    type: data.type,
    price: data.price ?? '0',
    quantity: data.quantity,
    filledQuantity: data.type === 'market' ? data.quantity : '0',
    remainingQuantity: data.type === 'market' ? '0' : data.quantity,
    status: data.type === 'market' ? 'filled' : 'open',
    timeInForce: data.timeInForce ?? 'GTC',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
