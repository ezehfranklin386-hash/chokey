import { cn } from '@/shared/lib/cn';
import type { Transaction } from '@/entities/wallet/wallet.types';
import { Button } from '@/shared/ui';

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  buy: 'Buy', sell: 'Sell', deposit: 'Deposit', withdraw: 'Withdraw',
  transfer_in: 'Transfer In', transfer_out: 'Transfer Out',
};

export function TransactionDetailModal({ transaction: tx, onClose }: TransactionDetailModalProps) {
  const isPositive = tx.type === 'buy' || tx.type === 'deposit' || tx.type === 'transfer_in';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-modal border border-white-10 bg-primary-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Transaction Details</h2>
          <button onClick={onClose} className="text-white-50 hover:text-white-90 transition-colors" aria-label="Close">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Amount */}
        <div className="text-center mb-6">
          <div className={cn(
            'inline-flex items-center justify-center h-14 w-14 rounded-full mb-3',
            isPositive ? 'bg-market-green/10' : 'bg-market-red/10',
          )}>
            <span className={cn('text-xl font-mono', isPositive ? 'text-market-green' : 'text-market-red')}>
              {isPositive ? '↓' : '↑'}
            </span>
          </div>
          <p className={cn('text-2xl font-bold font-mono', isPositive ? 'text-market-green' : 'text-market-red')}>
            {isPositive ? '+' : '-'}{Number(tx.amount).toLocaleString()} {tx.asset}
          </p>
          <p className="text-sm text-white-70">${Number(tx.usdValue).toLocaleString()}</p>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          <DetailRow label="Type" value={TYPE_LABELS[tx.type] || tx.type} />
          <DetailRow label="Status" value={
            <span className={cn(
              'rounded px-1.5 py-0.5 text-xs font-medium',
              tx.status === 'completed' && 'bg-market-green/10 text-market-green',
              tx.status === 'pending' && 'bg-warning/10 text-warning',
              tx.status === 'failed' && 'bg-market-red/10 text-market-red',
            )}>
              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
            </span>
          } />
          <DetailRow label="Fee" value={`${Number(tx.fee).toLocaleString()} ${tx.asset}`} />
          {tx.txHash && <DetailRow label="Transaction Hash" value={
            <span className="font-mono text-gold-500 text-xs break-all">{tx.txHash}</span>
          } />}
          {tx.fromAddress && <DetailRow label="From" value={
            <span className="font-mono text-xs text-white-50 break-all">{tx.fromAddress}</span>
          } />}
          {tx.toAddress && <DetailRow label="To" value={
            <span className="font-mono text-xs text-white-50 break-all">{tx.toAddress}</span>
          } />}
          {tx.confirmations !== undefined && <DetailRow label="Confirmations" value={String(tx.confirmations)} />}
          <DetailRow label="Date" value={new Date(tx.createdAt).toLocaleString()} />
        </div>

        <div className="mt-6">
          <Button fullWidth variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-primary-500/30 last:border-0">
      <span className="text-white-50">{label}</span>
      <span className="text-white-90 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
