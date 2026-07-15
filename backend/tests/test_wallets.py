"""Tests for wallet endpoints."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_wallets_requires_auth(client: AsyncClient):
    """GET /api/v1/wallets should return 401 without auth."""
    response = await client.get("/api/v1/wallets")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_wallet_summary_requires_auth(client: AsyncClient):
    """GET /api/v1/wallets/summary should return 401 without auth."""
    response = await client.get("/api/v1/wallets/summary")
    assert response.status_code == 401
