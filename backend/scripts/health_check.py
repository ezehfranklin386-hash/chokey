#!/usr/bin/env python3
"""Pre-deploy and post-deploy health verification script.

Usage:
    # Check a running deployment
    python scripts/health_check.py --base-url https://your-app.onrender.com

    # Pre-deploy check (local)
    python scripts/health_check.py --base-url http://localhost:8000

    # Quiet mode (exit code only — good for CI)
    python scripts/health_check.py --base-url https://your-app.onrender.com --quiet

Exit code: 0 if all checks pass, 1 if any fail.
"""

from __future__ import annotations

import argparse
import sys
from typing import Any

import httpx

TIMEOUT = 15.0  # seconds

# ── Checks ──────────────────────────────────────────────────────

PASSED = 0
FAILED = 0


def check(name: str, ok: bool, detail: str = "") -> None:
    global PASSED, FAILED
    if ok:
        PASSED += 1
        print(f"  ✅ {name}" + (f" — {detail}" if detail else ""))
    else:
        FAILED += 1
        print(f"  ❌ {name}" + (f" — {detail}" if detail else ""))


async def verify(base_url: str, quiet: bool = False) -> int:
    """Run all checks against the given base URL."""

    if not quiet:
        print(f"\n🔍 Health Check: {base_url}\n")

    async with httpx.AsyncClient(base_url=base_url, timeout=TIMEOUT) as client:

        # ── 1. Health endpoint ────────────────────────────────
        if not quiet:
            print("── Health & Readiness ──")
        try:
            r = await client.get("/health")
            data = r.json()
            check(r.status_code == 200, f"GET /health → {r.status_code}")
            check(data.get("status") == "ok", f"health.status = {data.get('status')}")
            check(data.get("db") is True, f"health.db = {data.get('db')}")
            check(data.get("app") is not None, f"health.app exists")
        except Exception as e:
            check(False, f"GET /health connection failed: {e}")

        # ── 2. Readiness probe ────────────────────────────────
        try:
            r = await client.get("/ready")
            data = r.json()
            check(r.status_code == 200, f"GET /ready → {r.status_code}")
            check(data.get("status") in ("ok", "degraded"), f"ready.status = {data.get('status')}")
            check(data.get("checks", {}).get("db") is True, f"ready.checks.db = {data.get('checks', {}).get('db')}")
        except Exception as e:
            check(False, f"GET /ready connection failed: {e}")

        # ── 3. Swagger docs ───────────────────────────────────
        if not quiet:
            print("\n── API Docs ──")
        try:
            r = await client.get("/docs")
            check(r.status_code == 200, f"GET /docs → {r.status_code}")
            check("swagger" in r.text.lower(), "Swagger UI renders")
        except Exception as e:
            check(False, f"GET /docs failed: {e}")

        # ── 4. Market prices ──────────────────────────────────
        if not quiet:
            print("\n── API Endpoints ──")
        try:
            r = await client.get("/api/v1/market/prices")
            data = r.json()
            check(r.status_code == 200, f"GET /api/v1/market/prices → {r.status_code}")
            check(data.get("status") == "success", "JSEND envelope: status=success")
            check("data" in data, "JSEND envelope: data present")
        except Exception as e:
            check(False, f"GET /market/prices failed: {e}")

        # ── 5. Available assets ───────────────────────────────
        try:
            r = await client.get("/api/v1/market/assets")
            data = r.json()
            check(r.status_code == 200, f"GET /api/v1/market/assets → {r.status_code}")
            check(data.get("status") == "success", "JSEND envelope ok")
        except Exception as e:
            check(False, f"GET /market/assets failed: {e}")

        # ── 6. Auth endpoints ─────────────────────────────────
        if not quiet:
            print("\n── Auth Flow ──")
        try:
            r = await client.post(
                "/api/v1/auth/register",
                json={
                    "email": "healthcheck@chokey.app",
                    "password": "HealthCheck123!",
                    "display_name": "Health Check",
                },
            )
            # 201 = created, 409 = already exists (fine)
            check(r.status_code in (201, 409), f"POST /auth/register → {r.status_code}")
        except Exception as e:
            check(False, f"POST /auth/register failed: {e}")

        # ── 7. Metrics endpoint (Prometheus) ──────────────────
        if not quiet:
            print("\n── Observability ──")
        try:
            r = await client.get("/metrics")
            check(r.status_code == 200, f"GET /metrics → {r.status_code}")
            check("http_requests_total" in r.text or "python_info" in r.text, "Prometheus metrics present")
        except Exception as e:
            check(False, f"GET /metrics failed: {e}")

        # ── 8. 404 handler ────────────────────────────────────
        try:
            r = await client.get("/nonexistent-route-xyz")
            check(r.status_code == 404, f"GET /nonexistent → {r.status_code} (expected)")
        except Exception as e:
            pass  # non-critical

        # ── 9. CORS headers ───────────────────────────────────
        if not quiet:
            print("\n── CORS ──")
        try:
            r = await client.options(
                "/api/v1/market/prices",
                headers={
                    "Origin": "http://localhost:5173",
                    "Access-Control-Request-Method": "GET",
                },
            )
            cors_ok = "access-control-allow-origin" in {h.lower() for h in r.headers}
            check(cors_ok, "CORS preflight responds with ACAO header")
        except Exception as e:
            check(False, f"CORS preflight failed: {e}")

    # ── Summary ────────────────────────────────────────────────
    if not quiet:
        print(f"\n{'─' * 40}")
        print(f"  {PASSED} passed, {FAILED} failed")
        print(f"{'─' * 40}\n")

    return 0 if FAILED == 0 else 1


def main() -> int:
    parser = argparse.ArgumentParser(description="Chokey deployment health check")
    parser.add_argument(
        "--base-url",
        default="http://localhost:8000",
        help="Base URL of the deployment (default: http://localhost:8000)",
    )
    parser.add_argument("--quiet", action="store_true", help="Suppress output, exit code only")
    args = parser.parse_args()

    import asyncio

    return asyncio.run(verify(args.base_url, quiet=args.quiet))


if __name__ == "__main__":
    sys.exit(main())
