# Frontend Architecture
## Crypto Wallet Webapp / PWA

**Version:** 1.0
**Date:** 2026-07-06

---

## 1. Technology Stack (Repeated from TAD with Frontend Focus)

| Category | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | React 18 + TypeScript 5 | Ecosystem, type safety, developer velocity |
| **Build Tool** | Vite 5 | Fast HMR, optimized builds, PWA plugin support |
| **Styling** | Tailwind CSS 3 | Utility-first, fast iteration, consistent design |
| **Routing** | React Router 6 (data loaders) | Nested routes, lazy loading, loader-based data fetching |
| **Server State** | TanStack Query (React Query) v5 | Caching, refetching, optimistic updates, WebSocket integration |
| **Client State** | Zustand 4 | Lightweight, TypeScript-native, no boilerplate |
| **Forms** | React Hook Form + Zod | Performant, validation shared with backend |
| **Charts** | TradingView Charting Library + Lightweight Charts | Professional-grade candlestick charts + mini sparklines |
| **Real-time** | Socket.io Client 4 | WebSocket with auto-reconnect, fallback to polling |
| **PWA** | vite-plugin-pwa (Workbox) | Service worker generation, precaching, runtime caching |
| **Animations** | Framer Motion 11 | Declarative animations, layout animations |
| **i18n** | i18next 23 | Multi-language support from day one |
| **Testing** | Vitest + React Testing Library + Playwright | Unit, integration, E2E |
| **Monitoring** | Sentry | Error tracking, performance monitoring |

---

## 2. Complete Project Structure

