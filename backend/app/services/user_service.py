"""User profile and settings business logic."""

from __future__ import annotations

from typing import Any

from sqlalchemy import select

from app.core.exceptions import NotFoundException
from app.database import async_session_factory
from app.models.user import ApiKey, Session, User, UserSettings


class UserService:
    @staticmethod
    async def get_profile(user_id: str) -> dict[str, Any]:
        """Get current user profile."""
        async with async_session_factory() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise NotFoundException("User not found.")

            return {
                "id": user.id,
                "email": user.email,
                "email_verified": user.email_verified,
                "display_name": user.display_name,
                "avatar_url": user.avatar_url,
                "role": user.role,
                "kyc_level": user.kyc_level,
                "two_factor_enabled": user.two_factor_enabled,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
            }

    @staticmethod
    async def update_profile(user_id: str, data: dict) -> dict[str, Any]:
        """Update user profile fields."""
        async with async_session_factory() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise NotFoundException("User not found.")

            allowed = {"display_name", "avatar_url"}
            for key, value in data.items():
                if key in allowed:
                    setattr(user, key, value)

            await session.commit()
            return {"message": "Profile updated."}

    @staticmethod
    async def get_settings(user_id: str) -> dict[str, Any]:
        """Get user settings."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(UserSettings).where(UserSettings.user_id == user_id)
            )
            s = result.scalar_one_or_none()
            if not s:
                return {
                    "language": "en",
                    "currency": "USD",
                    "theme": "system",
                    "notifications": {"price": True, "signal": True, "trade": True, "system": True},
                }
            return {
                "language": s.language,
                "currency": s.currency,
                "theme": s.theme,
                "notifications": {
                    "price": s.notification_price,
                    "signal": s.notification_signal,
                    "trade": s.notification_trade,
                    "system": s.notification_system,
                },
            }

    @staticmethod
    async def update_settings(user_id: str, data: dict) -> dict[str, Any]:
        """Update user settings."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(UserSettings).where(UserSettings.user_id == user_id)
            )
            s = result.scalar_one_or_none()
            if not s:
                raise NotFoundException("Settings not found.")

            field_map = {
                "language": "language",
                "currency": "currency",
                "theme": "theme",
            }
            notification_map = {
                "price": "notification_price",
                "signal": "notification_signal",
                "trade": "notification_trade",
                "system": "notification_system",
            }

            for key, value in data.items():
                if key in field_map:
                    setattr(s, field_map[key], value)
                elif key == "notifications" and isinstance(value, dict):
                    for nk, nv in value.items():
                        col = notification_map.get(nk)
                        if col:
                            setattr(s, col, nv)

            await session.commit()
            return {"message": "Settings updated."}

    @staticmethod
    async def list_sessions(user_id: str) -> list[dict[str, Any]]:
        """List active sessions."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Session)
                .where(Session.user_id == user_id, Session.is_revoked == False)  # noqa: E712
                .order_by(Session.created_at.desc())
            )
            sessions = result.scalars().all()
            return [
                {
                    "id": s.id,
                    "device_info": s.device_info,
                    "ip_address": s.ip_address,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                    "expires_at": s.expires_at.isoformat() if s.expires_at else None,
                }
                for s in sessions
            ]

    @staticmethod
    async def revoke_session(user_id: str, session_id: str) -> None:
        """Revoke a specific session."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Session).where(Session.id == session_id, Session.user_id == user_id)
            )
            s = result.scalar_one_or_none()
            if s:
                s.is_revoked = True
                await session.commit()

    @staticmethod
    async def revoke_all_sessions(user_id: str, current_session_id: str) -> None:
        """Revoke all sessions except current."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Session).where(
                    Session.user_id == user_id,
                    Session.id != current_session_id,
                    Session.is_revoked == False,  # noqa: E712
                )
            )
            for s in result.scalars():
                s.is_revoked = True
            await session.commit()

    @staticmethod
    async def list_api_keys(user_id: str) -> list[dict[str, Any]]:
        """List API keys."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(ApiKey).where(
                    ApiKey.user_id == user_id,
                    ApiKey.is_active == True,  # noqa: E712
                )
            )
            keys = result.scalars().all()
            return [
                {
                    "id": k.id,
                    "label": k.label,
                    "key_prefix": k.key_prefix,
                    "permissions": k.permissions,
                    "created_at": k.created_at.isoformat() if k.created_at else None,
                    "last_used_at": k.last_used_at.isoformat() if k.last_used_at else None,
                    "expires_at": k.expires_at.isoformat() if k.expires_at else None,
                }
                for k in keys
            ]

    @staticmethod
    async def create_api_key(
        user_id: str,
        label: str,
        permissions: list[str],
    ) -> dict[str, Any]:
        """Create a new API key."""
        import uuid

        from app.core.security import generate_api_key, hash_token

        async with async_session_factory() as session:
            full_key, prefix = generate_api_key()
            api_key = ApiKey(
                id=str(uuid.uuid4()),
                user_id=user_id,
                label=label,
                key_prefix=prefix,
                key_hash=hash_token(full_key),
                permissions={"read", "trade"} if "trade" in permissions else {"read"},
            )
            session.add(api_key)
            await session.commit()

            return {
                "id": api_key.id,
                "key": full_key,
                "label": label,
                "key_prefix": prefix,
            }

    @staticmethod
    async def revoke_api_key(user_id: str, key_id: str) -> None:
        """Revoke an API key."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == user_id)
            )
            k = result.scalar_one_or_none()
            if k:
                k.is_active = False
                await session.commit()


user_service = UserService()
