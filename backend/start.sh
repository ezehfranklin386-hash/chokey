#!/usr/bin/env bash
set -e

echo "=== Running Alembic migrations ==="
alembic upgrade head

echo "=== Starting gunicorn on port ${PORT:-8000} ==="
exec gunicorn -k uvicorn.workers.UvicornWorker -w 1 \
  app.main:app \
  --bind "0.0.0.0:${PORT:-8000}" \
  --log-level info \
  --access-logfile - \
  --error-logfile -
