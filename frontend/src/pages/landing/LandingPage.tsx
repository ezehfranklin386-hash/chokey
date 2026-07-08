import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';
import heroImage from '@/assets/hero.png';

/* ── Inline SVG Icons ──────────────────────────────────── */

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LightningIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function WalletIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="1" y="5" width="22" height="14" rx="2" />
      <circle cx="17" cy="12" r="2" />
      <path d="M5 5V3a1 1 0 011-1h12a1 1 0 011 1v2" />
    </svg>
  );
}

function ChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M17 17h4v-4" />
    </svg>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── Feature data ──────────────────────────────────────── */

const features = [
  {
    icon: ShieldIcon,
    title: 'Secure Storage',
    description: 'Industry-leading security with multi-signature wallets, cold storage, and real-time monitoring to keep your assets safe.',
  },
  {
    icon: LightningIcon,
    title: 'Lightning Fast Trades',
    description: 'Execute trades in milliseconds with our advanced matching engine. No delays, no downtime, just seamless trading.',
  },
  {
    icon: WalletIcon,
    title: 'Multi-Asset Wallet',
    description: 'Support for 100+ cryptocurrencies in a single wallet. Manage Bitcoin, Ethereum, Solana, and more from one place.',
  },
  {
    icon: ChartIcon,
    title: 'Professional Charts',
    description: 'Make informed decisions with real-time charts, technical indicators, and customizable trading views.',
  },
  {
    icon: GlobeIcon,
    title: 'Global Access',
    description: 'Available in 100+ countries with local payment methods. Buy crypto with your preferred currency.',
  },
  {
    icon: PhoneIcon,
    title: 'Mobile First',
    description: 'Full-featured mobile experience. Trade, monitor, and manage your portfolio on the go.',
  },
];

/* ─── nav links ──────────────────────────────────────── */
const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Security', href: '#security' },
  { label: 'Developers', href: '#developers' },
  { label: 'About', href: '#about' },
];

