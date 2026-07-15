# Chokey API

Crypto trading backend — FastAPI + PostgreSQL + Redis + Celery.

## Stack

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| Framework    | FastAPI (Python 3.12+)                      |
| Database     | PostgreSQL 16 + SQLAlchemy 2.0 (async)      |
| Migrations   | Alembic                                     |
| Cache/Queue  | Redis 7                                     |
| Task Queue   | Celery 5                                    |
| Auth         | JWT (access + refresh tokens), TOTP 2FA     |
| Matching     | In-memory price-time priority engine         |

## Quick Start

### 1. Prerequisites

- Python 3.12+
- PostgreSQL 16 running on `localhost:5432`
- Redis 7 running on `localhost:6379`

### 2. Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt   # dev dependencies
```

### 3. Environment

Copy `.env.example` to `.env` and adjust:

```bash
cp .env.example .env
# Edit .env with your database URL, secret keys, etc.
```

### 4. Database

```bash
# Create the database
createdb chokey

# Run migrations
alembic upgrade head

# Seed demo data
python -m scripts.seed_data
```

### 5. Run

```bash
# API server (http://localhost:8000)
uvicorn app.main:app --reload

# Celery worker (separate terminal)
celery -A app.celery_app worker -l info

# Celery beat for periodic tasks (separate terminal)
celery -A app.celery_app beat -l info
```

### 6. Docker (all-in-one)

```bash
docker compose up -d
```

## Project Structure

```
backend/
├── app/
│   ├── api/            # Route handlers (FastAPI routers)
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── wallets.py
│   │   ├── transactions.py
│   │   ├── orders.py
│   │   ├── market.py
│   │   ├── signals.py
│   │   ├── kyc.py
│   │   └── admin.py
│   ├── core/           # Config, security, exceptions, logging
│   ├── models/         # SQLAlchemy ORM models
│   ├── schemas/        # Pydantic request/response schemas
│   ├── services/       # Business logic (matching engine, etc.)
│   ├── ws/             # WebSocket manager + channels
│   ├── tasks/          # Celery task definitions
│   ├── main.py         # FastAPI app factory
│   └── celery_app.py   # Celery app config
├── scripts/            # Utility scripts
├── tests/              # Pytest test suite
├── alembic/            # Database migrations
├── docker-compose.yml
├── Dockerfile
├── pyproject.toml
└── requirements.txt
```

## API Docs

| Docs       | URL                          |
| ---------- | ---------------------------- |
| Swagger UI | http://localhost:8000/docs   |
| ReDoc      | http://localhost:8000/redoc  |
| OpenAPI    | http://localhost:8000/openapi.json |

## Auth Headers

Most endpoints require:
```
Authorization: Bearer <access_token>
```

For 2FA-protected endpoints:
```
X-2FA-Code: <totp_code>
```

## Testing

```bash
# Install test deps
pip install -r requirements-dev.txt

# Run all tests
pytest

# With coverage
pytest --cov=app --cov-report=term-missing

# Specific test file
pytest tests/test_auth.py -v
```

## Scripts

```bash
# Seed demo data (creates users, assets, wallets, prices, signals)
python -m scripts.seed_data

# Drop + re-seed
python -m scripts.seed_data --drop

# Create an admin user
python -m scripts.create_admin --email admin@example.com --password "SecurePass123!"

# Generate historical candle data for charts
python -m scripts.generate_candles --symbols BTC,ETH,SOL --days 365 --interval 1h
```

## Environment Variables

| Variable                    | Default                          | Description                  |
| --------------------------- | -------------------------------- | ---------------------------- |
| `DATABASE_URL`              | `postgresql+asyncpg://...`       | PostgreSQL connection string |
| `REDIS_URL`                 | `redis://localhost:6379/0`       | Redis connection string      |
| `JWT_SECRET_KEY`            | _(auto-generated in .env)_       | JWT signing key              |
| `JWT_ACCESS_EXPIRE_MINUTES` | `30`                             | Access token TTL             |
| `JWT_REFRESH_EXPIRE_DAYS`   | `7`                              | Refresh token TTL            |
| `DEBUG`                     | `false`                          | Debug mode (SQL echo, etc.)  |

## License

MIT
