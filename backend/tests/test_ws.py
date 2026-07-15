"""Tests for WebSocket connection manager."""

from __future__ import annotations

import pytest

from app.ws.manager import manager


@pytest.mark.asyncio
async def test_manager_starts_empty():
    """Connection manager should start with no connections."""
    assert manager.active_connections == 0
    assert manager.active_rooms == {}


@pytest.mark.asyncio
async def test_matching_engine_basic():
    """Test basic bid-ask match in matching engine."""
    from app.services.matching_engine import MatchingEngine, get_engine

    engine = MatchingEngine()

    # Add a sell order at 100
    await engine.add_order("sell1", "SELL", 100.0, 1.0)
    snapshot = engine.get_snapshot()
    assert len(snapshot["asks"]) == 1

    # Add a buy order at 101 (should match)
    fills = await engine.add_order("buy1", "BUY", 101.0, 1.0)
    assert len(fills) == 1
    assert fills[0]["price"] == 100.0
    assert fills[0]["quantity"] == 1.0


@pytest.mark.asyncio
async def test_matching_engine_no_match():
    """No match when bid < ask."""
    from app.services.matching_engine import MatchingEngine

    engine = MatchingEngine()
    await engine.add_order("sell1", "SELL", 100.0, 1.0)
    fills = await engine.add_order("buy1", "BUY", 99.0, 1.0)
    assert len(fills) == 0
