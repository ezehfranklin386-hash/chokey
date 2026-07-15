# Python Backend Build Plan — Crypto Wallet Platform

**Date:** 2026-07-13
**Stack:** Python 3.12+ · FastAPI · PostgreSQL 16 · Redis 7 · WebSocket · JWT · Docker

---

## Overview

A 13-phase plan to build a production-grade Python/async backend for the crypto wallet platform. The frontend (`frontend/`) is already built — this backend serves as the real API layer to replace the demo mocks.

The original architecture docs (Node.js/Express/Prisma) have been adapted to Python with FastAPI + SQLAlchemy 2.0 + Alembic, keeping the same database schema and API spec.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      API LAYER                                │
│  FastAPI (Uvicorn) · ASGI · Async/await everywhere            │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐ ┌────────┐ │
│  │ Auth    │ │ Wallet   │ │ Trading│ │ Signals │ │ Admin  │ │
│  │ Module  │ │ Module   │ │ Module │ │ Module  │ │ Module │ │
│  └────┬────┘ └────┬─────┘ └───┬────┘ └────┬────┘ └───┬────┘ │
│       │           │           │           │           │      │
│  ┌────┴───────────┴───────────┴───────────┴───────────┴────┐ │
│  │              MIDDLEWARE STACK                             │ │
│  │  Rate Limit · Auth · CORS · Logging · Error Handler      │ │
│  └──────────────────────────────────────────────────────────┘ │
├──────────┬──────────────┬──────────────┬──────────────────────┤
│          │              │              │                      │
│   ┌──────▼──────┐ ┌────▼─────┐  ┌─────▼──────┐  ┌───────────▼┐
│   │ PostgreSQL  │ │  Redis   │  │ Celery     │  │ External  │
│   │ SQLAlchemy  │ │  Cache   │  │ Worker     │  │ Service   │
│   │ Alembic     │ │  Pub/Sub │  │ (async)    │  │ Clients   │
│   └─────────────┘ └──────────┘  └────────────┘  └────────────┘
└──────────────────────────────────────────────────────────────┘
```

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Web Framework | **FastAPI** | Async-native, auto OpenAPI docs, Pydantic validation, fastest Python option |
| ASGI Server | **Uvicorn** | Industry standard, HTTP/1.1 + WebSocket, hot reload |
| ORM | **SQLAlchemy 2.0** | Async queries, mature ecosystem, Alembic migrations |
| Validation | **Pydantic v2** | Built into FastAPI, Rust-core, fast |
| DB Driver | **asyncpg** | Fastest async PostgreSQL driver for Python |
| Migrations | **Alembic** | SQLAlchemy-native, auto-generation |
| Cache | **Redis + redis-py** | Session cache, rate limiting, pub/sub, price cache |
| Task Queue | **Celery** (or **ARQ** for pure async) | Background tasks, scheduled jobs |
| Auth | **python-jose** + **passlib[bcrypt]** | JWT creation/verification, bcrypt hashing |
| WebSocket | **FastAPI WebSocket** | Built-in, same route table as REST |
| Testing | **pytest** + **httpx** + **pytest-asyncio** | Async test support |
| Container | **Docker** + **docker-compose** | Dev/prod parity, multi-service orchestration |
| Monitoring | **Prometheus** + **Grafana** via FastAPI middleware | Request metrics, custom business metrics |

---

## Directory Structure

```
backend/
├── alembic/                  # DB migrations
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI app factory, lifespan, middleware
│   ├── config.py             # Settings via pydantic-settings
│   ├── database.py           # Engine, SessionLocal, Base, get_db
│   ├── redis.py              # Redis client + connection pool
│   │
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── wallet.py
│   │   ├── transaction.py
│   │   ├── order.py
│   │   ├── signal.py
│   │   ├── market.py
│   │   ├── kyc.py
│   │   ├── notification.py
│   │   └── audit.py
│   │
│   ├── schemas/              # Pydantic request/response models
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── wallet.py
│   │   ├── transaction.py
│   │   ├── order.py
│   │   ├── signal.py
│   │   ├── market.py
│   │   ├── kyc.py
│   │   └── common.py         # Pagination, error, envelope
│   │
│   ├── api/                  # Route handlers
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py     # Aggregate all v1 routers
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── wallets.py
│   │   │   ├── transactions.py
│   │   │   ├── orders.py
│   │   │   ├── market.py
│   │   │   ├── signals.py
│   │   │   ├── kyc.py
│   │   │   ├── admin.py
│   │   │   └── webhooks.py
│   │   └── deps.py           # Dependency injection (get_current_user, etc.)
│   │
│   ├── services/             # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── wallet_service.py
│   │   ├── transaction_service.py
│   │   ├── order_service.py
│   │   ├── matching_engine.py
│   │   ├── signal_service.py
│   │   ├── market_service.py
│   │   ├── kyc_service.py
│   │   └── notification_service.py
│   │
│   ├── ws/                   # WebSocket handlers
│   │   ├── __init__.py
│   │   ├── manager.py        # Connection manager, rooms
│   │   ├── prices.py         # Real-time price feed
│   │   ├── orders.py         # Order status updates
│   │   ├── balances.py       # Balance updates
│   │   └── signals.py        # Signal updates
│   │
│   ├── core/                 # Cross-cutting concerns
│   │   ├── __init__.py
│   │   ├── security.py       # JWT, password hashing, 2FA
│   │   ├── rate_limit.py     # Redis-backed rate limiter
│   │   ├── middleware.py     # CORS, logging, error handling
│   │   ├── exceptions.py     # Custom exception classes
│   │   └── logging.py        # Structured logging config
│   │
│   └── tasks/                # Celery/background tasks
│       ├── __init__.py
│       ├── celery_app.py
│       ├── signal_generator.py
│       ├── price_feed.py
│       ├── email_tasks.py
│       └── cleanup.py
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py           # Fixtures: DB, client, auth headers
│   ├── test_auth.py
│   ├── test_wallets.py
│   ├── test_orders.py
│   ├── test_signals.py
│   ├── test_market.py
│   ├── test_kyc.py
│   └── test_ws.py
│
├── scripts/
│   ├── seed_data.py          # Seed demo data
│   ├── create_admin.py       # Create initial admin
│   └── generate_candles.py   # Generate historical candle data
│
├── Dockerfile
├── docker-compose.yml         # app + postgres + redis + celery
├── requirements.txt
├── requirements-dev.txt
├── pyproject.toml
├── .env.example
├── .env
└── README.md
```

---

## Phase Breakdown

### Phase 0: Project Scaffold & Tooling (Days 1–2)

**Goal:** Working FastAPI app with hot reload, database connection, Docker compose.

- [ ] Initialize `backend/` with `pyproject.toml`, `requirements.txt`
- [ ] Pin Python 3.12+ in Dockerfile (slim-bullseye base)
- [ ] FastAPI app factory with lifespan context manager
- [ ] `pydantic-settings` config from `.env` (DB_URL, REDIS_URL, JWT_SECRET, etc.)
- [ ] SQLAlchemy async engine + session factory + `Base`
- [ ] Alembic setup with async migration support
- [ ] Redis connection pool via `redis.asyncio`
- [ ] `docker-compose.yml`: app, postgres:16, redis:7, celery worker
- [ ] Health check endpoint `GET /health`
- [ ] Structured logging with structlog or loguru
- [ ] CORS middleware for `frontend/` dev server
- [ ] Global exception handler → JSEND error responses
- [ ] Auto-generated OpenAPI docs at `/docs`

**Deliverables:** `docker compose up` starts a working API at `localhost:8000/docs`

---

### Phase 1: Database Models (Days 2–4)

**Goal:** All SQLAlchemy async models matching the Prisma schema from docs.

Models to create (one file per domain in `app/models/`):

| File | Key Models |
|------|-----------|
| `user.py` | User, Session, ApiKey, UserSettings |
| `wallet.py` | Asset, Wallet, WalletAddress |
| `transaction.py` | Transaction |
| `order.py` | Order, Trade, OrderBook |
| `market.py` | MarketPrice, Candle |
| `signal.py` | Signal, SignalPerformance, SignalSubscription |
| `kyc.py` | KycDocument |
| `notification.py` | Notification |
| `audit.py` | AuditLog |

Each model includes:
- UUID primary keys
- Indexed foreign keys + composite indexes per `03-Database-Schema.md`
- `created_at`/`updated_at` convention (not `createdAt` — Python style)
- `__tablename__` with snake_case mapping

**Deliverables:** Alembic initial migration creates all tables with indexes.

---

### Phase 2: Auth System (Days 4–7)

**Goal:** Full auth: register, login, 2FA, refresh, logout, password reset.

#### Schema Layer (`app/schemas/auth.py`)
- `RegisterRequest`, `LoginRequest`, `TokenResponse`, `RefreshRequest`
- `TwoFactorRequest`, `TwoFactorVerifyRequest`
- `ForgotPasswordRequest`, `ResetPasswordRequest`

#### Service Layer (`app/services/auth_service.py`)
- `hash_password()` / `verify_password()` — passlib bcrypt (cost 12)
- `create_access_token()` — JWT with `sub`, `role`, `session_id`, `jti` (30 min)
- `create_refresh_token()` — JWT (7 day), stored as SHA-256 in DB
- `rotate_refresh_token()` — invalidate old, issue new (refresh token rotation)
- `verify_2fa()` — TOTP via `pyotp`
- `generate_2fa_secret()` / `get_2fa_provisioning_uri()`
- `check_password_pwned()` — async K-anonymity call to haveibeenpwned API

#### API Routes (`app/api/v1/auth.py`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | New user (email verification sent) |
| POST | `/auth/login` | Email + password → tokens (or 2FA temp token) |
| POST | `/auth/2fa/verify` | Complete 2FA login |
| POST | `/auth/refresh` | Rotate refresh token → new tokens |
| POST | `/auth/logout` | Revoke refresh token + session |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset with token |
| GET | `/auth/me` | Current user profile |
| PUT | `/auth/me` | Update profile |
| POST | `/auth/2fa/setup` | Enable 2FA (returns secret + QR URI) |
| POST | `/auth/2fa/confirm` | Confirm 2FA setup with code |
| POST | `/auth/2fa/disable` | Disable 2FA |

#### Security Measures
- Rate limit: 5 req/min/IP on login, 2 req/min on forgot-password
- Device fingerprint stored with sessions
- Known device tracking + email alerts on new device login
- Audit logs: LOGIN, LOGOUT, LOGIN_FAILED, 2FA_ENABLED, etc.
- JWT blacklist in Redis on logout

**Transitions to handle:**
| State | Behavior |
|-------|----------|
| Invalid credentials | 401, audit log, rate limiter counts attempt |
| Account locked | 403 with `ACCOUNT_LOCKED`, show lock reason |
| 2FA required but not set up | Allow login, flag in response to prompt setup |
| Expired refresh token | 401, force re-login |
| Refresh token reuse | Revoke all sessions for user (token theft detection) |
| Email not verified | Return profile with `emailVerified: false`, restrict sensitive actions |

---

### Phase 3: User Profile & Settings (Days 7–8)

**Goal:** Profile management, settings, API keys, sessions management.

- `GET/PUT /users/me` — Profile CRUD
- `GET/PUT /users/me/settings` — Language, currency, theme, notifications
- `GET /users/me/sessions` → list active sessions
- `DELETE /users/me/sessions/{id}` → revoke session
- `POST /users/me/sessions/revoke-all` → revoke all except current
- `GET/POST/DELETE /users/me/api-keys` — API key management
  - Key prefix + SHA-256 hash storage
  - Last used tracking
  - Permission scopes: `read`, `trade`, `withdraw`

---

### Phase 4: Wallet Engine (Days 8–11)

**Goal:** Wallet CRUD, balance management, deposit/withdrawal flow.

#### Domain Logic
- `GET /wallets` — All user wallets with balances
- `GET /wallets/{id}` — Single wallet detail
- `GET /wallets/{id}/addresses` — Deposit addresses
- `POST /wallets/{id}/addresses` — Generate new deposit address
- `POST /transactions/deposit` — Simulated deposit (or from webhook)
- `POST /transactions/withdraw` — Withdrawal with security checks
  - Check whitelist (if enabled)
  - Check daily/monthly limits
  - Check 2FA confirmation
  - Create pending transaction → admin approval if above threshold

#### Balance Calculation
- Wallets have `balance`, `locked_balance` columns
- `available = balance - locked_balance`
- Locked balance updated on order creation/cancellation
- Balance updated on trade fill or deposit confirmation

#### Transitions
| State | Behavior |
|-------|----------|
| Zero balance wallet | Show with $0, allow deposit |
| Insufficient balance for withdrawal | 422 `INSUFFICIENT_BALANCE` |
| Withdrawal above daily limit | 422 or prompt for 2FA confirmation |
| Address not whitelisted | 403 if whitelist enforcement enabled |

---

### Phase 5: Transaction System (Days 11–13)

**Goal:** Full transaction history, filtering, pagination.

- `GET /transactions` — Paginated, filterable by type/status/asset/date range
  - Cursor-based pagination (cursor from `created_at` + `id`)
- `GET /transactions/{id}` — Detail with blockchain confirmations if applicable
- Transaction status flow:

```
PENDING → PROCESSING → CONFIRMED (success)
  ↓           ↓
