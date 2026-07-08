# Product Requirements Document (PRD)
## Crypto Wallet Webapp / PWA

**Version:** 1.0
**Date:** 2026-07-06
**Status:** Draft

---

## 1. Executive Summary

A comprehensive cryptocurrency wallet web application and Progressive Web App (PWA) that enables users to buy, sell, and manage digital assets. The platform integrates real-time price charts, trading signals, and portfolio management tools. Built with React/Tailwind CSS (frontend) and Node.js/Express/PostgreSQL (backend), the app targets retail crypto traders who want an all-in-one web-based solution without installing a native mobile app.

## 2. Product Goals

1. Provide a secure, non-custodial **and** custodial hybrid wallet experience
2. Enable fiat-to-crypto and crypto-to-fiat transactions via integrated on-ramp/off-ramp
3. Deliver professional-grade charts and technical analysis tools
4. Offer actionable trading signals (algorithmic + community-driven)
5. Function as a fully-capable PWA (offline balance viewing, push notifications, home screen install)
6. Maintain regulatory compliance (KYC/AML) across supported jurisdictions

## 3. Target Audience

| Persona | Description |
|---------|-------------|
| **Retail Crypto Trader** | Ages 22–45, owns crypto, trades weekly, uses TradingView |
| **Crypto Newcomer** | First-time buyer, needs simplicity and education |
| **Active Trader** | Multiple daily trades, relies on signals/alerts |
| **HODLer** | Long-term holder, checks portfolio occasionally, wants security |

## 4. User Stories

### Authentication & Onboarding
- As a user, I can sign up with email + password or SSO (Google, Apple)
- As a user, I can set up 2FA (TOTP, SMS)
- As a user, I can complete KYC verification (ID upload, selfie, address proof)
- As a user, I can create/restore a non-custodial wallet using seed phrase
- As a user, I can set a spending PIN for transactions

### Dashboard & Portfolio
- As a user, I can see my total portfolio value in USD
- As a user, I can see 24h change, % change, and allocation breakdown
- As a user, I can see performance charts (1D, 1W, 1M, 1Y, All)
- As a user, I can add custom notes/tags to transactions

### Buy & Sell
- As a user, I can buy crypto with fiat (credit/debit card, wire transfer)
- As a user, I can sell crypto and withdraw to my bank account
- As a user, I can send crypto to any external wallet address
- As a user, I can receive crypto by sharing my wallet address/QR
- As a user, I can see real-time exchange rates before confirming
- As a user, I can set recurring buys (DCA - Dollar Cost Averaging)

### Charts & Market Data
- As a user, I can view interactive price charts (candlestick, line, area)
- As a user, I can apply technical indicators (RSI, MACD, MA, Bollinger Bands, etc.)
- As a user, I can draw trendlines and annotations on charts
- As a user, I can switch between timeframes (1m, 5m, 15m, 1H, 4H, 1D, 1W)
- As a user, I can see order book depth and recent trades

### Trading Signals
- As a user, I can view algorithmic trading signals (buy/sell/hold)
- As a user, I can subscribe to signal providers/strategies
- As a user, I can set up price alerts (push + email)
- As a user, I can see signal history and performance metrics (win rate, P&L)
- As a user, I can create custom signal criteria (e.g., "alert when RSI < 30 AND volume > 2x avg")

### PWA Features
- As a user, I can install the app on my mobile/desktop home screen
- As a user, I can view cached portfolio balances offline
- As a user, I receive push notifications for price alerts and completed transactions
- As a user, the app loads fast even on 3G connections

### Security
- As a user, I can whitelist withdrawal addresses
- As a user, I can set transaction limits
- As a user, I can view active sessions and revoke them
- As a user, I can enable biometric auth on supported devices

## 5. Functional Requirements

### FR-01: User Authentication
- Email/password registration with email verification
- OAuth 2.0 (Google, Apple, GitHub)
- JWT-based sessions with refresh tokens (30min access / 7d refresh)
- Device fingerprinting for fraud detection

### FR-02: Wallet Management
- Multi-currency wallet (BTC, ETH, SOL, USDT, USDC + 20+ top coins)
- Hierarchical Deterministic (HD) wallet derivation (BIP44)
- Balance caching with TTL (30s) for performance
- Transaction history with memos/tags
- QR code generation for receive addresses

