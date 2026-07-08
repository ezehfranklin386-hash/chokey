import { forwardRef, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { navItems } from './navConfig';

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ open, onClose, onLogout }, ref) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleNavClick = useCallback(() => {
      onClose();
    }, [onClose]);

    const handleLogout = useCallback(() => {
      onLogout();
      navigate('/auth/sign-in', { replace: true });
    }, [onLogout, navigate]);

    const content = (
      <>
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-ink-30/10 dark:border-white-10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <span className="text-sm font-bold text-white">C</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-ink dark:text-white">Chokey</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile navigation">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.exact}
                    onClick={handleNavClick}
                    className={cn(
                      'flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-500/10 text-brand-500'
                        : 'text-ink-70 dark:text-white-70 hover:bg-ink-30/10 dark:hover:bg-primary-600 hover:text-ink dark:hover:text-white-90',
                    )}
                  >
                    <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-brand-500' : 'text-ink-50 dark:text-white-50')} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-ink-30/10 dark:border-white-10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-ink-50 dark:text-white-50 transition-colors hover:bg-ink-30/10 dark:hover:bg-primary-600 hover:text-market-red"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </>
    );

    return (
      <>
        {/* Mobile overlay drawer */}
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />
            {/* Drawer */}
            <aside
              ref={ref}
              className="relative flex w-72 max-w-[80vw] flex-col bg-white dark:bg-primary-800 shadow-2xl h-full animate-slide-up"
            >
              {content}
            </aside>
          </div>
        )}
      </>
    );
  },
);

Sidebar.displayName = 'Sidebar';
