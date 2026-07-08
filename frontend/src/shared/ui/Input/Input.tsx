import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, prefix, suffix, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-normal text-ink dark:text-white-70"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex items-center rounded-lg border bg-surface-secondary dark:bg-primary-700/60 transition-all duration-150',
            'focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/20',
            error
              ? 'border-market-red'
              : 'border-transparent hover:border-ink-30/30 dark:hover:border-primary-500',
          )}
        >
          {prefix && (
            <span className="flex shrink-0 items-center pl-3 text-ink-50 dark:text-white-50">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-transparent px-3 py-2.5 text-sm text-ink dark:text-white placeholder-ink-50 dark:placeholder-white-50',
              'focus:outline-none',
              prefix && 'pl-2',
              suffix && 'pr-2',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {suffix && (
            <span className="flex shrink-0 items-center pr-3 text-ink-50 dark:text-white-50">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-market-red" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-ink-50 dark:text-white-50">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
