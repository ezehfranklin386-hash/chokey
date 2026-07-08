# Frontend Build Plan — Production-Grade Crypto Wallet PWA

**Version:** 1.0
**Date:** 2026-07-06
**Directory:** `frontend/` (standalone — no monorepo)
**Stack:** React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · TanStack Query 5 · Zustand 4 · Socket.io Client 4 · TradingView Charting Library · Lightweight Charts 4 · Workbox (vite-plugin-pwa)

---

## Table of Contents

1. [Phase 0: Project Scaffold & Tooling](#phase-0-project-scaffold--tooling)
2. [Phase 1: Design System & Core Components](#phase-1-design-system--core-components)
3. [Phase 2: App Shell, Routing & Providers](#phase-2-app-shell-routing--providers)
4. [Phase 3: API Layer & WebSocket Integration](#phase-3-api-layer--websocket-integration)
5. [Phase 4: Authentication Pages](#phase-4-authentication-pages)
6. [Phase 5: Portfolio Dashboard](#phase-5-portfolio-dashboard)
7. [Phase 6: Wallet & Transactions](#phase-6-wallet--transactions)
8. [Phase 7: Trading View (Charts + Order Book)](#phase-7-trading-view-charts--order-book)
9. [Phase 8: Signals Feed & Detail](#phase-8-signals-feed--detail)
10. [Phase 9: PWA & Offline Support](#phase-9-pwa--offline-support)
11. [Phase 10: KYC & Settings Pages](#phase-10-kyc--settings-pages)
12. [Phase 11: Testing Strategy](#phase-11-testing-strategy)
13. [Phase 12: Performance Optimization & Lighthouse](#phase-12-performance-optimization--lighthouse)
14. [Phase 13: CI/CD & Deployment](#phase-13-cicd--deployment)
15. [Phase 14: i18n & Accessibility (i18n + a11y)](#phase-14-i18n--accessibility)
16. [Production Checklist](#production-checklist)

---

## Phase 0: Project Scaffold & Tooling

**Goal:** Create the frontend directory, initialize Vite with React + TypeScript, configure all tooling.

### Step 0.1 — Initialize Project

```bash
mkdir frontend && cd frontend
npm create vite@latest . -- --template react-ts
npm install
```

### Step 0.2 — Install Core Dependencies

```bash
# Core
npm install react@18 react-dom@18 react-router-dom@6

# State Management
npm install @tanstack/react-query@5 zustand@4

# HTTP & Real-time
npm install axios socket.io-client

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Charts
# TradingView Charting Library goes in /public (see Phase 7)
npm install lightweight-charts recharts

# UI & Animation
npm install framer-motion@11

# i18n
npm install i18next react-i18next i18next-browser-languagedetector

# Utilities
npm install date-fns clsx tailwind-merge
npm install react-hot-toast # or sonner for notifications

# PWA
npm install vite-plugin-pwa workbox-webpack-plugin --save-dev

# Dev Dependencies
npm install -D tailwindcss@3 postcss autoprefixer
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D @playwright/test eslint eslint-plugin-react-hooks prettier
npm install -D @types/react @types/react-dom
npm install -D typescript@5
```

### Step 0.3 — Initialize Config Files

Create these files with full production configuration:

| File | Purpose |
|------|---------|
| `vite.config.ts` | Build config, proxy, PWA plugin, code splitting |
| `tsconfig.json` | Strict mode, path aliases (`@/` → `src/`) |
| `tsconfig.node.json` | For vite config |
| `tailwind.config.ts` | Full design tokens from Design System doc |
| `postcss.config.js` | Tailwind + autoprefixer |
| `.eslintrc.cjs` | Strict react-hooks rules, TypeScript |
| `.prettierrc` | Consistent formatting |
| `.env.example` | Document all env vars (VITE_API_URL, VITE_WS_URL, etc.) |
| `.env.development` | Dev defaults |

### Step 0.4 — Configure Path Aliases

**`tsconfig.json`** (critical for clean imports):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false
  }
}
```

**`vite.config.ts`**:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Step 0.5 — Create Directory Structure

```
frontend/
├── public/
│   ├── charting_library/    ← TradingView (copied manually)
│   ├── icons/               ← PWA icons (72x72 ... 512x512)
│   ├── manifest.json
│   ├── sw.js                ← Custom service worker extensions
│   ├── robots.txt
│   └── screenshots/         ← PWA screenshots
├── src/
│   ├── app/                 ← App shell: providers, router, root
│   ├── pages/               ← Route-level pages (lazy loaded)
│   ├── widgets/             ← Composable UI sections
│   ├── features/            ← Business logic units
│   ├── entities/            ← Domain models/types
│   ├── shared/              ← Shared: api, hooks, ui, lib, types
│   └── styles/              ← Global CSS, custom utilities
├── tests/                   ← E2E tests (Playwright)
│   ├── e2e/
│   └── pwa/
├── .env.development
├── .env.production
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Step 0.6 — Install & Configure Husky + lint-staged

```bash
npx husky init
npm install -D lint-staged
```

**`.husky/pre-commit`**:
```bash
npx lint-staged
```

**`package.json`**:
```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,json,md}": ["prettier --write"]
}
```

---

## Phase 1: Design System & Core Components

**Goal:** Build all design tokens, base styles, and the shared UI component library before any page work.

### Step 1.1 — Tailwind Design Tokens

**`tailwind.config.ts`** — Implement the full palette from `10-Design-System.md`:

```typescript
export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class', // always dark — but support future light mode
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#0A0E27',  // body background
          800: '#0F1636',  // surface
          700: '#151D45',  // elevated
          600: '#1C2554',  // interactive
          500: '#24306A',  // borders
          400: '#3B4A8A',  // disabled
        },
        gold: {
          500: '#D4A843',  // primary accent
          400: '#E0BD60',  // hover
          300: '#ECD17D',  // light
          200: '#F5E4A0',  // subtle
          100: '#FDF5D6',  // lightest
        },
        market: {
          green: '#22C55E',
          red: '#EF4444',
        },
        white: {
          DEFAULT: '#FFFFFF',
          90: '#E5E6EB',
          70: '#B3B5C2',
          50: '#808394',
          30: '#4D5168',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        // crypto-specific sizes
        'crypto-xs': ['11px', { lineHeight: '16px', fontFamily: 'JetBrains Mono' }],
        'crypto-sm': ['13px', { lineHeight: '18px', fontFamily: 'JetBrains Mono' }],
        'crypto-base': ['16px', { lineHeight: '24px', fontFamily: 'JetBrains Mono' }],
        'crypto-lg': ['24px', { lineHeight: '32px', fontFamily: 'JetBrains Mono' }],
        'crypto-xl': ['36px', { lineHeight: '44px', fontFamily: 'JetBrains Mono' }],
      },
      borderRadius: {
        micro: '4px',
        DEFAULT: '8px',
        card: '12px',
        modal: '16px',
        pill: '24px',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(212, 168, 67, 0.15)',
        'glow-gold-md': '0 0 30px rgba(212, 168, 67, 0.1)',
      },
      animation: {
        'price-up': 'flashGreen 0.5s ease-out',
        'price-down': 'flashRed 0.5s ease-out',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gold': 'pulseGold 0.6s ease-in-out',
      },
      keyframes: {
        flashGreen: {
          '0%': { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
```

### Step 1.2 — Base Styles (globals.css)

**`src/styles/globals.css`** — CSS custom properties, base resets, scrollbar styling.

### Step 1.3 — Shared UI Component Library

Build each component with full TypeScript types, loading/empty/error states, and Storybook-ready prop interfaces. Order of build:

| Priority | Component | Variants | Key Props |
|----------|-----------|----------|-----------|
| **P0** | `Button` | primary/gold, secondary/outline, ghost, danger | `variant`, `size`, `loading`, `disabled`, `fullWidth` |
| **P0** | `Input` | default, withPrefix, withSuffix | `label`, `error`, `helperText`, `prefix`/`suffix` |
| **P0** | `Card` | default, premium, stat, interactive | `variant`, `hoverable`, `padding` |
| **P0** | `Badge` | success, danger, warning, gold, outline | `variant`, `size`, `pulse` |
| **P0** | `Tabs` | underline, pill, icon | `tabs[]`, `activeTab`, `onChange` |
| **P1** | `Modal` | default, fullscreen(mobile) | `open`, `onClose`, `size`, `title` |
| **P1** | `Skeleton` | text, card, table, chart | `variant`, `lines`, `width`/`height` |
| **P1** | `EmptyState` | default | `icon`, `title`, `description`, `action`(CTA) |
| **P1** | `ErrorState` | default | `error`, `onRetry`, `onSupport` |
| **P1** | `Tooltip` | default | `content`, `side`, `delay` |
| **P1** | `Toggle` | default | `checked`, `onChange`, `disabled` |
| **P1** | `Toast` (react-hot-toast wrapper) | success, error, loading, info | `message`, `duration` |
| **P1** | `ConfirmDialog` | default, danger | `title`, `message`, `onConfirm`, `confirmText` |
| **P2** | `Table` | default, sortable, paginated | `columns[]`, `data[]`, `sortable`, `onRowClick` |
| **P2** | `Pagination` | default | `page`, `totalPages`, `onChange` |
| **P2** | `PriceTicker` | large, small | `price`, `change`, `changePercent`, `mono` |
| **P2** | `MiniChart` | line, area | `data[]`, `color`, `height`, `width`, `isPositive` |
| **P2** | `ProgressBar` | default | `value`, `max`, `color`, `label` |

All components go in `src/shared/ui/ComponentName/ComponentName.tsx` with barrel exports via `src/shared/ui/index.ts`.

### Step 1.4 — clsx/tailwind-merge Utility

**`src/shared/lib/cn.ts`**:
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Phase 2: App Shell, Routing & Providers

**Goal:** Create the app wrapper with all context providers, route definitions with lazy loading, and the base layout components.

### Step 2.1 — Provider Composition

**`src/app/providers/index.tsx`** — Compose providers in order:

```typescript
export function AppProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <ThemeProvider>
            <I18nProvider>
              <ErrorBoundary fallback={<ErrorPage />}>
                {children}
              </ErrorBoundary>
            </I18nProvider>
          </ThemeProvider>
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

**Provider implementations:**

| Provider | Responsibility | State Location |
|----------|---------------|----------------|
| `QueryClientProvider` | TanStack Query client with defaults | `@tanstack/react-query` |
| `AuthProvider` | Auth context + session management | Zustand store + Context |
| `WebSocketProvider` | Socket.io connection lifecycle | Zustand store |
| `ThemeProvider` | Dark/light theme | Zustand store + `class` on `<html>` |
| `I18nProvider` | i18next initialization | i18next singleton |

### Step 2.2 — Route Definitions

**`src/app/router/index.tsx`** — All routes with lazy loading:

```typescript
const AuthLayout = lazy(() => import('@/pages/auth/AuthLayout'));
const SignInPage = lazy(() => import('@/pages/auth/SignInPage'));
const SignUpPage = lazy(() => import('@/pages/auth/SignUpPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const TwoFactorPage = lazy(() => import('@/pages/auth/TwoFactorPage'));

const AppLayout = lazy(() => import('@/pages/dashboard/AppLayout'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const TradePage = lazy(() => import('@/pages/trade/TradePage'));
const WalletPage = lazy(() => import('@/pages/wallet/WalletPage'));
const AssetDetailPage = lazy(() => import('@/pages/wallet/AssetDetailPage'));
const SignalsPage = lazy(() => import('@/pages/signals/SignalsPage'));
const SignalDetailPage = lazy(() => import('@/pages/signals/SignalDetailPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const KYCWizardPage = lazy(() => import('@/pages/kyc/KYCWizardPage'));
const AdminPage = lazy(() => import('@/pages/admin/AdminPage'));

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="sign-in" replace /> },
      { path: 'sign-in', element: <SignInPage /> },
      { path: 'sign-up', element: <SignUpPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: '2fa', element: <TwoFactorPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'trade/:pair?', element: <TradePage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'wallet/:assetId', element: <AssetDetailPage /> },
      { path: 'signals', element: <SignalsPage /> },
      { path: 'signals/:signalId', element: <SignalDetailPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'kyc', element: <KYCWizardPage /> },
      { path: 'admin', element: <AdminRole><AdminPage /></AdminRole> },
      { path: 'offline', element: <OfflinePage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
```

### Step 2.3 — App Layout Components

Build these layout parts:

| Component | File | Notes |
|-----------|------|-------|
| `AppLayout` | `src/pages/dashboard/AppLayout.tsx` | Sidebar + Header + `<Outlet>` |
| `Sidebar` | `src/widgets/layout/Sidebar.tsx` | Desktop sidebar (160px, collapsible to 48px) |
| `SidebarItem` | `src/widgets/layout/SidebarItem.tsx` | Active state: gold icon + left border |
| `Header` | `src/widgets/layout/Header.tsx` | Logo, search, price ticker, notifications, avatar |
| `MobileNav` | `src/widgets/layout/MobileNav.tsx` | Bottom tab bar (5 tabs) |
| `OfflineBanner` | `src/widgets/layout/OfflineBanner.tsx` | Fixed bottom banner when offline |

**Desktop Layout Strategy:**
```tsx
function AppLayout() {
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <div className="min-h-screen bg-primary-900">
      <Sidebar />
      <div className="ml-[160px] md:ml-[48px] lg:ml-[160px] transition-all duration-300">
        <Header />
        <main className="p-4 lg:p-6">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      {isMobile && <MobileNav />}
      <OfflineBanner />
      <Toaster position="top-right" />
    </div>
  );
}
```

---

## Phase 3: API Layer & WebSocket Integration

**Goal:** Build the complete API client, typed request/response schemas, WebSocket connection management, and real-time hooks.

### Step 3.1 — Axios Instance

**`src/shared/api/client.ts`**:

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});
```

**Interceptors:**

| Interceptor | Purpose |
|-------------|---------|
| Request | Attach JWT access token from Zustand store |
| Request | Attach device fingerprint header |
| Response | Auto-refresh on 401, retry original request |
| Response | Transform JSEND envelope → `response.data.data` |
| Response | Handle 422/429/500 with typed error extraction |

### Step 3.2 — API Endpoint Modules (per domain)

Each module exports typed functions consumed by TanStack Query hooks:

| Module | File | Key Functions |
|--------|------|---------------|
| Auth | `src/shared/api/auth.ts` | `login`, `register`, `verifyEmail`, `setup2FA`, `verify2FA`, `refreshToken`, `logout` |
| Wallet | `src/shared/api/wallet.ts` | `getWallets`, `getWallet`, `getTransactions`, `generateAddress`, `sendCrypto` |
| Market | `src/shared/api/market.ts` | `getPrices`, `getCandles`, `getOrderBook`, `getTicker`, `getSymbols` |
| Trading | `src/shared/api/trading.ts` | `placeOrder`, `cancelOrder`, `getOrders`, `getOrderHistory`, `getPositions` |
| Signals | `src/shared/api/signals.ts` | `getSignals`, `getSignal`, `subscribeToSignal`, `getSignalProviders` |
| Alerts | `src/shared/api/alerts.ts` | `getAlerts`, `createAlert`, `deleteAlert`, `updateAlert` |
| KYC | `src/shared/api/kyc.ts` | `getKYCStatus`, `submitDocument`, `submitSelfie`, `getKYCLimits` |
| User | `src/shared/api/user.ts` | `getProfile`, `updateProfile`, `getSettings`, `updateSettings` |

### Step 3.3 — TanStack Query Client Configuration

**`src/app/providers/queryClient.ts`**:

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // Default 30s stale
      gcTime: 5 * 60_000,       // Garbage collect after 5 min
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: 'offlineFirst', // Allow cached data when offline
    },
    mutations: {
      retry: 0,                  // Never retry mutations
    },
  },
});
```

### Step 3.4 — WebSocket Connection Manager

**`src/shared/lib/websocket.ts`** (Zustand store):

```typescript
interface WebSocketState {
  socket: Socket | null;
  isConnected: boolean;
  reconnectAttempt: number;
  connect: (token: string) => void;
  disconnect: () => void;
  subscribe: (channel: string, callback: (data: any) => void) => () => void;
}

export const useWebSocket = create<WebSocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  reconnectAttempt: 0,

  connect: (token) => {
    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10_000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => set({ isConnected: true, reconnectAttempt: 0 }));
    socket.on('disconnect', () => set({ isConnected: false }));
    socket.on('connect_error', () => {
      set((state) => ({ reconnectAttempt: state.reconnectAttempt + 1 }));
    });

    set({ socket });
  },

  subscribe: (channel, callback) => {
    const { socket } = get();
    socket?.emit('subscribe', channel);
    socket?.on(channel, callback);
    return () => { socket?.emit('unsubscribe', channel); socket?.off(channel, callback); };
  },
}));
```

### Step 3.5 — WebSocket Channels & Hooks

Build custom hooks that use the WebSocket store + TanStack Query cache updates:

| Hook | Channel | Purpose |
|------|---------|---------|
| `usePriceStream(symbol)` | `price:{symbol}` | Real-time price, auto-updates query cache |
| `useCandleStream(symbol, interval)` | `candle:{symbol}:{interval}` | Real-time candle updates |
| `useOrderBookStream(symbol)` | `orderbook:{symbol}` | Real-time order book depth |
| `useOrderStream()` | `orders:{userId}` | Live order status updates |
| `useBalanceStream()` | `balances:{userId}` | Live balance updates |
| `useSignalStream()` | `signals:{userId}` | New signal notifications |
| `useAlertStream()` | `alerts:{userId}` | Alert trigger notifications |

**Pattern for WebSocket → Query Cache:**
```typescript
export function useOrderStream() {
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsub = subscribe('order:update', (order: Order) => {
      // Update order detail cache
      queryClient.setQueryData(['order', order.id], order);
      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // If filled, invalidate balances
      if (order.status === 'FILLED') {
        queryClient.invalidateQueries({ queryKey: ['wallets'] });
      }
    });
    return unsub;
  }, []);
}
```

---

## Phase 4: Authentication Pages

**Goal:** Build all auth pages with forms, validation, 2FA, and error handling.

### Step 4.1 — Sign In Page (`/auth/sign-in`)

**Components:**
- Email input with validation
- Password input with show/hide toggle
- "Remember me" checkbox
- Submit button with loading state
- Error handling: wrong credentials, rate limited, account locked
- Links: Forgot password, Sign up
- Social login buttons (Google, Apple) — styled as outlined

**Edge Cases:**
- 5 failed attempts → show lockout warning
- Account locked → show lock reason + support contact
- 2FA required → auto-redirect to `/auth/2fa` with temp token
- Network error → inline retry

### Step 4.2 — Sign Up Page (`/auth/sign-up`)

**Components:**
- Email, Password, Confirm Password inputs
- Password strength indicator (weak/medium/strong with color + text)
- Terms acceptance checkbox
- Submit → redirect to email verification

**Validation (Zod schema):**
- Email: valid format
- Password: min 12 chars, uppercase, lowercase, number, special char
- Confirm: matches password

### Step 4.3 — Email Verification (`/auth/verify-email`)

**Components:**
- 6-digit code input (4 individual masked inputs with auto-focus)
- Timer countdown (45s) for resend
- Loading state on submit
- Success → redirect to KYC or dashboard
- Error: "Invalid code" with retry
- Expired code: "Code expired" with resend

### Step 4.4 — Two-Factor Auth (`/auth/2fa`)

**Components:**
- 6-digit TOTP code input (same pattern as email verify)
- "Use recovery code" toggle
- Recovery code input (string)
- Trust this device checkbox
- QR code setup page (for initial 2FA enrollment)

### Step 4.5 — Auth Layout (`AuthLayout`)

- Centered card with logo
- Background: brand gradient (primary-900 → primary-600)
- Subtle grid pattern overlay (CSS background pattern)
- Footer with links (Terms, Privacy, Support)

---

## Phase 5: Portfolio Dashboard

**Goal:** Build the main landing page after auth — portfolio overview with charts, holdings, and quick actions.

### Step 5.1 — Data Fetching Strategy

```typescript
// All dashboard data fetched in parallel
export function useDashboardData() {
  const wallets = useQuery({ queryKey: ['wallets'], queryFn: walletApi.getWallets });
  const prices = useQuery({ queryKey: ['prices'], queryFn: marketApi.getPrices, refetchInterval: 10_000 });
  const transactions = useQuery({ queryKey: ['transactions', { limit: 5 }], queryFn: () => walletApi.getTransactions({ limit: 5 }) });
  const signals = useQuery({ queryKey: ['signals', { active: true }], queryFn: () => signalsApi.getSignals({ active: true, limit: 2 }) });
  const portfolioHistory = useQuery({ queryKey: ['portfolio-history'], queryFn: walletApi.getPortfolioHistory });

  return { wallets, prices, transactions, signals, portfolioHistory };
}
```

### Step 5.2 — Widget Build Order

| Widget | File | Data | States |
|--------|------|------|--------|
| `BalanceCard` | `src/widgets/portfolio/BalanceCard.tsx` | Total balance, 24h change | Loading (skeleton), error, empty (no balance) |
| `VisibilityToggle` | (inside BalanceCard) | Show/hide balance | Toggle animates number to "****" |
| `HoldingsGrid` | `src/widgets/portfolio/HoldingsGrid.tsx` | Per-asset balance, %, 24h change | Loading (4 skeleton cards), empty (CTA to buy) |
| `PortfolioChart` | `src/widgets/portfolio/PortfolioChart.tsx` | Recharts area chart | Loading (chart skeleton), error |
| `QuickActions` | `src/widgets/portfolio/QuickActions.tsx` | Static CTA buttons | Always visible |
| `RecentTransactions` | `src/widgets/portfolio/RecentTransactions.tsx` | Last 5 tx | Loading (3 skeleton rows), empty ("No transactions") |
| `ActiveSignals` | `src/widgets/portfolio/ActiveSignalsWidget.tsx` | Active signals (mini cards) | Loading, empty ("No active signals") |
| `PriceTicker` | `src/widgets/layout/PriceTicker.tsx` | WebSocket price feed | Streaming animation on update |
| `PortfolioAllocation` | `src/widgets/portfolio/PortfolioAllocation.tsx` | Donut/Recharts pie | Loading, empty |

### Step 5.3 — Real-time Price Updates

- WebSocket `price:{symbol}` → update TanStack cache every tick
- Price flash animation (brief green/red background) on change
- Throttle UI updates to 1s (batch rapid ticks)

### Step 5.4 — Dashboard Page Composition

```tsx
function DashboardPage() {
  const { wallets, prices, transactions, signals, portfolioHistory } = useDashboardData();

  return (
    <div className="space-y-6">
      <BalanceCard wallets={wallets} prices={prices} />
      <PortfolioChart data={portfolioHistory} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <HoldingsGrid wallets={wallets} />
        <QuickActions />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentTransactions transactions={transactions} />
        <ActiveSignals signals={signals} />
      </div>
    </div>
  );
}
```

---

## Phase 6: Wallet & Transactions

**Goal:** Build wallet list, asset detail, deposit/withdraw flows, and transaction history.

### Step 6.1 — Wallet Page (`/wallet`)

| Widget | File | Notes |
|--------|------|-------|
| `WalletSummary` | `src/widgets/wallet/WalletSummary.tsx` | Total + available balance |
| `AssetList` | `src/widgets/wallet/AssetList.tsx` | Table with sort/search |
| `AssetRow` | `src/widgets/wallet/AssetRow.tsx` | Icon, name, balance, USD, 24h, mini chart |
| `DepositButton` | Gold primary CTA |
| `WithdrawButton` | Gold secondary CTA |
| `SearchBar` | Filter assets by name/symbol |

**States:**
- Loading: 8 skeleton rows
- Empty: "No assets yet. [Buy Your First Crypto]"
- Error: retry + support
- Offline: cached balances with "Delayed" badge

### Step 6.2 — Asset Detail Page (`/wallet/:assetId`)

| Section | Widget | Notes |
|---------|--------|-------|
| Header | `AssetHeader` | Icon, name, market price, 24h change |
| Balance | `BalanceBreakdown` | Spot / In Orders / Pending breakdown |
| Chart | `MiniPriceChart` | Lightweight Charts (7D sparkline) |
| Actions | `ActionButtons` | [Deposit] [Withdraw] [Trade] gold buttons |
| History | `TransactionList` | Full paginated/filterable list |
| Detail | `TransactionDetailModal` | Opens on row click |

**Transaction list columns:** Date, Type (buy/sell/deposit/withdraw), Amount (+/-), USD Value, Status (completed/pending/failed), Fee

**Transaction detail:** Full info: txid (copyable), confirmations, from/to addresses, block explorer link, timestamp

### Step 6.3 — Deposit Flow

**`src/features/wallet/DepositFlow.tsx`** — Multi-step:
1. Select asset + network (auto-matched)
2. Generate/display deposit address (QR code + text + copy)
3. Show network confirmation requirements
4. Show minimum deposit warning
5. Address auto-expires (security timeout, new each session)
6. Recent deposits list below

### Step 6.4 — Withdraw Flow

**`src/features/wallet/WithdrawFlow.tsx`** — Multi-step with security:
1. Enter address (with paste + QR scan)
2. Enter amount with max shortcut
3. Show fee breakdown (network fee + platform fee)
4. ~~~ 2FA verification step ~~~
5. Email confirmation (if above threshold)
6. Success with tx status polling

---

## Phase 7: Trading View (Charts + Order Book)

**Goal:** Build the core trading experience — TradingView integration, order book, trade form.

### Step 7.1 — TradingView Charting Library Setup

**Files to create:**

| File | Purpose |
|------|---------|
| `public/charting_library/` | Copy TV library here (not in build) |
| `src/widgets/trading/TradingChart.tsx` | Widget wrapper component |
| `src/widgets/trading/datafeed.ts` | Custom datafeed adapter |
| `src/widgets/trading/tv-custom.css` | TV theme overrides (dark colors) |

**Implementation pattern:**
```typescript
// TradingChart.tsx — plan structure
export function TradingChart({ symbol, containerRef }: Props) {
  const chartRef = useRef<IChartingLibraryWidget | null>(null);

  useEffect(() => {
    if (!containerRef.current || !symbol) return;

    const widget = new widget({
      symbol,
      interval: '60',
      container: containerRef.current,
      library_path: '/charting_library/',
      locale: 'en',
      theme: 'Dark',
      // ... overrides from Design System doc (green/red candles, dark bg)
      datafeed: new CustomDatafeed(),
    });

    chartRef.current = widget;

    return () => widget.remove();
  }, [symbol]);

  // Expose setSymbol, setInterval via imperative handle or context
}
```

**Datafeed adapter (datafeed.ts) plan:**
- `resolveSymbol` — fetch from `/market/symbol/:name`
- `getBars` — fetch from `/market/candles/:symbol?interval=&from=&to=`
- `subscribeBars` — WebSocket candle stream
- `unsubscribeBars` — cleanup
- `getServerTime` — `/market/time`
- `searchSymbols` — `/market/search`

### Step 7.2 — Order Book Widget

**`src/widgets/trading/OrderBook.tsx`:**

- Split view: asks (red) on top, spread in middle, bids (green) below
- Real-time via WebSocket `orderbook:{symbol}`
- Depth bars as background gradients (width = depth %)
- Price + Amount columns
- Total column (cumulative)
- Visual flash on new entries

**States:**
- Loading: skeleton with 10 rows each side
- Empty: "No orders" (new/illiquid pair)
- Error: "Failed to load order book"

### Step 7.3 — Trade Form

**`src/features/trading/TradeForm.tsx`:**

Toggle: Buy (gold) / Sell (red) tabs
Order type: Market / Limit toggle

**Market Buy:**
- Total input (in quote currency, e.g., USDT)
- Estimated receive quantity
- Quick amount buttons (25%, 50%, 75%, 100%)
- Green [Buy BTC] button
- Slippage warning if > 2%

**Limit Buy:**
- Price input (with [Last Price] quick-fill)
- Amount input
- Total auto-calculated
- Time-in-force dropdown (GTC / IOC / FOK)
- Gold [Place Limit Order] button
- Optional: Stop-loss, Take-profit fields

### Step 7.4 — Market Pairs Sidebar

**`src/widgets/trading/MarketPairs.tsx`:**

- Scrollable list of trading pairs
- Each row: icon, symbol, last price, 24h change %, 24h volume
- Search + filter
- Favorite pinning (star icon, persisted to user preferences)
- Active pair highlighted with gold left border

### Step 7.5 — Trade Page Composition

```tsx
function TradePage() {
  const { pair } = useParams();
  const [activePair, setActivePair] = useState(pair || 'BTCUSDT');

  return (
    <div className="flex h-[calc(100vh-64px)] gap-0">
      <MarketPairs activePair={activePair} onSelect={setActivePair} />
      <div className="flex-1 flex flex-col">
        <TradingChart symbol={`BINANCE:${activePair}`} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
          <TradeForm pair={activePair} />
          <RecentTrades pair={activePair} />
        </div>
      </div>
      <OrderBook symbol={activePair} />
    </div>
  );
}
```

---

## Phase 8: Signals Feed & Detail

**Goal:** Build the signals browsing experience, signal details, and subscription flow.

### Step 8.1 — Signals List Page (`/signals`)

| Widget | File | Notes |
|--------|------|-------|
| `SignalFilters` | `src/features/signals/SignalFilters.tsx` | Direction (Buy/Sell/All), Timeframe, Asset filter |
| `SignalCard` | `src/widgets/signals/SignalCard.tsx` | Main signal card with accent bar |
| `SignalEmptyState` | `src/widgets/signals/SignalEmptyState.tsx` | "No signals matching filters" |
| `SignalCardSkeleton` | `src/widgets/signals/SignalCardSkeleton.tsx` | Loading shimmer |

**SignalCard composition:**
- Left accent bar (gold = STRONG BUY, green = BUY, red = SELL)
- Asset icon + symbol
- Direction badge (colored)
- Confidence bar (gold gradient fill)
- Price targets grid: Stop Loss → Entry → Target 1 → Target 2
- Strategy name + rationale (2-line clamp)
- Provider info: avatar, name, win rate badge
- Actions: [Trade Now], [Bookmark], [Share]
- Timestamp relative ("2h ago")

### Step 8.2 — Signal Detail Page (`/signals/:signalId`)

**Sections:**
1. Full signal info (all fields from card, expanded)
2. Provider profile card (stats: win rate, total P&L, followers, active signals)
3. Performance chart (Recharts area chart — cumulative P&L)
4. Related signals (same provider or same asset)
5. Comments/discussion (if implemented)

### Step 8.3 — "Trade Now" Flow

```
Click [Trade Now] on signal card
  → Navigate to /trade/:pair
  → Pre-fill order form:
    - Asset: from signal
    - Side: BUY/SELL from signal
    - Price: entry price (limit) or market
    - Amount: default = 1% of portfolio (user adjustible)
    - Stop-loss: pre-filled if signal has it
    - Take-profit: pre-filled with target 1
  → [Place Order] button highlighted with animation
```

---

## Phase 9: PWA & Offline Support

**Goal:** Make the app installable, functional offline, and notification-capable.

### Step 9.1 — vite-plugin-pwa Configuration

**`vite.config.ts`** — Full config from `08-PWA-Implementation-Guide.md`:

- `registerType: 'autoUpdate'`
- Include assets: icons, fonts, favicon
- Runtime caching rules:
  - TradingView lib → CacheFirst (30d)
  - Market data API → StaleWhileRevalidate (1h)
  - Wallet data → NetworkFirst (5min, with background sync)
  - User settings → NetworkFirst
  - CDN images → CacheFirst (30d)
  - Fonts → CacheFirst (1y)
- Navigation preload enabled
- Background sync for failed transactions

### Step 9.2 — Manifest Configuration

**`public/manifest.json`** — Full config from Design System:
- `name`: "CryptoWallet Pro"
- `short_name`: "CryptoWallet"
- `theme_color`: `#0A0E27`
- `background_color`: `#0A0E27`
- `display`: "standalone"
- `orientation`: "portrait"
- `scope`: "/"
- Icons: all sizes (72, 96, 128, 144, 152, 192, 384, 512) + maskable
- Shortcuts: Buy, Send, Trade, Signals
- Screenshots: dashboard, trading, mobile wallet
- iOS meta tags in `index.html`

### Step 9.3 — Service Worker Extensions

**`public/sw.js`** — Push event handler, notification click handler, background sync handler (see PWA guide for full code).

### Step 9.4 — Push Notifications

**`src/features/notifications/usePushNotifications.ts`**:
- Register push on auth
- Request permission (browser's native dialog)
- Subscribe with VAPID public key
- Save subscription to server
- Handle expired subscriptions (cleanup on 410)

### Step 9.5 — Install Prompt

**`src/app/providers/InstallPwaProvider.tsx`**:
- Capture `beforeinstallprompt` event
- Show install banner after 30s (or user action)
- Handle iOS (show instructions for Safari share → Add to Home Screen)
- Dismiss: hide for 30 days
- Track install analytics

### Step 9.6 — Offline Behavior Per Page

| Page | Offline UX |
|------|-----------|
| Dashboard | Show cached portfolio + "Updated X min ago" banner |
| Wallet | Show cached balances with "Delayed" badges |
| Trade | Disabled — "Connect to internet to trade" overlay |
| Signals | Show cached signals with timestamp |
| Settings | Read-only cached settings |
| Deposit | Show cached addresses only |

### Step 9.7 — Offline Detection Hook

**`src/shared/hooks/useOnlineStatus.ts`** — Used by all pages and the `OfflineBanner` widget.

---

## Phase 10: KYC & Settings Pages

### Step 10.1 — KYC Wizard (`/kyc`)

Multi-step form with progress indicator:

| Step | Widget | Notes |
|------|--------|-------|
| 1. Personal Info | `KYCStepPersonalInfo` | Name, DOB, nationality, address |
| 2. ID Upload | `KYCStepDocumentUpload` | Document type selector + drag-drop upload (front + back) |
| 3. Selfie | `KYCStepSelfie` | Camera capture or file upload |
| 4. Review | `KYCStepReview` | Summary of all info before submit |
| 5. Submitted | `KYCStepSubmitted` | "Under review" with estimated time |
| 6. Verified (success) | `KYCStepVerified` | Green check + new limits display |
| 7. Rejected (fail) | `KYCStepRejected` | Reason + retry button + support |

**States per step:**
- Loading: skeleton form
- Error: inline validation per field
- Submit loading: button spinner + "Submitting..."
- Upload progress: percentage bar
- Retry: on file upload failure

### Step 10.2 — Settings Page (`/settings`)

| Section | Widget | Notes |
|---------|--------|-------|
| Profile | `ProfileSection` | Avatar, name, email, phone |
| Security | `SecuritySection` | 2FA toggle, password change, sessions list, API keys |
| Notifications | `NotificationPreferences` | Push/email/SMS toggles per event type |
| Preferences | `PreferencesSection` | Currency, default trading view, language, slippage tolerance |
| About | `AboutSection` | Version, Terms, Privacy, Licenses, Logout |

---

## Phase 11: Testing Strategy

### Step 11.1 — Unit Tests (Vitest + Testing Library)

**Coverage targets:**
- Shared UI components: 100%
- Custom hooks: 100%
- Zustand stores: 100%
- Utility functions: 100%
- Feature logic: 90%+
- Pages: 80%+

| Test file | What it tests |
|-----------|--------------|
| `shared/ui/Button/Button.test.tsx` | All variants, loading, disabled, click handler |
| `shared/ui/Input/Input.test.tsx` | Label, error, value change, prefix/suffix rendering |
| `shared/hooks/useOnlineStatus.test.tsx` | Online/offline event simulation |
| `features/auth/login.test.ts` | Login flow, validation, error handling |
| `features/trading/TradeForm.test.tsx` | Price calculation, amount validation, slippage warning |
| `features/wallet/DepositFlow.test.tsx` | Address generation, copy, network selection |
| `zustand/useWebSocketStore.test.ts` | Connect, disconnect, subscribe, reconnect |

**Vitest config:**
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom",
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.*', 'src/vite-env.d.ts'],
    },
  },
});
```

### Step 11.2 — Integration Tests

- Auth flow: Register → Verify email → Login → Dashboard loads
- Trading flow: Place limit order → Order appears in open orders
- Wallet flow: Generate deposit address → Copy works
- Offline flow: Go offline → See cached data → Come online → Data refreshes

### Step 11.3 — E2E Tests (Playwright)

**`tests/e2e/`:**

| Test file | Scenarios |
|-----------|-----------|
| `auth.e2e.ts` | Full registration, login/logout, 2FA, password reset |
| `trading.e2e.ts` | Place market buy, place limit sell, cancel order |
| `wallet.e2e.ts` | View balances, generate deposit address, withdraw flow |
| `signals.e2e.ts` | Browse signals, filter, click "Trade Now" |
| `pwa.spec.ts` | SW registration, manifest, offline page, push permission |

**Playwright Config:**
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
});
```

### Step 11.4 — Test Commands (package.json)

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:run && npm run test:e2e"
  }
}
```

---

## Phase 12: Performance Optimization & Lighthouse

### Step 12.1 — Bundle Analysis

```bash
npm install -D rollup-plugin-visualizer
```

Add to `vite.config.ts` — run `npm run build -- --analyze` to visualize bundle composition.

### Step 12.2 — Code Splitting Strategy

| Split Point | Chunk | Notes |
|-------------|-------|-------|
| Auth pages | `auth.js` | ~50KB |
| Dashboard | `dashboard.js` | ~30KB |
| Wallet + Deposit/Withdraw | `wallet.js` | ~45KB |
| Trading (includes TradingView) | `trading.js` | ~500KB (TV lib loaded separately) |
| Signals | `signals.js` | ~40KB |
| KYC Wizard | `kyc.js` | ~35KB |
| Settings | `settings.js` | ~25KB |
| Admin | `admin.js` | ~40KB (lazy + protected) |
| **Shared vendor** | `vendor.js` | React, React Router, TanStack Query, Zustand, Socket.io |
| **Shared UI** | `ui.js` | All shared components (tree-shakeable) |

### Step 12.3 — Performance Checklist

- [ ] Code-split all route pages (React.lazy + Suspense)
- [ ] Preload critical routes (`<link rel="modulepreload">`)
- [ ] Preconnect to API + CDN (`<link rel="preconnect">`)
- [ ] Prefetch route data on hover (link prefetch + query prefetch)
- [ ] Tree-shake unused CSS (Tailwind purge: enabled in production)
- [ ] Font-display: swap for Inter + JetBrains Mono
- [ ] Compress images to WebP/AVIF
- [ ] Lazy-load below-fold content (IntersectionObserver)
- [ ] Virtual scroll for long lists (react-virtual or @tanstack/react-virtual)
- [ ] Offscreen canvas for chart rendering
- [ ] Throttle WebSocket updates to 1s per component
- [ ] Debounce search inputs (300ms)
- [ ] Optimize rerenders: React.memo on heavy widgets, useMemo/useCallback on expensive computations
- [ ] Proper dependency arrays on useEffect/useMemo to avoid infinite loops
- [ ] Use `React.Profiler` in dev to detect slow renders

### Step 12.4 — Lighthouse CI Integration

```yaml
# .github/workflows/lighthouse.yml
- name: Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --upload.target=temporary-public-storage
```

Configure thresholds in `lighthouserc.json`:
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:pwa": ["error", { "minScore": 1 }]
      }
    }
  }
}
```

---

## Phase 13: CI/CD & Deployment

### Step 13.1 — GitHub Actions Workflow

**`.github/workflows/frontend.yml`**:

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['frontend/**']
  pull_request:
    paths: ['frontend/**']

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: coverage, path: coverage/ }

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: playwright-report, path: playwright-report/ }

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm install -g @lhci/cli
      - run: lhci autorun

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: 'dist/' }

  deploy:
    needs: [lint, test, e2e, build]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: github-pages }
      # Deploy to Vercel/Netlify/Cloudflare Pages
