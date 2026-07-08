export interface Asset {
  symbol: string;
  name: string;
  icon?: string;
  price: string;
  change24h: string;
  changePercent24h: string;
  volume24h: string;
  marketCap?: string;
  high24h?: string;
  low24h?: string;
}

export interface PriceUpdate {
  symbol: string;
  price: string;
  change24h: string;
  changePercent24h: string;
  timestamp: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type CandleInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';
