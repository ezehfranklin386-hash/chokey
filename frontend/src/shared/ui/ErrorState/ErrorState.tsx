import { cn } from '@/shared/lib/cn';

export interface ErrorStateProps {
  error?: string;
  onRetry?: () => void;
  onSupport?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, onSupport, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-market-red/30 bg-primary-800/50 px-8 py-16 text-center',
        className,
      )}
    >
      <div className="mb-4 text-5xl text-warning">⚠️</div>
      <h3 className="text-xl font-semibold text-white">Something went wrong</h3>
      {error && (
        <p className="mt-2 max-w-md text-base text-white-70">{error}</p>
      )}
      <div className="mt-6 flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-lg border border-gold-500 px-6 py-2.5 text-sm font-semibold text-gold-500 transition-colors hover:bg-gold-500/10"
          >
            Try Again
          </button>
        )}
        {onSupport && (
          <button
            onClick={onSupport}
            className="rounded-lg px-6 py-2.5 text-sm font-medium text-white-70 transition-colors hover:bg-primary-600"
          >
            Contact Support
          </button>
        )}
      </div>
    </div>
  );
}
