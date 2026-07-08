# Implementation Plan
## Crypto Wallet Webapp / PWA

**Version:** 1.0
**Date:** 2026-07-06

---

## 1. Project Timeline Overview

```
Phase 0: Foundation      Week 1-2     ■■■■■■■■■■■■
Phase 1: Core Auth       Week 3-4     ■■■■■■■■■■■■
Phase 2: Wallet MVP      Week 5-8     ■■■■■■■■■■■■■■■■■■■■■■
Phase 3: Trading         Week 9-12    ■■■■■■■■■■■■■■■■■■■■■■
Phase 4: Charts          Week 13-15   ■■■■■■■■■■■■■■■■
Phase 5: Signals         Week 16-18   ■■■■■■■■■■■■■■■■
Phase 6: PWA Polish      Week 19-20   ■■■■■■■■■■
Phase 7: Launch Prep     Week 21-22   ■■■■■■■■■■
Phase 8: Post-Launch     Week 23+     Ongoing
```

**Total: ~22 weeks to MVP launch (with team of 4-6 developers)**

---

## 2. Team Structure

| Role | Count | Responsibilities |
|------|-------|------------------|
| **Frontend Lead** | 1 | React architecture, state management, PWA, charts |
| **Frontend Developer** | 1 | UI components, pages, Tailwind theming, i18n |
| **Backend Lead** | 1 | Express/Node architecture, database, API design |
| **Backend Developer** | 1 | Trading engine, signal algorithms, blockchain integration |
| **DevOps / Security** | 1 | CI/CD, infrastructure, security audits, compliance |
| **QA Engineer** | 1 | Testing, E2E tests, performance monitoring |
| **Product Manager** | 1 | Requirements, stakeholder management, prioritization |
| **UI/UX Designer** | 1 | Design system, wireframes, prototypes, user testing |

---

## 3. Phase Breakdown

### Phase 0: Foundation (Week 1-2)

**Goal:** Set up project scaffolding, CI/CD, dev environment.

| Task | Details | Owner |
|------|---------|-------|
| P0.1 | Initialize monorepo (Turborepo / Nx) | DevOps |
| P0.2 | Set up frontend (Vite + React + TS + Tailwind) | Frontend Lead |
| P0.3 | Set up backend (Express + TS + Prisma + Bull) | Backend Lead |
| P0.4 | Docker Compose for local dev (Postgres, Redis) | DevOps |
| P0.5 | GitHub repo + branch protection rules | DevOps |
| P0.6 | CI/CD pipeline (GitHub Actions: lint, test, build) | DevOps |
| P0.7 | ESLint + Prettier config (shared) | Frontend Lead |
| P0.8 | Base design tokens (colors, spacing, typography) | Designer |
| P0.9 | Shared TypeScript types package | Both Leads |
| P0.10 | Prisma schema initial migration | Backend Lead |
| P0.11 | Sentry + logging setup | DevOps |

**Deliverable:** `main` branch with both apps running, CI green, shared config enforced.

---

### Phase 1: Core Auth & User System (Week 3-4)

**Goal:** User registration, login, JWT auth, 2FA, basic profile.

| Task | Details | Owner |
|------|---------|-------|
| 1.1 | Backend: User model + Prisma migration | Backend |
| 1.2 | Backend: Register endpoint (email verification) | Backend |
| 1.3 | Backend: Login with JWT (access + refresh tokens) | Backend |
| 1.4 | Backend: Passport.js strategies (local, Google, Apple) | Backend |
| 1.5 | Backend: 2FA TOTP setup + verification | Backend |
| 1.6 | Backend: Forgot/reset password flow | Backend |
| 1.7 | Backend: User CRUD + settings endpoints | Backend |
| 1.8 | Backend: Session management + device tracking | Backend |
| 1.9 | Backend: Rate limiting middleware | Backend |
| 1.10 | Frontend: Auth layout (login, register pages) | Frontend |
| 1.11 | Frontend: Auth forms with React Hook Form + Zod | Frontend |
| 1.12 | Frontend: JWT interceptor (Axios) | Frontend |
| 1.13 | Frontend: OAuth buttons (Google, Apple) | Frontend |
| 1.14 | Frontend: 2FA setup + verification UI | Frontend |
| 1.15 | Frontend: Protected route guards | Frontend |
| 1.16 | Frontend: Basic dashboard layout (sidebar + header) | Frontend |
| 1.17 | Frontend: Profile/settings page | Frontend |
| 1.18 | E2E: Auth flow tests (login, register, 2FA) | QA |

