"""Tests for transaction endpoints — history, detail, deposit, withdrawal."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestListTransactions:
    """Transaction history listing (cursor paginated)."""

    @pytest.mark.asyncio
    async def test_list_empty(self, client: AsyncClient, auth_headers: dict):
        """GET /transactions with no transactions returns empty list."""
        response = await client.get("/api/v1/transactions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["items"] == []
        assert data["data"]["has_more"] is False

    @pytest.mark.asyncio
    async def test_list_filters(self, client: AsyncClient, auth_headers: dict):
        """GET /transactions with type/status filters."""
        response = await client.get(
            "/api/v1/transactions?type=DEPOSIT&status=PENDING",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_list_unauthorized(self, client: AsyncClient):
        """GET /transactions without auth returns 401."""
        response = await client.get("/api/v1/transactions")
        assert response.status_code == 401


class TestGetTransaction:
    """Single transaction detail."""

    @pytest.mark.asyncio
    async def test_get_not_found(self, client: AsyncClient, auth_headers: dict):
        """GET /transactions/:id with nonexistent ID returns error."""
        response = await client.get(
            "/api/v1/transactions/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "error"

    @pytest.mark.asyncio
    async def test_get_unauthorized(self, client: AsyncClient):
        """GET /transactions/:id without auth returns 401."""
        response = await client.get(
            "/api/v1/transactions/00000000-0000-0000-0000-000000000000",
        )
        assert response.status_code == 401


class TestDeposit:
    """Deposit creation."""

    @pytest.mark.asyncio
    async def test_deposit_success(
        self, client: AsyncClient, auth_headers: dict, test_asset: dict,
    ):
        """POST /transactions/deposit creates a pending deposit."""
        response = await client.post(
            "/api/v1/transactions/deposit",
            headers=auth_headers,
            json={"asset": "BTC", "amount": "0.5"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["status"] == "PENDING"

    @pytest.mark.asyncio
    async def test_deposit_unknown_asset(self, client: AsyncClient, auth_headers: dict):
        """POST /transactions/deposit with unknown asset returns error."""
        response = await client.post(
            "/api/v1/transactions/deposit",
            headers=auth_headers,
            json={"asset": "FAKE", "amount": "1.0"},
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_deposit_unauthorized(self, client: AsyncClient):
        """POST /transactions/deposit without auth returns 401."""
        response = await client.post(
            "/api/v1/transactions/deposit",
            json={"asset": "BTC", "amount": "0.5"},
        )
        assert response.status_code == 401


class TestWithdrawal:
    """Withdrawal creation with security checks."""

    @pytest.mark.asyncio
    async def test_withdrawal_success(
        self, client: AsyncClient, auth_headers: dict, test_wallet: dict,
    ):
        """POST /transactions/withdraw creates a pending withdrawal."""
        response = await client.post(
            "/api/v1/transactions/withdraw",
            headers=auth_headers,
            json={
                "asset": "BTC",
                "amount": "0.5",
                "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                "network": "bitcoin",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["status"] == "PENDING"

    @pytest.mark.asyncio
    async def test_withdrawal_insufficient_balance(
        self, client: AsyncClient, auth_headers: dict, test_wallet: dict,
    ):
        """POST /transactions/withdraw with amount > balance returns error."""
        response = await client.post(
            "/api/v1/transactions/withdraw",
            headers=auth_headers,
            json={
                "asset": "BTC",
                "amount": "100.0",  # wallet only has 10
                "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            },
        )
        assert response.status_code in (400, 422)

    @pytest.mark.asyncio
    async def test_withdrawal_no_address(self, client: AsyncClient, auth_headers: dict):
        """POST /transactions/withdraw without address returns error."""
        response = await client.post(
            "/api/v1/transactions/withdraw",
            headers=auth_headers,
            json={"asset": "BTC", "amount": "0.5"},
        )
        assert response.status_code in (400, 422)

    @pytest.mark.asyncio
    async def test_withdrawal_unauthorized(self, client: AsyncClient):
        """POST /transactions/withdraw without auth returns 401."""
        response = await client.post(
            "/api/v1/transactions/withdraw",
            json={"asset": "BTC", "amount": "0.5", "address": "abc"},
        )
        assert response.status_code == 401
