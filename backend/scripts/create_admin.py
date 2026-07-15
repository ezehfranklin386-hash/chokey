"""Create an admin user from the command line.

Usage:
    python -m scripts.create_admin --email admin@example.com --password "SecurePass123!"
"""

from __future__ import annotations

import argparse
import asyncio
import uuid
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pathlib import Path

from app.core.security import hash_password
from app.database import async_session_factory
from app.models.user import User


async def create_admin(email: str, password: str, display_name: str = "Admin") -> None:
    """Create an admin user if one doesn't already exist with this email."""
    async with async_session_factory() as session:
        existing = await session.get(User, email)  # not ideal; we'll query by email
        from sqlalchemy import select

        result = await session.execute(select(User).where(User.email == email))
        existing = result.scalar_one_or_none()

        if existing:
            print(f"User {email} already exists (admin={existing.is_admin}).")
            if not existing.is_admin:
                existing.is_admin = True
                await session.commit()
                print(f"Promoted {email} to admin.")
            return

        user = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=hash_password(password),
            display_name=display_name,
            is_verified=True,
            is_active=True,
            is_admin=True,
        )
        session.add(user)
        await session.commit()
        print(f"✅ Admin user created: {email}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create an admin user")
    parser.add_argument("--email", required=True, help="Email address")
    parser.add_argument("--password", required=True, help="Password")
    parser.add_argument("--name", default="Admin", help="Display name")
    args = parser.parse_args()

    asyncio.run(create_admin(args.email, args.password, args.name))


if __name__ == "__main__":
    main()
