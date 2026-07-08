import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, className, id, checked, ...props }, ref) => {
    const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label
        htmlFor={toggleId}
        className={cn('inline-flex cursor-pointer items-center gap-3', className)}
      >
        <div className="relative">
          <input
            ref={ref}
            id={toggleId}
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            {...props}
          />
          <div className="h-6 w-11 rounded-full bg-primary-500 transition-colors peer-checked:bg-gold-500 peer-focus-visible:ring-2 peer-focus-visible:ring-gold-500/50" />
          <div
            className={cn(
              'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200',
              'peer-checked:translate-x-5',
            )}
          />
        </div>
        {label && <span className="text-sm text-white-90">{label}</span>}
      </label>
    );
  },
);

Toggle.displayName = 'Toggle';
