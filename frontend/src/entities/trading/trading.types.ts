export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop_limit';
export type OrderStatus = 'open' | 'filled' | 'partial' | 'cancelled' | 'rejected' | 'expired';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK';

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: string;
  stopPrice?: string;
  quantity: string;
  filledQuantity: string;
  remainingQuantity: string;
  averagePrice?: string;
  status: OrderStatus;
  timeInForce: TimeInForce;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  symbol: string;
  side: OrderSide;
  quantity: string;
  entryPrice: string;
  markPrice: string;
  liquidationPrice?: string;
  pnl: string;
  pnlPercent: string;
  leverage: number;
  margin: string;
  createdAt: string;
}

export interface OrderBookEntry {
  price: string;
  amount: string;
  total: string;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: string;
  spreadPercent: string;
}

export interface RecentTrade {
  id: string;
  price: string;
  quantity: string;
  time: string;
  side: 'buy' | 'sell';
}

export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: string;
  change24h: string;
  changePercent24h: string;
  volume24h: string;
  high24h: string;
  low24h: string;
  isFavorite?: boolean;
}
