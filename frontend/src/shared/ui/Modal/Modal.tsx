import { type ReactNode, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/shared/lib/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  children: ReactNode;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  fullscreen: 'max-w-full mx-0 h-full rounded-none',
};

/**
 * Focusable elements selector used for focus trapping.
 * Includes standard interactive elements and those with tabIndex >= 0.
 */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, size = 'md', children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab' || !contentRef.current) return;

      const focusable = contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    // Save the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the first focusable element inside modal
    requestAnimationFrame(() => {
      if (contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length > 0) {
          focusable[0]!.focus();
        }
      }
    });

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';

      // Restore focus to the element that opened the modal
      previousActiveElement.current?.focus();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={contentRef}
        className={cn(
          'relative w-full animate-slide-up rounded-modal bg-primary-700 shadow-lg',
          sizeClasses[size],
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-primary-500 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-white-70 transition-colors hover:bg-primary-600 hover:text-white"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className={cn('overflow-y-auto', title ? 'p-6' : 'p-6')}>{children}</div>
      </div>
    </div>
  );
}
