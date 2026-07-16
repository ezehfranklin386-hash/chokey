#!/usr/bin/env bash
set -e

echo "=== Initializing database ==="
echo "DATABASE_URL: ${DATABASE_URL:0:20}..."

if python scripts/init_db.py 2>&1; then
    echo "=== Database ready ==="
else
    echo "=== WARNING: Database init failed. Starting server anyway. ==="
fi

echo "=== Starting gunicorn ==="
exec gunicorn -k uvicorn.workers.UvicornWorker -w 1 \
  app.main:app \
  --bind "0.0.0.0:$PORT" \
  --log-level info \
  --access-logfile - \
  --error-logfile -
