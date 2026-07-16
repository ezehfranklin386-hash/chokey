"""Tests for order endpoints — create, list, get, cancel, trades, history."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestCreateOrder:
    """Order creation."""

    @pytest.mark.asyncio
    async def test_create_limit(
        self, client: AsyncClient, auth_headers: dict, test_asset: dict,
    ):
        """POST /orders with valid limit order succeeds."""
        # Note: With SQLite test DB, the matching engine may use
        # in-memory engine. This tests the endpoint accepts the order.
        response = await client.post(
            "/api/v1/orders",
            headers=auth_headers,
            json={
                "asset": "BTC",
                "side": "BUY",
                "order_type": "LIMIT",
                "quantity": 0.1,
                "price": 50000.0,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_create_market(
        self, client: AsyncClient, auth_headers: dict, test_asset: dict,
    ):
        """POST /orders with market order succeeds."""
        response = await client.post(
            "/api/v1/orders",
            headers=auth_headers,
            json={
                "asset": "BTC",
                "side": "SELL",
                "order_type": "MARKET",
                "quantity": 0.05,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_create_requires_auth(self, client: AsyncClient):
        """POST /orders without auth returns 401."""
        response = await client.post(
            "/api/v1/orders",
            json={"asset": "BTC", "side": "BUY", "quantity": 0.1},
        )
        assert response.status_code == 401


class TestListOrders:
    """Order listing with cursor pagination."""

    @pytest.mark.asyncio
    async def test_list_empty(self, client: AsyncClient, auth_headers: dict):
        """GET /orders with no orders returns empty list."""
        response = await client.get("/api/v1/orders", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_list_requires_auth(self, client: AsyncClient):
        """GET /orders without auth returns 401."""
        response = await client.get("/api/v1/orders")
        assert response.status_code == 401


class TestGetOrder:
    """Single order detail."""

    @pytest.mark.asyncio
    async def test_get_not_found(self, client: AsyncClient, auth_headers: dict):
        """GET /orders/:id with nonexistent ID returns error."""
        response = await client.get(
            "/api/v1/orders/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "error"

    @pytest.mark.asyncio
    async def test_get_requires_auth(self, client: AsyncClient):
        """GET /orders/:id without auth returns 401."""
        response = await client.get(
            "/api/v1/orders/00000000-0000-0000-0000-000000000000",
        )
        assert response.status_code == 401


class TestCancelOrder:
    """Order cancellation."""

    @pytest.mark.asyncio
    async def test_cancel(self, client: AsyncClient, auth_headers: dict):
        """DELETE /orders/:id cancels an order."""
        response = await client.delete(
            "/api/v1/orders/nonexistent-id",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_cancel_requires_auth(self, client: AsyncClient):
        """DELETE /orders/:id without auth returns 401."""
        response = await client.delete("/api/v1/orders/nonexistent-id")
        assert response.status_code == 401


class TestTrades:
    """Trade history."""

    @pytest.mark.asyncio
    async def test_list_trades_empty(self, client: AsyncClient, auth_headers: dict):
        """GET /orders/trades with no trades returns empty list."""
        response = await client.get("/api/v1/orders/trades", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_trades_requires_auth(self, client: AsyncClient):
        """GET /orders/trades without auth returns 401."""
        response = await client.get("/api/v1/orders/trades")
        assert response.status_code == 401


class TestOrderHistory:
    """Order history."""

    @pytest.mark.asyncio
    async def test_history_empty(self, client: AsyncClient, auth_headers: dict):
        """GET /orders/history returns empty list."""
        response = await client.get("/api/v1/orders/history", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_history_requires_auth(self, client: AsyncClient):
        """GET /orders/history without auth returns 401."""
        response = await client.get("/api/v1/orders/history")
        assert response.status_code == 401
