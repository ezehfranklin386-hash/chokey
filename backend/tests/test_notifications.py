"""Tests for notification and price-alert endpoints."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestListNotifications:
    """Notification listing."""

    @pytest.mark.asyncio
    async def test_list_empty(self, client: AsyncClient, auth_headers: dict):
        """GET /notifications with no notifications returns empty list."""
        response = await client.get("/api/v1/notifications", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["notifications"] == []
        assert data["data"]["total"] == 0
        assert data["data"]["unread_count"] == 0

    @pytest.mark.asyncio
    async def test_list_pagination(self, client: AsyncClient, auth_headers: dict):
        """GET /notifications with page/limit params works."""
        response = await client.get(
            "/api/v1/notifications?page=1&limit=5",
            headers=auth_headers,
        )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_list_unauthorized(self, client: AsyncClient):
        """GET /notifications without auth returns 401."""
        response = await client.get("/api/v1/notifications")
        assert response.status_code == 401


class TestGetNotification:
    """Single notification detail."""

    @pytest.mark.asyncio
    async def test_get_not_found(self, client: AsyncClient, auth_headers: dict):
        """GET /notifications/:id with nonexistent ID returns error."""
        response = await client.get(
            "/api/v1/notifications/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "error"

    @pytest.mark.asyncio
    async def test_get_unauthorized(self, client: AsyncClient):
        """GET /notifications/:id without auth returns 401."""
        response = await client.get(
            "/api/v1/notifications/00000000-0000-0000-0000-000000000000",
        )
        assert response.status_code == 401


class TestMarkNotificationRead:
    """Mark notifications as read."""

    @pytest.mark.asyncio
    async def test_mark_read(self, client: AsyncClient, auth_headers: dict):
        """POST /notifications/:id/read should succeed."""
        response = await client.post(
            "/api/v1/notifications/some-id/read",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_mark_read_unauthorized(self, client: AsyncClient):
        """POST /notifications/:id/read without auth returns 401."""
        response = await client.post("/api/v1/notifications/some-id/read")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_mark_all_read(self, client: AsyncClient, auth_headers: dict):
        """POST /notifications/read-all should succeed."""
        response = await client.post(
            "/api/v1/notifications/read-all",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_mark_all_read_unauthorized(self, client: AsyncClient):
        """POST /notifications/read-all without auth returns 401."""
        response = await client.post("/api/v1/notifications/read-all")
        assert response.status_code == 401


class TestPriceAlerts:
    """Price alert CRUD."""

    @pytest.mark.asyncio
    async def test_list_alerts(self, client: AsyncClient, auth_headers: dict):
        """GET /price-alerts returns alert list."""
        response = await client.get("/api/v1/price-alerts", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "alerts" in data["data"]

    @pytest.mark.asyncio
    async def test_create_alert(self, client: AsyncClient, auth_headers: dict):
        """POST /price-alerts creates a new alert."""
        response = await client.post("/api/v1/price-alerts", headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["status"] == "ACTIVE"

    @pytest.mark.asyncio
    async def test_delete_alert(self, client: AsyncClient, auth_headers: dict):
        """DELETE /price-alerts/:id should succeed."""
        response = await client.delete(
            "/api/v1/price-alerts/alert-123",
            headers=auth_headers,
        )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_alerts_unauthorized(self, client: AsyncClient):
        """All price-alert endpoints return 401 without auth."""
        for method, path in [
            ("GET", "/api/v1/price-alerts"),
            ("POST", "/api/v1/price-alerts"),
            ("DELETE", "/api/v1/price-alerts/alert-123"),
        ]:
            response = await client.request(method, path)
            assert response.status_code == 401, f"{method} {path} returned {response.status_code}"