CANCELLED    FAILED → REFUNDED (if applicable)
```

- Auto-cancel pending deposits after 24h (Celery task)
- WebSocket push on status changes

---

### Phase 6: Trading Engine (Days 13–17)

**Goal:** Order creation, matching engine, order book, trade history.

#### Core Trading Flow
1. User places order → validate balance (lock funds)
2. Market orders match immediately at best bid/ask
3. Limit orders enter order book → wait for match
4. Stop-limit/stop-loss trigger when market price crosses stop price
5. Matched orders → create Trade records → update balances → emit WebSocket

#### API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/orders` | Place order (market/limit/stop) |
| GET | `/orders` | List orders (filterable by status) |
| GET | `/orders/{id}` | Order detail |
| DELETE | `/orders/{id}` | Cancel open order |
| GET | `/trades` | Trade history |
| GET | `/market/orderbook/{asset}` | Order book snapshot (bids/asks aggregated) |
| GET | `/market/trades/{asset}` | Recent public trades |

#### Matching Engine (`app/services/matching_engine.py`)
- In-memory order books per trading pair (loaded from DB on startup)
- Price-time priority matching
- Partial fill support
- Order types: MARKET, LIMIT, STOP_LIMIT, STOP_LOSS, TAKE_PROFIT
- TIF: GTC (Good-Till-Cancelled), IOC (Immediate-Or-Cancel), FOK (Fill-Or-Kill)

