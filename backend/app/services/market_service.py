"""Market data business logic — prices, candles, search, with Redis caching."""

from __future__ import annotations

import json
from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.orm import joinedload

from app.database import async_session_factory
from app.models.market import Candle, MarketPrice
from app.models.wallet import Asset
from app.redis import get_redis

PRICE_CACHE_TTL = 30  # seconds
ASSET_CACHE_TTL = 300  # 5 minutes


class MarketService:
    @staticmethod
    async def list_prices() -> list[dict[str, Any]]:
        """Get latest prices for all assets (cached)."""
        # Try cache first
        redis = await get_redis()
        if redis:
            try:
                cached = await redis.get("market:prices")
                if cached:
                    return json.loads(cached)
            except Exception:
                pass

        async with async_session_factory() as session:
            result = await session.execute(
                select(MarketPrice)
                .options(joinedload(MarketPrice.asset))
                .order_by(MarketPrice.market_cap.desc().nullslast())
            )
            prices = result.scalars().all()

            data = []
            for p in prices:
                data.append({
                    "symbol": p.asset.symbol,
                    "price": str(p.price),
                    "change_24h": str(p.price_change_24h),
                    "volume_24h": str(p.volume_24h),
                    "high_24h": str(p.high_24h),
                    "low_24h": str(p.low_24h),
                    "market_cap": str(p.market_cap) if p.market_cap else None,
                })

            # Cache for 30s
            if redis:
                try:
                    await redis.setex("market:prices", PRICE_CACHE_TTL, json.dumps(data))
                except Exception:
                    pass

            return data

    @staticmethod
    async def get_price(symbol: str) -> dict[str, Any] | None:
        """Get single asset price + 24h stats."""
        redis = await get_redis()
        cache_key = f"market:price:{symbol.upper()}"

        if redis:
            try:
                cached = await redis.get(cache_key)
                if cached:
                    return json.loads(cached)
            except Exception:
                pass

        async with async_session_factory() as session:
            asset_result = await session.execute(
                select(Asset).where(Asset.symbol == symbol.upper())
            )
            asset_obj = asset_result.scalar_one_or_none()
            if not asset_obj:
                return None

            result = await session.execute(
                select(MarketPrice)
                .options(joinedload(MarketPrice.asset))
                .where(MarketPrice.asset_id == asset_obj.id)
            )
            p = result.scalar_one_or_none()
            if not p:
                return None

            data = {
                "symbol": p.asset.symbol,
                "price": str(p.price),
                "change_24h": str(p.price_change_24h),
                "volume_24h": str(p.volume_24h),
                "high_24h": str(p.high_24h),
                "low_24h": str(p.low_24h),
                "market_cap": str(p.market_cap) if p.market_cap else None,
            }

            if redis:
                try:
                    await redis.setex(cache_key, PRICE_CACHE_TTL, json.dumps(data))
                except Exception:
                    pass

            return data

    @staticmethod
    async def get_candles(symbol: str, interval: str = "1h", limit: int = 100) -> list[dict[str, Any]]:
        """Get OHLCV candle data."""
        async with async_session_factory() as session:
            asset_result = await session.execute(
                select(Asset).where(Asset.symbol == symbol.upper())
            )
            asset_obj = asset_result.scalar_one_or_none()
            if not asset_obj:
                return []

            result = await session.execute(
                select(Candle)
                .where(Candle.asset_id == asset_obj.id, Candle.interval == interval)
                .order_by(Candle.open_time.desc())
                .limit(limit)
            )
            candles = result.scalars().all()

            return [
                {
                    "timestamp": c.open_time.isoformat(),
                    "open": str(c.open),
                    "high": str(c.high),
                    "low": str(c.low),
                    "close": str(c.close),
                    "volume": str(c.volume),
                }
                for c in reversed(candles)
            ]

    @staticmethod
    async def search_assets(query: str) -> list[dict[str, Any]]:
        """Search assets by symbol or name."""
        q = f"%{query}%"
        async with async_session_factory() as session:
            result = await session.execute(
                select(Asset).where(
                    or_(Asset.symbol.ilike(q), Asset.name.ilike(q))
                ).limit(20)
            )
            assets = result.scalars().all()

            return [
                {
                    "symbol": a.symbol,
                    "name": a.name,
                    "decimals": a.decimals,
                }
                for a in assets
            ]

    @staticmethod
    async def list_assets() -> list[dict[str, Any]]:
        """List all supported assets (cached)."""
        redis = await get_redis()
        if redis:
            try:
                cached = await redis.get("market:assets")
                if cached:
                    return json.loads(cached)
            except Exception:
                pass

        async with async_session_factory() as session:
            result = await session.execute(select(Asset).order_by(Asset.symbol))
            assets = result.scalars().all()

            data = [
                {
                    "symbol": a.symbol,
                    "name": a.name,
                    "decimals": a.decimals,
                    "icon": a.logo_url,
                }
                for a in assets
            ]

            if redis:
                try:
                    await redis.setex("market:assets", ASSET_CACHE_TTL, json.dumps(data))
                except Exception:
                    pass

            return data

    @staticmethod
    async def get_orderbook(symbol: str) -> dict[str, Any]:
        """Get order book snapshot from matching engine."""
        from app.services.matching_engine import get_engine

        engine = get_engine(symbol.upper())
        snapshot = engine.get_snapshot(20)
        return {
            "symbol": symbol.upper(),
            "bids": snapshot.get("bids", []),
            "asks": snapshot.get("asks", []),
            "updated_at": snapshot.get("updated_at", ""),
        }

    @staticmethod
    async def get_public_trades(symbol: str, limit: int = 50) -> list[dict[str, Any]]:
        """Get recent public trades."""
        async with async_session_factory() as session:
            from app.models.order import Trade

            asset_result = await session.execute(
                select(Asset).where(Asset.symbol == symbol.upper())
            )
            asset_obj = asset_result.scalar_one_or_none()
            if not asset_obj:
                return []

            result = await session.execute(
                select(Trade)
                .where(Trade.asset_id == asset_obj.id)
                .order_by(Trade.created_at.desc())
                .limit(limit)
            )
            trades = result.scalars().all()

            return [
                {
                    "id": t.id,
                    "price": str(t.price),
                    "quantity": str(t.quantity),
                    "total": str(t.total),
                    "side": t.side,
                    "timestamp": t.created_at.isoformat() if t.created_at else None,
                }
                for t in trades
            ]


market_service = MarketService()
