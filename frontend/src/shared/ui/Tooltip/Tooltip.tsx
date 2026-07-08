import { type ReactNode, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';

const sideClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export interface TooltipProps {
  content: string;
  side?: keyof typeof sideClasses;
  delay?: number;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ content, side = 'top', delay = 200, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = () => {
    if (timeoutRef.current !== undefined) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current !== undefined) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-primary-600 px-3 py-1.5 text-xs text-white-90 shadow-lg',
            sideClasses[side],
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
