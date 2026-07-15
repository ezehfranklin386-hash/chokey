# Task: Scale Backend to 10k Concurrent Users

## Metadata
- **Task ID:** 2
- **Agent:** @build
- **Started:** 2026-07-14
- **Status:** In Progress

## Description
Scale the FastAPI backend from ~500 to 10k concurrent users. Multi-phase implementation covering connection pools, horizontal scaling, WebSocket sharding, matching engine, database optimization, and caching.

## Acceptance Criteria
- [x] Phase 1: DB pool 150/50, Redis 200 conns, Celery 8 workers
- [x] Phase 2: Redis pub/sub WebSocket manager, stateless matching, nginx LB
- [x] Phase 3: PgBouncer, read replicas, Decimal for all financial values
- [x] Phase 3c: Schema mismatch fixes (services using .symbol, float → Decimal)
- [ ] Phase 4: Aggressive caching, composite indexes, cursor pagination
- [x] Phase 5a: Render.com deployment blueprint (render.yaml)
- [x] Phase 5b: S3 file upload storage service (app/storage/s3.py)
- [x] Phase 5c: Upload API endpoint (app/api/v1/uploads.py)
- [x] Phase 5d: Vercel proxy config for API calls (frontend/vercel.json)
- [x] Phase 5e: AWS credentials in config.py
- [x] Phase 5f: gunicorn + boto3 in requirements.txt

## References & Prerequisites
- `backend/render.yaml` — Render.com blueprint
- `backend/app/storage/s3.py` — S3 file storage
- `backend/app/api/v1/uploads.py` — Upload router
- `frontend/vercel.json` — Proxy rewrites
- `backend/config.py` — AWS credentials

## Execution Log
- 2026-07-14 — Started Phase 1: pool tuning
- 2026-07-14 — Phase 1 complete: DB/Redis/Celery pools
- 2026-07-14 — Phase 2 complete: WS Redis pub/sub, matching engine, nginx/PgBouncer/replicas
- 2026-07-14 — Phase 3a: read replicas in database.py
- 2026-07-14 — Phase 3b: float→Decimal in all models, schemas, core services
- 2026-07-14 — Added Alembic migration for Numeric columns
- 2026-07-15 — Phase 3c: Fixed all pre-existing schema mismatches in services
- 2026-07-15 — Phase 5: Started Render.com deployment prep
- 2026-07-15 — Phase 5a: Created render.yaml blueprint (API + Worker + Beat + DB + Redis)
- 2026-07-15 — Phase 5b: Created S3 storage service (app/storage/s3.py)
- 2026-07-15 — Phase 5c: Created uploads router with presigned POST/URL endpoints
- 2026-07-15 — Phase 5d: Added AWS credentials to config.py
- 2026-07-15 — Phase 5e: Added Vercel API proxy rewrite (frontend/vercel.json)
- 2026-07-15 — Phase 5f: Added gunicorn + boto3 to requirements.txt

## Files Modified (Phase 5 — Render Deploy)
- `backend/requirements.txt` — Added gunicorn, boto3
- `backend/render.yaml` — NEW: Render blueprint (API + Worker + Beat + DB + Redis)
- `backend/app/storage/__init__.py` — NEW: storage package
- `backend/app/storage/s3.py` — NEW: S3 upload/download/presigned URL service
- `backend/app/config.py` — Added aws_access_key_id, aws_secret_access_key; async_database_url, async_database_read_url properties
- `backend/app/database.py` — Use settings.async_database_url instead of raw settings.database_url
- `backend/alembic/env.py` — Use settings.async_database_url instead of settings.database_url
- `backend/app/api/v1/uploads.py` — NEW: Upload router (presigned POST, presigned URL, delete)
- `backend/app/api/v1/router.py` — Registered uploads router at /uploads
- `backend/app/main.py` — Added S3 storage init in lifespan
- `backend/.env.example` — Added S3/AWS env vars
- `backend/.gitignore` — NEW: Python gitignore (venv, pycache, .env, etc.)
- `frontend/vercel.json` — Added /api/* proxy rewrite to Render
- `task.md` — This update

## Verification (Phase 5)
- [x] All Python files pass `ast.parse` syntax check
- [ ] Backend starts without errors (blocked — boto3 not available in local env)
- [ ] `render.yaml` syntax valid
- [ ] S3Storage class syntax valid
- [ ] Presigned URL endpoint syntax valid
- [ ] Upload router registered correctly
- [ ] `.env.example` covers all production vars
