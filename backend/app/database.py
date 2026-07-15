"""Async database engine, session factory, and Base.

Supports read/write splitting when DATABASE_READ_URL is configured.
All writes go through the primary engine; reads can use the read replica.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# Naming convention for constraints (required by Alembic)
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=convention)

# ── Primary (write) engine ───────────────────────────────────

engine = create_async_engine(
    settings.async_database_url,
    echo=settings.debug,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_pre_ping=True,
    pool_recycle=1800,
    pool_use_lifo=True,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ── Read replica engine (optional) ──────────────────────────

_read_engine = None
_read_session_factory = None

if settings.async_database_read_url:
    _read_engine = create_async_engine(
        settings.async_database_read_url,
        echo=settings.debug,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_pre_ping=True,
        pool_recycle=1800,
        pool_use_lifo=True,
    )
    _read_session_factory = async_sessionmaker(
        _read_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )


class Base(DeclarativeBase):
    metadata = metadata


# ── Session dependencies ─────────────────────────────────────


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — yields a primary (read-write) session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_db_read() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — yields a read-replica session when available.

    Falls back to the primary engine if no read replica is configured.
    """
    factory = _read_session_factory or async_session_factory
    async with factory() as session:
        try:
            yield session
            # Read-only sessions do not commit
        except Exception:
            await session.rollback()
            raise
