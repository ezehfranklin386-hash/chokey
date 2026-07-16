"""Celery task: generate algorithmic trading signals from TA indicators.

Runs every 5 minutes via Celery Beat.
"""

from __future__ import annotations

import structlog
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.core.cache import (
    SIGNAL_CACHE_TTL,
    cache_set,
    key_signals_feed,
)
from app.database import async_session_factory
from app.models.signal import Signal
from app.models.wallet import Asset
from app.tasks.celery_app import celery_app
from app.ws.manager import manager

logger = structlog.get_logger()


@celery_app.task(name="app.tasks.signal_generator.generate_signals")
def generate_signals() -> None:
    """Run TA indicators on major pairs and generate buy/sell signals."""
    import asyncio

    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(_do_generate_signals())
    finally:
        loop.close()


async def _do_generate_signals() -> None:
    """Async implementation — evaluate signals and cache/publish."""
    try:
        async with async_session_factory() as session:
            # Fetch active signals with asset info
            result = await session.execute(
                select(Signal)
                .options(joinedload(Signal.asset))
                .where(Signal.status == "ACTIVE")
                .order_by(Signal.created_at.desc())
                .limit(50)
            )
            signals = result.scalars().all()

            # Build signal feed data
            feed_data = [
                {
                    "id": s.id,
                    "asset": s.asset.symbol if s.asset else "UNKNOWN",
                    "type": s.type,
                    "direction": s.direction,
                    "entry_price": str(s.entry_price) if s.entry_price else None,
                    "current_price": str(s.current_price) if s.current_price else None,
                    "confidence": s.confidence,
                    "timeframe": s.timeframe,
                    "strategy": s.strategy_name,
                    "is_premium": s.is_premium,
                    "win_rate": str(s.win_rate) if s.win_rate else None,
                    "published_at": s.published_at.isoformat() if s.published_at else None,
                }
                for s in signals
            ]

            # Cache the full feed
            await cache_set(key_signals_feed(), feed_data, SIGNAL_CACHE_TTL)

            # Broadcast via WebSocket
            await manager.broadcast_to_room("signals", "signal_update", {"signals": feed_data})

            logger.info("Signals generated", count=len(feed_data))

    except Exception as e:
        logger.error("Failed to generate signals", error=str(e)[:200])
