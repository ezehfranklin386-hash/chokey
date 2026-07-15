"""Celery task: generate algorithmic trading signals from TA indicators."""

from __future__ import annotations

import structlog

from app.tasks.celery_app import celery_app

logger = structlog.get_logger()


@celery_app.task(name="app.tasks.signal_generator.generate_signals")
def generate_signals() -> None:
    """Run TA indicators on major pairs and generate buy/sell signals."""
    logger.info("Generating signals…")
    # TODO: fetch candles from DB
    # TODO: compute RSI, MACD, SMA/EMA crossovers, Bollinger Bands
    # TODO: score and create Signal records
    # TODO: broadcast new signals via WebSocket