**Deliverable:** User can register, login with 2FA, view/edit profile.

---

### Phase 2: Wallet MVP (Week 5-8)

**Goal:** Multi-currency wallets, deposits, withdrawals, transaction history.

| Task | Details | Owner |
|------|---------|-------|
| 2.1 | DB: Wallet + Transaction + Asset models | Backend |
| 2.2 | Backend: Asset management CRUD (admin) | Backend |
| 2.3 | Backend: Wallet creation endpoint | Backend |
| 2.4 | Backend: Balance queries with caching (Redis) | Backend |
| 2.5 | Backend: Deposit address generation (HD wallet) | Backend |
| 2.6 | Backend: Deposit detection (blockchain watcher) | Backend |
| 2.7 | Backend: Withdrawal creation + fee calculation | Backend |
| 2.8 | Backend: Withdrawal security flow (2FA, PIN, limits) | Backend |
| 2.9 | Backend: Internal transfer (user-to-user) | Backend |
| 2.10 | Backend: Transaction history with filters | Backend |
| 2.11 | Backend: Address whitelist CRUD | Backend |
| 2.12 | Backend: Blockchain node connectivity (BTC, ETH) | Backend |
| 2.13 | Backend: Transaction confirmation watcher | Backend |
| 2.14 | Frontend: Wallets overview page | Frontend |
| 2.15 | Frontend: Wallet detail + transaction list | Frontend |
| 2.16 | Frontend: Send crypto form (address, amount, PIN, 2FA) | Frontend |
| 2.17 | Frontend: Receive screen (address + QR code) | Frontend |
| 2.18 | Frontend: Internal transfer form | Frontend |
| 2.19 | Frontend: Transaction history with filters | Frontend |
| 2.20 | Frontend: Skeleton loaders for wallet pages | Frontend |
| 2.21 | Integration: MoonPay/Stripe fiat on-ramp widget | Frontend |
| 2.22 | E2E: Send crypto flow (mock) | QA |
| 2.23 | E2E: Deposit detection flow | QA |

**Deliverable:** User can deposit, send, receive crypto. Transaction history visible.

---

### Phase 3: Trading Engine (Week 9-12)

**Goal:** Buy/sell crypto with market and limit orders, order book.

| Task | Details | Owner |
|------|---------|-------|
| 3.1 | DB: Order + Trade + OrderBook models | Backend |
| 3.2 | Backend: Order creation (market, limit, stop-loss) | Backend |
| 3.3 | Backend: Matching engine (in-memory + DB persistence) | Backend |
| 3.4 | Backend: Order book management (Redis sorted sets) | Backend |
| 3.5 | Backend: Order cancellation | Backend |
| 3.6 | Backend: Trade execution recording | Backend |
| 3.7 | Backend: Order history with filters | Backend |
| 3.8 | Backend: Quote endpoint (instant price estimation) | Backend |
| 3.9 | Backend: Slippage protection | Backend |
| 3.10 | Backend: Fee calculation engine | Backend |
| 3.11 | Backend: Balance locking/unlocking on order placement | Backend |
| 3.12 | WS: Order status updates (real-time) | Backend |
| 3.13 | WS: Order book depth stream | Backend |
| 3.14 | Backend: DCA (recurring buy) scheduling | Backend |
| 3.15 | Frontend: Trading page layout (chart + form + book) | Frontend |
| 3.16 | Frontend: Order form (market buy/sell, limit) | Frontend |
| 3.17 | Frontend: Order book display | Frontend |
| 3.18 | Frontend: Recent trades panel | Frontend |
| 3.19 | Frontend: Open orders page | Frontend |
| 3.20 | Frontend: Order/trade history pages | Frontend |
| 3.21 | Frontend: Recurring buy setup UI | Frontend |
| 3.22 | Frontend: Price quote display before confirmation | Frontend |
| 3.23 | E2E: Place market order flow | QA |
| 3.24 | Load test: Matching engine (1000 orders/sec) | DevOps |

**Deliverable:** User can buy/sell crypto with market and limit orders.

---

### Phase 4: Charts & Market Data (Week 13-15)

**Goal:** Professional TradingView charts, market overview, mini charts.

