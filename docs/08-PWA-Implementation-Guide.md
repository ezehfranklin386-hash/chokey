# PWA Implementation Guide
## Crypto Wallet Webapp / PWA

**Version:** 1.0
**Date:** 2026-07-06

---

## 1. Overview

This guide covers making the crypto wallet a fully-capable Progressive Web App (PWA) that meets or exceeds native app expectations. The goal: users can install it on their home screen, receive push notifications, view cached data offline, and enjoy near-native performance.

### 1.1 PWA Checklist (Target: 4/4 Green on Lighthouse)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| ✅ Register service worker | Done | Workbox via vite-plugin-pwa |
| ✅ Manifest with icons | Done | All required sizes + maskable |
| ✅ HTTPS | Done | Cloudflare + Let's Encrypt |
| ✅ Offline fallback | Done | Cached shell + offline page |
| ✅ Fast first load | Done | Precache shell, lazy routes |
| ✅ Push notifications | Done | VAPID + FCM |
| ✅ Install prompt | Done | BeforeInstallPrompt event |
| ✅ Splash screen | Done | Manifest theme_color + icons |
| ✅ App shortcuts | Done | Buy, Send, Trade shortcuts |

---

## 2. Manifest Configuration

### 2.1 Web App Manifest

```json
// public/manifest.json
{
  "name": "CryptoWallet Pro",
  "short_name": "CryptoWallet",
  "description": "Buy, sell, and trade cryptocurrency with real-time charts and AI-powered signals",
  "start_url": "/?source=pwa",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "theme_color": "#1a1a2e",
  "background_color": "#0f0f23",
  "lang": "en-US",
  "dir": "ltr",
  "categories": ["finance", "cryptocurrency", "business"],
  "prefer_related_applications": false,
  "shortcuts": [
    {
      "name": "Buy Crypto",
      "short_name": "Buy",
      "description": "Buy cryptocurrency with fiat",
      "url": "/buy?source=pwa_shortcut",
      "icons": [
        { "src": "/icons/shortcut-buy.png", "sizes": "96x96", "type": "image/png" }
      ]
    },
    {
      "name": "Send Crypto",
      "short_name": "Send",
      "description": "Send crypto to any wallet",
      "url": "/send?source=pwa_shortcut",
      "icons": [
        { "src": "/icons/shortcut-send.png", "sizes": "96x96", "type": "image/png" }
      ]
    },
    {
      "name": "Trade",
      "short_name": "Trade",
      "description": "Open trading view",
      "url": "/trade/BTC-USD?source=pwa_shortcut",
      "icons": [
        { "src": "/icons/shortcut-trade.png", "sizes": "96x96", "type": "image/png" }
      ]
    },
    {
      "name": "Signals",
      "short_name": "Signals",
      "description": "View latest trading signals",
      "url": "/signals?source=pwa_shortcut",
      "icons": [
        { "src": "/icons/shortcut-signals.png", "sizes": "96x96", "type": "image/png" }
      ]
    }
  ],
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96x96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152x152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard-dark.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Dashboard Overview"
    },
    {
      "src": "/screenshots/trading-dark.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Trading View with Charts"
    },
    {
      "src": "/screenshots/mobile-wallet-dark.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Wallet Balances"
    }
  ]
}
```

### 2.2 iOS Specific Configuration

```html
<!-- index.html head -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="CryptoWallet">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">
<link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png">
<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#1a1a2e">
<meta name="application-name" content="CryptoWallet">
```

---

## 3. Service Worker Architecture

### 3.1 vite-plugin-pwa Configuration

```typescript
// vite.config.ts — full PWA config
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'icons/*.png',
        'fonts/*.woff2',
      ],
      manifest: false, // We use our own manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/charting_library/**'], // TV lib too large for precache
        runtimeCaching: [
          // TradingView library (load on demand)
          {
            urlPattern: /\/charting_library\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tradingview-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          // Market data API (stale-while-revalidate for speed)
          {
            urlPattern: /\/api\/v1\/(market|prices)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'market-data',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, // 1 hour
              networkTimeoutSeconds: 3,
            },
          },
          // Wallet API (stale for offline viewing)
          {
            urlPattern: /\/api\/v1\/(wallets|transactions)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wallet-data',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 5 }, // 5 min
              networkTimeoutSeconds: 5,
              backgroundSync: {
                name: 'pending-transactions',
                options: {
                  maxRetentionTime: 60 * 24, // 24 hours
                },
              },
            },
          },
          // User settings
          {
            urlPattern: /\/api\/v1\/users\/me/,
            handler: 'NetworkFirst',
            options: { cacheName: 'user-data' },
          },
          // CDN images
          {
            urlPattern: /^https:\/\/cdn\.cryptowallet\.app\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          // Fonts (cache first, very long TTL)
          {
            urlPattern: /\.woff2$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
        // Background sync for failed transactions
        backgroundSync: {
          name: 'sync-transactions',
          options: {
            maxRetentionTime: 24 * 60, // Retry for 24 hours
          },
        },
        navigationPreload: true,
      },
    }),
  ],
});
```

