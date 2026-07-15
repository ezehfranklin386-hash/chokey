"""Tests for signal endpoints."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_signals(client: AsyncClient):
    """GET /api/v1/signals should return 200."""
    response = await client.get("/api/v1/signals")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_signal_detail(client: AsyncClient):
    """GET /api/v1/signals/:id should return 200 (placeholder response)."""
    response = await client.get("/api/v1/signals/test-id")
    assert response.status_code == 200
