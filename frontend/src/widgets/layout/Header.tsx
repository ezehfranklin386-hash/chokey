import { useMemo } from 'react';
import { cn } from '@/shared/lib/cn';
import { useAuth } from '@/app/providers/AuthProvider';
import { useTheme } from '@/app/providers/ThemeProvider';
import { Badge } from '@/shared/ui/Badge/Badge';
import { IS_DEMO_MODE } from '@/shared/api/demo/demoConfig';

export interface HeaderProps {
  collapsed: boolean;
  onMenuToggle: () => void;
  className?: string;
}

export function Header({ collapsed, onMenuToggle, className }: HeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const displayName = useMemo(() => {
    if (!user) return 'User';
    return user.fullName || user.username || user.email;
  }, [user]);

  const initials = useMemo(() => {
    if (!user) return 'U';
    const name = user.fullName || user.username || user.email;
    return name
      .split(' ')
      .map((s) => s[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  return (
    <header
      className={cn(
        'flex h-16 shrink-0 items-center justify-between border-b border-white-10 bg-primary-900 px-4 lg:px-6',
        className,
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-white-70 hover:bg-primary-600 hover:text-white-90 transition-colors md:hidden"
          aria-label="Toggle navigation menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>

        {/* Page title / breadcrumb could go here */}
        {collapsed && (
          <button
            onClick={onMenuToggle}
            className="hidden rounded-lg p-2 text-white-70 hover:bg-primary-600 hover:text-white-90 transition-colors md:flex"
            aria-label="Expand sidebar"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-white-70 hover:bg-primary-600 hover:text-white-90 transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-white-70 hover:bg-primary-600 hover:text-white-90 transition-colors"
          aria-label="Notifications"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-market-red" />
        </button>

        {/* Demo mode badge */}
        {IS_DEMO_MODE && (
          <Badge variant="warning" size="sm" className="mr-1">
            DEMO
          </Badge>
        )}

        {/* User avatar */}
        <div className="ml-2 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white-90">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white-90">{displayName}</p>
            {user?.kycLevel && user.kycLevel > 0 && (
              <Badge variant="gold" size="sm">
                Level {user.kycLevel}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