/* ─── Landing Page ────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleGetStarted = useCallback(() => {
    navigate('/auth/sign-up');
  }, [navigate]);

  const handleSignIn = useCallback(() => {
    navigate('/auth/sign-in');
  }, [navigate]);

  const handleEmailSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (email.trim()) {
        navigate('/auth/sign-up');
      }
    },
    [email, navigate],
  );

  return (
    <div className="min-h-screen bg-white">
      {/* ─── NAVIGATION ─────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-ink-30/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-500">
              <span className="text-xs font-bold text-white">C</span>
            </div>
            <span className="text-base font-bold tracking-tight text-ink">Chokey</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-ink-50 hover:text-ink transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleSignIn}
              className="text-sm font-medium text-ink-50 hover:text-ink transition-colors"
            >
              Sign In
            </button>
            <Button size="sm" onClick={handleGetStarted}>
              Get Started
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="rounded-lg p-2 text-ink-50 hover:text-ink transition-colors md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile nav panel */}
        {mobileNavOpen && (
          <div className="border-t border-ink-30/10 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="text-sm font-medium text-ink-50 hover:text-ink transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-ink-30/10" />
              <button
                onClick={handleSignIn}
                className="text-sm font-medium text-ink-50 hover:text-ink transition-colors text-left"
              >
                Sign In
              </button>
              <Button size="sm" fullWidth onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ──────────────────────────────────── */}
      <section className="relative overflow-hidden pt-14">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,82,255,0.06),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Text */}
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/5 px-3 py-1 text-xs font-medium text-brand-500">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                Now available in 100+ countries
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                Your Crypto Journey{' '}
                <span className="text-brand-500">Starts Here</span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-ink-70 sm:text-xl">
                Buy, sell, and trade 100+ cryptocurrencies with confidence.
                Industry-leading security, lightning-fast execution, and a platform
                trusted by millions worldwide.
              </p>

              {/* Email signup */}
              <form onSubmit={handleEmailSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-ink-30/20 bg-surface-secondary px-4 py-3 text-sm text-ink placeholder-ink-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-colors"
                    required
                  />
                </div>
                <Button type="submit" size="lg">
                  Get Started
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <p className="mt-4 text-xs text-ink-50">
                By signing up, you agree to our{' '}
                <a href="#" className="text-brand-500 hover:text-brand-600">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-brand-500 hover:text-brand-600">Privacy Policy</a>.
              </p>

              {/* Trusted by */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-white bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-600"
                    >
                      {['JD', 'AK', 'ML', 'TS'][i - 1]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-ink-50">
                  <span className="font-semibold text-ink">2M+</span> traders trust Chokey
                </p>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Chokey crypto dashboard"
                className="relative w-full max-w-lg rounded-2xl shadow-2xl ring-1 ring-ink-30/10"
              />
              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 rounded-lg border border-ink-30/10 bg-white p-4 shadow-lg lg:-left-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-market-green/10">
                    <ChartIcon className="h-5 w-5 text-market-green" />
                  </div>
                  <div>
                    <p className="text-xs text-ink-50">Portfolio Value</p>
                    <p className="text-lg font-bold text-ink">$12,458.32</p>
                    <p className="text-xs font-medium text-market-green">+8.2% today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─────────────────────────────── */}
      <section className="border-y border-ink-30/10 bg-surface-secondary">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '$2.4B', label: 'Trading Volume' },
              { value: '2M+', label: 'Active Users' },
              { value: '100+', label: 'Countries' },
              { value: '150+', label: 'Assets Supported' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-ink">{stat.value}</p>
                <p className="mt-1 text-sm text-ink-50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────── */}
      <section id="features" className="scroll-mt-14">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-ink sm:text-4xl">
              Everything you need to trade crypto
            </h2>
            <p className="mt-3 text-lg text-ink-70">
              A complete platform for buying, selling, and managing your digital assets.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-lg border border-ink-30/10 bg-white p-6 transition-all duration-200 hover:border-brand-500/30 hover:shadow-sm"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-70">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SECURITY SECTION ──────────────────────── */}
      <section id="security" className="scroll-mt-14 bg-surface-secondary">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-ink sm:text-4xl">
                Built with{' '}
                <span className="text-brand-500">security</span> at every layer
              </h2>
              <p className="mt-4 text-lg text-ink-70">
                Your assets are protected by the same security infrastructure used by
                leading financial institutions worldwide.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'Multi-signature wallet technology',
                  '98% of assets stored in cold storage',
                  'Real-time fraud monitoring',
                  'SOC 2 Type II certified',
                  'FDIC insurance eligible',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-market-green" />
                    <span className="text-sm text-ink-70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-2xl border border-ink-30/10 bg-white p-8 shadow-sm">
                <ShieldIcon className="mx-auto h-24 w-24 text-brand-500" />
                <p className="mt-4 text-center text-sm font-medium text-ink-70">
                  Enterprise-grade security for everyone
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ───────────────────────────── */}
      <section id="about" className="scroll-mt-14">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="relative overflow-hidden rounded-2xl bg-brand-500 px-6 py-16 text-center sm:px-16">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
            </div>

            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Start your crypto journey today
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-white/80">
                Join millions of traders worldwide. Sign up in minutes and start trading instantly.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-white text-brand-500 hover:bg-white/90 hover:text-brand-600"
                >
                  Create free account
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
                <button
                  onClick={handleSignIn}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Sign in instead
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────── */}
      <footer className="border-t border-ink-30/10 bg-surface-secondary">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-500">
                  <span className="text-xs font-bold text-white">C</span>
                </div>
                <span className="text-base font-bold tracking-tight text-ink">Chokey</span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-ink-50">
                Your trusted platform for buying, selling, and managing cryptocurrency.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-ink">Product</h4>
              <ul className="mt-4 space-y-2">
                {['Buy Crypto', 'Sell Crypto', 'Wallet', 'Trading', 'Signals'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-ink-50 hover:text-ink transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-ink">Company</h4>
              <ul className="mt-4 space-y-2">
                {['About', 'Careers', 'Press', 'Blog', 'Security'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-ink-50 hover:text-ink transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-ink">Support</h4>
              <ul className="mt-4 space-y-2">
                {['Help Center', 'Contact Us', 'API Docs', 'Community', 'Status'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-ink-50 hover:text-ink transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-ink-30/10 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-xs text-ink-50">
                &copy; {new Date().getFullYear()} Chokey. All rights reserved.
              </p>
              <div className="flex gap-4 text-xs text-ink-50">
                <a href="#" className="hover:text-ink transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-ink transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-ink transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