### FR-03: Trading Engine
- Limit orders, market orders, and stop-loss orders
- Order book matching (internal matching engine for speed)
- Slippage protection
- Order cancellation (cancels open orders)
- Trade history export (CSV/PDF)

### FR-04: Fiat On-Ramp / Off-Ramp
- Integration with MoonPay, Stripe, or Banxa for card payments
- ACH/wire transfer support via Plaid or similar
- Withdrawal to linked bank account
- Fee transparency display before confirmation

### FR-05: Charts (TradingView Integration)
- TradingView Charting Library widget embedding
- Custom indicator library (RSI, MACD, EMA/SMA, Bollinger Bands, Ichimoku)
- Multi-timeframe support via WebSocket streaming
- Chart layout persistence (per user)
- Drawing tools (trendline, Fibonacci retracement, horizontal/vertical lines)

### FR-06: Trading Signals Engine
- **Algorithmic Signals:** Generated via server-side technical analysis scanning (runs every 1H / 4H / 1D)
- **Community Signals:** Premium users can publish signals; rated by performance
- **Signal Feed:** Real-time feed with filter by pair, type, timeframe
- **Signal Details:** Entry price, target prices, stop-loss, confidence score, rationale
- **Copy Trading:** Auto-execute signals from top-performing providers (opt-in)

### FR-07: PWA
- `manifest.json` with proper icons (192px, 512px, maskable)
- Service worker with Workbox (precache shell, runtime cache API data)
- Offline fallback page
- Push notification support (VAPID keys)
- Background sync for pending transactions
- App shortcuts (iOS Quick Actions, Android shortcuts)

### FR-08: Admin Panel
- User management (view, suspend, verify KYC)
- Transaction monitoring and manual intervention
- Signal approval/moderation queue
- Fee configuration (trading fees, withdrawal fees)
- System health dashboard (API latency, error rates, active users)

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | First Contentful Paint < 1.5s, Time to Interactive < 3s |
| **Performance** | API response < 200ms (p95) for non-blocking endpoints |
| **Availability** | 99.9% uptime (8.7h max downtime/year) |
| **Scalability** | Support 100k concurrent users at launch |
| **Security** | SOC2 compliance target, all data encrypted at rest (AES-256) and in transit (TLS 1.3) |
| **Compliance** | KYC/AML per FinCEN, FCA, and local regulations |
| **Offline** | PWA must display cached portfolio data when offline |
| **Accessibility** | WCAG 2.1 AA minimum compliance |

## 7. Constraints & Assumptions

- **Assumption:** Users have modern browsers (Chrome 90+, Safari 15+, Firefox 90+)
- **Assumption:** Third-party APIs (MoonPay, TradingView, blockchain nodes) are available and reliable
- **Constraint:** Cannot support all 10,000+ cryptocurrencies — cap at top 50 by market cap initially
- **Constraint:** Some jurisdictions restricted (NY, China, etc.) — geo-block via IP + KYC
- **Constraint:** Non-custodial features limited to reading balances via public node APIs; private keys never stored server-side

## 8. Success Metrics (KPIs)

| Metric | Target (Year 1) |
|--------|----------------|
| Registered Users | 100,000 |
| Monthly Active Traders | 20,000 |
| Total Transaction Volume | $50M |
| PWA Install Rate | 20% of mobile visitors |
| Signal Win Rate (avg) | > 60% |
| App Score (Lighthouse) | > 90 on all 4 categories |
| Support Ticket Resolution | < 4h avg |

## 9. Feature Priority Matrix

| Feature | Priority | Complexity | Timeline |
|---------|----------|------------|----------|
| User Auth & KYC | P0 | Medium | Sprint 1-2 |
| Wallet (custodial) | P0 | High | Sprint 2-4 |
| Buy/Sell Crypto | P0 | High | Sprint 3-5 |
| Charts (basic) | P1 | Medium | Sprint 4-6 |
| PWA Shell | P1 | Low | Sprint 2 |
| Portfolio Dashboard | P1 | Medium | Sprint 3-4 |
| Trading Signals | P2 | High | Sprint 6-8 |
| Non-Custodial Wallet | P2 | Medium | Sprint 7-9 |
| Copy Trading | P3 | High | Sprint 10-12 |
| Advanced Chart Tools | P3 | Medium | Sprint 8-10 |
| Mobile App (React Native) | P4 | High | Q3-Q4 |

---

**Next Document:** [02-Technical-Architecture.md](02-Technical-Architecture.md)
