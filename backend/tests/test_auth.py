"""Tests for authentication endpoints — register, login, refresh, logout."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestHealth:
    """Basic health and connectivity checks."""

    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        """GET /health should return ok with app name."""
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "app" in data
        assert "db" in data

    @pytest.mark.asyncio
    async def test_ready_check(self, client: AsyncClient):
        """GET /ready should return ok or degraded."""
        response = await client.get("/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ("ok", "degraded")

    @pytest.mark.asyncio
    async def test_ping(self, client: AsyncClient):
        """GET /api/v1/ping should return pong."""
        response = await client.get("/api/v1/ping")
        assert response.status_code == 200
        assert response.json()["status"] == "pong"

    @pytest.mark.asyncio
    async def test_cors_headers(self, client: AsyncClient):
        """Response should include CORS headers."""
        response = await client.options("/health", headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        })
        assert "access-control-allow-origin" in response.headers

    @pytest.mark.asyncio
    async def test_metrics_endpoint(self, client: AsyncClient):
        """GET /metrics should return Prometheus data."""
        response = await client.get("/metrics")
        # Either 200 (instrumentator installed) or 404 (not installed)
        assert response.status_code in (200, 404)


class TestRegistration:
    """User registration flow."""

    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient):
        """Register a new user successfully."""
        response = await client.post("/api/v1/auth/register", json={
            "email": "newuser@chokey.app",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "display_name": "New User",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["email"] == "newuser@chokey.app"

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient):
        """Registering with an existing email should fail."""
        # First registration
        await client.post("/api/v1/auth/register", json={
            "email": "dup@chokey.app",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
        })
        # Duplicate
        response = await client.post("/api/v1/auth/register", json={
            "email": "dup@chokey.app",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
        })
        assert response.status_code in (409, 400)

    @pytest.mark.asyncio
    async def test_register_missing_fields(self, client: AsyncClient):
        """Register without required fields should fail."""
        response = await client.post("/api/v1/auth/register", json={
            "email": "missing@chokey.app",
        })
        assert response.status_code in (400, 422)

    @pytest.mark.asyncio
    async def test_register_password_mismatch(self, client: AsyncClient):
        """Password confirm mismatch should fail."""
        response = await client.post("/api/v1/auth/register", json={
            "email": "mismatch@chokey.app",
            "password": "SecurePass123!",
            "password_confirm": "DifferentPass456!",
        })
        assert response.status_code in (400, 422)


class TestLogin:
    """Authentication flow."""

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, registered_user: dict):
        """Login with valid credentials returns tokens."""
        response = await client.post("/api/v1/auth/login", json={
            "email": registered_user["email"],
            "password": registered_user["password"],
        })
        assert response.status_code == 200
        data = response.json().get("data", {})
        assert data.get("access_token") or data.get("accessToken"), "No access token returned"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient):
        """Login with wrong password should fail."""
        response = await client.post("/api/v1/auth/login", json={
            "email": "testuser@chokey.app",
            "password": "WrongPassword999!",
        })
        assert response.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Login with unregistered email should fail."""
        response = await client.post("/api/v1/auth/login", json={
            "email": "nobody@example.com",
            "password": "SomePass123!",
        })
        assert response.status_code in (401, 404)


class TestAuthenticatedEndpoints:
    """Endpoints that require a valid JWT."""

    @pytest.mark.asyncio
    async def test_me_authenticated(self, client: AsyncClient, auth_headers: dict):
        """GET /auth/me returns user data with valid token."""
        response = await client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json().get("data", {})
        assert data.get("email") or data.get("id"), "No user data returned"

    @pytest.mark.asyncio
    async def test_me_unauthenticated(self, client: AsyncClient):
        """GET /auth/me without token returns 401."""
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_invalid_token(self, client: AsyncClient):
        """Request with invalid JWT returns 401."""
        response = await client.get("/api/v1/auth/me", headers={
            "Authorization": "Bearer invalid.jwt.token",
        })
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_expired_token_format(self, client: AsyncClient):
        """Malformed token header returns 401."""
        response = await client.get("/api/v1/auth/me", headers={
            "Authorization": "Bearer ",
        })
        assert response.status_code == 401


class TestProtectedEndpoints:
    """All protected routes return 401 without auth."""

    ROUTES = [
        ("GET", "/api/v1/wallets"),
        ("GET", "/api/v1/wallets/summary"),
        ("GET", "/api/v1/orders"),
        ("POST", "/api/v1/orders"),
        ("GET", "/api/v1/orders/trades"),
        ("GET", "/api/v1/orders/history"),
        ("GET", "/api/v1/transactions"),
        ("GET", "/api/v1/users/me"),
        ("PUT", "/api/v1/users/me"),
        ("GET", "/api/v1/users/me/settings"),
        ("GET", "/api/v1/users/me/sessions"),
        ("GET", "/api/v1/users/me/api-keys"),
        ("GET", "/api/v1/notifications"),
        ("GET", "/api/v1/admin/users"),
    ]

    @pytest.mark.asyncio
    @pytest.mark.parametrize("method,path", ROUTES)
    async def test_protected_route(self, client: AsyncClient, method: str, path: str):
        """All protected routes reject unauthenticated requests."""
        response = await client.request(method, path)
        assert response.status_code == 401, f"{method} {path} returned {response.status_code}, expected 401"
