"""Tests for user profile, settings, sessions, and API key endpoints."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestProfile:
    """User profile retrieval and update."""

    @pytest.mark.asyncio
    async def test_get_profile(self, client: AsyncClient, auth_headers: dict):
        """GET /users/me returns user profile."""
        response = await client.get("/api/v1/users/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        profile = data["data"]
        assert "id" in profile
        assert "email" in profile
        assert "display_name" in profile
        assert profile["email"] == "testuser@chokey.app"

    @pytest.mark.asyncio
    async def test_get_profile_unauthorized(self, client: AsyncClient):
        """GET /users/me without auth returns 401."""
        response = await client.get("/api/v1/users/me")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_update_profile(self, client: AsyncClient, auth_headers: dict):
        """PUT /users/me updates allowed fields."""
        response = await client.put(
            "/api/v1/users/me",
            headers=auth_headers,
            json={"display_name": "Updated Name"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_update_profile_unauthorized(self, client: AsyncClient):
        """PUT /users/me without auth returns 401."""
        response = await client.put(
            "/api/v1/users/me",
            json={"display_name": "Hacker"},
        )
        assert response.status_code == 401


class TestSettings:
    """User settings management."""

    @pytest.mark.asyncio
    async def test_get_settings(self, client: AsyncClient, auth_headers: dict):
        """GET /users/me/settings returns user preferences."""
        response = await client.get("/api/v1/users/me/settings", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        settings = data["data"]
        assert "language" in settings
        assert "currency" in settings
        assert "theme" in settings
        assert "notifications" in settings

    @pytest.mark.asyncio
    async def test_get_settings_unauthorized(self, client: AsyncClient):
        """GET /users/me/settings without auth returns 401."""
        response = await client.get("/api/v1/users/me/settings")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_update_settings(self, client: AsyncClient, auth_headers: dict):
        """PUT /users/me/settings updates preferences."""
        response = await client.put(
            "/api/v1/users/me/settings",
            headers=auth_headers,
            json={"language": "fr", "theme": "dark"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_patch_settings(self, client: AsyncClient, auth_headers: dict):
        """PATCH /users/me/settings works the same as PUT."""
        response = await client.patch(
            "/api/v1/users/me/settings",
            headers=auth_headers,
            json={"currency": "EUR"},
        )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_update_settings_unauthorized(self, client: AsyncClient):
        """PUT /users/me/settings without auth returns 401."""
        response = await client.put(
            "/api/v1/users/me/settings",
            json={"language": "de"},
        )
        assert response.status_code == 401


class TestSessions:
    """Session management."""

    @pytest.mark.asyncio
    async def test_list_sessions(self, client: AsyncClient, auth_headers: dict):
        """GET /users/me/sessions returns session list."""
        response = await client.get("/api/v1/users/me/sessions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "sessions" in data["data"]

    @pytest.mark.asyncio
    async def test_revoke_session(self, client: AsyncClient, auth_headers: dict):
        """DELETE /users/me/sessions/:id revokes a session."""
        response = await client.delete(
            "/api/v1/users/me/sessions/some-session-id",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_revoke_all_sessions(self, client: AsyncClient, auth_headers: dict):
        """POST /users/me/sessions/revoke-all revokes other sessions."""
        response = await client.post(
            "/api/v1/users/me/sessions/revoke-all",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_sessions_unauthorized(self, client: AsyncClient):
        """Session endpoints return 401 without auth."""
        for method, path in [
            ("GET", "/api/v1/users/me/sessions"),
            ("DELETE", "/api/v1/users/me/sessions/sid"),
            ("POST", "/api/v1/users/me/sessions/revoke-all"),
        ]:
            response = await client.request(method, path)
            assert response.status_code == 401, f"{method} {path} returned {response.status_code}"


class TestAPIKeys:
    """API key management."""

    @pytest.mark.asyncio
    async def test_list_api_keys(self, client: AsyncClient, auth_headers: dict):
        """GET /users/me/api-keys returns key list."""
        response = await client.get("/api/v1/users/me/api-keys", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "keys" in data["data"]

    @pytest.mark.asyncio
    async def test_create_api_key(self, client: AsyncClient, auth_headers: dict):
        """POST /users/me/api-keys creates a new API key."""
        response = await client.post(
            "/api/v1/users/me/api-keys",
            headers=auth_headers,
            json={"label": "Test Key", "permissions": ["read", "trade"]},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert "key" in data["data"]  # full key returned on creation
        assert data["data"]["label"] == "Test Key"

    @pytest.mark.asyncio
    async def test_create_api_key_default_label(self, client: AsyncClient, auth_headers: dict):
        """POST /users/me/api-keys with no label uses default."""
        response = await client.post(
            "/api/v1/users/me/api-keys",
            headers=auth_headers,
            json={},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_revoke_api_key(self, client: AsyncClient, auth_headers: dict):
        """DELETE /users/me/api-keys/:id revokes a key."""
        response = await client.delete(
            "/api/v1/users/me/api-keys/key-123",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_api_keys_unauthorized(self, client: AsyncClient):
        """API key endpoints return 401 without auth."""
        for method, path in [
            ("GET", "/api/v1/users/me/api-keys"),
            ("POST", "/api/v1/users/me/api-keys"),
            ("DELETE", "/api/v1/users/me/api-keys/kid"),
        ]:
            response = await client.request(method, path)
            assert response.status_code == 401, f"{method} {path} returned {response.status_code}"
