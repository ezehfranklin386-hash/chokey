import { type ReactNode, useCallback } from 'react';
import { cn } from '@/shared/lib/cn';

const variants = {
  underline: {
    container: 'flex border-b border-primary-500',
    tab: (active: boolean) =>
      cn(
        'px-4 py-3 text-sm font-medium transition-colors duration-200 relative',
        'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:transition-transform after:duration-200',
        active
          ? 'text-white after:bg-gold-500 after:scale-x-100'
          : 'text-white-70 hover:text-white-90 after:scale-x-0',
      ),
  },
  pill: {
    container: 'flex gap-1 rounded-lg bg-primary-700 p-1',
    tab: (active: boolean) =>
      cn(
        'rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
        active
          ? 'bg-gold-500 text-white shadow-sm'
          : 'text-white-70 hover:text-white-90 hover:bg-primary-600',
      ),
  },
  icon: {
    container: 'flex gap-4',
    tab: (active: boolean) =>
      cn(
        'flex flex-col items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-200',
        active ? 'text-gold-500' : 'text-white-70 hover:text-white-90',
      ),
  },
} as const;

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: keyof typeof variants;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, variant = 'underline', className }: TabsProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, tabId: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange(tabId);
      }
    },
    [onChange],
  );

  const style = variants[variant];

  return (
    <div className={cn(style.container, className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          onClick={() => onChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, tab.id)}
          className={style.tab(activeTab === tab.id)}
        >
          {tab.icon && <span className="shrink-0">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.badge && <span>{tab.badge}</span>}
        </button>
      ))}
    </div>
  );
}