```
src/
│
├── app/                              # App shell
│   ├── providers/
│   │   ├── AuthProvider.tsx           # Auth context + session management
│   │   ├── ThemeProvider.tsx          # Dark/light/system theme
│   │   ├── WebSocketProvider.tsx      # Socket.io connection lifecycle
│   │   └── I18nProvider.tsx           # Internationalization
│   ├── router/
│   │   ├── index.tsx                  # Route definitions
│   │   ├── ProtectedRoute.tsx         # Auth guard
│   │   ├── KycRoute.tsx               # KYC level guard
│   │   └── AdminRoute.tsx             # Admin role guard
│   ├── layouts/
│   │   ├── AuthLayout.tsx             # Login/register layout
│   │   ├── DashboardLayout.tsx        # Main app layout (sidebar + header)
│   │   └── AdminLayout.tsx            # Admin panel layout
│   └── App.tsx                        # Root component
│
├── pages/                             # Route-level pages
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── TwoFactorPage.tsx
│   │   └── TwoFactorSetupPage.tsx
│   ├── kyc/
│   │   ├── KycStartPage.tsx
│   │   ├── KycUploadPage.tsx
│   │   └── KycStatusPage.tsx
│   ├── dashboard/
│   │   ├── DashboardPage.tsx          # Main portfolio overview
│   │   └── PortfolioPage.tsx          # Detailed portfolio view
│   ├── wallet/
│   │   ├── WalletsPage.tsx            # All wallets overview
│   │   ├── WalletDetailPage.tsx       # Single wallet (transactions)
│   │   ├── SendPage.tsx               # Send crypto form
│   │   ├── ReceivePage.tsx            # Receive crypto (address + QR)
│   │   └── InternalTransferPage.tsx   # Send to platform user
│   ├── trade/
│   │   ├── TradePage.tsx              # Full trading view (chart + order form + orderbook)
│   │   ├── OrdersPage.tsx             # Open orders
│   │   ├── OrderHistoryPage.tsx       # Order history
│   │   └── TradeHistoryPage.tsx       # Trade execution history
│   ├── market/
│   │   ├── MarketPage.tsx             # Market overview (all pairs)
│   │   └── CoinDetailPage.tsx         # Single coin deep dive
│   ├── signals/
│   │   ├── SignalsFeedPage.tsx        # All signals
│   │   ├── SignalDetailPage.tsx       # Single signal detail
│   │   ├── CreateSignalPage.tsx       # Create community signal (premium)
│   │   └── CopyTradingPage.tsx        # Copy trading dashboard
│   ├── alerts/
│   │   └── AlertsPage.tsx             # Price alerts management
│   ├── payment/
│   │   ├── BuyPage.tsx                # Fiat on-ramp
│   │   ├── SellPage.tsx               # Crypto off-ramp
│   │   └── PaymentMethodsPage.tsx     # Saved payment methods
│   ├── settings/
│   │   ├── ProfilePage.tsx            # Profile settings
│   │   ├── SecurityPage.tsx           # 2FA, sessions, API keys
│   │   ├── PreferencesPage.tsx        # Theme, language, currency
│   │   ├── NotificationsPage.tsx      # Notification preferences
│   │   └── AddressWhitelistPage.tsx   # Whitelisted withdrawal addresses
│   └── admin/
│       ├── AdminDashboardPage.tsx     # Stats overview
│       ├── AdminUsersPage.tsx         # User management
│       ├── AdminTransactionsPage.tsx  # Transaction monitoring
│       ├── AdminSignalsPage.tsx       # Signal moderation
│       ├── AdminFeesPage.tsx          # Fee configuration
│       └── AdminSettingsPage.tsx      # System configuration
│
├── widgets/                           # Composable UI sections
│   ├── portfolio/
│   │   ├── PortfolioSummary.tsx       # Total value, 24h change
│   │   ├── PortfolioAllocation.tsx    # Pie/donut chart of holdings
│   │   └── PortfolioHistory.tsx       # Performance over time (Recharts)
│   ├── trading/
│   │   ├── OrderForm.tsx              # Buy/sell order form
│   │   ├── OrderBook.tsx              # Depth chart + order list
│   │   ├── RecentTrades.tsx           # Recent trade list
│   │   └── TradingChart.tsx           # Main chart (TradingView)
│   ├── wallet/
│   │   ├── WalletCard.tsx             # Single wallet display
│   │   ├── TransactionList.tsx        # Paginated transaction list
│   │   └── AddressQR.tsx              # QR code for receive address
│   ├── signals/
│   │   ├── SignalCard.tsx             # Signal summary card
│   │   ├── SignalPerformance.tsx      # Win rate + P&L metrics
│   │   └── SignalFilters.tsx          # Filter bar for signal feed
│   ├── market/
│   │   ├── PriceTicker.tsx            # Scrolling price ticker
│   │   ├── MarketGrid.tsx             # Grid of crypto pairs
│   │   └── MiniChart.tsx              # Sparkline mini chart (Lightweight Charts)
│   ├── alert/
│   │   └── AlertForm.tsx              # Create/edit alert form
│   └── common/
│       ├── SearchBar.tsx              # Global search (coins, users)
│       ├── NotificationBell.tsx       # Notification dropdown
│       └── QuickActions.tsx           # Quick send/receive buttons
│
├── features/                          # Business logic feature slices
│   ├── auth/
│   │   ├── useAuth.ts                 # Auth hook (login, logout, register)
│   │   ├── useSession.ts              # Session management
│   │   ├── use2FA.ts                  # 2FA enable/disable hooks
│   │   └── authApi.ts                 # Auth API calls
│   ├── wallet/
│   │   ├── useWallet.ts               # Wallet data hook
│   │   ├── useTransaction.ts          # Transaction hooks
│   │   ├── useSend.ts                 # Send crypto hooks
│   │   └── walletApi.ts               # Wallet API calls
│   ├── trading/
│   │   ├── useOrder.ts                # Order placement hooks
│   │   ├── useOrderBook.ts            # Order book subscription
│   │   ├── useTradingChart.ts         # Chart setup hooks
│   │   └── tradingApi.ts              # Trading API calls
│   ├── signals/
│   │   ├── useSignals.ts              # Signal feed hooks
│   │   ├── useSignalSubscription.ts   # Subscribe/unsubscribe
│   │   └── signalsApi.ts              # Signal API calls
│   ├── market/
│   │   ├── useMarketData.ts           # Price + candle hooks
│   │   ├── usePriceTicker.ts          # Real-time price updates
│   │   └── marketApi.ts               # Market data API calls
│   ├── payment/
│   │   ├── usePayment.ts              # Buy/sell hooks
│   │   └── paymentApi.ts              # Payment API calls
│   ├── alerts/
│   │   ├── useAlerts.ts               # Alert CRUD hooks
│   │   └── alertsApi.ts               # Alert API calls
│   ├── kyc/
│   │   ├── useKYC.ts                  # KYC flow hooks
│   │   └── kycApi.ts                  # KYC API calls
│   └── notifications/
│       ├── useNotifications.ts        # Notification hooks
│       └── notificationsApi.ts        # Notification API calls
│
├── entities/                          # Domain models / types
│   ├── user/
│   │   ├── user.types.ts
│   │   └── user.validation.ts         # Shared Zod schemas
│   ├── wallet/
│   │   ├── wallet.types.ts
│   │   └── transaction.types.ts
│   ├── trading/
│   │   ├── order.types.ts
│   │   └── trade.types.ts
│   ├── market/
│   │   ├── asset.types.ts
│   │   └── candle.types.ts
│   ├── signal/
│   │   └── signal.types.ts
│   └── common/
│       ├── api.types.ts               # API response types
│       └── pagination.types.ts
│
├── shared/                            # Shared infrastructure
│   ├── api/
│   │   ├── apiClient.ts               # Axios instance with interceptors
│   │   ├── websocketClient.ts         # Socket.io wrapper
│   │   └── queryClient.ts             # TanStack Query config
│   ├── hooks/
│   │   ├── usePagination.ts           # Pagination logic
│   │   ├── useDebounce.ts             # Debounce values
│   │   ├── useMediaQuery.ts           # Responsive breakpoints
│   │   ├── useLocalStorage.ts         # Typed localStorage
│   │   ├── useOnlineStatus.ts         # Online/offline detection
│   │   └── useCountdown.ts            # Timer/countdown
│   ├── ui/                            # Design system components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Table.tsx
│   │   ├── Tabs.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Spinner.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Toast.tsx
│   │   ├── Toggle.tsx
│   │   ├── Select.tsx
│   │   ├── Pagination.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── PinInput.tsx               # Spending PIN entry
│   ├── lib/
│   │   ├── formatCurrency.ts          # Number formatting
│   │   ├── formatDate.ts              # Date formatting (dayjs)
│   │   ├── formatCrypto.ts            # Crypto amount formatting
│   │   ├── validators.ts              # Shared validation
│   │   ├── cn.ts                      # clsx + tailwind-merge helper
│   │   └── nprogress.ts              # Page transition loading bar
│   ├── types/
│   │   └── index.ts
│   └── constants/
│       ├── routes.ts                  # Route path constants
│       ├── assets.ts                  # Supported assets list
│       └── config.ts                  # App-wide config
│
└── styles/
    ├── globals.css                    # Tailwind directives, CSS variables
    ├── tailwind.config.ts             # Extended Tailwind config
    └── animations.css                 # Custom keyframe animations
```

