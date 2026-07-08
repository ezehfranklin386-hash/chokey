import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradingApi } from '@/shared/api/trading';
import { showSuccessToast, showErrorToast } from '@/shared/ui';

/** Fetch all trading pairs */
export function useTradingPairs() {
  return useQuery({
    queryKey: ['trading-pairs'],
    queryFn: tradingApi.getPairs,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Fetch order book */
export function useOrderBook(symbol: string) {
  return useQuery({
    queryKey: ['orderbook', symbol],
    queryFn: () => tradingApi.getOrderBook(symbol),
    enabled: !!symbol,
    staleTime: 5_000,
    refetchInterval: 10_000,
  });
}

/** Fetch recent trades */
export function useRecentTrades(symbol: string) {
  return useQuery({
    queryKey: ['recent-trades', symbol],
    queryFn: () => tradingApi.getRecentTrades(symbol),
    enabled: !!symbol,
    staleTime: 5_000,
    refetchInterval: 10_000,
  });
}

/** Fetch open orders */
export function useOpenOrders(symbol?: string) {
  return useQuery({
    queryKey: ['open-orders', symbol],
    queryFn: () => tradingApi.getOpenOrders(symbol),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

/** Place order mutation */
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      symbol: string;
      side: 'buy' | 'sell';
      type: 'market' | 'limit' | 'stop_limit';
      price?: string;
      stopPrice?: string;
      quantity: string;
      timeInForce?: 'GTC' | 'IOC' | 'FOK';
    }) => tradingApi.placeOrder(data),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['open-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderbook'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      showSuccessToast(
        `${order.side === 'buy' ? 'Bought' : 'Sold'} ${order.quantity} ${order.symbol}`,
      );
    },
    onError: (err: any) => {
      showErrorToast(err?.response?.data?.message || 'Order failed');
    },
  });
}

/** Cancel order mutation */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => tradingApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-orders'] });
      showSuccessToast('Order cancelled');
    },
    onError: (err: any) => {
      showErrorToast(err?.response?.data?.message || 'Failed to cancel order');
    },
  });
}