#### WebSocket Channels
- `orders:{userId}` — Order status updates
- `trades:{asset}` — New public trades
- `orderbook:{asset}` — Order book diff updates (every 100ms)

#### Transitions
| State | Behavior |
|-------|----------|
| Insufficient balance | 422, no funds locked |
| Market order with no liquidity | Partial fill or reject |
| Stop order at wrong price | Accepted, waits for trigger |
| Cancel already-filled order | 404, order already final |
| Post-only order would match | Rejected |

---

### Phase 7: Market Data (Days 17–19)

**Goal:** Price feeds, candles, market overview, search.

#### Data Sources
- **Primary:** CoinGecko API (free tier for initial dev)
- **Caching:** Redis with 5s TTL for prices, 5m for candles
- **Fallback:** Scheduled Celery task polls every 30s, stores in DB

#### API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/market/prices` | All current prices (top ~100 assets) |
| GET | `/market/prices/{asset}` | Single asset price + 24h stats |
| GET | `/market/candles/{asset}` | OHLCV data (interval: 1m–1w) |
| GET | `/market/search?q=` | Asset search by symbol/name |
| GET | `/market/assets` | List all supported assets |

#### Candle Aggregation
- Raw trade data → 1m candles → rolled up to higher timeframes
- Stored in `candles` table with `(asset_id, interval, open_time)` unique constraint
- Celery task: roll up candles every minute

