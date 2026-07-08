import { type SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-ink-70 dark:text-white-70"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative rounded-lg border bg-surface-secondary dark:bg-primary-700 transition-all duration-200',
            'focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/30',
            error ? 'border-market-red' : 'border-ink-30/20 dark:border-primary-500',
          )}
        >
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none bg-transparent px-3 py-2.5 pr-10 text-base text-ink dark:text-white',
              'focus:outline-none',
              className,
            )}
            aria-invalid={!!error}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-surface-secondary dark:bg-primary-700">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface-secondary dark:bg-primary-700">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-50 dark:text-white-50">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-market-red" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
