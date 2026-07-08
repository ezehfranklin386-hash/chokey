import { useState, useMemo } from 'react';
import { cn } from '@/shared/lib/cn';
import type { TradingPair } from '@/entities/trading/trading.types';
import { SearchBar } from '@/widgets/wallet/SearchBar';
import { Spinner } from '@/shared/ui';

interface MarketPairsProps {
  pairs: TradingPair[] | undefined;
  isLoading: boolean;
  activePair: string;
  onSelect: (symbol: string) => void;
}

export function MarketPairs({ pairs, isLoading, activePair, onSelect }: MarketPairsProps) {
  const [search, setSearch] = useState('');

  const filteredPairs = useMemo(() => {
    if (!pairs) return [];
    if (!search.trim()) return pairs;
    const q = search.toLowerCase();
    return pairs.filter(
      (p) => p.symbol.toLowerCase().includes(q) ||
             p.baseAsset.toLowerCase().includes(q) ||
             p.quoteAsset.toLowerCase().includes(q),
    );
  }, [pairs, search]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-primary-800 border-r border-ink-30/10 dark:border-primary-500/40">
      {/* Header */}
      <div className="p-3 border-b border-primary-500/40">
        <h3 className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-2">Markets</h3>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Column headers */}
      <div className="flex items-center px-3 py-1.5 text-[10px] text-ink-50 dark:text-white-50 uppercase tracking-wider border-b border-primary-500/40">
        <span className="flex-1">Pair</span>
        <span className="w-20 text-right">Price</span>
        <span className="w-16 text-right">24h</span>
      </div>

      {/* Pairs list */}
      <div className="flex-1 overflow-y-auto">
        {!filteredPairs || filteredPairs.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-xs text-ink-50 dark:text-white-50">
            {search ? 'No pairs match your search' : 'No trading pairs available'}
          </div>
        ) : (
          filteredPairs.map((pair) => {
            const isActive = pair.symbol === activePair;
            const changeNum = parseFloat(pair.changePercent24h);
            const isPositive = changeNum >= 0;
            return (
              <button
                key={pair.symbol}
                onClick={() => onSelect(pair.symbol)}
                className={cn(
                  'flex w-full items-center px-3 py-2.5 text-left transition-colors hover:bg-primary-600/50',
                  isActive && 'bg-brand-500/5 border-l-2 border-brand-500',
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium font-mono',
                    isActive ? 'text-brand-500' : 'text-ink dark:text-white',
                  )}>
                    {pair.symbol}
                  </p>
                  <p className="text-[10px] text-ink-50 dark:text-white-50">
                    Vol: ${(parseFloat(pair.volume24h) / 1_000_000).toFixed(1)}M
                  </p>
                </div>
                <span className="w-20 text-right text-sm font-mono text-ink-90 dark:text-white-90">
                  ${parseFloat(pair.price).toLocaleString()}
                </span>
                <span className={cn(
                  'w-16 text-right text-xs font-mono',
                  isPositive ? 'text-market-green' : 'text-market-red',
                )}>
                  {isPositive ? '+' : ''}{pair.changePercent24h}%
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
