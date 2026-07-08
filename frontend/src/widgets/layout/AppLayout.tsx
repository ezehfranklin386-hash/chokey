import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { OfflineBanner } from './OfflineBanner';

export function AppLayout() {
  const { logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change (handled by Sidebar's handleNavClick)

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileMenuOpen]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const openMobileMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <div className="flex h-screen flex-col bg-primary-900">
      {/* Skip to content link — visually hidden, shown on focus */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Offline banner at the very top */}
      <OfflineBanner />

      {/* Main flex row: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          mobileOpen={mobileMenuOpen}
          onMobileClose={closeMobileMenu}
          onLogout={handleLogout}
        />

        {/* Content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            collapsed={sidebarCollapsed}
            onMenuToggle={sidebarCollapsed ? toggleSidebar : openMobileMenu}
          />

          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-y-auto p-4 lg:p-6 focus:outline-none"
          >
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile bottom nav (hidden on md+) */}
      <MobileNav />
    </div>
  );
}
