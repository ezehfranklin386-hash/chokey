# Chokey

Production-grade crypto wallet & trading platform with real-time signals, order matching engine, and WebSocket streaming.

**Stack:** FastAPI + PostgreSQL + Redis + Celery (backend) · React 19 + TypeScript + Tailwind (frontend)

---

## Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- OR Python 3.12+ / Node.js 20+ (local dev)

### Docker (full stack, one command)

```bash
cd backend
cp .env.example .env          # review defaults first
docker compose up -d          # starts everything: DB, Redis, API (×3), Celery, frontend
docker compose logs -f        # watch all services come up
```

Services:
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API (load-balanced) | http://localhost/api/v1 |
| API (direct) | http://localhost:8000/docs |
| Metrics | http://localhost:8000/metrics |
| Health | http://localhost:8000/health |

### Local Dev (without Docker)

**Backend:**

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Start Postgres & Redis separately, then:
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev                    # starts on :5173, proxies /api → :8000
```

---

## Architecture

```
                              Browser
                                │
                    ┌───────────┴───────────┐
                    │   Vite Proxy / Nginx  │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                  ▼
         ╔══════════╗    ╔══════════╗     ╔══════════╗
         ║  app 1   ║    ║  app 2   ║     ║  app 3   ║   ← 3× FastAPI, stateless
         ╚══════════╝    ╚══════════╝     ╚══════════╝
              │                 │                  │
              └─────────────────┼──────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
              ╔════════════╗         ╔═══════════╗
              ║  PgBouncer ║         ║   Redis   ║   ← connection pooler + cache/queue
              ╚════════════╝         ╚═══════════╝
                    │                       │
                    ▼                       ▼
              ╔════════════╗         ╔═══════════════╗
              ║ PostgreSQL ║         ║  Celery Workers║  ← async tasks + beat scheduler
              ╚════════════╝         ╚═══════════════╝
```

### Key Design Decisions

- **Stateless API**: All instances share Redis pub/sub for WebSocket and order matching. No sticky sessions needed.
- **Matching Engine**: Redis-backed Lua script for atomic order matching across instances. Falls back to in-memory when Redis is down.
- **Read Replicas**: `get_db_read()` dependency automatically uses a read replica when `DATABASE_READ_URL` is configured.
- **Caching**: Centralized cache-aside pattern in `app/core/cache.py`. Prices (30s), candles (60s), wallets (30s), signals (2m).
- **Pagination**: Cursor-based for user-facing lists (orders, trades, transactions); offset-based retained for admin/reports.

---

## Project Layout

```
backend/
├── app/
│   ├── api/v1/           # Route handlers
│   ├── core/             # Exceptions, logging, cache, pagination
│   ├── models/           # SQLAlchemy ORM models
│   ├── services/         # Business logic
│   ├── tasks/            # Celery workers (price_feed, signal_generator, email, cleanup)
│   └── ws/               # WebSocket manager (Redis pub/sub)
├── alembic/versions/     # Database migrations
├── scripts/              # Seed data, admin creation, candle generation
└── docker-compose.yml    # Full stack orchestration

frontend/
├── src/
│   ├── app/              # Router, providers, layouts
│   ├── shared/           # UI kit, API client, i18n, hooks
│   ├── pages/            # Route page components
│   ├── features/         # Domain-specific widgets
│   └── widgets/          # Composable UI blocks
└── tests/                # E2E + PWA tests (Playwright)
```

---

## API Conventions

All responses use the **JSEND** envelope:

```json
{
  "status": "success",
  "data": { ... }
}

{
  "status": "error",
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Available: 0.5, needed: 1.0"
  }
}
```

Authentication: Bearer JWT in `Authorization` header. Access tokens expire in 30 min, refresh tokens in 7 days.

---

## Environment Variables

Key config in `backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://chokey:chokey@localhost:5432/chokey` | Primary DB |
| `REDIS_URL` | `redis://localhost:6379/0` | Cache & broker |
| `SECRET_KEY` | — | JWT signing key (generate a long random one) |
| `SENTRY_DSN` | — | Error tracking (optional) |
| `AWS_ACCESS_KEY_ID` | — | S3 file uploads (optional) |
| `RUN_MIGRATIONS` | `false` | Set `true` in prod to skip `create_all` fallback |

---

## Deployment

### Render

```bash
# render.yaml is pre-configured for Render Blueprint
# https://render.com/docs/blueprint-spec
# Deploys: API (gunicorn), Celery Worker, Celery Beat, PostgreSQL, Redis
```

### Docker

```bash
docker build -t chokey-api ./backend
docker run -p 8000:8000 --env-file .env chokey-api
```

---

## Testing

```bash
# Backend
cd backend && pytest -v --cov=app

# Frontend
cd frontend && npm run test          # Vitest unit tests
cd frontend && npx playwright test    # E2E tests
```

---

## License

MIT