#### WebSocket Channels
- `prices` — Full price feed (all assets, every 1s)
- `prices:{asset}` — Single asset price updates

---

### Phase 8: Signals Engine (Days 19–22)

**Goal:** Signal generation, distribution, subscription, performance tracking.

#### Signal Types
1. **Technical Algo** — Generated by Celery task running TA indicators
2. **Community** — User-submitted signals (with approval workflow)
3. **Premium Provider** — Vetted signal providers with subscriptions

#### Algorithmic Signal Generation (`app/tasks/signal_generator.py`)
- Run every hour on major pairs
- Indicators: RSI, MACD, SMA/EMA crossovers, Bollinger Bands, Volume
- `ta` library or `pandas-ta` for calculations
- Scoring system: 0–100 confidence based on indicator agreement
- Direction: STRONG_BUY / BUY / NEUTRAL / SELL / STRONG_SELL

#### API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/signals` | Feed (filterable by asset/direction/type) |
| GET | `/signals/{id}` | Signal detail + performance |
| POST | `/signals` | Create community signal (if enabled) |
| POST | `/signals/{id}/subscribe` | Subscribe to premium signal |
| DELETE | `/signals/{id}/subscribe` | Unsubscribe |
| POST | `/signals/{id}/bookmark` | Bookmark signal |
| GET | `/signals/providers` | List signal providers |
| GET | `/signals/providers/{id}` | Provider profile with stats |

