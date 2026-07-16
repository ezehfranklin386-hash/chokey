"""Create all tables from models and stamp Alembic head.

Run on fresh databases where no tables exist yet.
"""

from __future__ import annotations

import asyncio
import sys

from alembic.config import Config
from alembic import command
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.config import settings
from app.database import Base

# Import all models so they register on Base.metadata
import app.models  # noqa: F401


async def main() -> None:
    engine = create_async_engine(settings.async_database_url)

    try:
        # Check if any tables exist
        async with engine.connect() as conn:
            result = await conn.execute(
                text("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
            )
            table_count = result.scalar()

        if table_count == 0:
            print(f"=== No tables found. Creating {len(Base.metadata.tables)} tables from models... ===")
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("=== Tables created successfully ===")

            # Stamp Alembic at head so future migrations work
            alembic_cfg = Config("alembic.ini")
            command.stamp(alembic_cfg, "head")
            print(f"=== Alembic stamped at head ===")
        else:
            print(f"=== Found {table_count} existing tables. Skipping creation. ===")
            # Run pending migrations
            alembic_cfg = Config("alembic.ini")
            command.upgrade(alembic_cfg, "head")
            print("=== Migrations up to date ===")
    except Exception as e:
        print(f"=== ERROR during DB init: {e} ===", file=sys.stderr)
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
