import { forwardRef, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { navItems } from './navConfig';

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onLogout: () => void;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ collapsed, onToggle, mobileOpen, onMobileClose, onLogout }, ref) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Close on route change (mobile)
    const handleNavClick = useCallback(() => {
      if (mobileOpen) onMobileClose();
    }, [mobileOpen, onMobileClose]);

    const handleLogout = useCallback(() => {
      onLogout();
      navigate('/auth/sign-in', { replace: true });
    }, [onLogout, navigate]);

    const sidebarContent = (
      <>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white-10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500">
              <span className="text-sm font-bold text-primary-900">C</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight text-white">CryptoWallet</span>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={onToggle}
              className="rounded-lg p-1.5 text-white-50 hover:bg-primary-600 hover:text-white-90 transition-colors"
              aria-label="Collapse sidebar"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
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
                        ? 'bg-gold-500/10 text-gold-500'
                        : 'text-white-70 hover:bg-primary-600 hover:text-white-90',
                    )}
                  >
                    <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-gold-500' : 'text-white-50')} />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse button when collapsed */}
        {collapsed && (
          <div className="px-3 pb-2">
            <button
              onClick={onToggle}
              className="flex w-full items-center justify-center rounded-card px-3 py-2.5 text-white-50 hover:bg-primary-600 hover:text-white-90 transition-colors"
              aria-label="Expand sidebar"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}

        {/* Logout */}
        <div className="border-t border-white-10 p-3">
          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-white-50 transition-colors hover:bg-primary-600 hover:text-market-red',
              collapsed && 'justify-center',
            )}
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </>
    );

    return (
      <>
        {/* Desktop sidebar */}
        <aside
          ref={ref}
          className={cn(
            'hidden md:flex flex-col bg-primary-800 border-r border-white-10 transition-all duration-200',
            collapsed ? 'w-16' : 'w-64',
          )}
        >
          {sidebarContent}
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onMobileClose}
            />
            {/* Drawer */}
            <aside className="relative flex w-72 flex-col bg-primary-800 shadow-2xl animate-slide-up">
              {sidebarContent}
            </aside>
          </div>
        )}
      </>
    );
  },
);

Sidebar.displayName = 'Sidebar';
