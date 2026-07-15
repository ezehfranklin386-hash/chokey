"""Tests for order endpoints."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_order_requires_auth(client: AsyncClient):
    """POST /api/v1/orders should return 401 without auth."""
    response = await client.post("/api/v1/orders", json={"asset": "BTC", "side": "BUY", "quantity": 0.1})
    assert response.status_code == 401