## 3. Routing Architecture

### 3.1 Route Tree

```tsx
// app/router/index.tsx
const routes = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: lazy(() => import('@/pages/auth/LoginPage')) },
      { path: 'register', element: lazy(() => import('@/pages/auth/RegisterPage')) },
      { path: 'forgot-password', element: lazy(() => import('@/pages/auth/ForgotPasswordPage')) },
      { path: 'reset-password', element: lazy(() => import('@/pages/auth/ResetPasswordPage')) },
      { path: '2fa', element: lazy(() => import('@/pages/auth/TwoFactorPage')) },
      { path: '2fa/setup', element: lazy(() => import('@/pages/auth/TwoFactorSetupPage')) },
    ],
  },
  {
    path: '/kyc',
    element: <ProtectedRoute />,
    children: [
      { path: 'start', element: lazy(() => import('@/pages/kyc/KycStartPage')) },
      { path: 'upload', element: lazy(() => import('@/pages/kyc/KycUploadPage')) },
      { path: 'status', element: lazy(() => import('@/pages/kyc/KycStatusPage')) },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: lazy(() => import('@/pages/dashboard/DashboardPage')) },
      { path: 'portfolio', element: lazy(() => import('@/pages/dashboard/PortfolioPage')) },
      { path: 'wallets', element: lazy(() => import('@/pages/wallet/WalletsPage')) },
      { path: 'wallets/:id', element: lazy(() => import('@/pages/wallet/WalletDetailPage')) },
      { path: 'send', element: lazy(() => import('@/pages/wallet/SendPage')) },
      { path: 'receive', element: lazy(() => import('@/pages/wallet/ReceivePage')) },
      { path: 'transfer', element: lazy(() => import('@/pages/wallet/InternalTransferPage')) },
      { path: 'trade', element: lazy(() => import('@/pages/trade/TradePage')) },
      { path: 'trade/:pair', element: lazy(() => import('@/pages/trade/TradePage')) },
      { path: 'orders', element: lazy(() => import('@/pages/trade/OrdersPage')) },
      { path: 'orders/history', element: lazy(() => import('@/pages/trade/OrderHistoryPage')) },
      { path: 'trades', element: lazy(() => import('@/pages/trade/TradeHistoryPage')) },
      { path: 'market', element: lazy(() => import('@/pages/market/MarketPage')) },
      { path: 'market/:symbol', element: lazy(() => import('@/pages/market/CoinDetailPage')) },
      { path: 'signals', element: lazy(() => import('@/pages/signals/SignalsFeedPage')) },
      { path: 'signals/:id', element: lazy(() => import('@/pages/signals/SignalDetailPage')) },
      { path: 'signals/create', element: lazy(() => import('@/pages/signals/CreateSignalPage')) },
      { path: 'copy-trading', element: lazy(() => import('@/pages/signals/CopyTradingPage')) },
      { path: 'alerts', element: lazy(() => import('@/pages/alerts/AlertsPage')) },
      { path: 'buy', element: lazy(() => import('@/pages/payment/BuyPage')) },
      { path: 'sell', element: lazy(() => import('@/pages/payment/SellPage')) },
      { path: 'payment-methods', element: lazy(() => import('@/pages/payment/PaymentMethodsPage')) },
      { path: 'settings/profile', element: lazy(() => import('@/pages/settings/ProfilePage')) },
      { path: 'settings/security', element: lazy(() => import('@/pages/settings/SecurityPage')) },
      { path: 'settings/preferences', element: lazy(() => import('@/pages/settings/PreferencesPage')) },
      { path: 'settings/notifications', element: lazy(() => import('@/pages/settings/NotificationsPage')) },
      { path: 'settings/addresses', element: lazy(() => import('@/pages/settings/AddressWhitelistPage')) },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true, element: lazy(() => import('@/pages/admin/AdminDashboardPage')) },
      { path: 'users', element: lazy(() => import('@/pages/admin/AdminUsersPage')) },
      { path: 'transactions', element: lazy(() => import('@/pages/admin/AdminTransactionsPage')) },
      { path: 'signals', element: lazy(() => import('@/pages/admin/AdminSignalsPage')) },
      { path: 'fees', element: lazy(() => import('@/pages/admin/AdminFeesPage')) },
      { path: 'settings', element: lazy(() => import('@/pages/admin/AdminSettingsPage')) },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
```

