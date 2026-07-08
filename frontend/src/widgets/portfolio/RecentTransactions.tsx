import { cn } from '@/shared/lib/cn';
import type { Transaction } from '@/entities/wallet/wallet.types';

interface RecentTransactionsProps {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  buy: 'Buy',
  sell: 'Sell',
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  transfer_in: 'Transfer In',
  transfer_out: 'Transfer Out',
};

const TYPE_COLORS: Record<string, string> = {
  buy: 'text-market-green',
  sell: 'text-market-red',
  deposit: 'text-market-green',
  withdraw: 'text-market-red',
  transfer_in: 'text-info',
  transfer_out: 'text-warning',
};

const STATUS_BADGES: Record<string, string> = {
  completed: 'bg-market-green/10 text-market-green',
  pending: 'bg-warning/10 text-warning',
  failed: 'bg-market-red/10 text-market-red',
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-6">
        <h3 className="mb-4 text-sm font-medium text-ink-70 dark:text-white-70">Recent Transactions</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="skeleton h-3 w-24 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
              <div className="space-y-1 text-right">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-3 w-12 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-6">
        <h3 className="mb-4 text-sm font-medium text-ink-70 dark:text-white-70">Recent Transactions</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 text-3xl text-ink-30 dark:text-white-30">📭</div>
          <p className="text-sm text-ink-70 dark:text-white-70">No transactions yet</p>
          <p className="mt-1 text-xs text-ink-50 dark:text-white-50">Your crypto transactions will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-6">
      <h3 className="mb-4 text-sm font-medium text-ink-70 dark:text-white-70">Recent Transactions</h3>
      <div className="space-y-1">
        {transactions.slice(0, 5).map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-primary-600/50 cursor-pointer"
          >
            {/* Type icon */}
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm',
              tx.type === 'buy' || tx.type === 'deposit' || tx.type === 'transfer_in'
                ? 'bg-market-green/10'
                : 'bg-market-red/10',
            )}>
              <span className={cn(
                'text-sm font-mono',
                tx.type === 'buy' || tx.type === 'deposit' || tx.type === 'transfer_in'
                  ? 'text-market-green'
                  : 'text-market-red',
              )}>
                {tx.type === 'buy' || tx.type === 'deposit' || tx.type === 'transfer_in' ? '↓' : '↑'}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink dark:text-white">{TYPE_LABELS[tx.type] || tx.type}</p>
              <p className="text-xs text-ink-50 dark:text-white-50">{formatTime(tx.createdAt)}</p>
            </div>

            {/* Amount + Status */}
            <div className="text-right">
              <p className={cn('text-sm font-mono', TYPE_COLORS[tx.type] || 'text-ink dark:text-white')}>
                {tx.type === 'buy' || tx.type === 'deposit' || tx.type === 'transfer_in' ? '+' : '-'}
                {Number(tx.amount).toLocaleString()} {tx.asset}
              </p>
              <span className={cn(
                'inline-block rounded px-1.5 py-0.5 text-[10px] font-medium',
                STATUS_BADGES[tx.status] || 'bg-primary-500/30 text-ink-50 dark:text-white-50',
              )}>
                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
