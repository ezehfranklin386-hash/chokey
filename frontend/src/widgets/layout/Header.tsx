import { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { useAuth } from '@/app/providers/AuthProvider';
import { useTheme } from '@/app/providers/ThemeProvider';
import { Badge } from '@/shared/ui/Badge/Badge';
import { IS_DEMO_MODE } from '@/shared/api/demo/demoConfig';
import { navItems } from './navConfig';

export interface HeaderProps {
  onMenuToggle: () => void;
  className?: string;
}

export function Header({ onMenuToggle, className }: HeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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
        'sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-900 px-4 lg:px-6',
        className,
      )}
    >
      {/* Left section: hamburger + logo */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-ink-70 dark:text-white-70 hover:bg-ink-30/10 dark:hover:bg-primary-600 hover:text-ink dark:hover:text-white-90 transition-colors lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-ink dark:text-white">
            Chokey
          </span>
        </button>
      </div>

      {/* Center: nav links (desktop) */}
      <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-brand-500 bg-brand-50 dark:bg-brand-500/10'
                    : 'text-ink-70 dark:text-white-70 hover:text-ink dark:hover:text-white-90 hover:bg-ink-30/10 dark:hover:bg-primary-600',
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-ink-70 dark:text-white-70 hover:bg-ink-30/10 dark:hover:bg-primary-600 hover:text-ink dark:hover:text-white-90 transition-colors"
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
          className="relative rounded-lg p-2 text-ink-70 dark:text-white-70 hover:bg-ink-30/10 dark:hover:bg-primary-600 hover:text-ink dark:hover:text-white-90 transition-colors"
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-primary-600 text-sm font-semibold text-brand-600 dark:text-white-90">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-ink dark:text-white-90">{displayName}</p>
            {user?.kycLevel && user.kycLevel > 0 && (
              <Badge variant="brand" size="sm">
                Level {user.kycLevel}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