### 3.2 State Management Strategy

```
┌───────────────────────────────────────────────────────────┐
│                   STATE ARCHITECTURE                       │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  SERVER STATE (TanStack Query)                            │
│  ─────────────────────────────                             │
│  • Wallets / Balances          →  cache, refetch, WS push │
│  • Transactions                →  cache, pagination       │
│  • Orders / Trades             →  cache, optimistic update│
│  • Market Prices               →  cache, WS push          │
│  • User Profile / Settings     →  cache, mutation         │
│  • Signals                     →  cache, pagination       │
│  • KYC Status                  →  cache, mutation         │
│                                                           │
│  CLIENT STATE (Zustand)                                   │
│  ─────────────────────                                     │
│  • Auth Tokens                 →  persisted (encrypted)   │
│  • UI State (sidebar, modals)  →  session only            │
│  • Selected Trading Pair       →  session only            │
│  • Chart Preferences           →  persisted               │
│  • WebSocket Connection Status →  session only            │
│  • Theme Preference            →  persisted               │
│                                                           │
│  FORM STATE (React Hook Form)                             │
│  ────────────────────────────                             │
│  • Auth forms (login, register)                           │
│  • Trade forms (buy/sell, limit)                          │
│  • Send/Receive forms                                    │
│  • KYC upload forms                                       │
│  • Settings forms                                         │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 3.3 Data Fetching Strategy

```typescript
// Example: Wallet hooks with TanStack Query

