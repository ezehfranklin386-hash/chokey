import { apiClient } from '@/shared/api/apiClient';
import type { Order, Position, OrderBookData, RecentTrade, TradingPair } from '@/entities/trading/trading.types';

export const tradingApi = {
  /** Get all trading pairs */
  getPairs: async (): Promise<TradingPair[]> => {
    const res = await apiClient.get('/market/symbols');
    return res as unknown as TradingPair[];
  },

  /** Get order book for a pair */
  getOrderBook: async (symbol: string): Promise<OrderBookData> => {
    const res = await apiClient.get(`/market/orderbook/${symbol}`);
    return res as unknown as OrderBookData;
  },

  /** Get recent trades */
  getRecentTrades: async (symbol: string, limit = 50): Promise<RecentTrade[]> => {
    const res = await apiClient.get(`/market/trades/${symbol}`, { params: { limit } });
    return res as unknown as RecentTrade[];
  },

  /** Place a new order */
  placeOrder: async (data: {
    symbol: string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit' | 'stop_limit';
    price?: string;
    stopPrice?: string;
    quantity: string;
    timeInForce?: 'GTC' | 'IOC' | 'FOK';
  }): Promise<Order> => {
    const res = await apiClient.post('/orders', data);
    return res as unknown as Order;
  },

  /** Cancel an order */
  cancelOrder: async (orderId: string): Promise<void> => {
    await apiClient.delete(`/orders/${orderId}`);
  },

  /** Get open orders */
  getOpenOrders: async (symbol?: string): Promise<Order[]> => {
    const res = await apiClient.get('/orders', { params: { symbol, status: 'open' } });
    return res as unknown as Order[];
  },

  /** Get order history */
  getOrderHistory: async (params?: {
    symbol?: string;
    page?: number;
    limit?: number;
  }): Promise<Order[]> => {
    const res = await apiClient.get('/orders/history', { params });
    return res as unknown as Order[];
  },

  /** Get order detail */
  getOrder: async (orderId: string): Promise<Order> => {
    const res = await apiClient.get(`/orders/${orderId}`);
    return res as unknown as Order;
  },

  /** Get open positions */
  getPositions: async (): Promise<Position[]> => {
    const res = await apiClient.get('/positions');
    return res as unknown as Position[];
  },
};
