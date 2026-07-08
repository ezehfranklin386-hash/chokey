import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import type { Signal } from '@/entities/signals/signals.types';
import { useToggleBookmark } from '@/features/signals/useSignals';
import { Button } from '@/shared/ui';

interface SignalCardProps {
  signal: Signal;
}

const DIRECTION_CONFIG = {
  STRONG_BUY: { label: 'STRONG BUY', color: 'text-market-green', bg: 'bg-market-green/10' },
  BUY: { label: 'BUY', color: 'text-market-green', bg: 'bg-market-green/5' },
  SELL: { label: 'SELL', color: 'text-market-red', bg: 'bg-market-red/5' },
  STRONG_SELL: { label: 'STRONG SELL', color: 'text-market-red', bg: 'bg-market-red/10' },
};

const DIRECTION_ACCENT = {
  STRONG_BUY: 'bg-brand-500',
  BUY: 'bg-market-green',
  SELL: 'bg-market-red',
  STRONG_SELL: 'bg-market-red',
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch { return iso; }
}

export function SignalCard({ signal }: SignalCardProps) {
  const navigate = useNavigate();
  const toggleBookmark = useToggleBookmark();
  const config = DIRECTION_CONFIG[signal.direction];
  const accent = DIRECTION_ACCENT[signal.direction];

  return (
    <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 hover:border-white-20 transition-colors overflow-hidden">
      <div className="flex">
        {/* Left accent bar */}
        <div className={cn('w-1 shrink-0', accent)} />

        <div className="flex-1 p-4">
          {/* Top row: Asset + Direction + Timestamp */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-mono text-ink-90 dark:text-white-90">
                {signal.asset.slice(0, 2)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink dark:text-white">{signal.assetName || signal.asset}</h3>
                <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold', config.bg, config.color)}>
                  {config.label}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-ink-50 dark:text-white-50 shrink-0">{formatTime(signal.createdAt)}</span>
          </div>

          {/* Price targets grid */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="rounded bg-market-red/10 p-2 text-center">
              <p className="text-[9px] text-ink-50 dark:text-white-50 uppercase">Stop</p>
              <p className="text-xs font-mono text-market-red font-medium">
                ${parseFloat(signal.stopLoss).toLocaleString()}
              </p>
            </div>
            <div className="rounded bg-primary-600 p-2 text-center">
              <p className="text-[9px] text-ink-50 dark:text-white-50 uppercase">Entry</p>
              <p className="text-xs font-mono text-ink-90 dark:text-white-90 font-medium">
                ${parseFloat(signal.entryPrice).toLocaleString()}
              </p>
            </div>
            <div className="rounded bg-market-green/10 p-2 text-center">
              <p className="text-[9px] text-ink-50 dark:text-white-50 uppercase">Target 1</p>
              <p className="text-xs font-mono text-market-green font-medium">
                ${parseFloat(signal.targetPrice1).toLocaleString()}
              </p>
            </div>
            <div className="rounded bg-market-green/5 p-2 text-center">
              <p className="text-[9px] text-ink-50 dark:text-white-50 uppercase">Target 2</p>
              <p className={cn(
                'text-xs font-mono font-medium',
                signal.targetPrice2 ? 'text-market-green' : 'text-ink-50 dark:text-white-50',
              )}>
                {signal.targetPrice2 ? `$${parseFloat(signal.targetPrice2).toLocaleString()}` : '—'}
              </p>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-ink-50 dark:text-white-50">Confidence</span>
              <span className={cn(
                'text-xs font-mono font-bold',
                signal.confidence >= 70 ? 'text-brand-500' : 'text-ink-70 dark:text-white-70',
              )}>
                {signal.confidence}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-primary-500">
              <div
                className={cn('h-full rounded-full', signal.confidence >= 70 ? 'bg-brand-500' : 'bg-ink-30 dark:bg-white-30')}
                style={{ width: `${signal.confidence}%` }}
              />
            </div>
          </div>

          {/* Strategy + Rationale */}
          <p className="text-xs text-ink-70 dark:text-white-70 mb-1">
            <span className="font-medium text-ink-90 dark:text-white-90">{signal.strategy}</span>
          </p>
          <p className="text-xs text-ink-50 dark:text-white-50 line-clamp-2 mb-3">{signal.rationale}</p>

          {/* Provider info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/20 text-[9px] font-bold text-brand-500">
              {signal.provider.name.charAt(0)}
            </div>
            <span className="text-xs text-ink-70 dark:text-white-70">{signal.provider.name}</span>
            <span className={cn(
              'text-[10px] font-medium',
              Number(signal.provider.winRate) >= 60 ? 'text-market-green' : 'text-market-red',
            )}>
              {signal.provider.winRate}% win
            </span>
            {signal.provider.isVerified && (
              <svg className="h-3 w-3 text-info" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => navigate(`/trade/${signal.asset}USDT`)}
            >
              Trade Now
            </Button>
            <button
              onClick={() => toggleBookmark.mutate(signal.id)}
              className={cn(
                'rounded-lg p-2 transition-colors',
                signal.isBookmarked
                  ? 'text-brand-500 hover:text-brand-400'
                  : 'text-ink-50 dark:text-white-50 hover:text-ink-90 dark:text-white-90',
              )}
              aria-label={signal.isBookmarked ? 'Remove bookmark' : 'Bookmark signal'}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill={signal.isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
              </svg>
            </button>
            <button
              onClick={() => navigate(`/signals/${signal.id}`)}
              className="rounded-lg p-2 text-ink-50 dark:text-white-50 hover:text-ink-90 dark:text-white-90 transition-colors"
              aria-label="View details"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>

          {/* Performance if done */}
          {signal.performance && (
            <div className="mt-3 rounded-lg bg-primary-700 p-2 flex items-center gap-4">
              <span className={cn(
                'text-sm font-mono font-bold',
                Number(signal.performance.pnl) >= 0 ? 'text-market-green' : 'text-market-red',
              )}>
                {Number(signal.performance.pnl) >= 0 ? '+' : ''}{signal.performance.pnl} ({signal.performance.pnlPercent})
              </span>
              {signal.performance.hitTarget1 && (
                <span className="text-[10px] text-market-green bg-market-green/10 rounded px-1.5 py-0.5">
                  TP1 Hit
                </span>
              )}
              {signal.performance.hitTarget2 && (
                <span className="text-[10px] text-market-green bg-market-green/10 rounded px-1.5 py-0.5">
                  TP2 Hit
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
