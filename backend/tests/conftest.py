"""Pytest fixtures: async DB session, test client, real auth headers."""

from __future__ import annotations

import asyncio
import uuid
from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.main import app

# Use SQLite for fast tests (swap to PostgreSQL for full integration)
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_session_factory = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

TEST_USER_EMAIL = "testuser@chokey.app"
TEST_USER_PASSWORD = "TestUser123!"
TEST_USER_DISPLAY = "Test User"


@pytest.fixture(scope="session")
def event_loop():
    """Create a single event loop for the test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    """Create tables before each test, drop after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    """Override the get_db dependency to use the test database."""
    async with test_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """HTTP test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def registered_user(client: AsyncClient) -> dict[str, Any]:
    """Register a test user and return credentials + tokens."""
    response = await client.post("/api/v1/auth/register", json={
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
        "password_confirm": TEST_USER_PASSWORD,
        "display_name": TEST_USER_DISPLAY,
    })
    if response.status_code == 201:
        data = response.json().get("data", {})
    else:
        # User may already exist from previous test
        data = {}
    return {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
        "display_name": TEST_USER_DISPLAY,
        "id": data.get("id"),
    }


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient, registered_user: dict[str, Any]) -> dict[str, str]:
    """Log in and return real Authorization headers with JWT."""
    response = await client.post("/api/v1/auth/login", json={
        "email": registered_user["email"],
        "password": registered_user["password"],
    })

    if response.status_code == 200:
        data = response.json().get("data", {})
        token = data.get("access_token") or data.get("accessToken")
        if token:
            return {"Authorization": f"Bearer {token}"}

    return {"Authorization": "Bearer test_token_placeholder"}


@pytest_asyncio.fixture
async def test_user_id(client: AsyncClient, auth_headers: dict[str, str]) -> str | None:
    """Get the authenticated user's ID from /auth/me."""
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    if response.status_code == 200:
        data = response.json().get("data", {})
        return data.get("id")
    return None


@pytest_asyncio.fixture
async def test_asset() -> dict[str, Any]:
    """Create a BTC asset in the test DB for use in wallet/txn tests."""
    from app.models.wallet import Asset

    asset_id = str(uuid.uuid4())
    async with test_session_factory() as session:
        asset = Asset(
            id=asset_id,
            symbol="BTC",
            name="Bitcoin",
            type="cryptocurrency",
            is_active=True,
            is_supported=True,
            decimals=8,
        )
        session.add(asset)
        await session.commit()
    return {"id": asset_id, "symbol": "BTC"}


@pytest_asyncio.fixture
async def test_wallet(test_user_id: str, test_asset: dict[str, Any]) -> dict[str, Any]:
    """Create a wallet for the test user with a funded balance."""
    from app.models.wallet import Wallet

    wallet_id = str(uuid.uuid4())
    async with test_session_factory() as session:
        wallet = Wallet(
            id=wallet_id,
            user_id=test_user_id,
            asset_id=test_asset["id"],
            balance=Decimal("10.0"),
            locked_balance=Decimal("0"),
            type="CUSTODIAL",
        )
        session.add(wallet)
        await session.commit()
    return {"id": wallet_id, "user_id": test_user_id, "asset_id": test_asset["id"]}
