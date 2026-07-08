import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';

interface Signal {
  id: string;
  asset: string;
  direction: 'STRONG_BUY' | 'BUY' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  entryPrice: string;
  targetPrice: string;
  stopLoss: string;
  providerName: string;
}

interface ActiveSignalsWidgetProps {
  signals: Signal[] | undefined;
  isLoading: boolean;
}

const DIRECTION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  STRONG_BUY: { label: 'STRONG BUY', color: 'text-market-green border-market-green', bg: 'bg-market-green/10' },
  BUY: { label: 'BUY', color: 'text-market-green border-market-green', bg: 'bg-market-green/5' },
  SELL: { label: 'SELL', color: 'text-market-red border-market-red', bg: 'bg-market-red/5' },
  STRONG_SELL: { label: 'STRONG SELL', color: 'text-market-red border-market-red', bg: 'bg-market-red/10' },
};

export function ActiveSignalsWidget({ signals, isLoading }: ActiveSignalsWidgetProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-6">
        <h3 className="mb-4 text-sm font-medium text-ink-70 dark:text-white-70">Active Signals</h3>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton h-10 w-1 rounded" />
              <div className="flex-1 space-y-1">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-3 w-32 rounded" />
              </div>
              <div className="skeleton h-6 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!signals || signals.length === 0) {
    return (
      <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-6">
        <h3 className="mb-4 text-sm font-medium text-ink-70 dark:text-white-70">Active Signals</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 text-3xl text-ink-30 dark:text-white-30">📡</div>
          <p className="text-sm text-ink-70 dark:text-white-70">No active signals</p>
          <p className="mt-1 text-xs text-ink-50 dark:text-white-50">Check back later for trading signals</p>
          <button
            onClick={() => navigate('/signals')}
            className="mt-3 text-xs font-medium text-brand-500 hover:text-brand-400 transition-colors"
          >
            Browse Signals →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-70 dark:text-white-70">Active Signals</h3>
        <button
          onClick={() => navigate('/signals')}
          className="text-xs font-medium text-brand-500 hover:text-brand-400 transition-colors"
        >
          View All →
        </button>
      </div>
      <div className="space-y-3">
        {signals.slice(0, 3).map((signal) => {
          const config = DIRECTION_CONFIG[signal.direction] || DIRECTION_CONFIG.BUY;

          return (
            <div
              key={signal.id}
              onClick={() => navigate(`/signals/${signal.id}`)}
              className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-primary-600/50 cursor-pointer"
            >
              {/* Direction accent bar */}
              <div className={cn('h-full w-1 rounded-full shrink-0 mt-1', config!.bg)} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink dark:text-white">{signal.asset}</span>
                  <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold', config!.bg, config!.color)}>
                    {config!.label}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-50 dark:text-white-50">
                  Entry: {signal.entryPrice} · Target: {signal.targetPrice}
                </p>
                <p className="text-[10px] text-ink-30 dark:text-white-30">by {signal.providerName}</p>
              </div>

              {/* Confidence */}
              <div className="text-right shrink-0">
                <div className="text-sm font-mono text-ink-90 dark:text-white-90">{signal.confidence}%</div>
                <div className="mt-1 h-1.5 w-12 overflow-hidden rounded-full bg-primary-500">
                  <div
                    className={cn('h-full rounded-full', signal.confidence >= 70 ? 'bg-brand-500' : 'bg-ink-30 dark:bg-white-30')}
                    style={{ width: `${signal.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
