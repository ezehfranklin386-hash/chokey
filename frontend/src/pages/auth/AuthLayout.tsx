import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-primary-900">
      {/* Background gradient + subtle grid overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212, 168, 67, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 168, 67, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-modal border border-white-10 bg-primary-800/80 p-8 shadow-2xl backdrop-blur-xl">
            <Outlet />
          </div>

          {/* Footer links */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-4 text-xs text-white-50">
              <a href="#" className="hover:text-white-70 transition-colors">
                Terms of Service
              </a>
              <span className="text-white-30">·</span>
              <a href="#" className="hover:text-white-70 transition-colors">
                Privacy Policy
              </a>
              <span className="text-white-30">·</span>
              <a href="#" className="hover:text-white-70 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative border-t border-white-10 py-4 text-center text-xs text-white-30">
        &copy; {new Date().getFullYear()} CryptoWallet. All rights reserved.
      </div>
    </div>
  );
}
