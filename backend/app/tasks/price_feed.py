"""Celery task: poll external API for price updates, cache in Redis, broadcast via WebSocket.

Runs every 30 seconds via Celery Beat.
"""

from __future__ import annotations

import structlog
from sqlalchemy import select

from app.core.cache import (
    PRICE_CACHE_TTL,
    cache_set,
    key_market_price,
    key_market_prices,
)
from app.database import async_session_factory
from app.models.market import MarketPrice
from app.models.wallet import Asset
from app.tasks.celery_app import celery_app
from app.ws.manager import manager

logger = structlog.get_logger()


@celery_app.task(name="app.tasks.price_feed.update_prices")
def update_prices() -> None:
    """Poll DB for latest prices, cache in Redis, broadcast via WebSocket."""
    import asyncio

    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(_do_update_prices())
    finally:
        loop.close()


async def _do_update_prices() -> None:
    """Async implementation of price update — called by Celery task."""
    try:
        async with async_session_factory() as session:
            result = await session.execute(
                select(MarketPrice).order_by(MarketPrice.market_cap.desc().nullslast())
            )
            prices = result.scalars().all()

            # Build collective price list
            price_list = []
            for p in prices:
                # Get symbol
                asset_result = await session.execute(
                    select(Asset.symbol).where(Asset.id == p.asset_id)
                )
                symbol = asset_result.scalar_one_or_none() or "UNKNOWN"

                entry = {
                    "symbol": symbol,
                    "price": str(p.price),
                    "change_24h": str(p.price_change_24h),
                    "volume_24h": str(p.volume_24h),
                    "high_24h": str(p.high_24h),
                    "low_24h": str(p.low_24h),
                    "market_cap": str(p.market_cap) if p.market_cap else None,
                }
                price_list.append(entry)

                # Cache individual price
                single_key = key_market_price(symbol)
                await cache_set(single_key, entry, PRICE_CACHE_TTL)

            # Cache collective prices
            await cache_set(key_market_prices(), price_list, PRICE_CACHE_TTL)

            # Broadcast via WebSocket — all connected clients in the "prices" room
            await manager.broadcast_to_room("prices", "price_update", price_list)

            logger.info("Prices updated", count=len(price_list))

    except Exception as e:
        logger.error("Failed to update prices", error=str(e)[:200])
