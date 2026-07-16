# Deployment Guide

Production deployment targets **Render** (backend API, workers, DB, Redis) with optional **Docker Hub** as a container registry fallback.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Render Setup (Recommended)](#render-setup-recommended)
- [GitHub Secrets](#github-secrets)
- [CI/CD Pipeline](#cicd-pipeline)
- [Docker Hub Deployment](#docker-hub-deployment)
- [Production Environment Variables](#production-environment-variables)
- [Pre-Deploy Checklist](#pre-deploy-checklist)
- [Post-Deploy Verification](#post-deploy-verification)
- [Rollback](#rollback)
- [Monitoring & Alerts](#monitoring--alerts)

---

## Prerequisites

- **Render account** — [render.com](https://render.com) (free tier sufficient for staging)
- **GitHub account** — repository with `main` branch
- **Docker Hub account** — optional, for container registry fallback
- **Sentry account** — optional, for error tracking
- **SendGrid account** — optional, for email sending
- **AWS account** — optional, for S3 file uploads (KYC documents)

---

## Render Setup (Recommended)

The repository ships with a `backend/render.yaml` [Blueprint](https://render.com/docs/blueprint-spec) that defines the full stack.

### One-Click Deploy (Blueprint)

1. Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints)
2. Connect your GitHub repo
3. Render auto-detects `render.yaml` in `backend/`
4. Click **Apply** — it provisions:
   - `chokey-api` — web service (gunicorn + uvicorn)
   - `chokey-worker` — Celery worker (background tasks)
   - `chokey-beat` — Celery Beat (scheduled tasks)
   - `chokey-db` — PostgreSQL (free, 256MB)
   - `chokey-redis` — Redis (free, 25MB)

### Manual Setup (per service)

If the Blueprint doesn't work, create each service manually:

**Web Service (chokey-api):**
| Setting | Value |
|---------|-------|
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `bash start.sh` |
| Health Check Path | `/health` |
| Plan | Free (or Starter for production) |

**Worker (chokey-worker):**
| Setting | Value |
|---------|-------|
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `celery -A app.tasks.celery_app worker --concurrency=2 --loglevel=info --max-tasks-per-child=100` |

**Worker (chokey-beat):**
| Setting | Value |
|---------|-------|
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `celery -A app.tasks.celery_app beat --loglevel=info` |

### Environment Variables (all services)

After provisioning, set the following in the Render dashboard (or via render.yaml):

| Variable | Source | Required |
|----------|--------|----------|
| `SECRET_KEY` | Generate a 64-char random string | ✅ |
| `DATABASE_URL` | From Render PostgreSQL (internal) | ✅ |
| `REDIS_URL` | From Render Redis (internal) | ✅ |
| `ALLOWED_ORIGINS` | Your frontend URL(s) | ✅ |
| `SENTRY_DSN` | Sentry project DSN | optional |
| `SENDGRID_API_KEY` | SendGrid API key | optional |
| `AWS_ACCESS_KEY_ID` | AWS IAM user | optional |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret | optional |
| `S3_BUCKET` | S3 bucket name | optional |
| `S3_REGION` | e.g. `us-east-1` | optional |

> **Important**: The free Render PostgreSQL provides an `internal` connection string that uses `postgresql://`. The app's `async_database_url` property auto-converts it to `postgresql+asyncpg://` — no manual fix needed.

---

## GitHub Secrets

For CI/CD to deploy automatically, configure these in your GitHub repo: **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `RENDER_DEPLOY_HOOK_URL` | Triggers Render deploy from CI. Get it from Render Dashboard → your service → **Deploy Hooks** |
| `DOCKER_USERNAME` | Docker Hub username (if using Docker deploy) |
| `DOCKER_PASSWORD` | Docker Hub password or access token |

### Getting the Render Deploy Hook

1. Go to Render Dashboard → **chokey-api** → **Settings** → **Deploy Hooks**
2. Click **Create Deploy Hook**, give it a name (e.g. "CI/CD")
3. Copy the generated URL
4. Add it as `RENDER_DEPLOY_HOOK_URL` in GitHub Secrets

---

## CI/CD Pipeline

The `.github/workflows/backend.yml` pipeline runs on push/PR to `main` or `develop` when backend files change:

```
push → [lint] → [test] → [docker-build]
                              ↓  (main branch only)
                   [deploy-render]  [deploy-docker]
```

**Jobs:**
1. **lint** — Ruff checks (2 min)
2. **test** — pytest with coverage (3 min)
3. **docker-build** — Builds Docker image, verifies app loads (2 min)
4. **deploy-render** — POSTs to Render deploy hook (instant trigger)
5. **deploy-docker** — Pushes to Docker Hub (fallback registry)

Jobs 4 and 5 only run on push to `main` and only after lint + test + docker-build pass.

---

## Docker Hub Deployment

If you prefer to deploy via Docker instead of Render's native Python support:

```bash
# Build for production
docker build -t yourname/chokey-api:latest ./backend

# Push to Docker Hub
docker push yourname/chokey-api:latest

# Run on any Docker host
docker run -d \
  --name chokey-api \
  -p 8000:8000 \
  --env-file .env.production \
  yourname/chokey-api:latest
```

---

## Production Environment Variables

Copy `backend/.env.example` to `backend/.env.production` and fill in production values:

```bash
cp backend/.env.example backend/.env.production
```

**Critical changes from dev defaults:**

| Variable | Dev Value | Production Value |
|----------|-----------|-----------------|
| `DEBUG` | `true` | **`false`** |
| `SECRET_KEY` | dev default | **64-char random** (`openssl rand -hex 32`) |
| `RUN_MIGRATIONS` | `false` | **`true`** |
| `ALLOWED_ORIGINS` | `localhost` | **Your production domain(s)** |
| `SENTRY_DSN` | empty | **Your Sentry DSN** |

---

## Pre-Deploy Checklist

- [ ] All migrations committed and tested locally (`alembic upgrade head`)
- [ ] `pytest` passes with >= 80% coverage
- [ ] `ruff check` passes with no errors
- [ ] Docker image builds successfully
- [ ] `.env.production` has production values (not dev defaults)
- [ ] `SECRET_KEY` is a unique 64-char random string
- [ ] `ALLOWED_ORIGINS` includes the frontend's production URL
- [ ] Sentry DSN is configured (if desired)
- [ ] SendGrid API key is configured (if email sending needed)
- [ ] AWS S3 credentials configured (if file uploads needed)
- [ ] Render deploy hook URL is in GitHub Secrets (`RENDER_DEPLOY_HOOK_URL`)
- [ ] GitHub Actions is enabled on the repository

---

## Post-Deploy Verification

After deployment completes, verify the following:

### 1. Health Check

```bash
curl https://your-app.onrender.com/health
# Expected:
# {"status":"ok","app":"Chokey API","version":"0.1.0","db":true,"redis":true}
```

### 2. Readiness Probe

```bash
curl https://your-app.onrender.com/ready
# Expected:
# {"status":"ok","checks":{"db":true,"redis":true}}
```

### 3. API Response

```bash
curl https://your-app.onrender.com/api/v1/market/prices
# Expected: JSEND envelope with price data
```

### 4. Swagger Docs (if debug is temporarily on)

```bash
curl https://your-app.onrender.com/docs
# Expected: 200 — Swagger UI HTML
```

### 5. Authentication Flow

```bash
# Register a test user
curl -X POST https://your-app.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","display_name":"Test User"}'
# Expected: 201 with user data
```

### 6. Metrics Endpoint (Prometheus)

```bash
curl https://your-app.onrender.com/metrics
# Expected: Prometheus-format metrics (if instrumentator is installed)
```

### 7. WebSocket Connection

```bash
# Using wscat (npm install -g wscat)
wscat -c wss://your-app.onrender.com/ws
# Expected: Connection established, heartbeat messages every 30s
```

### 8. Worker Health (via logs)

```bash
# Check Render logs for:
# "Prices updated" from celery price_feed task (every 30s)
# "Signals generated" from celery signal_generator task (every hour)
```

---

## Rollback

### Render

1. Go to Render Dashboard → **chokey-api** → **Deploy History**
2. Find the last known-good deploy
3. Click **Deploy** on that entry

### Docker

```bash
docker run -d --name chokey-api-rollback \
  -p 8000:8000 \
  yourname/chokey-api:<previous-tag>
```

---

## Monitoring & Alerts

### Render Dashboard
- **CPU/Memory graphs** — available in each service's dashboard
- **Logs** — real-time streaming per service
- **Uptime** — Render automatically restarts crashed services

### Sentry
- Error tracking with automatic capture of unhandled exceptions
- Performance tracing (10% sample rate by default)
- Configure alert rules in Sentry dashboard

### Prometheus Metrics (optional)
The `/metrics` endpoint exposes:
- HTTP request count, duration, errors (per route)
- Python GC stats
- Can be scraped by Prometheus + Grafana for visualization

---

## Appendix: Render Free Tier Limits

| Resource | Limit |
|----------|-------|
| RAM (web service) | 512 MB |
| RAM (worker) | 512 MB |
| CPU | 0.1 vCPU (burst) |
| PostgreSQL | 256 MB / 1 GB disk |
| Redis | 25 MB |
| Bandwidth | 100 GB/month |
| Idle timeout | 15 min (spins down) |
| Build hours | 500/month across all services |

> Pro tip: Free tier services spin down after 15 minutes of inactivity.
> The first request after a spin-down takes ~15 seconds to cold-start.
> Upgrade to Starter ($7/month) for no spin-down.
