"""Tests for wallet endpoints — list, detail, addresses, summary."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestListWallets:
    """Wallet listing."""

    @pytest.mark.asyncio
    async def test_list_empty(self, client: AsyncClient, auth_headers: dict):
        """GET /wallets with no wallets returns empty list."""
        response = await client.get("/api/v1/wallets", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_list_requires_auth(self, client: AsyncClient):
        """GET /wallets without auth returns 401."""
        response = await client.get("/api/v1/wallets")
        assert response.status_code == 401


class TestGetWallet:
    """Single wallet detail."""

    @pytest.mark.asyncio
    async def test_get_not_found(self, client: AsyncClient, auth_headers: dict):
        """GET /wallets/:id with nonexistent ID returns error."""
        response = await client.get(
            "/api/v1/wallets/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "error"

    @pytest.mark.asyncio
    async def test_get_requires_auth(self, client: AsyncClient):
        """GET /wallets/:id without auth returns 401."""
        response = await client.get(
            "/api/v1/wallets/00000000-0000-0000-0000-000000000000",
        )
        assert response.status_code == 401


class TestWalletAddresses:
    """Wallet address management."""

    @pytest.mark.asyncio
    async def test_list_addresses_empty(
        self, client: AsyncClient, auth_headers: dict, test_wallet: dict,
    ):
        """GET /wallets/:id/addresses returns empty list."""
        response = await client.get(
            f"/api/v1/wallets/{test_wallet['id']}/addresses",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "addresses" in data["data"]

    @pytest.mark.asyncio
    async def test_create_address(
        self, client: AsyncClient, auth_headers: dict, test_wallet: dict,
    ):
        """POST /wallets/:id/addresses generates a new address."""
        response = await client.post(
            f"/api/v1/wallets/{test_wallet['id']}/addresses",
            headers=auth_headers,
            json={"label": "Test Address"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_addresses_requires_auth(self, client: AsyncClient):
        """Wallet address endpoints return 401 without auth."""
        for method, path in [
            ("GET", "/api/v1/wallets/some-id/addresses"),
            ("POST", "/api/v1/wallets/some-id/addresses"),
        ]:
            response = await client.request(method, path)
            assert response.status_code == 401, f"{method} {path} returned {response.status_code}"


class TestWalletSummary:
    """Portfolio summary."""

    @pytest.mark.asyncio
    async def test_summary(self, client: AsyncClient, auth_headers: dict):
        """GET /wallets/summary returns portfolio data."""
        response = await client.get("/api/v1/wallets/summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_summary_requires_auth(self, client: AsyncClient):
        """GET /wallets/summary without auth returns 401."""
        response = await client.get("/api/v1/wallets/summary")
        assert response.status_code == 401