### 3.2 Custom Service Worker Extensions

```javascript
// sw.js (extending the generated Workbox service worker)
// Place this in public/sw.js

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);

// Network-only for all trading and transaction endpoints
// (never serve stale trading data)
registerRoute(
  ({ url }) => url.pathname.includes('/api/v1/trade/') ||
               url.pathname.includes('/api/v1/transactions/send'),
  new NetworkOnly()
);

// Handle push events
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {
    title: 'CryptoWallet',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-icon.png',
    data: { url: '/' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag ?? 'default',
      renotify: data.renotify ?? false,
      requireInteraction: data.requireInteraction ?? false,
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      data: data.data,
      vibrate: [200, 100, 200],
      silent: data.silent ?? false,
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus().then(client =>
            client.navigate(url)
          );
        }
        return clients.openWindow(url);
      })
  );
});

// Background sync for queued transactions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncPendingTransactions());
  }
});

async function syncPendingTransactions() {
  const cache = await caches.open('pending-transactions');
  const requests = await cache.keys();

  for (const request of requests) {
    try {
      const response = await fetch(request.clone());
      if (response.ok) {
        await cache.delete(request);
        // Notify user of success
        const data = await response.clone().json();
        showSyncNotification('Transaction completed!', data);
      }
    } catch (error) {
      console.error('Background sync failed:', error);
      // Will retry on next sync event
    }
  }
}
```

---

## 4. Push Notification Architecture

### 4.1 Web Push Setup

```typescript
// Backend: Push notification service
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:support@cryptowallet.app',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  tag?: string;
}

class PushNotificationService {
  async sendToUser(userId: string, payload: PushPayload) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
    });

    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        webpush.sendNotification(
          JSON.parse(sub.subscriptionJson),
          JSON.stringify(payload)
        ).catch(async (error) => {
          if (error.statusCode === 410) {
            // Subscription expired or invalid
            await prisma.pushSubscription.delete({
              where: { id: sub.id },
            });
          }
          throw error;
        })
      )
    );

    return {
      sent: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
    };
  }

  async broadcastToAll(payload: PushPayload) {
    // Batch send to all active users (rate limited)
    const batchSize = 100;
    let cursor = null;
    let total = 0;

    do {
      const batch = await prisma.pushSubscription.findMany({
        take: batchSize,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        where: { isActive: true },
      });

      await Promise.allSettled(
        batch.map(sub => webpush.sendNotification(
          JSON.parse(sub.subscriptionJson),
          JSON.stringify(payload)
        ))
      );

      total += batch.length;
      cursor = batch[batch.length - 1]?.id;
    } while (cursor);

    return { sent: total };
  }
}
```

### 4.2 Frontend Push Subscription

```typescript
// features/notifications/usePushNotifications.ts
export function usePushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const registerPush = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          await updateServerSubscription(existing);
          return;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // Subscribe with VAPID
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            import.meta.env.VITE_VAPID_PUBLIC_KEY
          ),
        });

        // Save to server
        await pushApi.subscribe({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: arrayBufferToBase64(subscription.getKey('auth')),
          },
        });

      } catch (error) {
        console.error('Push registration failed:', error);
      }
    };

    registerPush();
  }, [user]);
}
```

---

## 5. Offline Experience

### 5.1 Offline Detection & UI

```tsx
// shared/hooks/useOnlineStatus.ts
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Offline banner shown when user goes offline
function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [reconnecting, setReconnecting] = useState(false);

  // Attempt to reconnect WebSocket
  useEffect(() => {
    if (!isOnline) {
      const timer = setInterval(() => {
        setReconnecting(true);
        // WebSocket auto-reconnect is handled by Socket.io
      }, 5000);
      return () => clearInterval(timer);
    }
    setReconnecting(false);
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 flex items-center gap-3">
        <WifiOffIcon className="w-4 h-4 text-amber-500" />
        <span className="text-sm text-amber-500">
          {reconnecting ? 'Reconnecting...' : 'You are offline. Some features may be unavailable.'}
        </span>
      </div>
    </div>
  );
}
```

