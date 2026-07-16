#!/usr/bin/env bash
set -e

echo "=== Running database migrations ==="
echo "DATABASE_URL: ${DATABASE_URL:0:20}..."

if alembic upgrade head 2>&1; then
    echo "=== Migrations completed successfully ==="
else
    MIGRATION_EXIT=$?
    echo "=== MIGRATION FAILED (exit code: $MIGRATION_EXIT) ==="
    echo "=== Check logs above for details. Starting server anyway. ==="
fi

echo "=== Starting gunicorn ==="
exec gunicorn -k uvicorn.workers.UvicornWorker -w 1 \
  app.main:app \
  --bind "0.0.0.0:$PORT" \
  --log-level info \
  --access-logfile - \
  --error-logfile -
