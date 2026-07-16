"""Tests for KYC endpoints — submit, status, documents."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestKYCSubmit:
    """KYC document submission."""

    @pytest.mark.asyncio
    async def test_submit(self, client: AsyncClient, auth_headers: dict):
        """POST /kyc/submit returns success with document ID."""
        response = await client.post("/api/v1/kyc/submit", headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert "id" in data["data"]

    @pytest.mark.asyncio
    async def test_submit_unauthorized(self, client: AsyncClient):
        """POST /kyc/submit without auth returns 401."""
        response = await client.post("/api/v1/kyc/submit")
        assert response.status_code == 401


class TestKYCStatus:
    """KYC status retrieval."""

    @pytest.mark.asyncio
    async def test_status(self, client: AsyncClient, auth_headers: dict):
        """GET /kyc/status returns current KYC level and status."""
        response = await client.get("/api/v1/kyc/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "kyc_level" in data["data"]
        assert "status" in data["data"]

    @pytest.mark.asyncio
    async def test_status_unauthorized(self, client: AsyncClient):
        """GET /kyc/status without auth returns 401."""
        response = await client.get("/api/v1/kyc/status")
        assert response.status_code == 401


class TestKYCDocuments:
    """KYC document listing."""

    @pytest.mark.asyncio
    async def test_list_documents(self, client: AsyncClient, auth_headers: dict):
        """GET /kyc/documents returns document list."""
        response = await client.get("/api/v1/kyc/documents", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "documents" in data["data"]

    @pytest.mark.asyncio
    async def test_list_documents_unauthorized(self, client: AsyncClient):
        """GET /kyc/documents without auth returns 401."""
        response = await client.get("/api/v1/kyc/documents")
        assert response.status_code == 401
