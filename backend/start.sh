#!/usr/bin/env bash
set -e

echo "=== Starting gunicorn ==="
exec gunicorn -k uvicorn.workers.UvicornWorker -w 1 \
  app.main:app \
  --bind "0.0.0.0:$PORT" \
  --log-level info \
  --access-logfile - \
  --error-logfile -