// --- features/wallet/walletApi.ts ---
const BASE = '/wallets';

export const walletApi = {
  list: (): Promise<WalletsResponse> => apiClient.get(BASE),
  get: (id: string): Promise<WalletResponse> => apiClient.get(`${BASE}/${id}`),
  getTransactions: (id: string, params: PaginationParams): Promise<TransactionsResponse> =>
    apiClient.get(`${BASE}/${id}/transactions`, { params }),
  createAddress: (id: string, label: string): Promise<AddressResponse> =>
    apiClient.post(`${BASE}/${id}/addresses`, { label }),
};

// --- features/wallet/useWallet.ts ---
export const useWallets = () => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: walletApi.list,
    staleTime: 30_000,        // 30s until considered stale
    refetchInterval: 60_000,   // poll every 60s as fallback
    select: (data) => data.wallets,
  });
};

export const useWalletBalance = (assetId: string) => {
  return useQuery({
    queryKey: ['wallet', assetId],
    queryFn: () => walletApi.get(assetId),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
};

// Optimistic mutation for sending crypto
export const useSendCrypto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SendParams) => walletApi.send(params),
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wallets'] });
      // Snapshot previous value
      const previous = queryClient.getQueryData(['wallets']);
      // Optimistically update balance
      queryClient.setQueryData(['wallets'], (old: any) => ({
        ...old,
        // deduct amount being sent
      }));
      return { previous };
    },
    onError: (err, vars, context) => {
      // Rollback on error
      queryClient.setQueryData(['wallets'], context?.previous);
      toast.error('Send failed. Please try again.');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};
```

## 4. Design System & UI Components

### 4.1 Theme Configuration

```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',   // Main brand color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Market colors
        'market-green': '#22c55e',   // #16c784
        'market-red': '#ef4444',     // #ea3943
        // Crypto-specific
        bitcoin: '#f7931a',
        ethereum: '#627eea',
        solana: '#9945ff',
        // Dark theme surfaces
        surface: {
          DEFAULT: '#ffffff',
          dark: '#1a1a2e',
          card: {
            DEFAULT: '#ffffff',
            dark: '#16213e',
          },
          border: {
            DEFAULT: '#e2e8f0',
            dark: '#2d3748',
          },
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],  // For crypto amounts
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'pulse-red': 'pulse-red 2s ease-in-out infinite',
      },
    },
  },
};
```

### 4.2 Core UI Component Pattern

```tsx
// shared/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

// Always handle: loading, disabled, error, empty, success states
// Every interactive component must show loading spinner when `loading` is true
// Every form button must accept `disabled` when form is invalid
```

### 4.3 Page State Pattern

Every page component must handle these states:

```tsx
function WalletsPage() {
  const { data: wallets, isLoading, isError, error } = useWallets();

  if (isLoading) return <WalletsSkeleton />;
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!wallets?.length) return <EmptyState
    icon={<WalletIcon />}
    title="No wallets yet"
    description="Deposit crypto to get started"
    action={<Button onClick={() => navigate('/buy')}>Buy Crypto</Button>}
  />;

  return (
    <div>
      <PortfolioSummary wallets={wallets} />
      <div className="grid gap-4">
        {wallets.map(wallet => <WalletCard key={wallet.id} wallet={wallet} />)}
      </div>
    </div>
  );
}
```

## 5. Trading Chart Integration

```tsx
// widgets/trading/TradingChart.tsx

// Uses TradingView Charting Library for the main trading view
// Embedded via iframe-free widget for performance

