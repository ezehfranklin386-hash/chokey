import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { mobileNavItems } from './navConfig';

export function MobileNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-white-10 bg-primary-800 md:hidden"
      aria-label="Mobile navigation"
    >
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              isActive ? 'text-gold-500' : 'text-white-50 hover:text-white-70',
            )}
          >
            <Icon className={cn('h-5 w-5', isActive && 'text-gold-500')} />
            <span>{item.label}</span>
            {/* Active indicator dot */}
            {isActive && <span className="mt-0.5 h-1 w-1 rounded-full bg-gold-500" />}
          </NavLink>
        );
      })}
    </nav>
  );
}
