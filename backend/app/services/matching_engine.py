"""Order matching engine — Redis-backed for multi-instance support.

Order books are stored in Redis sorted sets so all API instances
share the same state. A Lua script ensures atomic matching across
concurrent requests from any instance.

Fallback to in-memory engine when Redis is unavailable.
"""

from __future__ import annotations

import json
import time
import uuid
from typing import Any

from app.redis import get_redis

MATCH_LUA_SCRIPT = """
-- KEYS[1] = order book key prefix (e.g. "ob:BTC")
-- ARGV[1] = order_id
-- ARGV[2] = side (BUY / SELL)
-- ARGV[3] = price
-- ARGV[4] = quantity
-- ARGV[5] = timestamp

local prefix = KEYS[1]
local order_id = ARGV[1]
local side = ARGV[2]
local price = tonumber(ARGV[3])
local quantity = tonumber(ARGV[4])
local timestamp = ARGV[5]

local bids_key = prefix .. ":bids"
local asks_key = prefix .. ":asks"
local orders_key = prefix .. ":orders"

-- Store order metadata
redis.call("HSET", orders_key, order_id, cjson.encode({
    order_id = order_id,
    side = side,
    price = price,
    quantity = quantity,
    timestamp = timestamp,
}))

-- Add to appropriate sorted set
-- Bids: score = -price (reversed for max-heap behavior)
-- Asks: score = price
if side == "BUY" then
    redis.call("ZADD", bids_key, -price, order_id)
else
    redis.call("ZADD", asks_key, price, order_id)
end

-- Matching loop
local fills = {}
while true do
    local best_bid = redis.call("ZRANGE", bids_key, 0, 0, "WITHSCORES")
    local best_ask = redis.call("ZRANGE", asks_key, 0, 0, "WITHSCORES")

    if #best_bid < 2 or #best_ask < 2 then
        break
    end

    local bid_price = -tonumber(best_bid[2])  -- negate back to positive
    local ask_price = tonumber(best_ask[2])
    local bid_order_id = best_bid[1]
    local ask_order_id = best_ask[1]

    if bid_price < ask_price then
        break  -- spread, no match
    end

    -- Get order details
    local bid_json = redis.call("HGET", orders_key, bid_order_id)
    local ask_json = redis.call("HGET", orders_key, ask_order_id)
    if not bid_json or not ask_json then
        break
    end

    local bid = cjson.decode(bid_json)
    local ask = cjson.decode(ask_json)
    local trade_price = ask_price
    local trade_qty = math.min(bid.quantity, ask.quantity)

    table.insert(fills, cjson.encode({
        buy_order_id = bid_order_id,
        sell_order_id = ask_order_id,
        price = trade_price,
        quantity = trade_qty,
    }))

    -- Update remaining quantities
    bid.quantity = bid.quantity - trade_qty
    ask.quantity = ask.quantity - trade_qty

    if bid.quantity <= 0 then
        redis.call("ZREM", bids_key, bid_order_id)
        redis.call("HDEL", orders_key, bid_order_id)
    else
        redis.call("HSET", orders_key, bid_order_id, cjson.encode(bid))
    end

    if ask.quantity <= 0 then
        redis.call("ZREM", asks_key, ask_order_id)
        redis.call("HDEL", orders_key, ask_order_id)
    else
        redis.call("HSET", orders_key, ask_order_id, cjson.encode(ask))
    end
end

return cjson.encode(fills)
"""


