# Technical Architecture Document
## Crypto Wallet Webapp / PWA

**Version:** 1.0
**Date:** 2026-07-06

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  React SPA (Vite + TypeScript + Tailwind CSS)           │   │
│  │  ┌──────┐ ┌──────┐ ┌───────┐ ┌────────┐ ┌──────────┐  │   │
│  │  │Auth  │ │Wallet│ │Charts │ │Signals │ │Portfolio │  │   │
│  │  │Pages │ │Module│ │Module │ │Feed    │ │Dashboard │  │   │
│  │  └──────┘ └──────┘ └───────┘ └────────┘ └──────────┘  │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  PWA Service Worker (Workbox)                    │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS / WSS
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Nginx / Cloudflare (Rate Limiting, WAF, SSL Termination) │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express.js API Server (TypeScript, Cluster Mode)        │   │
│  │  /api/v1/*  - REST endpoints                             │   │
│  │  /ws/*      - WebSocket (Socket.io)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────┬───────────────────────┬───────────────────┬───────────────┘
       │                       │                   │
       ▼                       ▼                   ▼
┌───────────┐    ┌──────────────────┐    ┌──────────────┐
│PostgreSQL │    │     Redis        │    │  Bull Queue  │
│ (Primary) │    │ (Cache / Session │    │ (Async Jobs) │
│           │    │  / Pub-Sub)      │    │              │
└─────┬─────┘    └──────────────────┘    └──────┬───────┘
      │                                         │
      ▼                                         ▼
┌──────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES LAYER                      │
│ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌───────┐ ┌──────────┐ │
│ │MoonPay  │ │TradingView│ │Blockchain│ │Alchemy│ │CoinGecko│ │
│ │(Fiat    │ │(Charts)   │ │Nodes    │ │(Eth)  │ │(Market   │ │
│ │On-Ramp) │ │           │ │(Infura)  │ │       │ │ Data)    │ │
│ └─────────┘ └──────────┘ └─────────┘ └───────┘ └──────────┘ │
│ ┌──────────┐ ┌──────────┐ ┌───────────────────────────────┐  │
│ │SendGrid  │ │AWS S3    │ │Twilio (SMS 2FA)               │  │
│ │(Email)   │ │(Docs)    │ │                               │  │
│ └──────────┘ └──────────┘ └───────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack (Detailed)

### 2.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 5.x | Build Tool / Dev Server |
| Tailwind CSS | 3.x | Utility-first CSS |
| TanStack Query (React Query) | 5.x | Server State / Caching |
| Zustand | 4.x | Client State Management |
| React Router | 6.x | Routing |
| React Hook Form | 7.x | Form Management |
| Zod | 3.x | Schema Validation (shared with backend) |
| TradingView Charting Library | Latest | Interactive Charts |
| Lightweight Charts | 4.x | Mini-charts / sparklines |
| Socket.io Client | 4.x | Real-time Data |
| Workbox | 7.x | Service Worker / PWA |
| Vite PWA Plugin | Latest | PWA Build Integration |
| Recharts | 2.x | Portfolio charts (non-trading) |
| i18next | 23.x | Internationalization |
| Framer Motion | 11.x | Animations |
| React Error Boundary | Latest | Error Handling |
| Sentry | Latest | Error Monitoring |

### 2.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| TypeScript | 5.x | Type Safety |
| Express.js | 4.x | HTTP Framework |
| Socket.io | 4.x | WebSocket Server |
| Bull | 4.x | Job Queue |
| node-postgres (pg) | 8.x | Database Driver |
| ioredis | 5.x | Redis Client |
| Prisma ORM | 5.x | Database ORM / Migrations |
| Passport.js | Latest | Authentication Strategies |
| JWT (jsonwebtoken) | 9.x | Token Auth |
| bcrypt | 5.x | Password Hashing |
| Zod | 3.x | Input Validation |
| Speakeasy | Latest | TOTP 2FA |
| nodemailer | 6.x | Email Transport |
| Winston | 3.x | Logging |
| Helmet | 7.x | HTTP Security Headers |
| express-rate-limit | 7.x | Rate Limiting |
| cors | 2.x | CORS |
| Swagger (swagger-jsdoc) | Latest | API Documentation |

### 2.3 Infrastructure & Data

| Technology | Purpose |
|------------|---------|
| PostgreSQL 16 | Primary database |
| Redis 7 | Cache, sessions, pub/sub, rate limiter |
| AWS S3 (or Cloudflare R2) | Document storage (KYC), avatars |
| AWS CloudFront / Cloudflare CDN | Static asset delivery |
| Docker + Docker Compose | Local dev environment |
| GitHub Actions | CI/CD |
| PM2 or Kubernetes | Production process management |

## 3. Application Architecture Patterns

### 3.1 Frontend Architecture (Feature-Sliced Design)

```
src/
├── app/               # App initialization, providers, router
│   ├── providers/     # Context providers (Auth, Theme, i18n)
│   ├── router/        # Route definitions
│   └── App.tsx        # Root component
├── pages/             # Top-level route pages
│   ├── auth/          # Login, Register, 2FA, KYC
│   ├── dashboard/     # Portfolio overview
│   ├── wallet/        # Send, Receive, balances
│   ├── trade/         # Buy/Sell, order forms
│   ├── charts/        # Full chart view
│   ├── signals/       # Signal feed, signal detail
│   ├── settings/      # Profile, security, preferences
│   └── admin/         # Admin panel (protected)
├── widgets/           # Composable UI sections
│   ├── portfolio-chart/
│   ├── order-book/
│   ├── trade-form/
│   ├── signal-card/
│   └── price-ticker/
├── features/          # Business logic units
│   ├── auth/          # Auth feature slice
│   ├── wallet/        # Wallet feature slice
│   ├── trading/       # Trading feature slice
│   ├── signals/       # Signals feature slice
│   └── kyc/           # KYC verification flow
├── entities/          # Domain models
│   ├── user/
│   ├── transaction/
│   ├── asset/
│   └── signal/
├── shared/            # Shared utilities
│   ├── api/           # Axios instance, API client
│   ├── hooks/         # Shared custom hooks
│   ├── ui/            # Design system components
│   ├── lib/           # Utilities
│   └── types/         # Shared TypeScript types
└── styles/            # Global styles, Tailwind config
```

### 3.2 Backend Architecture (Modular Monolith → Microservices)

```
src/
├── server.ts              # Entry point
├── app.ts                 # Express app setup
├── config/                # Environment config
│   ├── database.ts
│   ├── redis.ts
│   ├── auth.ts
│   └── payment.ts
├── modules/               # Domain modules
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.validation.ts
│   │   └── strategies/    # Passport strategies
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.repository.ts
│   ├── wallet/
│   │   ├── wallet.controller.ts
│   │   ├── wallet.service.ts
│   │   ├── wallet.repository.ts
│   │   └── blockchain/    # Node interaction layer
│   ├── trading/
│   │   ├── order.controller.ts
│   │   ├── order.service.ts
│   │   ├── matching-engine.ts
│   │   └── order.repository.ts
│   ├── signals/
│   │   ├── signal.controller.ts
│   │   ├── signal.service.ts
│   │   ├── signal.repository.ts
│   │   └── analyzers/    # TA indicator calculators
│   ├── market-data/
│   │   ├── market-data.controller.ts
│   │   ├── market-data.service.ts
│   │   └── providers/     # CoinGecko, custom aggregator
│   ├── payment/
│   │   ├── payment.controller.ts
│   │   ├── payment.service.ts
│   │   └── providers/     # MoonPay, Stripe
│   ├── kyc/
│   │   ├── kyc.controller.ts
│   │   ├── kyc.service.ts
│   │   └── providers/     # Onfido, Jumio
│   └── admin/
│       ├── admin.controller.ts
│       └── admin.service.ts
├── common/                # Shared infrastructure
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── rate-limiter.ts
│   │   ├── validate.middleware.ts
│   │   ├── error-handler.ts
│   │   └── audit-log.ts
│   ├── websocket/
│   │   ├── socket-server.ts
│   │   └── handlers/
│   ├── queue/
│   │   ├── bull-board.ts
│   │   └── jobs/
│   ├── database/
│   │   ├── prisma.ts
│   │   └── migrations/
│   └── utils/
│       ├── logger.ts
│       ├── encryption.ts
│       └── pagination.ts
└── types/                 # Shared types
    ├── express.d.ts
    ├── socket.d.ts
    └── env.d.ts
```

## 4. Data Flow Diagrams

### 4.1 Buy Crypto Flow

```
User                    Frontend                   Backend                    MoonPay/Stripe
 │                        │                          │                           │
 │ Click "Buy BTC"        │                          │                           │
 │───────────────────────►│                          │                           │
 │                        │                          │                           │
 │ Show quote (rate+fees) │  POST /api/v1/trade/quote│                           │
 │◄───────────────────────│─────────────────────────►│                           │
 │                        │                          ├── Fetch current rate ────►│
 │                        │                          │◄── Return quote ─────────┤
 │                        │◄── Send quote ◄──────────│                           │
 │                        │                          │                           │
 │ Confirm purchase       │                          │                           │
 │───────────────────────►│  POST /api/v1/trade/buy  │                           │
 │                        │─────────────────────────►│                           │
 │                        │                          ├── Create pending order    │
 │                        │                          ├── Redirect to payment ───►│
 │                        │◄── Payment URL ◄─────────│                           │
 │◄── Open payment page──┤                          │                           │
 │                        │                          │                           │
 │ ┌──────────────────┐   │                          │                           │
 │ │ Payment Widget   │   │                          │                           │
 │ │ (MoonPay/Stripe) │───│──────────────────────────│──────────────────────────►│
 │ │ Enter card info  │   │                          │                           │
 │ └────────┬─────────┘   │                          │                           │
 │          │             │                          │                           │
 │◄── Payment success ───│──────────────────────────│──────────────────────────┤
 │                        │                          │                           │
 │                        │  WebSocket: order.update │                           │
 │◄─── Balance update ───│◄─────────────────────────│                           │
 │                        │                          │                           │
 │ Show success + balance │                          │                           │
 │───────────────────────►│                          │                           │
```

### 4.2 Real-Time Price Feed Flow

```
Frontend                    Backend                      External Provider
  │                           │                              │
  │ WebSocket Connect         │                              │
  │──────────────────────────►│                              │
  │                           │                              │
  │ Subscribe: prices:BTC-USD │                              │
  │──────────────────────────►│                              │
  │                           │                              │
  │                           ├── Subscribe to provider ────►│
  │                           │◄── Price tick ──────────────┤
  │                           │                              │
  │                           ├── Broadcast to room          │
  │◄── Price update ─────────┤                              │
  │ (via Socket.io)          │                              │
  │                           │                              │
  │ Update chart + balance    │                              │
  │ (throttled to 1s)        │                              │
```

## 5. Database Design (at-a-glance)

See [03-Database-Schema.md](03-Database-Schema.md) for full details.

**Core Tables:**
- `users` — auth, profile, KYC status
- `wallets` — per-currency wallet records
- `wallet_addresses` — deposit addresses per blockchain
- `transactions` — all on-chain and internal transfers
- `orders` — buy/sell orders (market, limit, stop)
- `trades` — executed trade records
- `signals` — trading signals with entry/exit logic
- `signal_subscriptions` — user signal provider subscriptions
- `price_alerts` — user-defined price threshold alerts
- `kyc_documents` — uploaded KYC verification docs
- `sessions` — JWT refresh token tracking
- `audit_logs` — all sensitive operations

## 6. API Design Principles

- RESTful for CRUD operations (`/api/v1/resource`)
- WebSocket (Socket.io) for real-time data
- Namespaced WebSocket channels:
  - `/ws/prices` — real-time price ticks
  - `/ws/orders` — user's order status updates
  - `/ws/balances` — user's balance changes
  - `/ws/signals` — new signal alerts
- Pagination: cursor-based for lists, offset-based for admin
- Rate limiting: 100 req/min for auth, 300 req/min for general, 1000 req/min for market data
- All responses follow JSEND format

## 7. Security Architecture

### 7.1 Encryption Standards
- **At Rest:** AES-256-GCM for sensitive user data (private keys, documents)
- **In Transit:** TLS 1.3 (min)
- **Password Hashing:** bcrypt (cost factor 12)
- **API Keys:** Hashed with SHA-256 before storage (view-once display)

### 7.2 Authentication Flow
```
1. User submits credentials
2. Server validates → issues access_token (30m) + refresh_token (7d, httpOnly cookie)
3. Refresh token rotates on each use (old invalidated)
4. Access token contains: { sub, role, kycLevel, iat, exp }
5. 2FA check: if enabled, require TOTP token after credentials
```

### 7.3 Key Management
- Wallet private keys stored encrypted with master key (AWS KMS / HashiCorp Vault)
- Master key never touches application servers
- HSMs for high-value transaction signing
- Seed phrases generated client-side for non-custodial wallets (never sent to server)

## 8. PWA Implementation Strategy

### 8.1 Service Worker Architecture
```
┌──────────────────────────────────────────────┐
│            Service Worker (Workbox)           │
│                                               │
│  ┌────────────────┐  ┌──────────────────┐    │
│  │ Precache (shell)│  │ Runtime Cache    │    │
│  │ - HTML          │  │ - API responses  │    │
│  │ - JS bundles    │  │ - Chart data     │    │
│  │ - CSS           │  │ - Images/ icons  │    │
│  │ - Icons         │  │ - Fonts          │    │
│  └────────────────┘  └──────────────────┘    │
│                                               │
│  ┌──────────────────────────────────────┐    │
│  │  Strategy: Stale-While-Revalidate     │    │
│  │  (API), Cache-First (static assets), │    │
│  │  Network-Only (transactions)         │    │
│  └──────────────────────────────────────┘    │
│                                               │
│  ┌──────────────────────────────────────┐    │
│  │  Background Sync                      │    │
│  │  - Queue failed transactions          │    │
│  │  - Retry when online                  │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

### 8.2 Offline Capabilities
| Feature | Online | Offline |
|---------|--------|---------|
| Portfolio balance | Live via API | Cached (last known) |
| Price charts | Real-time | Last 24H cache |
| Transaction history | Full history | Last 50 cached |
| Buy/Sell | Available | Disabled (show friendly message) |
| Signal feed | Live | Last 50 cached |
| Settings | Editable | Read-only cached |

## 9. Deployment Architecture

```
                    ┌──────────────┐
                    │  Cloudflare  │
                    │  (DNS / CDN) │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Nginx LB   │
                    │  (SSL Term)  │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │ Express App │ │ Express App │ │ Express App │
    │  (PM2)      │ │  (PM2)      │ │  (PM2)      │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │  (Primary)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │  (Replica)  │
                    └─────────────┘
```

## 10. Monitoring & Observability

| Tool | Purpose |
|------|---------|
| Sentry | Error tracking (frontend + backend) |
| Grafana + Prometheus | Metrics dashboard |
| Loki | Log aggregation |
| CloudWatch / Datadog | Infrastructure monitoring |
| Uptime Robot / Pingdom | External uptime monitoring |
| Lighthouse CI | PWA performance regression tracking |
| New Relic / OpenTelemetry | APM tracing |

---

**Next Document:** [03-Database-Schema.md](03-Database-Schema.md)