```

### Step 13.2 — Deployment Build

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "type-check": "tsc --noEmit"
  }
}
```

**`vite.config.ts` — production build optimization:**
- `rollupOptions.output.manualChunks` for code splitting (vendor, ui, pages)
- `build.sourcemap: 'hidden'` (for Sentry, not public)
- `build.chunkSizeWarningLimit: 100` (KB)
- `build.cssMinify: 'lightningcss'`

---

## Phase 14: i18n & Accessibility

### Step 14.1 — i18n Setup

**`src/app/providers/I18nProvider.tsx`**:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n.use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: 'en',
  debug: import.meta.env.DEV,
  interpolation: { escapeValue: false }, // React already escapes
  resources: {
    en: { translation: {} }, // Start with empty, add as you build
  },
});
```

**Translation file structure:**
```
src/shared/lib/i18n/
├── locales/
│   ├── en/
│   │   ├── common.json      # Shared UI labels
│   │   ├── auth.json        # Auth page translations
│   │   ├── trading.json     # Trading labels
│   │   ├── wallet.json      # Wallet labels
│   │   ├── signals.json     # Signals labels
│   │   ├── settings.json    # Settings labels
│   │   └── kyc.json         # KYC labels
│   ├── es/
│   ├── zh/
│   ├── ja/
│   └── ... (initial: en only, add others via i18n platform)
```

**Usage in code:**
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation('trading');
// <h1>{t('placeOrder')}</h1>
```