#### Transitions
| State | Behavior |
|-------|----------|
| No active signals | Return empty list, no error |
| Signal target hit | Auto-update status to TARGET_HIT, notify subscribers |
| Signal expired | Auto-close after configured timeframe |
| Premium signal not subscribed | Show preview only, mask full rationale |

---

### Phase 9: KYC & Compliance (Days 22–24)

**Goal:** Document upload, verification workflow, compliance checks.

- `POST /kyc/submit` — Upload document (base64 or presigned S3 URL)
- `GET /kyc/status` — Current KYC level and pending submissions
- `GET /kyc/documents` — List submitted documents with status
- Admin endpoints: `GET /admin/kyc/pending`, `POST /admin/kyc/{id}/approve|reject`

#### Verification Flow
```
User submits → PENDING → Admin review → APPROVED or REJECTED
                                          ↓
                                    KYC level upgraded
                                          ↓
                              Unlock higher deposit/withdrawal limits
```

- File storage: Local disk (dev) or S3-compatible (prod) via `boto3` / `s3fs`
- File hash stored for integrity verification
- KYC level gates: NONE → BASIC (email) → VERIFIED (ID) → ADVANCED (address)

---

### Phase 10: Notifications & Alerts (Days 24–26)

**Goal:** In-app notifications, push, email, price alerts.

- `GET /notifications` — Paginated notification history
- `PUT /notifications/{id}/read` — Mark as read
- `PUT /notifications/read-all` — Mark all as read
- `GET/POST/PUT/DELETE /alerts` — Price alert CRUD
- `POST /alerts/{id}/test` — Test trigger notification

