#!/usr/bin/env bash
# ── Chokey Manual Deploy Script ──────────────────────────────
# Usage:
#   bash scripts/deploy.sh                    # deploy to Render (via hook)
#   bash scripts/deploy.sh --docker           # build + push Docker image
#   bash scripts/deploy.sh --full             # both
#   bash scripts/deploy.sh --check-only       # run health checks only
#
# Prerequisites:
#   - Render deploy hook URL in RENDER_DEPLOY_HOOK_URL env var
#   - Docker logged in (for --docker mode): docker login
#   - .env.production with production values
#
# Environment variables:
#   RENDER_DEPLOY_HOOK_URL   — Render deploy hook URL
#   DOCKER_IMAGE             — Docker image tag (default: chokey-api)
#   BASE_URL                 — Base URL for health check (default: http://localhost:8000)
# ================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOCKER_IMAGE="${DOCKER_IMAGE:-chokey-api}"
BASE_URL="${BASE_URL:-http://localhost:8000}"
GIT_SHA="${GITHUB_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo 'dev')}"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}→${NC} $1"; }
ok()    { echo -e "${GREEN}✅${NC} $1"; }
fail()  { echo -e "${RED}❌${NC} $1"; }

# ── Parse flags ───────────────────────────────────────────────
DO_DOCKER=false
DO_RENDER=false
DO_CHECK=false

for arg in "$@"; do
  case "$arg" in
    --docker) DO_DOCKER=true ;;
    --render) DO_RENDER=true ;;
    --full)   DO_DOCKER=true; DO_RENDER=true ;;
    --check-only) DO_CHECK=true ;;
    --help)
      echo "Usage: bash scripts/deploy.sh [--docker] [--render] [--full] [--check-only]"
      exit 0
      ;;
  esac
done

# Default: render only
if ! $DO_DOCKER && ! $DO_RENDER && ! $DO_CHECK; then
  DO_RENDER=true
fi

# ── Pre-flight checks ────────────────────────────────────────
info "Running pre-flight checks..."

if $DO_RENDER && [ -z "${RENDER_DEPLOY_HOOK_URL:-}" ]; then
  fail "RENDER_DEPLOY_HOOK_URL is not set"
  echo "  Export it or set in .env:"
  echo "    export RENDER_DEPLOY_HOOK_URL='https://api.render.com/deploy/...'"
  exit 1
fi

if $DO_DOCKER && ! command -v docker &>/dev/null; then
  fail "Docker is not installed"
  exit 1
fi

if $DO_CHECK; then
  info "Running health checks against ${BASE_URL}..."
  python "${ROOT_DIR}/scripts/health_check.py" --base-url "$BASE_URL"
  echo ""
  ok "Health checks complete"
  exit 0
fi

# ── Docker build + push ───────────────────────────────────────
if $DO_DOCKER; then
  echo ""
  info "Building Docker image: ${DOCKER_IMAGE}:${GIT_SHA}..."
  docker build -t "${DOCKER_IMAGE}:${GIT_SHA}" -t "${DOCKER_IMAGE}:latest" "$ROOT_DIR"

  info "Pushing Docker image..."
  docker push "${DOCKER_IMAGE}:${GIT_SHA}"
  docker push "${DOCKER_IMAGE}:latest"

  ok "Docker deploy complete — ${DOCKER_IMAGE}:${GIT_SHA}"
fi

# ── Render deploy ────────────────────────────────────────────
if $DO_RENDER; then
  echo ""
  info "Triggering Render deploy hook..."

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$RENDER_DEPLOY_HOOK_URL")

  if [ "$HTTP_CODE" = "200" ]; then
    ok "Render deploy triggered (HTTP $HTTP_CODE)"
  else
    fail "Render deploy hook returned HTTP $HTTP_CODE"
    exit 1
  fi

  echo ""
  info "Waiting 30s for deploy to start..."
  sleep 30

  echo ""
  info "Running post-deploy health checks against ${BASE_URL}..."
  python "${ROOT_DIR}/scripts/health_check.py" --base-url "$BASE_URL" || true
fi

echo ""
ok "Deploy complete"