class RedisMatchingEngine:
    """Redis-backed matching engine for a single trading pair."""

    def __init__(self, symbol: str):
        self._prefix = f"ob:{symbol}"

    async def add_order(self, order_id: str, side: str, price: float, quantity: float) -> list[dict[str, Any]]:
        """Add an order and match. Returns fills."""
        redis = await get_redis()
        if redis is None:
            return []

        ts = str(time.time())
        try:
            raw = await redis.eval(
                MATCH_LUA_SCRIPT,
                1,
                self._prefix,
                order_id,
                side,
                str(price),
                str(quantity),
                ts,
            )
            if raw:
                return [json.loads(f) for f in json.loads(raw)]
            return []
        except Exception:
            return []

    async def cancel_order(self, order_id: str) -> bool:
        """Cancel an order — remove from sorted sets and metadata."""
        redis = await get_redis()
        if redis is None:
            return False
        try:
            pipe = redis.pipeline()
            pipe.zrem(f"{self._prefix}:bids", order_id)
            pipe.zrem(f"{self._prefix}:asks", order_id)
            pipe.hdel(f"{self._prefix}:orders", order_id)
            results = await pipe.execute()
            return any(r == 1 for r in results)
        except Exception:
            return False

    async def get_snapshot(self, depth: int = 20) -> dict[str, Any]:
        """Get order book snapshot."""
        redis = await get_redis()
        if redis is None:
            return {"bids": [], "asks": [], "bid_depth": 0, "ask_depth": 0}

        try:
            pipe = redis.pipeline()
            pipe.zrange(f"{self._prefix}:bids", 0, depth - 1, "WITHSCORES")
            pipe.zrange(f"{self._prefix}:asks", 0, depth - 1, "WITHSCORES")
            raw_bids, raw_asks = await pipe.execute()

            bids = []
            for i in range(0, len(raw_bids), 2):
                order_id = raw_bids[i]
                price = -float(raw_bids[i + 1])  # negate back
                qty = await self._get_order_quantity(order_id)
                if qty and qty > 0:
                    bids.append((price, qty))

            asks = []
            for i in range(0, len(raw_asks), 2):
                order_id = raw_asks[i]
                price = float(raw_asks[i + 1])
                qty = await self._get_order_quantity(order_id)
                if qty and qty > 0:
                    asks.append((price, qty))

            return {
                "bids": sorted(bids, key=lambda x: -x[0])[:depth],
                "asks": sorted(asks, key=lambda x: x[0])[:depth],
                "bid_depth": sum(q for _, q in bids),
                "ask_depth": sum(q for _, q in asks),
            }
        except Exception:
            return {"bids": [], "asks": [], "bid_depth": 0, "ask_depth": 0}

    async def _get_order_quantity(self, order_id: str) -> float | None:
        """Get remaining quantity for an order."""
        redis = await get_redis()
        if redis is None:
            return None
        try:
            raw = await redis.hget(f"{self._prefix}:orders", order_id)
            if raw:
                data = json.loads(raw)
                return float(data.get("quantity", 0))
        except Exception:
            pass
        return None


# In-memory fallback for when Redis is unavailable
class InMemoryMatchingEngine:
    """Simple in-memory matching engine (fallback when Redis is down)."""

    def __init__(self):
        self._bids: list[dict] = []
        self._asks: list[dict] = []
        self._orders: dict[str, dict] = {}

    async def add_order(self, order_id: str, side: str, price: float, quantity: float) -> list[dict]:
        entry = {"order_id": order_id, "side": side, "price": price, "quantity": quantity, "timestamp": time.time()}
        self._orders[order_id] = entry
        if side == "BUY":
            self._bids.append(entry)
            self._bids.sort(key=lambda x: -x["price"])
        else:
            self._asks.append(entry)
            self._asks.sort(key=lambda x: x["price"])
        return self._match()

    def _match(self) -> list[dict]:
        fills = []
        while self._bids and self._asks:
            bid = self._bids[0]
            ask = self._asks[0]
            if bid["price"] < ask["price"]:
                break
            trade_price = ask["price"]
            trade_qty = min(bid["quantity"], ask["quantity"])
            fills.append({
                "buy_order_id": bid["order_id"],
                "sell_order_id": ask["order_id"],
                "price": trade_price,
                "quantity": trade_qty,
            })
            bid["quantity"] -= trade_qty
            ask["quantity"] -= trade_qty
            if bid["quantity"] <= 0:
                self._bids.pop(0)
                self._orders.pop(bid["order_id"], None)
            if ask["quantity"] <= 0:
                self._asks.pop(0)
                self._orders.pop(ask["order_id"], None)
        return fills

    async def cancel_order(self, order_id: str) -> bool:
        if order_id not in self._orders:
            return False
        entry = self._orders.pop(order_id)
        entry["quantity"] = 0
        return True

    def get_snapshot(self, depth: int = 20) -> dict:
        bids = [(e["price"], e["quantity"]) for e in self._bids if e["quantity"] > 0][:depth]
        asks = [(e["price"], e["quantity"]) for e in self._asks if e["quantity"] > 0][:depth]
        return {
            "bids": bids,
            "asks": asks,
            "bid_depth": sum(q for _, q in bids),
            "ask_depth": sum(q for _, q in asks),
        }


_engines: dict[str, RedisMatchingEngine | InMemoryMatchingEngine] = {}
_using_redis: bool | None = None


async def _check_redis() -> bool:
    """Check if Redis is available for the matching engine."""
    global _using_redis
    if _using_redis is not None:
        return _using_redis
    redis = await get_redis()
    _using_redis = redis is not None
    return _using_redis


def get_engine(asset: str) -> RedisMatchingEngine | InMemoryMatchingEngine:
    """Get or create a matching engine for an asset pair."""
    if asset not in _engines:
        _engines[asset] = RedisMatchingEngine(asset)
    return _engines[asset]
