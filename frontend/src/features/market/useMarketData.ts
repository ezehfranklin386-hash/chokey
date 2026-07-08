import { useQuery } from '@tanstack/react-query';
import { marketApi } from '@/shared/api/market';

/** Fetch all market prices */
export function useMarketPrices() {
  return useQuery({
    queryKey: ['market-prices'],
    queryFn: marketApi.getPrices,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

/** Fetch single price */
export function usePrice(symbol: string) {
  return useQuery({
    queryKey: ['price', symbol],
    queryFn: () => marketApi.getPrice(symbol),
    enabled: !!symbol,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

/** Fetch candles for a symbol */
export function useCandles(symbol: string, interval: string = '1h', limit = 200) {
  return useQuery({
    queryKey: ['candles', symbol, interval, limit],
    queryFn: () => marketApi.getCandles(symbol, interval as any, limit),
    enabled: !!symbol,
    staleTime: 30_000,
  });
}
