import { useRef } from 'react';

/**
 * Throttle a callback. Drops calls within the limit window.
 * Only the trailing call fires.
 */
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 1000,
): T {
  const lastCall = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return ((...args: any[]) => {
    const now = Date.now();
    const remaining = delay - (now - lastCall.current);

    if (remaining <= 0) {
      lastCall.current = now;
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = undefined;
      }
      callback(...args);
    } else if (!timer.current) {
      timer.current = setTimeout(() => {
        lastCall.current = Date.now();
        timer.current = undefined;
        callback(...args);
      }, remaining);
    }
  }) as T;
}
