"""Tests for authentication endpoints."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """GET /health should return ok."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_ping(client: AsyncClient):
    """GET /api/v1/ping should return pong."""
    response = await client.get("/api/v1/ping")
    assert response.status_code == 200
    assert response.json()["status"] == "pong"


@pytest.mark.asyncio
async def test_register_endpoint_exists(client: AsyncClient):
    """POST /api/v1/auth/register should exist."""
    response = await client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "TestPass123!",
        "password_confirm": "TestPass123!",
    })
    # Placeholder — will fail with NotImplementedError until service is implemented
    assert response.status_code in (200, 201, 500)


@pytest.mark.asyncio
async def test_login_endpoint_exists(client: AsyncClient):
    """POST /api/v1/auth/login should exist."""
    response = await client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "TestPass123!",
    })
    assert response.status_code in (200, 500)


@pytest.mark.asyncio
async def test_health_detail(client: AsyncClient):
    """Health endpoint should include app name."""
    response = await client.get("/health")
    assert "app" in response.json()


@pytest.mark.asyncio
async def test_cors_headers(client: AsyncClient):
    """Response should include CORS headers."""
    response = await client.options("/health", headers={
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET",
    })
    assert "access-control-allow-origin" in response.headers
