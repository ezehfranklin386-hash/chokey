"""Unit tests for cache key constants and cache-aside helpers.

Tests the pure key-generation functions and fallback behavior of cache helpers
when Redis is unavailable. Full integration tests require a running Redis.
"""

from __future__ import annotations

from datetime import UTC, datetime

from app.core.cache import (
    PRICE_CACHE_TTL,
    WALLET_CACHE_TTL,
    cache_delete,
    cache_delete_pattern,
    cache_get,
    cache_set,
    invalidate_market_cache,
    invalidate_user_cache,
    key_market_assets,
    key_market_candles,
    key_market_orderbook,
    key_market_price,
    key_market_prices,
    key_signals_feed,
    key_user_profile,
    key_user_settings,
    key_user_wallet,
    key_user_wallets,
)


class TestCacheKeyFunctions:
    """Pure functions — no Redis needed."""

    def test_key_market_prices(self):
        assert key_market_prices() == "market:prices"

    def test_key_market_price(self):
        assert key_market_price("btc") == "market:price:BTC"
        assert key_market_price("ETH") == "market:price:ETH"

    def test_key_market_assets(self):
        assert key_market_assets() == "market:assets"

    def test_key_market_candles(self):
        assert key_market_candles("btc", "1h") == "market:candles:BTC:1h"
        assert key_market_candles("ETH", "1d") == "market:candles:ETH:1d"

    def test_key_market_orderbook(self):
        assert key_market_orderbook("btc") == "market:orderbook:BTC"

    def test_key_user_wallets(self):
        assert key_user_wallets("user-1") == "user:user-1:wallets"

    def test_key_user_wallet(self):
        assert key_user_wallet("user-1", "asset-1") == "user:user-1:wallet:asset-1"

    def test_key_user_profile(self):
        assert key_user_profile("user-1") == "user:user-1:profile"

    def test_key_user_settings(self):
        assert key_user_settings("user-1") == "user:user-1:settings"

    def test_key_signals_feed_all(self):
        assert key_signals_feed() == "signal:feed:all"

    def test_key_signals_feed_filtered(self):
        key = key_signals_feed({"status": "ACTIVE", "asset": "BTC"})
        # Sorted deterministically
        assert key == "signal:feed:asset=BTC:status=ACTIVE"

    def test_key_signals_feed_empty_filters(self):
        assert key_signals_feed({}) == "signal:feed:all"


class TestCacheHelpersWithoutRedis:
    """Cache helpers gracefully handle missing/errored Redis connections."""

    async def test_cache_get_no_redis(self):
        """cache_get returns None when Redis is unavailable."""
        result = await cache_get("market:price:BTC")
        assert result is None

    async def test_cache_set_no_redis(self):
        """cache_set returns False when Redis is unavailable."""
        result = await cache_set("market:price:BTC", 50000.0, PRICE_CACHE_TTL)
        assert result is False

    async def test_cache_delete_no_redis(self):
        """cache_delete returns False when Redis is unavailable."""
        result = await cache_delete("market:price:BTC")
        assert result is False

    async def test_cache_delete_pattern_no_redis(self):
        """cache_delete_pattern returns 0 when Redis is unavailable."""
        result = await cache_delete_pattern("user:abc123:*")
        assert result == 0

    async def test_invalidate_user_cache_no_redis(self):
        """invalidate_user_cache does not raise when Redis is unavailable."""
        await invalidate_user_cache("user-1")  # should not raise

    async def test_invalidate_market_cache_no_redis(self):
        """invalidate_market_cache does not raise when Redis is unavailable."""
        await invalidate_market_cache()  # should not raise


class TestCacheTTLConstants:
    """TTL constants have sensible values."""

    def test_price_ttl(self):
        assert 10 <= PRICE_CACHE_TTL <= 60

    def test_wallet_ttl(self):
        assert 10 <= WALLET_CACHE_TTL <= 120