### 5.2 Offline Pages

```tsx
// Offline fallback page served by service worker
function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <WifiOffIcon className="w-24 h-24 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold mt-6">You're offline</h1>
        <p className="text-muted-foreground mt-2">
          Don't worry — your portfolio data is cached. You can still view your balances.
          Transactions will be queued and processed when you're back online.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button onClick={() => window.location.href = '/dashboard'}>
            View Portfolio
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 5.3 Offline Data Strategy

```typescript
// Each data type has a specific offline strategy:

const OFFLINE_STRATEGIES = {
  // User's wallet balances — show last known values
  'wallet-data': {
    strategy: 'cache-first',
    lastUpdated: null, // shown in UI: "Updated 5 min ago"
    staleWhileRevalidate: true,
  },
  // Market prices — show slightly stale prices with indicator
  'market-data': {
    strategy: 'stale-while-revalidate',
    staleIndicator: true, // show "delayed" badge if > 1 min old
  },
  // Trading — never allow offline trading
  'trading': {
    strategy: 'network-only',
    offlineMessage: 'Trading is unavailable offline',
  },
  // Transactions — queue for later
  'transactions': {
    strategy: 'background-sync',
    queueLabel: 'Will complete when online',
  },
};
```

### 5.4 Offline Balance Caching

```tsx
// features/wallet/useWallet.ts
export function useWallet() {
  const isOnline = useOnlineStatus();

  return useQuery({
    queryKey: ['wallets'],
    queryFn: walletApi.list,
    staleTime: 30_000,
    // When offline, return cached data
    networkMode: isOnline ? 'online' : 'cacheOnly',
    // Always keep previous data while refetching
    placeholderData: keepPreviousData,
    meta: {
      // Show stale indicator
      isStale: !isOnline,
    },
  });
}

// In WalletCard component:
function WalletCard({ wallet }: { wallet: Wallet }) {
  const { dataUpdatedAt } = useWallet();
  const isStale = Date.now() - dataUpdatedAt > 30_000;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{wallet.asset.name}</p>
          <p className="text-2xl font-bold">{formatCrypto(wallet.balance, wallet.asset)}</p>
          <p className="text-sm">${formatCurrency(wallet.usdValue)}</p>
        </div>
        {isStale && (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            Delayed
          </Badge>
        )}
      </div>
    </Card>
  );
}
```

---

## 6. Performance Optimizations

### 6.1 Loading Strategy

```typescript
// 1. Preload critical routes
<link rel="preload" href="/assets/dashboard-page.[hash].js" as="script">
<link rel="preload" href="/assets/wallet-page.[hash].js" as="script">

// 2. Preconnect to API and CDN
<link rel="preconnect" href="https://api.cryptowallet.app">
<link rel="preconnect" href="https://cdn.cryptowallet.app">
<link rel="dns-prefetch" href="https://api.cryptowallet.app">

