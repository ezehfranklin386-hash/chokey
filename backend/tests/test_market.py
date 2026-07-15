"""Tests for market data endpoints."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_prices(client: AsyncClient):
    """GET /api/v1/market/prices should return 200."""
    response = await client.get("/api/v1/market/prices")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_search_assets(client: AsyncClient):
    """GET /api/v1/market/search should return 200."""
    response = await client.get("/api/v1/market/search", params={"q": "BTC"})
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_list_assets(client: AsyncClient):
    """GET /api/v1/market/assets should return 200."""
    response = await client.get("/api/v1/market/assets")
    assert response.status_code == 200
