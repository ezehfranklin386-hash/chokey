import { apiClient } from '@/shared/api/apiClient';
import type { Asset, PriceUpdate, Candle, CandleInterval } from '@/entities/market/asset.types';

export const marketApi = {
  /** Get all market prices */
  getPrices: async (): Promise<{ prices: Asset[] }> => {
    const res = await apiClient.get('/market/prices');
    return res as unknown as { prices: Asset[] };
  },

  /** Get single asset price */
  getPrice: async (symbol: string): Promise<PriceUpdate> => {
    const res = await apiClient.get(`/market/prices/${symbol}`);
    return res as unknown as PriceUpdate;
  },

  /** Get candles for chart */
  getCandles: async (symbol: string, interval: CandleInterval = '1h', limit = 200): Promise<Candle[]> => {
    const res = await apiClient.get(`/market/candles/${symbol}`, {
      params: { interval, limit },
    });
    return res as unknown as Candle[];
  },

  /** Search assets */
  searchAssets: async (query: string): Promise<Asset[]> => {
    const res = await apiClient.get('/market/search', {
      params: { q: query },
    });
    return res as unknown as Asset[];
  },
};