interface TradingChartProps {
  symbol: string;        // "BINANCE:BTCUSD"
  interval: ChartInterval;
  theme: 'dark' | 'light';
  onCrosshairMove?: (price: number) => void;
}

// Key chart features:
// 1. Multi-timeframe (1m → 1W)
// 2. All TV indicators (RSI, MACD, Bollinger, etc.)
// 3. Drawing tools (trendline, fib, etc.)
// 4. Custom overlay signals (signal entry/exit markers)
// 5. Order line visualization (pending, filled orders on chart)
// 6. Layout persistence per user

// Alternative for non-trading views: Lightweight Charts
// Used in: MiniChart, PortfolioHistory sparklines
// Pros: 45KB gzipped, no API key required
```

## 6. Real-Time Price Updates

```typescript
// features/market/usePriceTicker.ts
export function usePriceTicker(symbols: string[]) {
  const queryClient = useQueryClient();
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    // Subscribe to price feeds
    socket.emit('subscribe:prices', symbols);

    // Handle real-time updates
    const handler = (data: PriceUpdate) => {
      // Optimistically update TanStack Query cache
      queryClient.setQueryData(['price', data.symbol], data);
      // Also update the market prices list
      queryClient.setQueriesData({ queryKey: ['market-prices'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          prices: old.prices.map(p =>
            p.symbol === data.symbol ? { ...p, ...data } : p
          ),
        };
      });
    };

    socket.on('price:update', handler);
    return () => {
      socket.emit('unsubscribe:prices', symbols);
      socket.off('price:update', handler);
    };
  }, [socket, symbols]);
}
```

## 7. PWA Implementation (vite-plugin-pwa)

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'CryptoWallet Pro',
        short_name: 'CryptoWallet',
        description: 'Buy, sell, and trade cryptocurrency with real-time charts and signals',
        theme_color: '#1a1a2e',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Buy Crypto', url: '/buy', icons: [{ src: '/icons/buy.png', sizes: '96x96' }] },
          { name: 'Send', url: '/send', icons: [{ src: '/icons/send.png', sizes: '96x96' }] },
          { name: 'Trade', url: '/trade', icons: [{ src: '/icons/trade.png', sizes: '96x96' }] },
        ],
        categories: ['finance', 'cryptocurrency'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.cryptowallet\.app\/api\/v1\/(wallets|prices|market)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              backgroundSync: { name: 'pending-transactions' },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.cryptowallet\.app\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
});
```

### 7.1 Service Worker Registration & Update Handling

```typescript
// app/providers/PwaProvider.tsx
export function PwaProvider({ children }: PropsWithChildren) {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  // Show "Update available" toast when new SW is ready
  // Show "App ready for offline use" toast when SW activates

  return (
    <PwaContext.Provider value={{ needRefresh, setNeedRefresh, offlineReady }}>
      {children}
      {needRefresh && (
        <UpdateBanner
          message="A new version is available"
          onUpdate={() => registerSW?.updateServiceWorker()}
          onDismiss={() => setNeedRefresh(false)}
        />
      )}
    </PwaContext.Provider>
  );
}
```

## 8. Key Performance Targets

| Metric | Target | Implementation |
|--------|--------|----------------|
| Lighthouse Performance | ≥ 95 | Code splitting, lazy loading, optimized images, preconnect |
| Lighthouse PWA | ≥ 95 | Manifest, SW, offline page, HTTPS |
| Lighthouse Accessibility | ≥ 90 | ARIA labels, keyboard nav, color contrast |
| First Contentful Paint | < 1.2s | Inline critical CSS, preload fonts, CDN |
| Time to Interactive | < 2.5s | Route-level code splitting, deferred JS |
| Bundle Size (initial) | < 150KB gzip | Tree-shaking, dynamic imports, size limits |
| Bundle Size (trading page) | < 500KB gzip | Lazy load TV library on demand |
| API cache hit rate | > 80% | TanStack Query stale/revalidate strategy |

---

**Next Document:** [06-Security-Compliance.md](06-Security-Compliance.md)
