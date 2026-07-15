"""Redis-backed sliding window rate limiter with graceful degradation."""

from __future__ import annotations

import time

from app.redis import get_redis


async def check_rate_limit(
    key: str,
    max_requests: int,
    window_seconds: int = 60,
) -> tuple[bool, int, int]:
    """
    Check if a request is within the rate limit.

    Returns:
        (allowed, remaining, reset_timestamp)
    """
    redis = await get_redis()
    if redis is None:
        # Redis unavailable — allow all requests (graceful degradation)
        return True, max_requests, int(time.time()) + window_seconds

    now = int(time.time())
    window_start = now - window_seconds

    try:
        pipe = redis.pipeline()
        pipe.zremrangebyscore(key, 0, window_start)
        pipe.zcard(key)
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, window_seconds)
        _, count, _, _ = await pipe.execute()

        allowed = count <= max_requests
        remaining = max(0, max_requests - count)
        reset_at = now + window_seconds

        return allowed, remaining, reset_at
    except Exception:
        return True, max_requests, int(time.time()) + window_seconds


async def rate_limit_auth(key: str) -> bool:
    """Strict rate limit for auth endpoints (5 req/min)."""
    allowed, _, _ = await check_rate_limit(f"rl:auth:{key}", max_requests=5, window_seconds=60)
    return allowed


async def rate_limit_api(key: str) -> bool:
    """Standard API rate limit (100 req/min)."""
    allowed, _, _ = await check_rate_limit(f"rl:api:{key}", max_requests=100, window_seconds=60)
    return allowed
