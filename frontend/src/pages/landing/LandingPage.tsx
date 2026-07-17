import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';

/* ── Hooks ──────────────────────────────────────────────── */

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

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

function StarsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ── Hero Dashboard Illustration (SVG) ──────────────────── */

function HeroIllustration() {
  return (
    <div className="relative">
      {/* Glow behind illustration */}
      <div className="absolute -inset-8 bg-gradient-to-r from-brand-500/20 via-brand-400/10 to-transparent rounded-3xl blur-3xl" />

      {/* Main illustration card */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white-30/10 bg-primary-800/60 p-5 shadow-2xl backdrop-blur-sm">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500">
              <span className="text-[10px] font-bold text-white">C</span>
            </div>
            <span className="text-sm font-semibold text-white-90">Chokey</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-market-green" />
            <span className="text-xs text-white-70">Live</span>
          </div>
        </div>

        {/* Portfolio summary */}
        <div className="mb-4 rounded-xl border border-white-30/10 bg-primary-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white-50">Portfolio Value</p>
              <p className="text-2xl font-bold text-white">$12,458.32</p>
            </div>
            <div className="rounded-lg bg-market-green/15 px-3 py-1.5">
              <p className="text-sm font-semibold text-market-green">+8.2%</p>
            </div>
          </div>
        </div>

        {/* Mini candlestick chart */}
        <svg className="mb-4 w-full" viewBox="0 0 400 80" preserveAspectRatio="none" style={{ height: 48 }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0052FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0052FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Price line */}
          <path
            d="M0,60 L20,55 L40,58 L60,45 L80,48 L100,35 L120,38 L140,25 L160,28 L180,20 L200,22 L220,15 L240,18 L260,10 L280,12 L300,8 L320,10 L340,5 L360,7 L380,3 L400,6"
            fill="none"
            stroke="#0052FF"
            strokeWidth="2"
            className="animate-pulse"
          />
          {/* Gradient fill */}
          <path
            d="M0,60 L20,55 L40,58 L60,45 L80,48 L100,35 L120,38 L140,25 L160,28 L180,20 L200,22 L220,15 L240,18 L260,10 L280,12 L300,8 L320,10 L340,5 L360,7 L380,3 L400,6 L400,80 L0,80 Z"
            fill="url(#chartGrad)"
          />
          {/* Candles */}
          {[
            { x: 10, up: true }, { x: 50, up: true }, { x: 90, up: false },
            { x: 130, up: true }, { x: 170, up: true }, { x: 210, up: false },
            { x: 250, up: true }, { x: 290, up: true }, { x: 330, up: false },
            { x: 370, up: true },
          ].map((c, i) => (
            <g key={i}>
              <rect x={c.x} y={c.up ? 38 : 42} width="6" height={c.up ? -10 : 10} rx="1" fill={c.up ? '#16A34A' : '#DC2626'} />
              <line x1={c.x + 3} y1={c.up ? 28 : 52} x2={c.x + 3} y2={c.up ? 38 : 42} stroke={c.up ? '#16A34A' : '#DC2626'} strokeWidth="1" />
            </g>
          ))}
        </svg>

        {/* Asset row */}
        <div className="flex items-center justify-between rounded-lg border border-white-30/10 bg-primary-700/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-400">B</div>
            <div>
              <p className="text-sm font-medium text-white">Bitcoin</p>
              <p className="text-xs text-white-50">BTC</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">$43,821.50</p>
            <p className="text-xs font-medium text-market-green">+2.4%</p>
          </div>
        </div>

        {/* Bottom asset dots */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {['bg-brand-400', 'bg-gold-400', 'bg-market-green', 'bg-purple-500', 'bg-pink-500'].map((c, i) => (
            <div key={i} className={`h-2 w-2 rounded-full ${c} opacity-60`} />
          ))}
        </div>
      </div>

      {/* Floating glass card */}
      <div className="absolute -bottom-4 -left-4 rounded-xl border border-white-30/10 bg-primary-800/80 p-4 shadow-xl backdrop-blur-lg lg:-left-8 animate-slide-up"
        style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-market-green/15">
            <ChartIcon className="h-5 w-5 text-market-green" />
          </div>
          <div>
            <p className="text-xs text-white-50">24h Volume</p>
            <p className="text-lg font-bold text-white">$2.4B</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Animated gradient orbs ─────────────────────────────── */

function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-brand-500/10 blur-3xl" style={{ animationDuration: '8s' }} />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-purple-500/10 blur-3xl" style={{ animationDuration: '12s' }} />
      <div className="absolute top-1/2 left-1/3 h-60 w-60 animate-pulse rounded-full bg-brand-400/5 blur-3xl" style={{ animationDuration: '10s' }} />
      {/* Dot grid overlay */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
      </svg>
    </div>
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

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Security', href: '#security' },
  { label: 'Developers', href: '#developers' },
  { label: 'About', href: '#about' },
];

/* ── Animated section wrapper ──────────────────────────── */

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal(0.12);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Landing Page ──────────────────────────────────────── */

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
    <div className="min-h-screen">
      {/* ─── NAVIGATION ─────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white-30/10 bg-primary-900/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-500 shadow-glow-brand">
              <span className="text-xs font-bold text-white">C</span>
            </div>
            <span className="text-base font-bold tracking-tight text-white">Chokey</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white-70 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleSignIn}
              className="text-sm font-medium text-white-70 hover:text-white transition-colors"
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
            className="rounded-lg p-2 text-white-70 hover:text-white transition-colors md:hidden"
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
          <div className="border-t border-white-30/10 bg-primary-900 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="text-sm font-medium text-white-70 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-white-30/10" />
              <button
                onClick={handleSignIn}
                className="text-sm font-medium text-white-70 hover:text-white transition-colors text-left"
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
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-primary-900 pt-14">
        {/* Background layers */}
        <FloatingOrbs />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Text */}
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400 shadow-glow-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
                Now available in 100+ countries
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Your Crypto Journey{' '}
                <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-brand-500 bg-clip-text text-transparent">
                  Starts Here
                </span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-white-70 sm:text-xl max-w-lg">
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
                    className="w-full rounded-lg border border-white-30/10 bg-primary-800/80 px-4 py-3 text-sm text-white placeholder-white-50 backdrop-blur-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-colors"
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto shadow-glow-brand hover:shadow-lg hover:shadow-brand-500/20 transition-shadow">
                  Get Started
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <p className="mt-4 text-xs text-white-50">
                By signing up, you agree to our{' '}
                <a href="#" className="text-brand-400 hover:text-brand-300 transition-colors">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-brand-400 hover:text-brand-300 transition-colors">Privacy Policy</a>.
              </p>

              {/* Trusted by */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-primary-800 bg-brand-500/20 flex items-center justify-center text-xs font-semibold text-brand-400"
                    >
                      {['JD', 'AK', 'ML', 'TS'][i - 1]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-white-50">
                  <span className="font-semibold text-white">2M+</span> traders trust Chokey
                </p>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className="relative flex items-center justify-center">
              <HeroIllustration />
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-900 to-transparent" />
      </section>

      {/* ─── STATS BAR ─────────────────────────────── */}
      <section className="border-y border-white-30/10 bg-primary-900">
        <RevealSection>
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { value: '$2.4B', label: 'Trading Volume', num: 2400000000, prefix: '$', suffix: 'B' },
                { value: '2M+', label: 'Active Users', num: 2000000, prefix: '', suffix: 'M+' },
                { value: '100+', label: 'Countries', num: 100, prefix: '', suffix: '+' },
                { value: '150+', label: 'Assets Supported', num: 150, prefix: '', suffix: '+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-white-50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ─── FEATURES ──────────────────────────────── */}
      <section id="features" className="scroll-mt-14 bg-primary-900">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <RevealSection>
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">
                <StarsIcon className="h-3 w-3" />
                Platform Features
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Everything you need to{' '}
                <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">trade crypto</span>
              </h2>
              <p className="mt-3 text-lg text-white-70">
                A complete platform for buying, selling, and managing your digital assets.
              </p>
            </div>
          </RevealSection>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <RevealSection key={feature.title} delay={i * 100}>
                  <div className="group rounded-xl border border-white-30/10 bg-primary-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-brand-500/30 hover:bg-primary-800/80 hover:shadow-glow-brand hover:-translate-y-0.5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white-70">{feature.description}</p>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SECURITY SECTION ──────────────────────── */}
      <section id="security" className="scroll-mt-14 bg-primary-800/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <RevealSection>
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">
                  <ShieldIcon className="h-3 w-3" />
                  Security First
                </div>
                <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  Built with{' '}
                  <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">security</span>{' '}
                  at every layer
                </h2>
                <p className="mt-4 text-lg text-white-70">
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
                      <span className="text-sm text-white-70">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="rounded-2xl border border-white-30/10 bg-primary-800/80 p-8 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 animate-pulse rounded-full bg-brand-500/20 blur-xl" />
                      <ShieldIcon className="relative h-24 w-24 text-brand-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-center text-sm font-medium text-white-70">
                    Enterprise-grade security for everyone
                  </p>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── CTA SECTION ───────────────────────────── */}
      <section id="about" className="scroll-mt-14 bg-primary-900">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <RevealSection>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-primary-700 px-6 py-16 text-center sm:px-16 shadow-2xl">
              {/* Animated background pattern */}
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
              {/* Glow orbs */}
              <div className="absolute -top-20 -right-20 h-40 w-40 animate-pulse rounded-full bg-white/10 blur-3xl" style={{ animationDuration: '6s' }} />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 animate-pulse rounded-full bg-white/10 blur-3xl" style={{ animationDuration: '8s' }} />

              <div className="relative">
                <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  Start your crypto journey today
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-lg text-white/80">
                  Join millions of traders worldwide. Sign up in minutes and start trading instantly.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    onClick={handleGetStarted}
                    className="bg-white text-brand-600 hover:bg-white/90 hover:text-brand-700 shadow-xl hover:shadow-2xl transition-all"
                  >
                    Create free account
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                  <button
                    onClick={handleSignIn}
                    className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                  >
                    Sign in instead
                  </button>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────── */}
      <footer className="border-t border-white-30/10 bg-primary-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-500 shadow-glow-brand">
                  <span className="text-xs font-bold text-white">C</span>
                </div>
                <span className="text-base font-bold tracking-tight text-white">Chokey</span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-white-50">
                Your trusted platform for buying, selling, and managing cryptocurrency.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-white">Product</h4>
              <ul className="mt-4 space-y-2">
                {['Buy Crypto', 'Sell Crypto', 'Wallet', 'Trading', 'Signals'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white-50 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-white">Company</h4>
              <ul className="mt-4 space-y-2">
                {['About', 'Careers', 'Press', 'Blog', 'Security'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white-50 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-white">Support</h4>
              <ul className="mt-4 space-y-2">
                {['Help Center', 'Contact Us', 'API Docs', 'Community', 'Status'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white-50 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white-30/10 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-xs text-white-50">
                &copy; {new Date().getFullYear()} Chokey. All rights reserved.
              </p>
              <div className="flex gap-4 text-xs text-white-50">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