### Step 14.2 — Accessibility Checklist

- [ ] Semantic HTML: `<nav>`, `<main>`, `<section>`, `<button>` not `<div>` for clickables
- [ ] ARIA labels on all icon-only buttons: `aria-label="Toggle sidebar"`
- [ ] Focus management: tab order matches visual order
- [ ] Keyboard navigation: Tab, Enter, Escape, Arrow keys on dropdowns/tabs/modals
- [ ] Focus trap in modals and dialogs
- [ ] Skip to content link (hidden until Tab)
- [ ] Color contrast: All text passes WCAG AA (gold on dark blue = 5.2:1)
- [ ] Price movement indicators: not just green/red, add ▲/▼ symbols
- [ ] Form error announcements: `aria-invalid`, `aria-describedby`, `role="alert"`
- [ ] Loading states announced: `aria-busy="true"` on loading regions
- [ ] Screen reader-friendly price announcements (crypto amounts spoken with full precision)
- [ ] Touch targets: minimum 44×44px on mobile interactive elements
- [ ] Focus visible: never `outline: none` without replacement
- [ ] Reduced motion: respect `prefers-reduced-motion`, disable animations

---

## Production Checklist (Final Sign-off)

### Code Quality
- [ ] TypeScript strict mode: no `any` without explicit justification
- [ ] ESLint passing with no warnings
- [ ] Prettier consistent formatting
- [ ] No console.log in production (lint rule)
- [ ] All env vars documented in `.env.example`

