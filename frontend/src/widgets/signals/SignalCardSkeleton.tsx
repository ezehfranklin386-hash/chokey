export function SignalCardSkeleton() {
  return (
    <div className="rounded-card border border-white-10 bg-primary-800 overflow-hidden">
      <div className="flex">
        <div className="w-1 shrink-0 bg-primary-500" />
        <div className="flex-1 p-4 space-y-3">
          {/* Top row */}
          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-3 w-12 rounded" />
            </div>
            <div className="skeleton h-3 w-12 rounded ml-auto" />
          </div>

          {/* Price targets grid */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-10 rounded" />
            ))}
          </div>

          {/* Confidence bar */}
          <div className="space-y-1">
            <div className="skeleton h-2 w-full rounded" />
            <div className="skeleton h-4 w-16 rounded" />
          </div>

          {/* Rationale */}
          <div className="space-y-1">
            <div className="skeleton h-3 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>

          {/* Provider + Actions */}
          <div className="flex items-center gap-2">
            <div className="skeleton h-5 w-5 rounded-full" />
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-6 w-20 rounded ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