#### Price Alert Engine (Celery)
- Check active alerts every 60s
- Compare current price to alert condition
- Triggered → create Notification → send push/email
- Cooldown period prevents re-trigger

#### Notification Types
- Email: SendGrid / Mailgun via Celery task
- Push: Web Push API (PWA) or Firebase Cloud Messaging
- In-app: Stored in DB, fetched via REST, real-time via WebSocket

---

### Phase 11: WebSocket Infrastructure (Phase 2–10, finalized Days 26–28)

**Goal:** Real-time data for prices, orders, balances, signals.

#### Connection Manager (`app/ws/manager.py`)
- Track connected clients per user
- Room-based pub/sub (users join `user:{userId}`, prices room, etc.)
- Redis pub/sub for cross-worker broadcasting (scales to multiple app instances)
- Heartbeat every 30s, disconnect stale connections after 60s

#### Channels

| Channel | Data | Frequency |
|---------|------|-----------|
| `prices` | All asset prices | 1s |
| `prices:{asset}` | Single asset price | 1s |
| `user:{userId}:orders` | Order status changes | Event-driven |
| `user:{userId}:balances` | Balance updates | Event-driven |
| `user:{userId}:notifications` | New notifications | Event-driven |
| `orderbook:{asset}` | Order book depth | 100ms diff updates |
| `trades:{asset}` | Recent trades | Event-driven |
| `signals:{asset}` | New signals | Event-driven |

#### Auth Flow
- Client sends `Authorization: Bearer <token>` on connect
- Server validates JWT, subscribes to user-specific channels
- Public channels (prices, orderbook) available without auth

---

### Phase 12: Admin Panel API (Days 28–30)

**Goal:** Admin endpoints for user management, system config, monitoring.

- `GET /admin/users` — List users (filterable by KYC level, role, active)
- `GET /admin/users/{id}` — User detail with all relations
- `PUT /admin/users/{id}` — Update user (role, KYC level, lock/unlock)
- `GET /admin/transactions` — All transactions (admin view)
- `GET /admin/orders` — All orders
- `GET /admin/kyc/pending` — Pending KYC documents
- `POST /admin/kyc/{id}/approve` — Approve KYC document
- `POST /admin/kyc/{id}/reject` — Reject with reason
- `GET/PUT /admin/settings` — System configuration
- `GET /admin/stats` — Dashboard stats (users, volume, signals)

Role-based access: `ADMIN` and `SUPER_ADMIN` levels.

---

### Phase 13: Testing & Deployment (Days 30–33)

**Goal:** Comprehensive test suite, Docker production config, deployment.

#### Testing Strategy
- **Unit tests:** Services with mocked DB/Redis
- **Integration tests:** FastAPI TestClient with test DB (SQLite async or test PostgreSQL)
- **API tests:** httpx async client against full app
- **Fixtures:** `conftest.py` with DB session override, auth headers, seed data

#### Test Targets
| Layer | Coverage Goal |
|-------|--------------|
| Services | All happy paths, error paths, edge cases |
| API routes | All status codes, validation errors, auth failures |
| Matching engine | Fill, partial fill, reject, cancel scenarios |
| WebSocket | Connect, auth, subscribe, receive message |
| Security | SQL injection attempts, XSS, rate limiting |

#### Docker Production Configuration
- `Dockerfile` multi-stage: builder (dev) → runner (slim)
- `docker-compose.prod.yml`: app (gunicorn + uvicorn workers), postgres, redis, celery
- Health checks on all services
- `.env.production` template with all secrets marked

#### CI/CD
- GitHub Actions: `backend.yml` workflow
  - `pytest` with coverage
  - Ruff linting + formatting check
  - Build and push Docker image
  - Deploy to fly.io / Railway / AWS ECS

---

## Database Migration Strategy

```bash
# Create migration
alembic revision --autogenerate -m "add wallet table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

All migrations committed to version control. Never edit existing migrations in prod.

---

## API Response Envelope

All responses follow JSEND format (matching the frontend expectation):

```python
# app/schemas/common.py
from pydantic import BaseModel
from typing import Generic, TypeVar