### Testing
- [ ] Unit tests passing (≥80% coverage)
- [ ] Integration tests for all critical paths
- [ ] E2E tests for all P0 flows
- [ ] PWA tests: SW activation, manifest, offline page
- [ ] Lighthouse: 4/4 categories ≥90

### Performance
- [ ] First Contentful Paint < 1.5s (3G simulation)
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Performance ≥ 95
- [ ] Bundle: vendor < 200KB gzip, total < 600KB gzip
- [ ] No render-blocking resources above the fold
- [ ] Proper cache headers set on CDN

### PWA
- [ ] Manifest valid and complete
- [ ] Service worker registered and activated
- [ ] Offline page renders on no connection
- [ ] Push notifications functional (VAPID keys configured)
- [ ] iOS: `apple-mobile-web-app-capable` meta tags correct
- [ ] Install prompt triggers at appropriate time
- [ ] Background sync queues failed transactions

### Security
- [ ] No sensitive data in client bundles (API keys, secrets)
- [ ] CSP headers configured on the server
- [ ] JWT stored in memory, not localStorage
- [ ] All API calls go through the axios instance (interceptors for auth)
- [ ] Input sanitization on all user-facing forms
- [ ] Sentry error tracking configured (not logging sensitive data)

### Accessibility
- [ ] WCAG 2.1 AA compliance scan passes
- [ ] Keyboard navigation verified on all pages
- [ ] Screen reader (VoiceOver/NVDA) tested on critical flows
- [ ] Color contrast verified for all text

