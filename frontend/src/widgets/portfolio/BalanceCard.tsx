import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import type { PortfolioSummary } from '@/entities/wallet/wallet.types';

interface BalanceCardProps {
  summary: PortfolioSummary | undefined;
  isLoading: boolean;
}

export function BalanceCard({ summary, isLoading }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  if (isLoading) {
    return (
      <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-6">
        <div className="skeleton mb-2 h-4 w-24 rounded" />
        <div className="skeleton mb-2 h-10 w-48 rounded" />
        <div className="skeleton h-4 w-32 rounded" />
      </div>
    );
  }

  const total = summary?.totalUsdValue ?? '$0.00';
  const change = summary?.changePercent24h ?? '0.00';
  const changeAbs = summary?.change24h ?? '$0.00';
  const isPositive = !change.startsWith('-');

  return (
    <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-70 dark:text-white-70">Total Balance</span>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="rounded p-1 text-ink-50 dark:text-white-50 hover:bg-primary-600 hover:text-ink-90 dark:hover:text-white-90 transition-colors"
          aria-label={showBalance ? 'Hide balance' : 'Show balance'}
        >
          {showBalance ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      <div className="mt-2 flex items-baseline gap-2 sm:gap-3">
        <h2 className="text-2xl font-bold text-ink dark:text-white font-mono sm:text-3xl">
          {showBalance ? total : '****'}
        </h2>
        <span
          className={cn(
            'flex items-center gap-1 text-sm font-medium font-mono',
            isPositive ? 'text-market-green' : 'text-market-red',
          )}
        >
          <svg
            className={cn('h-3 w-3', !isPositive && 'rotate-180')}
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <path d="M6 2l4 6H2z" />
          </svg>
          {showBalance ? `${isPositive ? '+' : ''}${change}%` : '****'}
        </span>
      </div>

      <p className="mt-1 text-sm text-ink-50 dark:text-white-50">
        24h change: {showBalance ? `${isPositive ? '+' : ''}${changeAbs}` : '****'}
      </p>

      {summary && (
        <div className="mt-4 flex flex-wrap gap-4 border-t border-ink-30/10 dark:border-white-10 pt-4">
          <div>
            <p className="text-xs text-ink-50 dark:text-white-50">In Orders</p>
            <p className="text-sm font-mono text-ink-90 dark:text-white-90">
              {showBalance ? `$${Number(summary.inOrders).toLocaleString()}` : '****'}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-50 dark:text-white-50">Available</p>
            <p className="text-sm font-mono text-ink-90 dark:text-white-90">
              {showBalance ? `$${Number(summary.available).toLocaleString()}` : '****'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
