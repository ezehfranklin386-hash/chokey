"""FastAPI application factory with lifespan, middleware, and route mounting."""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_v1_router
from app.config import settings
from app.core.exceptions import AppException
from app.core.logging import setup_logging
from app.database import Base, engine
from app.models import *  # noqa: F401,F403 — register all models on Base.metadata
from app.redis import close_redis, get_redis
from app.storage.s3 import storage as s3_storage
from app.ws.manager import manager as ws_manager

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup → yield → shutdown."""
    logger.info("Starting up…")
    # Verify Redis connection (with timeout so tests don't hang)
    try:
        r = await get_redis()
        await r.ping()
        logger.info("Redis connected")
    except Exception as e:
        logger.warning("Redis not available", error=str(e)[:80])

    # Ensure database tables exist
    # In dev, Base.metadata.create_all handles fresh databases.
    # In production, run `alembic upgrade head` instead and set
    # RUN_MIGRATIONS=true to skip this fallback.
    if not settings.run_migrations:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created/verified via metadata")
        except Exception as e:
            logger.error("Could not create tables", error=str(e)[:200])
    else:
        logger.info("Skipping metadata create_all — expecting alembic migrations")

    # Initialize S3 storage
    await s3_storage.initialize()

    # Start WebSocket Redis listener for cross-instance broadcasting
    listener_task = asyncio.create_task(ws_manager.start_listener())

    yield

    logger.info("Shutting down…")
    listener_task.cancel()
    try:
        await listener_task
    except asyncio.CancelledError:
        pass
    await ws_manager.stop_listener()
    await close_redis()
    await engine.dispose()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    setup_logging()

    # ── Sentry ─────────────────────────────────────────────────
    if settings.sentry_dsn:
        import sentry_sdk
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            traces_sample_rate=settings.sentry_traces_sample_rate,
            environment="production" if not settings.debug else "development",
            profiles_sample_rate=0.1,
            send_default_pii=False,
        )
        logger.info("Sentry initialized")
    else:
        logger.info("Sentry not configured — skipping")

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        lifespan=lifespan,
    )

    # --- Middleware ---
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Prometheus metrics ---
    try:
        from prometheus_fastapi_instrumentator import Instrumentator
        Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)
        logger.info("Prometheus metrics enabled at /metrics")
    except ImportError:
        logger.warning("prometheus-fastapi-instrumentator not installed — metrics disabled")

    # --- Global exception handler ---
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "error",
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                },
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": f"{type(exc).__name__}: {str(exc)[:200]}",
                },
            },
        )

    # --- Routes ---
    app.include_router(api_v1_router, prefix="/api/v1")

    # --- Health check ---
    @app.get("/health")
    async def health() -> dict:
        db_ok = False
        try:
            from sqlalchemy import text as sql_text
            async with engine.connect() as conn:
                await conn.execute(sql_text("SELECT 1"))
                db_ok = True
        except Exception:
            pass

        redis_ok = False
        try:
            r = await get_redis()
            if r:
                await r.ping()
                redis_ok = True
        except Exception:
            pass

        return {
            "status": "ok",
            "app": settings.app_name,
            "version": "0.1.0",
            "db": db_ok,
            "redis": redis_ok,
        }

    # --- Readiness probe (Kubernetes / Docker) ---
    @app.get("/ready")
    async def ready() -> dict:
        """Readiness check — all dependencies must be reachable."""
        db_ok = False
        try:
            from sqlalchemy import text as sql_text
            async with engine.connect() as conn:
                await conn.execute(sql_text("SELECT 1"))
                db_ok = True
        except Exception:
            pass

        redis_ok = False
        try:
            r = await get_redis()
            if r:
                await r.ping()
                redis_ok = True
        except Exception:
            pass

        all_ok = db_ok  # Redis is optional
        return {
            "status": "ok" if all_ok else "degraded",
            "checks": {"db": db_ok, "redis": redis_ok},
        }

    return app


app = create_app()