### Build
- [ ] Production build succeeds with no warnings
- [ ] Sourcemaps (hidden) generated for Sentry
- [ ] Code splitting effective (verify with analyzer)
- [ ] CDN/assets purge configured in deploy pipeline
- [ ] `npm audit` passes (no critical vulnerabilities)

---

## Timeline Summary

| Phase | Scope | Est. Days | Dependencies |
|-------|-------|-----------|-------------|
| **0** | Scaffold & tooling | 1 | — |
| **1** | Design system & UI components | 5 | Phase 0 |
| **2** | App shell, routing, providers | 3 | Phase 1 |
| **3** | API layer & WebSocket | 3 | Phase 2 |
| **4** | Auth pages | 4 | Phase 3 |
| **5** | Portfolio dashboard | 5 | Phase 4 |
| **6** | Wallet & transactions | 5 | Phase 4 |
| **7** | Trading view (charts + order book) | 8 | Phase 4, 3 |
| **8** | Signals feed | 4 | Phase 4 |
| **9** | PWA & offline | 3 | Phase 2 (routing) |
| **10** | KYC & settings | 4 | Phase 4 |
| **11** | Testing (parallel to 4-10) | 5 | — |
| **12** | Performance optimization | 3 | Phase 1-10 |
| **13** | CI/CD & deployment | 2 | Phase 12 |
| **14** | i18n & a11y | 3 | Phase 4+ |

