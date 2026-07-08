import { useEffect, useState } from 'react';

export interface OfflineBannerProps {
  className?: string;
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="alert"
      className={`flex items-center justify-center gap-2 bg-warning/20 px-4 py-2 text-sm font-medium text-warning ${className ?? ''}`}
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
      </svg>
      <span>You are offline. Some features may be unavailable.</span>
    </div>
  );
}
