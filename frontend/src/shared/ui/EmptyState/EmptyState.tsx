import { type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-primary-500 bg-primary-800/50 px-8 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 text-white-30 [&>svg]:h-14 [&>svg]:w-14">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-base text-white-70">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