T = TypeVar("T")

class SuccessResponse(BaseModel, Generic[T]):
    status: str = "success"
    data: T
    meta: Optional[dict] = None

class ErrorResponse(BaseModel):
    status: str = "error"
    error: ErrorDetail

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None
```

Helper in `app/core/exceptions.py`:

```python
class AppException(Exception):
    def __init__(self, status_code: int, code: str, message: str, details: dict = None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details
```

---

## Environment Variables

```
# .env.example
APP_NAME=Chokey API
DEBUG=true
SECRET_KEY=generate-a-random-64-char-string
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/chokey
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_ACCESS_EXPIRE_MINUTES=30
JWT_REFRESH_EXPIRE_DAYS=7
JWT_ALGORITHM=HS256

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_GLOBAL=300
RATE_LIMIT_AUTH=5

# External APIs
COINGECKO_API_URL=https://api.coingecko.com/api/v3
SENDGRID_API_KEY=
S3_BUCKET=
S3_REGION=

# Admin
ADMIN_EMAIL=admin@chokey.app
```

---

## Dependencies Summary

```txt
# requirements.txt
fastapi==0.115.*
uvicorn[standard]==0.30.*
sqlalchemy[asyncio]==2.0.*
asyncpg==0.29.*
alembic==1.13.*
redis[hiredis]==5.1.*
pydantic==2.8.*
pydantic-settings==2.3.*
python-jose[cryptography]==3.3.*
passlib[bcrypt]==1.7.*
python-multipart==0.0.*
pyotp==2.9.*
qrcode[pil]==7.4.*
httpx==0.27.*
celery[redis]==5.4.*
pandas-ta==0.3.*b
structlog==24.*
tenacity==9.*
sentry-sdk[fastapi]==2.*
```

```txt
# requirements-dev.txt
pytest==8.*
pytest-asyncio==0.24.*
httpx==0.27.*
ruff==0.5.*
factory-boy==3.3.*
faker==27.*
```

---

## Files NOT to Generate (Frontend-owned)

The frontend already handles these — the backend just serves data:

- UI components (shared/ui/*)
- Layout components (widgets/layout/*)
- Pages and routing
- PWA service worker
- i18n locale files
- Demo mock data files

---

## Resource Estimates

| Phase | Effort | Files Created | Key Risk |
|-------|--------|---------------|----------|
| 0: Scaffold | 2 days | ~15 | Docker setup |
| 1: Models | 2 days | ~15 | Getting async SQLAlchemy right |
| 2: Auth | 3 days | ~8 | Security review needed |
| 3: Profile | 1 day | ~5 | Straightforward CRUD |
| 4: Wallet | 3 days | ~6 | Balance accuracy critical |
| 5: Transactions | 2 days | ~4 | Cursor pagination |
| 6: Trading | 4 days | ~8 | Matching engine correctness |
| 7: Market | 2 days | ~5 | External API reliability |
| 8: Signals | 3 days | ~6 | TA indicator quality |
| 9: KYC | 2 days | ~4 | File storage + compliance |
| 10: Notifications | 2 days | ~5 | Email deliverability |
| 11: WebSocket | 2 days | ~3 | Connection stability |
| 12: Admin | 2 days | ~3 | Permission enforcement |
| 13: Testing/Deploy | 3 days | ~10 | CI config |

**Total:** ~33 days (~6.5 weeks) for a single developer.

---

## Next Steps

1. **Phase 0:** Run `docker compose up` with FastAPI + PostgreSQL + Redis
2. **Phase 1:** Define all SQLAlchemy models, run `alembic upgrade head`
3. **Phase 2:** Implement JWT auth with login/register endpoints
4. **Verify:** Point frontend at `VITE_API_URL=http://localhost:8000/api/v1`