| Task | Details | Owner |
|------|---------|-------|
| 4.1 | DB: Candle + MarketPrice models | Backend |
| 4.2 | Backend: Candle aggregation from price data | Backend |
| 4.3 | Backend: Market price endpoints | Backend |
| 4.4 | Backend: OHLCV historical API (with pagination) | Backend |
| 4.5 | WS: Real-time candle updates | Backend |
| 4.6 | Backend: TradingView datafeed adapter API | Backend |
| 4.7 | Backend: Chart layout persistence (save/load) | Backend |
| 4.8 | Frontend: TradingView Charting Library integration | Frontend |
| 4.9 | Frontend: Custom datafeed implementation | Frontend |
| 4.10 | Frontend: Chart theme (dark/light) sync | Frontend |
| 4.11 | Frontend: Timeframe selector | Frontend |
| 4.12 | Frontend: Drawing tools enabled | Frontend |
| 4.13 | Frontend: Indicators (RSI, MACD, etc.) | Frontend |
| 4.14 | Frontend: Order overlay on chart (pending/filled) | Frontend |
| 4.15 | Frontend: Market overview page (grid of all pairs) | Frontend |
| 4.16 | Frontend: Coin detail page (price, chart, stats) | Frontend |
| 4.17 | Frontend: Mini sparkline charts (Lightweight Charts) | Frontend |
| 4.18 | Frontend: Price ticker (scrolling marquee) | Frontend |
| 4.19 | Frontend: Chart layout persistence per user | Frontend |
| 4.20 | E2E: Chart loads + candles displayed | QA |

**Deliverable:** Full TradingView experience with indicators, drawing, real-time updates.

---

### Phase 5: Trading Signals (Week 16-18)

**Goal:** Algorithmic + community signals, signal feed, performance tracking.

| Task | Details | Owner |
|------|---------|-------|
| 5.1 | DB: Signal + SignalPerformance + Subscription models | Backend |
| 5.2 | Backend: TA library (TA-Lib bindings or pure JS) | Backend |
| 5.3 | Backend: Signal strategy engine (RSI, MACD, etc.) | Backend |
| 5.4 | Backend: Bull queue job (hourly scan) | Backend |
| 5.5 | Backend: Signal confidence scoring algorithm | Backend |
| 5.6 | Backend: Community signal submission + validation | Backend |
| 5.7 | Backend: Signal moderation queue (admin) | Backend |
| 5.8 | Backend: Signal subscription endpoints | Backend |
| 5.9 | Backend: Signal performance tracking + recalc job | Backend |
| 5.10 | Backend: Copy trading engine (mirror trades) | Backend |
| 5.11 | WS: Signal broadcast on new signals | Backend |
| 5.12 | WS: Price alert detection + trigger | Backend |
| 5.13 | Frontend: Signals feed page (filterable) | Frontend |
| 5.14 | Frontend: Signal detail + performance charts | Frontend |
| 5.15 | Frontend: Create signal form (premium users) | Frontend |
| 5.16 | Frontend: Subscribe/auto-trade buttons | Frontend |
| 5.17 | Frontend: Copy trading dashboard | Frontend |
| 5.18 | Frontend: Signal provider profile + stats | Frontend |
| 5.19 | Frontend: Price alerts CRUD page | Frontend |
| 5.20 | Frontend: Signal markers on chart (overlay) | Frontend |
| 5.21 | E2E: Signal display + creation flow | QA |

**Deliverable:** Users see algorithmic signals, can subscribe, copy trade, set price alerts.

---

### Phase 6: PWA Polish (Week 19-20)

**Goal:** Full PWA compliance, offline support, push notifications, install flow.

| Task | Details | Owner |
|------|---------|-------|
| 6.1 | vite-plugin-pwa configuration complete | Frontend |
| 6.2 | All icon sizes generated (72–512 + maskable) | Frontend |
| 6.3 | Manifest.json with shortcuts + screenshots | Frontend |
| 6.4 | Service worker + runtime caching rules | Frontend |
| 6.5 | Offline fallback page | Frontend |
| 6.6 | Offline balance caching (stale-while-revalidate) | Frontend |
| 6.7 | Background sync for pending transactions | Frontend |
| 6.8 | Push notification subscription flow (VAPID) | Frontend |
| 6.9 | Backend: Push notification sending service | Backend |
| 6.10 | Backend: Notification preference model | Backend |
| 6.11 | Install prompt banner (beforeinstallprompt) | Frontend |
| 6.12 | iOS install instructions (add to home screen) | Frontend |
| 6.13 | Lighthouse score optimization | Frontend |
| 6.14 | Performance bundle analysis + optimization | Frontend |
| 6.15 | Offline UI indicators (banner, delayed badge) | Frontend |
| 6.16 | E2E: PWA tests (manifest, SW, offline) | QA |

