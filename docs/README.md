# Chokey — Crypto Wallet Webapp / PWA

**Documentation Index**

A comprehensive crypto wallet progressive web application with trading, signals, and charting capabilities.

---

## Document Index

| # | Document | Description | Lines |
|---|----------|-------------|-------|
| 01 | [01-PRD.md](./01-PRD.md) | Product Requirements Document | 189 |
| 02 | [02-Technical-Architecture.md](./02-Technical-Architecture.md) | System Architecture & Tech Stack | 447 |
| 03 | [03-Database-Schema.md](./03-Database-Schema.md) | Prisma Schema, Indexes, Partitioning | 848 |
| 04 | [04-API-Specification.md](./04-API-Specification.md) | REST & WebSocket API Specifications | 1,095 |
| 05 | [05-Frontend-Architecture.md](./05-Frontend-Architecture.md) | React Frontend Architecture | 696 |
| 06 | [06-Security-Compliance.md](./06-Security-Compliance.md) | Security & Compliance Framework | 533 |
| 07 | [07-Signals-Charts-Architecture.md](./07-Signals-Charts-Architecture.md) | Trading Signals & Charts | 693 |
| 08 | [08-PWA-Implementation-Guide.md](./08-PWA-Implementation-Guide.md) | PWA Implementation | 874 |
| 09 | [09-Implementation-Plan.md](./09-Implementation-Plan.md) | Implementation Plan & Timeline | 499 |
| 10 | [10-Design-System.md](./10-Design-System.md) | Design System & UI/UX Reference | ~540 |

**Total documentation:** ~6,414 lines across 11 files

---

## Quick Start

```bash
# Frontend
cd client
npm install
npm run dev

# Backend
cd server
npm install
npx prisma migrate dev
npm run dev

# Redis (required for queues, sessions, caching)
docker run -d -p 6379:6379 redis:7-alpine

# PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine
```

---

## Architecture Overview

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   PWA        │◄────►│  Express API  │◄────►│  PostgreSQL  │
│  (React)     │  WS  │  (Node.js)   │      │  (Primary)   │
│              │      │              │      │              │
│  Tailwind    │      │  Bull Queue  │◄────►│  Redis 7     │
│  Zustand     │      │  Socket.io   │      │  (Cache/Q)   │
│  TradingView │      │  Passport.js │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
```

---

## Key Features

- **Multi-currency wallet** — BTC, ETH, SOL, USDT, and more
- **Spot trading** — Limit & market orders with real-time order book
- **Advanced charts** — TradingView Charting Library integration
- **Trading signals** — 13 algorithmic strategies with confidence scoring
- **PWA** — Offline support, push notifications, installable
- **Security** — 2FA, multi-sig withdrawals, AES-256-GCM encryption
- **KYC/AML** — Tiered verification (4 levels)

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Dark Blue | `#0A0E27` → `#1C2554` | Backgrounds (layered depth) |
| Golden Yellow | `#D4A843` → `#ECD17D` | Primary accent & CTAs |
| White | `#FFFFFF` → `#B3B5C2` | Text hierarchy |

---

**Design inspiration:** Bybit Trading Platform
**Generated:** 2026-07-06
