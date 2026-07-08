import { useState, useMemo } from 'react';
import { useSignals } from '@/features/signals/useSignals';
import { SignalCard } from '@/widgets/signals/SignalCard';
import { SignalCardSkeleton } from '@/widgets/signals/SignalCardSkeleton';
import { SignalFilters } from '@/widgets/signals/SignalFilters';
import type { SignalDirection, SignalTimeframe } from '@/entities/signals/signals.types';

export default function SignalsPage() {
  // Filters
  const [direction, setDirection] = useState<SignalDirection | 'all'>('all');
  const [asset, setAsset] = useState('');
  const [timeframe, setTimeframe] = useState<SignalTimeframe | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'pnl'>('date');

  const { data, isLoading } = useSignals({
    direction: direction !== 'all' ? direction : undefined,
    asset: asset || undefined,
    timeframe: timeframe !== 'all' ? timeframe : undefined,
    sortBy,
    limit: 50,
  });

  // Sort/filter client side for instant feedback
  const filteredSignals = useMemo(() => {
    if (!data?.signals) return [];

    let results = [...data.signals];

    // Client-side asset search
    if (asset.trim()) {
      const q = asset.toLowerCase();
      results = results.filter(
        (s) => s.asset.toLowerCase().includes(q) || s.assetName?.toLowerCase().includes(q),
      );
    }

    // Sort
    if (sortBy === 'confidence') {
      results.sort((a, b) => b.confidence - a.confidence);
    } else if (sortBy === 'pnl') {
      results.sort((a, b) => {
        const pnlA = a.performance ? parseFloat(a.performance.pnl) : -Infinity;
        const pnlB = b.performance ? parseFloat(b.performance.pnl) : -Infinity;
        return pnlB - pnlA;
      });
    } else {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return results;
  }, [data?.signals, asset, sortBy]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Signals</h1>
        <p className="text-sm text-white-50">Professional trading signals to guide your decisions</p>
      </div>

      {/* Filters */}
      <div className="rounded-card border border-white-10 bg-primary-800 p-4">
        <SignalFilters
          direction={direction}
          onDirectionChange={setDirection}
          asset={asset}
          onAssetChange={setAsset}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-white-50">
          {isLoading ? 'Loading...' : `${filteredSignals.length} signal${filteredSignals.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Signal cards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <SignalCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredSignals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-4xl text-white-30">📡</div>
          <p className="text-sm text-white-70">
            {asset ? 'No signals match your search' : 'No signals available yet'}
          </p>
          <p className="mt-1 text-xs text-white-50">
            {asset
              ? 'Try a different asset or adjust your filters'
              : 'Check back later for new trading signals'}
          </p>
          {asset && (
            <button
              onClick={() => setAsset('')}
              className="mt-4 text-xs font-medium text-gold-500 hover:text-gold-400"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSignals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      )}
    </div>
  );
}
