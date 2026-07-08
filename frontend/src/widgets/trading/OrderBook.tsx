import { memo, useMemo } from 'react';
import type { OrderBookData } from '@/entities/trading/trading.types';
import { Spinner } from '@/shared/ui';

interface OrderBookProps {
  data: OrderBookData | undefined;
  isLoading: boolean;
  symbol: string;
}

export const OrderBook = memo(function OrderBook({ data, isLoading, symbol }: OrderBookProps) {
  const maxTotal = useMemo(() => {
    if (!data) return 0;
    const bidMax = Math.max(...data.bids.map((b) => parseFloat(b.total)), 0);
    const askMax = Math.max(...data.asks.map((a) => parseFloat(a.total)), 0);
    return Math.max(bidMax, askMax) || 1;
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-card border border-white-10 bg-primary-800 p-4">
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!data || (data.asks.length === 0 && data.bids.length === 0)) {
    return (
      <div className="rounded-card border border-white-10 bg-primary-800 p-4">
        <h3 className="text-sm font-medium text-white-70 mb-4">Order Book</h3>
        <div className="flex items-center justify-center py-12 text-sm text-white-50">
          No orders for this pair
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-white-10 bg-primary-800">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-primary-500/40">
        <h3 className="text-sm font-medium text-white">Order Book</h3>
        <p className="text-xs text-white-50 font-mono">{symbol}</p>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-4 py-1.5 text-[10px] text-white-50 uppercase tracking-wider">
        <span className="flex-1 text-left">Price</span>
        <span className="flex-1 text-right">Amount</span>
        <span className="flex-1 text-right">Total</span>
      </div>

      {/* Asks (red, reversed so lowest ask is at bottom) */}
      <div className="overflow-hidden">
        {[...data.asks].reverse().slice(0, 10).map((ask, i) => {
          const totalNum = parseFloat(ask.total);
          const depthPercent = (totalNum / maxTotal) * 100;
          return (
            <div key={`ask-${i}`} className="relative flex items-center px-4 py-1 text-xs font-mono">
              <div
                className="absolute right-0 top-0 h-full bg-market-red/10"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="flex-1 text-left text-market-red z-10">
                {parseFloat(ask.price).toLocaleString()}
              </span>
              <span className="flex-1 text-right text-white-90 z-10">
                {parseFloat(ask.amount).toFixed(4)}
              </span>
              <span className="flex-1 text-right text-white-50 z-10">
                {parseFloat(ask.total).toFixed(4)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Spread */}
      <div className="flex items-center justify-between px-4 py-2 border-y border-primary-500/40 bg-primary-700/50">
        <span className="text-xs font-mono text-gold-500">
          {parseFloat(data.spread).toLocaleString()}
        </span>
        <span className="text-[10px] text-white-50">Spread {data.spreadPercent}%</span>
      </div>

      {/* Bids (green) */}
      <div>
        {data.bids.slice(0, 10).map((bid, i) => {
          const totalNum = parseFloat(bid.total);
          const depthPercent = (totalNum / maxTotal) * 100;
          return (
            <div key={`bid-${i}`} className="relative flex items-center px-4 py-1 text-xs font-mono">
              <div
                className="absolute right-0 top-0 h-full bg-market-green/10"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="flex-1 text-left text-market-green z-10">
                {parseFloat(bid.price).toLocaleString()}
              </span>
              <span className="flex-1 text-right text-white-90 z-10">
                {parseFloat(bid.amount).toFixed(4)}
              </span>
              <span className="flex-1 text-right text-white-50 z-10">
                {parseFloat(bid.total).toFixed(4)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
