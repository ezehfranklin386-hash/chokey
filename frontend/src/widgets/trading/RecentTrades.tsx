import { cn } from '@/shared/lib/cn';
import type { RecentTrade } from '@/entities/trading/trading.types';
import { Spinner } from '@/shared/ui';

interface RecentTradesProps {
  trades: RecentTrade[] | undefined;
  isLoading: boolean;
}

export function RecentTrades({ trades, isLoading }: RecentTradesProps) {
  if (isLoading) {
    return (
      <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-4">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800">
      <div className="px-4 py-2.5 border-b border-primary-500/40">
        <h3 className="text-sm font-medium text-ink dark:text-white">Recent Trades</h3>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-4 py-1.5 text-[10px] text-ink-50 dark:text-white-50 uppercase tracking-wider">
        <span className="flex-1 text-left">Price</span>
        <span className="flex-1 text-right">Amount</span>
        <span className="flex-1 text-right">Time</span>
      </div>

      <div className="max-h-[240px] overflow-y-auto">
        {!trades || trades.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-ink-50 dark:text-white-50">
            No recent trades
          </div>
        ) : (
          trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center px-4 py-1 text-xs font-mono hover:bg-primary-600/30"
            >
              <span className={cn(
                'flex-1 text-left',
                trade.side === 'buy' ? 'text-market-green' : 'text-market-red',
              )}>
                {parseFloat(trade.price).toLocaleString()}
              </span>
              <span className="flex-1 text-right text-ink-90 dark:text-white-90">
                {parseFloat(trade.quantity).toFixed(4)}
              </span>
              <span className="flex-1 text-right text-ink-50 dark:text-white-50">
                {formatTradeTime(trade.time)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatTradeTime(time: string): string {
  try {
    const d = new Date(time);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return time;
  }
}