**Deliverable:** Lighthouse PWA score 100/100, full offline support, push notifications.

---

### Phase 7: Launch Preparation (Week 21-22)

**Goal:** Security audit, compliance, performance tuning, production deployment.

| Task | Details | Owner |
|------|---------|-------|
| 7.1 | External penetration test | Security |
| 7.2 | Compliance review (KYC/AML procedures) | PM + Legal |
| 7.3 | Production infrastructure setup (AWS/GCP) | DevOps |
| 7.4 | Database migration + backup strategy | Backend |
| 7.5 | CDN setup (Cloudflare) | DevOps |
| 7.6 | Load testing (target: 100k concurrent users) | DevOps |
| 7.7 | Error budget monitoring setup (Sentry + Grafana) | DevOps |
| 7.8 | Staging environment + smoke tests | DevOps |
| 7.9 | Bug bounty program launch | Security |
| 7.10 | Documentation (user guide, API docs, admin guide) | PM |
| 7.11 | Terms of Service + Privacy Policy | Legal |
| 7.12 | Soft launch (invite-only, 1000 users) | PM |
| 7.13 | Bug fixes from soft launch | All |
| 7.14 | Public launch | PM |

**Deliverable:** Production-ready application with all security measures in place.

---

### Phase 8: Post-Launch (Week 23+)

| Task | Timeline |
|------|----------|
| Monitor error rates and performance | Ongoing |
| Bug fixes and minor improvements | Weekly |
| Feature requests triage | Bi-weekly |
| Add more blockchain networks | Month 2 |
| Advanced order types (OCO, trailing stop) | Month 2 |
| Mobile app (React Native) exploration | Month 3 |
| P2P trading feature | Month 4 |
| DeFi integration (staking, yield) | Month 5 |
| NFT gallery support | Month 6 |
| Institutional features (sub-accounts, reports) | Month 6+ |

---

## 4. Development Standards

### 4.1 Git Workflow

```yaml
Branch Naming:
  - feature/prefix-short-description   # feat/wallet-transactions
  - fix/prefix-short-description        # fix/login-redirect
  - chore/description                    # chore/update-deps
  - docs/description                     # docs/api-usage

Commit Convention: Conventional Commits
  - feat: add wallet transaction history
  - fix: handle empty balance state
  - chore: update npm dependencies
  - docs: add API authentication section

PR Requirements:
  - At least 1 reviewer
  - All CI checks pass
  - Branch up to date with main
  - No console.logs
  - Tests included for new features
```

### 4.2 Code Review Checklist

```
Functionality:
  □ Does the code do what it's supposed to?
  □ Are edge cases handled (loading, empty, error states)?
  □ Is there any dead/unreachable code?

Performance:
  □ Are there unnecessary re-renders?
  □ Is data fetching efficient (caching, deduplication)?
  □ Are large libraries lazy-loaded?

Security:
  □ Are all inputs validated (frontend + backend)?
  □ Are proper auth checks in place?
  □ Is RLS configured for new database queries?
  □ No sensitive data logged or exposed?

Maintainability:
  □ Is the code readable and well-named?
  □ Are there unit tests for business logic?
  □ Is TypeScript used properly (not `any`)?
  □ Are error messages helpful?
```

### 4.3 Testing Requirements

| Type | Coverage Target | Tools |
|------|----------------|-------|
| Unit tests (frontend) | 80%+ | Vitest + React Testing Library |
| Unit tests (backend) | 90%+ | Vitest + Supertest |
| Component tests | Key components | Storybook + Chromatic |
| E2E tests | Critical flows | Playwright |
| API contract tests | All endpoints | Supertest + Zod |
| Load tests | Trading engine | k6 / Artillery |
| Visual regression | UI pages | Percy / Chromatic |
| Security scan | All endpoints | OWASP ZAP |

---

## 5. Risk & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **TradingView library API changes** | Medium | High | Abstract datafeed layer, unit test adapter |
| **Blockchain node outages** | Medium | High | Multi-provider failover, circuit breaker |
| **Regulatory changes (crypto)** | Medium | High | Modular compliance layer, geo-blocking |
| **Security breach** | Low | Critical | Pen testing, bug bounty, incident response plan |
| **Scaling costs exceed budget** | Medium | Medium | Auto-scaling limits, cost monitoring, reserved instances |
| **Team member departure** | Low | High | Documentation, code ownership rotation |
| **Third-party API deprecation** | Medium | Medium | Abstract API layer, multiple providers |

