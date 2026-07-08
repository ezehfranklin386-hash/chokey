import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { useSignal, useSignalProvider, useRelatedSignals } from '@/features/signals/useSignals';
import { SignalCard } from '@/widgets/signals/SignalCard';
import { Button, Spinner } from '@/shared/ui';

const DIRECTION_CONFIG = {
  STRONG_BUY: { label: 'STRONG BUY', color: 'text-market-green', bg: 'bg-market-green/10' },
  BUY: { label: 'BUY', color: 'text-market-green', bg: 'bg-market-green/5' },
  SELL: { label: 'SELL', color: 'text-market-red', bg: 'bg-market-red/5' },
  STRONG_SELL: { label: 'STRONG SELL', color: 'text-market-red', bg: 'bg-market-red/10' },
};

export default function SignalDetailPage() {
  const { signalId } = useParams<{ signalId: string }>();
  const navigate = useNavigate();
  const { data: signal, isLoading } = useSignal(signalId || '');
  const { data: provider } = useSignalProvider(signal?.provider.id);
  const { data: relatedSignals } = useRelatedSignals(signalId || '');

  if (!signalId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-white-70">No signal selected</p>
        <Button variant="secondary" onClick={() => navigate('/signals')} className="mt-4">
          Back to Signals
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-white-70">Signal not found</p>
        <Button variant="secondary" onClick={() => navigate('/signals')} className="mt-4">
          Back to Signals
        </Button>
      </div>
    );
  }

  const config = DIRECTION_CONFIG[signal.direction];
  const timeSince = formatDetailTime(signal.createdAt);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Back */}
      <button
        onClick={() => navigate('/signals')}
        className="flex items-center gap-1 text-sm text-white-50 hover:text-white-90 transition-colors"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Signals
      </button>

      {/* Signal detail card */}
      <div className="rounded-card border border-white-10 bg-primary-800 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-lg font-mono text-white-90">
              {signal.asset.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{signal.assetName || signal.asset}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('rounded px-2 py-0.5 text-xs font-bold', config.bg, config.color)}>
                  {config.label}
                </span>
                <span className="text-xs text-white-50">{timeSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price targets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <TargetBox label="Stop Loss" value={signal.stopLoss} color="market-red" />
          <TargetBox label="Entry Price" value={signal.entryPrice} color="white-90" />
          <TargetBox label="Target 1" value={signal.targetPrice1} color="market-green" />
          <TargetBox label="Target 2" value={signal.targetPrice2 || '—'} color={signal.targetPrice2 ? 'market-green' : 'white-50'} />
        </div>

        {/* Confidence */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-white-70">Confidence</span>
            <span className={cn('text-lg font-mono font-bold', signal.confidence >= 70 ? 'text-gold-500' : 'text-white-70')}>
              {signal.confidence}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-primary-500">
            <div
              className={cn('h-full rounded-full', signal.confidence >= 70 ? 'bg-gold-500' : 'bg-white-30')}
              style={{ width: `${signal.confidence}%` }}
            />
          </div>
        </div>

        {/* Strategy + Rationale */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white-70 mb-1">Strategy: {signal.strategy}</h3>
          <p className="text-sm text-white-70 leading-relaxed">{signal.rationale}</p>
        </div>

        {/* Performance if resolved */}
        {signal.performance && (
          <div className="mb-6 rounded-lg bg-primary-700 p-4">
            <h3 className="text-sm font-medium text-white-70 mb-2">Performance</h3>
            <div className="flex items-center gap-4">
              <span className={cn(
                'text-lg font-mono font-bold',
                Number(signal.performance.pnl) >= 0 ? 'text-market-green' : 'text-market-red',
              )}>
                {Number(signal.performance.pnl) >= 0 ? '+' : ''}{signal.performance.pnl}
              </span>
              <span className={cn(
                'text-sm font-mono',
                Number(signal.performance.pnlPercent) >= 0 ? 'text-market-green' : 'text-market-red',
              )}>
                ({signal.performance.pnlPercent})
              </span>
              <div className="flex gap-2">
                {signal.performance.hitTarget1 && (
                  <span className="text-xs text-market-green bg-market-green/10 rounded px-2 py-0.5">
                    ✅ Target 1 Hit
                  </span>
                )}
                {signal.performance.hitTarget2 && (
                  <span className="text-xs text-market-green bg-market-green/10 rounded px-2 py-0.5">
                    ✅ Target 2 Hit
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={() => navigate(`/trade/${signal.asset}USDT`)}>
            Trade Now
          </Button>
          <Button variant="secondary" onClick={() => navigate('/signals')}>
            View All Signals
          </Button>
        </div>
      </div>

      {/* Provider profile card */}
      {provider && (
        <div className="rounded-card border border-white-10 bg-primary-800 p-6">
          <h2 className="text-sm font-medium text-white-70 mb-4">Signal Provider</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/20 text-lg font-bold text-gold-500">
              {provider.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{provider.name}</h3>
                {provider.isVerified && (
                  <svg className="h-4 w-4 text-info" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-white-50">Signal Provider</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBox label="Win Rate" value={`${provider.winRate}%`} />
            <StatBox label="Total Signals" value={String(provider.totalSignals)} />
            <StatBox label="Total P&L" value={provider.totalPnl} positive />
            <StatBox label="Followers" value={String(provider.followers)} />
          </div>
        </div>
      )}

      {/* Related signals */}
      {relatedSignals && relatedSignals.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-white-70 mb-4">Related Signals</h2>
          <div className="space-y-4">
            {relatedSignals.slice(0, 3).map((s) => (
              <SignalCard key={s.id} signal={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TargetBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg bg-primary-700 p-3 text-center">
      <p className="text-[10px] text-white-50 uppercase mb-0.5">{label}</p>
      <p className={cn('text-sm font-mono font-medium', `text-${color}`)}>
        ${parseFloat(value).toLocaleString()}
      </p>
    </div>
  );
}

function StatBox({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-lg bg-primary-700 p-3">
      <p className="text-[10px] text-white-50">{label}</p>
      <p className={cn(
        'text-sm font-mono font-medium',
        positive && !value.startsWith('-') ? 'text-market-green' : 'text-white-90',
      )}>
        {value}
      </p>
    </div>
  );
}

function formatDetailTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}
