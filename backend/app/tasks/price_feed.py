"""Celery task: poll external API for price updates and broadcast via WebSocket."""

from __future__ import annotations

import structlog

from app.tasks.celery_app import celery_app

logger = structlog.get_logger()


@celery_app.task(name="app.tasks.price_feed.update_prices")
def update_prices() -> None:
    """Poll CoinGecko (or fallback) for latest prices and store in Redis/DB."""
    logger.info("Updating prices…")
    # TODO: fetch prices from CoinGecko API
    # TODO: store latest in Redis with 5s TTL
    # TODO: broadcast updates via WebSocket manager
