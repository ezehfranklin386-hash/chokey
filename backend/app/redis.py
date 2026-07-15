"""Redis connection pool."""

from __future__ import annotations

import redis.asyncio as aioredis

from app.config import settings

redis_client: aioredis.Redis | None = None


redis_client: aioredis.Redis | None = None
_redis_available: bool = False


async def get_redis() -> aioredis.Redis | None:
    """Get or create the Redis connection pool. Returns None if unavailable."""
    global redis_client, _redis_available
    if _redis_available and redis_client is not None:
        return redis_client
    if redis_client is None:
        try:
            redis_client = aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
                retry_on_timeout=True,
                max_connections=settings.redis_max_connections,
            )
            await redis_client.ping()
            _redis_available = True
        except Exception:
            redis_client = None
            _redis_available = False
    return redis_client if _redis_available else None


async def close_redis() -> None:
    """Close the Redis connection pool."""
    global redis_client, _redis_available
    if redis_client is not None:
        try:
            await redis_client.close()
        except Exception:
            pass
        redis_client = None
        _redis_available = False