**Total: ~53 days (10-11 weeks)**

---

## References & Resources

- React project structure best practices — [ReactBlueprint](https://react-blueprint.dev/) · [Robin Wieruch](https://www.robinwieruch.de/react-folder-structure/)
- TradingView Charting Library React integration — [Official Examples](https://github.com/tradingview/charting-library-examples/tree/master/react-typescript) · [Framework Docs](https://www.tradingview.com/charting-library-docs/latest/tutorials/framework-integrations/)
- Vite PWA plugin — [Official Docs](https://vite-pwa-org.netlify.app/) · [Workbox Options](https://deepwiki.com/vite-pwa/vite-plugin-pwa/4.3-workbox-options)
- Zustand + TanStack Query pattern — [Medium Guide](https://medium.com/@contato.blense/zustand-and-tanstack-query-the-dynamic-duo-that-simplified-my-react-state-management-486c3073f81c)
- Tailwind CSS crypto dark mode — [Designing Dark-Mode Crypto UIs with Tailwind](https://www.soosho.dev/blog/tailwind-4-crypto-ui-design)
- Testing strategy — [Vitest + Playwright Guide](https://softaims.com/blog/react-testing-strategy-vitest-playwright-2026)
- Real-time Socket.io patterns — [Socket.io React Guide 2026](https://moldstud.com/articles/p-building-real-time-applications-with-react-and-socketio-a-comprehensive-guide)
- i18next React — [Official Docs](https://react.i18next.com/)
- Lightweight Charts React — [Official React Examples](https://tradingview.github.io/lightweight-charts/tutorials/react/advanced)
- Crypto dashboard templates (reference only) — [FinLab](https://themeforest.net/item/finlab-react-vite-crypto-trading-ui-admin-dashboard-template/56122497) · [Cryptoon](https://themeforest.net/item/cryptoon-tailwind-crypto-admin-dashboard-template/57142255)

---

**Document prepared by:** Claude Code
**Source research:** Web search + all project docs (01-PRD through 11-User-Flows)
**Related docs:** [05-Frontend-Architecture.md](./05-Frontend-Architecture.md) · [10-Design-System.md](./10-Design-System.md) · [11-User-Flows.md](./11-User-Flows.md)
