import { cn } from '@/shared/lib/cn';
import type { SignalDirection, SignalTimeframe } from '@/entities/signals/signals.types';

interface SignalFiltersProps {
  direction: SignalDirection | 'all';
  onDirectionChange: (d: SignalDirection | 'all') => void;
  asset: string;
  onAssetChange: (a: string) => void;
  timeframe: SignalTimeframe | 'all';
  onTimeframeChange: (t: SignalTimeframe | 'all') => void;
  sortBy: 'date' | 'confidence' | 'pnl';
  onSortChange: (s: 'date' | 'confidence' | 'pnl') => void;
}

const DIRECTIONS: { value: SignalDirection | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: '' },
  { value: 'STRONG_BUY', label: 'Strong Buy', color: 'text-market-green' },
  { value: 'BUY', label: 'Buy', color: 'text-market-green' },
  { value: 'SELL', label: 'Sell', color: 'text-market-red' },
  { value: 'STRONG_SELL', label: 'Strong Sell', color: 'text-market-red' },
];

const TIMEFRAMES: { value: SignalTimeframe | 'all'; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
];

const SORT_OPTIONS: { value: 'date' | 'confidence' | 'pnl'; label: string }[] = [
  { value: 'date', label: 'Latest' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'pnl', label: 'P&L' },
];

export function SignalFilters({
  direction, onDirectionChange,
  asset, onAssetChange,
  timeframe, onTimeframeChange,
  sortBy, onSortChange,
}: SignalFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Direction filter */}
      <div className="flex flex-wrap gap-1.5">
        {DIRECTIONS.map((d) => (
          <button
            key={d.value}
            onClick={() => onDirectionChange(d.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              direction === d.value
                ? 'bg-brand-500/10 text-brand-500 border border-brand-500/30'
                : 'bg-primary-700 text-ink-50 dark:text-white-50 hover:text-ink-70 dark:text-white-70 border border-transparent',
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Second row: Timeframe + Sort + Search */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        {/* Timeframe */}
        <div className="flex gap-1">
          {TIMEFRAMES.map((t) => (
            <button
              key={t.value}
              onClick={() => onTimeframeChange(t.value)}
              className={cn(
                'rounded px-2.5 py-1 text-[10px] font-medium transition-colors',
                timeframe === t.value
                  ? 'bg-primary-500 text-ink dark:text-white'
                  : 'text-ink-50 dark:text-white-50 hover:text-ink-70 dark:text-white-70',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Divider (hidden on mobile) */}
        <div className="hidden sm:block h-4 w-px bg-primary-500" />

        {/* Sort */}
        <div className="flex gap-1">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => onSortChange(s.value)}
              className={cn(
                'rounded px-2.5 py-1 text-[10px] font-medium transition-colors',
                sortBy === s.value
                  ? 'bg-primary-500 text-ink dark:text-white'
                  : 'text-ink-50 dark:text-white-50 hover:text-ink-70 dark:text-white-70',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Asset search */}
        <div className="relative w-full sm:w-auto sm:ml-auto">
          <svg className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-50 dark:text-white-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={asset}
            onChange={(e) => onAssetChange(e.target.value)}
            placeholder="Search asset..."
            className="w-full rounded-lg border border-primary-500 bg-primary-700 py-1.5 pl-7 pr-2.5 text-xs text-ink dark:text-white placeholder-ink-50 dark:placeholder-white-50 focus:border-brand-500 focus:outline-none transition-colors sm:w-32"
          />
        </div>
      </div>
    </div>
  );
}
