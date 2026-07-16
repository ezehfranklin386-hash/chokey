"""Tests for admin endpoints — user management, KYC review, stats."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestAdminAuth:
    """Admin routes are accessible with valid auth (role check is TODO)."""

    @pytest.mark.asyncio
    async def test_list_users(self, client: AsyncClient, auth_headers: dict):
        """GET /admin/users should return user list."""
        response = await client.get("/api/v1/admin/users", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_list_users_unauthorized(self, client: AsyncClient):
        """GET /admin/users without auth returns 401."""
        response = await client.get("/api/v1/admin/users")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_user_detail(self, client: AsyncClient, auth_headers: dict):
        """GET /admin/users/:id should return user detail."""
        response = await client.get("/api/v1/admin/users/test-user-id", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["id"] == "test-user-id"

    @pytest.mark.asyncio
    async def test_update_user(self, client: AsyncClient, auth_headers: dict):
        """PUT /admin/users/:id should succeed."""
        response = await client.put("/api/v1/admin/users/test-user-id", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["status"] == "success"


class TestAdminKYC:
    """Admin KYC review workflow."""

    @pytest.mark.asyncio
    async def test_pending_kyc(self, client: AsyncClient, auth_headers: dict):
        """GET /admin/kyc/pending should list pending documents."""
        response = await client.get("/api/v1/admin/kyc/pending", headers=auth_headers)
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_approve_kyc(self, client: AsyncClient, auth_headers: dict):
        """POST /admin/kyc/:id/approve should succeed."""
        response = await client.post("/api/v1/admin/kyc/doc-123/approve", headers=auth_headers)
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_reject_kyc(self, client: AsyncClient, auth_headers: dict):
        """POST /admin/kyc/:id/reject should succeed."""
        response = await client.post("/api/v1/admin/kyc/doc-123/reject", headers=auth_headers)
        assert response.status_code == 200


class TestAdminTransactions:
    """Admin transaction and order views."""

    @pytest.mark.asyncio
    async def test_list_all_transactions(self, client: AsyncClient, auth_headers: dict):
        """GET /admin/transactions should return all transactions."""
        response = await client.get("/api/v1/admin/transactions", headers=auth_headers)
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_list_all_orders(self, client: AsyncClient, auth_headers: dict):
        """GET /admin/orders should return all orders."""
        response = await client.get("/api/v1/admin/orders", headers=auth_headers)
        assert response.status_code == 200


class TestAdminSettings:
    """System settings management."""

    @pytest.mark.asyncio
    async def test_get_settings(self, client: AsyncClient, auth_headers: dict):
        """GET /admin/settings should return system config."""
        response = await client.get("/api/v1/admin/settings", headers=auth_headers)
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_update_settings(self, client: AsyncClient, auth_headers: dict):
        """PUT /admin/settings should succeed."""
        response = await client.put("/api/v1/admin/settings", headers=auth_headers)
        assert response.status_code == 200


class TestAdminStats:
    """Dashboard statistics."""

    @pytest.mark.asyncio
    async def test_get_stats(self, client: AsyncClient, auth_headers: dict):
        """GET /admin/stats should return dashboard data."""
        response = await client.get("/api/v1/admin/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json().get("data", {})
        assert "total_users" in data
        assert "total_volume_24h" in data
        assert "active_signals" in data
        assert "pending_kyc" in data
        assert "open_orders" in data
