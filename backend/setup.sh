#!/usr/bin/env bash
# ── Chokey Local Dev Setup ─────────────────────────────────
# Run from ./backend/  (or `bash setup.sh` from the backend dir)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== 1. Creating .env from .env.example ==="
if [ ! -f "$BACKEND_DIR/.env" ]; then
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  echo "Created backend/.env — review and edit before running."
else
  echo "backend/.env already exists, skipping."
fi

echo ""
echo "=== 2. Creating Python virtual environment ==="
if [ ! -d "$BACKEND_DIR/venv" ]; then
  python3 -m venv "$BACKEND_DIR/venv"
  echo "Created venv at backend/venv"
else
  echo "venv already exists, skipping."
fi

echo ""
echo "=== 3. Installing Python dependencies ==="
source "$BACKEND_DIR/venv/bin/activate"
pip install -r "$BACKEND_DIR/requirements.txt"
pip install -r "$BACKEND_DIR/requirements-dev.txt" 2>/dev/null || true

echo ""
echo "=== 4. Installing Node.js dependencies (frontend) ==="
if [ -d "$ROOT_DIR/frontend" ]; then
  cd "$ROOT_DIR/frontend"
  npm install
  cd "$BACKEND_DIR"
else
  echo "frontend/ directory not found, skipping."
fi

echo ""
echo "=== 5. Setup complete ==="
echo ""
echo "Next steps:"
echo "  1. Edit backend/.env if needed"
echo "  2. Start infra:   docker compose up -d postgres redis"
echo "  3. Run migrations: alembic upgrade head"
echo "  4. Seed data:     python scripts/seed_data.py"
echo "  5. Start API:     uvicorn app.main:app --reload"
echo "  6. Start frontend: cd ../frontend && npm run dev"
