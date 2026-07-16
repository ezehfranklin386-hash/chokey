"""Centralized cache key constants and cache-aside helpers.

All Redis cache keys live here so we can audit TTLs and naming conventions
in one place. Every cache consumer should call these helpers rather than
constructing raw keys.
"""

from __future__ import annotations

import json
from typing import Any, TypeVar

from app.redis import get_redis

T = TypeVar("T")

# ── TTL constants (seconds) ────────────────────────────────────

# Market data — frequently updated
PRICE_CACHE_TTL = 30           # Latest prices — stale quickly
CANDLE_CACHE_TTL = 60          # OHLCV candles — 1 min is fine
ASSET_CACHE_TTL = 300          # Asset list — rarely changes (5 min)
ORDERBOOK_CACHE_TTL = 10       # Order book snapshot — very volatile

# User data — per-user, longer TTL
WALLET_CACHE_TTL = 30           # Wallet balances — needs freshness
PROFILE_CACHE_TTL = 600        # User profile — rarely changes (10 min)
SETTINGS_CACHE_TTL = 600       # User settings

# Reference data — slow-moving
SIGNAL_CACHE_TTL = 120         # Signal feed — 2 min
SYMBOL_CACHE_TTL = 3600        # Symbol metadata — 1 hour

# ── Cache key prefixes ─────────────────────────────────────────

_MARKET = "market"
_USER = "user"
_SIGNAL = "signal"


def key_market_prices() -> str:
    return f"{_MARKET}:prices"


def key_market_price(symbol: str) -> str:
    return f"{_MARKET}:price:{symbol.upper()}"


def key_market_assets() -> str:
    return f"{_MARKET}:assets"


def key_market_candles(symbol: str, interval: str) -> str:
    return f"{_MARKET}:candles:{symbol.upper()}:{interval}"


def key_market_orderbook(symbol: str) -> str:
    return f"{_MARKET}:orderbook:{symbol.upper()}"


def key_user_wallets(user_id: str) -> str:
    return f"{_USER}:{user_id}:wallets"


def key_user_wallet(user_id: str, asset_id: str) -> str:
    return f"{_USER}:{user_id}:wallet:{asset_id}"


def key_user_profile(user_id: str) -> str:
    return f"{_USER}:{user_id}:profile"


def key_user_settings(user_id: str) -> str:
    return f"{_USER}:{user_id}:settings"


def key_signals_feed(filters: dict[str, Any] | None = None) -> str:
    """Generate a deterministic cache key from signal feed filters."""
    if filters:
        parts = [f"{k}={v}" for k, v in sorted(filters.items())]
        return f"{_SIGNAL}:feed:{':'.join(parts)}"
    return f"{_SIGNAL}:feed:all"


# ── Cache helpers ──────────────────────────────────────────────


async def cache_get(key: str) -> Any | None:
    """Fetch a JSON value from Redis. Returns None on miss or error."""
    redis = await get_redis()
    if not redis:
        return None
    try:
        raw = await redis.get(key)
        if raw is not None:
            return json.loads(raw)
    except Exception:
        pass
    return None


async def cache_set(key: str, value: Any, ttl: int) -> bool:
    """Store a JSON-serializable value in Redis with TTL."""
    redis = await get_redis()
    if not redis:
        return False
    try:
        await redis.setex(key, ttl, json.dumps(value, default=str))
        return True
    except Exception:
        return False


async def cache_delete(key: str) -> bool:
    """Delete a single cache key."""
    redis = await get_redis()
    if not redis:
        return False
    try:
        await redis.delete(key)
        return True
    except Exception:
        return False


async def cache_delete_pattern(pattern: str) -> int:
    """Delete all keys matching a glob pattern (e.g. ``user:abc123:*``).

    Uses SCAN under the hood so it won't block on large key spaces.
    Returns the number of deleted keys.
    """
    redis = await get_redis()
    if not redis:
        return 0
    try:
        cursor = 0
        deleted = 0
        while True:
            cursor, keys = await redis.scan(cursor, match=pattern, count=100)
            if keys:
                deleted += await redis.delete(*keys)
            if cursor == 0:
                break
        return deleted
    except Exception:
        return 0


async def invalidate_user_cache(user_id: str) -> None:
    """Invalidate all cached data for a user (wallets, profile, settings)."""
    await cache_delete_pattern(f"{_USER}:{user_id}:*")


async def invalidate_market_cache() -> None:
    """Invalidate all cached market data."""
    keys = [
        key_market_prices(),
        key_market_assets(),
    ]
    for k in keys:
        await cache_delete(k)