---

## 6. Budget Estimation

### 6.1 Development Cost (One-time)

| Item | Est. Hours | Rate | Total |
|------|-----------|------|-------|
| Frontend Development | 1,000 | $75/hr | $75,000 |
| Backend Development | 1,200 | $85/hr | $102,000 |
| DevOps / Infrastructure | 300 | $100/hr | $30,000 |
| UI/UX Design | 400 | $80/hr | $32,000 |
| QA / Testing | 500 | $60/hr | $30,000 |
| Security Audit | 100 | $200/hr | $20,000 |
| **Total Development** | **3,500** | | **$289,000** |

### 6.2 Monthly Operating Cost

| Item | Cost |
|------|------|
| Cloud Infrastructure (AWS/GCP) | $2,000 - $5,000 |
| Third-party APIs (MoonPay, Infura, etc.) | $1,000 - $3,000 |
| Sentry + Monitoring | $200 - $500 |
| CDN (Cloudflare) | $200 - $500 |
| Email Service (SendGrid) | $100 - $300 |
| SMS (Twilio) | $100 - $500 |
| KYC Provider | $1 - $5 per user |
| **Total Monthly** | **$3,600 - $9,800** |

---

## 7. Technology Decision Log

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| State Management | Redux Toolkit, Zustand, Jotai | Zustand | Less boilerplate, TS-native, small bundle |
| Server State | TanStack Query, SWR, Apollo | TanStack Query | Better caching, devtools, WS integration |
| ORM | Prisma, TypeORM, Drizzle | Prisma | Best DX, migrations, type-safe queries |
| Charts | TradingView, Lightweight, Chart.js | TradingView + LC | TV for main chart, LC for mini charts |
| Real-time | Socket.io, WS, SSE | Socket.io | Auto-reconnect, rooms, fallback |
| Queue | Bull, Bee, RabbitMQ | Bull | Redis-backed, UI dashboard, scheduling |
| PWA | Workbox, SW-precache | Workbox | Mature, well-documented, Vite plugin |
| Blockchain | Ethers.js, Web3.js, viem | viem | Modern, type-safe, tree-shakable |
| CSS | Tailwind, Styled Components, vanilla | Tailwind | Utility-first, fast iteration, theming |
| Monorepo | Turborepo, Nx, Lerna | Turborepo | Fast caching, simple config, Vite-native |

---

## 8. File to Create (Scaffold Checklist)

```
root/
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── pages/
│   │   │   ├── widgets/
│   │   │   ├── features/
│   │   │   ├── entities/
│   │   │   ├── shared/
│   │   │   └── styles/
│   │   ├── public/
│   │   │   ├── icons/
│   │   │   ├── screenshots/
│   │   │   └── manifest.json
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── backend/
│       ├── src/
│       │   ├── modules/
│       │   ├── common/
│       │   ├── config/
│       │   └── types/
│       ├── prisma/
│       │   └── schema.prisma
│       ├── tests/
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared-types/
│   │   ├── src/
│   │   │   ├── types/
│   │   │   └── validations/
│   │   └── package.json
│   │
│   └── ui-kit/
│       ├── src/
│       │   ├── Button/
│       │   ├── Input/
│       │   └── ...
│       └── package.json
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy.yml
│       └── lint.yml
├── .eslintrc.js
├── .prettierrc
├── turbo.json
├── package.json
└── README.md
```

---

**Document Index:**

| # | Document | Description |
|---|----------|-------------|
| 01 | [PRD](01-PRD.md) | Product Requirements Document |
| 02 | [Technical Architecture](02-Technical-Architecture.md) | System architecture, stack, data flow |
| 03 | [Database Schema](03-Database-Schema.md) | PostgreSQL schema (Prisma) |
| 04 | [API Specification](04-API-Specification.md) | REST + WebSocket API reference |
| 05 | [Frontend Architecture](05-Frontend-Architecture.md) | React component tree, state management |
| 06 | [Security & Compliance](06-Security-Compliance.md) | Security measures, KYC/AML, regulations |
| 07 | [Signals & Charts](07-Signals-Charts-Architecture.md) | Signal engine, chart integration |
| 08 | [PWA Guide](08-PWA-Implementation-Guide.md) | Service worker, offline, push notifications |
| 09 | **Implementation Plan** | Timeline, phases, team, budget |
