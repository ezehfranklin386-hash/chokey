import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-brand-50 via-white to-surface-secondary dark:from-primary-900 dark:via-primary-800 dark:to-primary-700">
      {/* Subtle grid overlay (dark mode only) */}
      <div
        className="absolute inset-0 hidden dark:block opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 82, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 82, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-modal border border-ink-30/10 dark:border-white/10 bg-white dark:bg-primary-800/80 p-8 dark:shadow-2xl dark:backdrop-blur-xl">
            <Outlet />
          </div>

          {/* Footer links */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-4 text-xs text-ink-50 dark:text-white-50">
              <a href="#" className="hover:text-ink-70 dark:hover:text-white-70 transition-colors">
                Terms of Service
              </a>
              <span className="text-ink-30 dark:text-white-30">·</span>
              <a href="#" className="hover:text-ink-70 dark:hover:text-white-70 transition-colors">
                Privacy Policy
              </a>
              <span className="text-ink-30 dark:text-white-30">·</span>
              <a href="#" className="hover:text-ink-70 dark:hover:text-white-70 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative border-t border-ink-30/10 dark:border-white-10 py-4 text-center text-xs text-ink-30 dark:text-white-30">
        &copy; {new Date().getFullYear()} CryptoWallet. All rights reserved.
      </div>
    </div>
  );
}
