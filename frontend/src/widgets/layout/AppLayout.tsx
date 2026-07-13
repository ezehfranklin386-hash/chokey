import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { OfflineBanner } from './OfflineBanner';

export function AppLayout() {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="flex h-screen flex-col bg-surface dark:bg-primary-900">
      {/* Skip to content link — visually hidden, shown on focus */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Offline banner at the very top */}
      <OfflineBanner />

      {/* Top navigation bar */}
      <Header onMenuToggle={openMobileMenu} />

      {/* Mobile sidebar drawer */}
      <Sidebar
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        onLogout={handleLogout}
      />

      {/* Main content area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 overflow-y-auto pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0 focus:outline-none"
      >
        <Outlet />
      </main>

      {/* Mobile bottom nav (hidden on lg+) */}
      <MobileNav />
    </div>
  );
}
