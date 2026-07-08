import { cn } from '@/shared/lib/cn';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const delta = 2;
    const range: (number | '...')[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  };

  return (
    <nav className={cn('flex items-center justify-center gap-1', className)} aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg px-3 py-2 text-sm text-white-70 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Previous page"
      >
        ←
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-white-50">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              'min-w-[36px] rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              p === page
                ? 'bg-gold-500 text-white'
                : 'text-white-70 hover:bg-primary-600 hover:text-white',
            )}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg px-3 py-2 text-sm text-white-70 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  );
}