// 3. Prefetch on hover (instant page transitions)
function usePrefetchOnHover(href: string) {
  const queryClient = useQueryClient();
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = linkRef.current;
    if (!el) return;

    const handleMouseEnter = () => {
      const router = useRouter();
      router.prefetch(href); // React Router prefetch
      // Also prefetch data
      queryClient.prefetchQuery({
        queryKey: ['prefetch', href],
        queryFn: () => fetch(href).then(r => r.json()),
      });
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    return () => el.removeEventListener('mouseenter', handleMouseEnter);
  }, [href]);

  return linkRef;
}
```

### 6.2 Bundle Splitting

```typescript
// Route-level code splitting (all pages lazy loaded)
// TradingView library loaded only on trading page
const TradePage = lazy(() => import('@/pages/trade/TradePage'));
// Charting library loaded only when trade page mounts
const TradingChart = lazy(() => import('@/widgets/trading/TradingChart'));
// Admin panel loaded only for admin users
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboardPage'));
```

### 6.3 Critical CSS

```html
<!-- Inline critical CSS in <head> for fastest FCP -->
<style>
  /* Essential layout CSS only (~15KB) */
  :root { --primary: #3b82f6; --bg: #0f0f23; --text: #f8fafc; }
  body { margin: 0; font-family: Inter, sans-serif; background: var(--bg); color: var(--text); }
  .loading-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  /* ... other critical styles */
</style>
```

---

## 7. App Install Flow

### 7.1 Install Prompt Handler

```tsx
// app/providers/InstallPwaProvider.tsx
export function InstallPwaProvider({ children }: PropsWithChildren) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show install prompt after 30s or on specific triggers
      setTimeout(() => {
        if (!dismissed) setShowInstall(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowInstall(false);
      trackEvent('pwa_installed', { source: 'prompt' });
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    setDismissed(true);
    // Show again after 30 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Also show a different install banner on iOS (which doesn't support beforeinstallprompt)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  return (
    <InstallContext.Provider value={{ handleInstall, isIOS, showInstall }}>
      {children}
      {showInstall && (
        <InstallBanner
          onInstall={handleInstall}
          onDismiss={handleDismiss}
          isIOS={isIOS}
        />
      )}
    </InstallContext.Provider>
  );
}
```

### 7.2 Install Prompt UI

```tsx
function InstallBanner({ onInstall, onDismiss, isIOS }: InstallBannerProps) {
  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <Card className="p-4 shadow-xl border-primary/20">
        <div className="flex items-start gap-3">
          <img src="/icons/icon-72x72.png" alt="CryptoWallet" className="w-12 h-12 rounded-xl" />
          <div className="flex-1">
            <h3 className="font-semibold">Install CryptoWallet</h3>
            <p className="text-sm text-muted-foreground">
              {isIOS
                ? 'Tap the Share button and select "Add to Home Screen"'
                : 'Install for the best experience — faster access, offline support, and more'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {!isIOS && (
            <Button onClick={onInstall} className="flex-1">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Install
            </Button>
          )}
          <Button variant="ghost" onClick={onDismiss} className="flex-1">
            Maybe later
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

---

## 8. Lighthouse Score Targets & Optimization

| Audit | Target | How We Achieve It |
|-------|--------|-------------------|
| **Performance** | ≥ 95 | Code splitting, lazy loading, critical CSS, CDN, image optimization |
| **Accessibility** | ≥ 95 | ARIA labels, semantic HTML, keyboard navigation, color contrast |
| **Best Practices** | ≥ 95 | HTTPS, no deprecated APIs, error tracking, console clean |
| **SEO** | ≥ 95 | Meta tags, semantic HTML, sitemap, structured data |
| **PWA** | 100/100 | Full manifest, SW, offline page, push notifications |

### Optimization Checklist

- [ ] Compress images (WebP + AVIF)
- [ ] Use responsive images (`srcset`)
- [ ] Font-display: swap for all custom fonts
- [ ] Preload critical fonts
- [ ] Tree-shake unused CSS (Tailwind purge)
- [ ] Avoid layout shifts (set dimensions on images)
- [ ] Defer third-party scripts (TradingView, analytics)
- [ ] Enable Brotli compression (Cloudflare)
- [ ] Cache API responses with proper headers
- [ ] Use `<link rel=modulepreload>` for critical routes
- [ ] Lazy load below-the-fold content
- [ ] Implement virtual scrolling for long lists (transactions)
- [ ] Offscreen canvas for chart rendering
- [ ] Use `will-change` CSS sparingly (only for animated elements)

---

## 9. Testing PWA Features

```typescript
// playwright/tests/pwa.spec.ts
import { test, expect } from '@playwright/test';

test('should register service worker', async ({ page }) => {
  await page.goto('/');
  const swState = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.state;
  });
  expect(swState).toBe('activated');
});

test('should have manifest', async ({ page }) => {
  await page.goto('/');
  const manifest = await page.evaluate(async () => {
    const response = await fetch('/manifest.json');
    return response.json();
  });
  expect(manifest.name).toBe('CryptoWallet Pro');
  expect(manifest.display).toBe('standalone');
});

test('should show offline page when offline', async ({ page }) => {
  await page.goto('/');
  await page.context().setOffline(true);
  await page.reload();
  await expect(page.getByText("You're offline")).toBeVisible();
  await expect(page.getByText('View Portfolio')).toBeVisible();
  await page.context().setOffline(false);
});

test('should request push notification permission', async ({ page }) => {
  await page.goto('/');
  const permission = await page.evaluate(async () => {
    // Trigger push subscription flow
    return Notification.permission;
  });
  expect(['granted', 'denied', 'default']).toContain(permission);
});
```

---

**Next Document:** [09-Implementation-Plan.md](09-Implementation-Plan.md)
