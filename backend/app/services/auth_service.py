"""Authentication business logic — register, login, JWT, 2FA."""

from __future__ import annotations

import secrets
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError
from sqlalchemy import select

from app.core.exceptions import (
    ConflictException,
    InvalidInputException,
    UnauthorizedException,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.database import async_session_factory
from app.models.user import Session, User, UserSettings


class AuthService:
    """Handles user registration, login, 2FA, token management."""

    @staticmethod
    async def register(
        email: str,
        password: str,
        password_confirm: str,
        referral_code: str | None = None,
    ) -> dict[str, Any]:
        """Register a new user."""
        if password != password_confirm:
            raise InvalidInputException("Passwords do not match.")

        if len(password) < 8:
            raise InvalidInputException("Password must be at least 8 characters.")

        async with async_session_factory() as session:
            existing = await session.execute(select(User).where(User.email == email))
            if existing.scalar_one_or_none():
                raise ConflictException("Email already registered.")

            user = User(
                id=str(uuid.uuid4()),
                email=email,
                password_hash=hash_password(password),
                display_name=email.split("@")[0],
            )
            session.add(user)
            await session.flush()

            # Create default user settings
            settings = UserSettings(id=str(uuid.uuid4()), user_id=user.id)
            session.add(settings)

            await session.commit()

            return {
                "id": user.id,
                "email": user.email,
                "display_name": user.display_name,
            }

    @staticmethod
    async def login(
        email: str,
        password: str,
        device_info: dict | None = None,
    ) -> dict[str, Any]:
        """Authenticate user and return tokens."""
        async with async_session_factory() as session:
            result = await session.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()

            if not user or not verify_password(password, user.password_hash):
                raise UnauthorizedException("Invalid email or password.")

            if not user.is_active:
                raise UnauthorizedException("Account is deactivated.")

            if user.is_locked:
                raise UnauthorizedException(f"Account locked: {user.lock_reason or 'Contact support.'}")

            # Update last login
            user.last_login_at = datetime.now(UTC)
            user.last_active_at = datetime.now(UTC)
            await session.flush()

            # Create session + tokens
            session_id = str(uuid.uuid4())
            access_token = create_access_token(
                subject=user.id,
                role=user.role,
                kyc_level=user.kyc_level,
                session_id=session_id,
            )
            refresh_token = create_refresh_token(user.id, session_id)

            # Store hashed refresh token
            db_session = Session(
                id=session_id,
                user_id=user.id,
                refresh_token=hash_token(refresh_token),
                device_info=device_info or {},
                expires_at=datetime.now(UTC) + timedelta(days=7),
            )
            session.add(db_session)
            await session.commit()

            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "Bearer",
                "expires_in": 1800,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "display_name": user.display_name,
                    "role": user.role,
                    "kyc_level": user.kyc_level,
                    "two_factor_enabled": user.two_factor_enabled,
                },
            }

    @staticmethod
    async def refresh_tokens(refresh_token: str) -> dict[str, Any]:
        """Rotate refresh token and issue new access + refresh tokens."""
        token_hash = hash_token(refresh_token)

        async with async_session_factory() as session:
            result = await session.execute(
                select(Session).where(
                    Session.refresh_token == token_hash,
                    Session.is_revoked == False,  # noqa: E712
                    Session.expires_at > datetime.now(UTC),
                )
            )
            db_session = result.scalar_one_or_none()

            if not db_session:
                raise UnauthorizedException("Invalid or expired refresh token.")

            # Revoke old session
            db_session.is_revoked = True

            # Get user
            result = await session.execute(select(User).where(User.id == db_session.user_id))
            user = result.scalar_one_or_none()
            if not user or not user.is_active:
                raise UnauthorizedException("User account not found or deactivated.")

            # Create new session + tokens
            new_session_id = str(uuid.uuid4())
            new_access = create_access_token(
                subject=user.id,
                role=user.role,
                kyc_level=user.kyc_level,
                session_id=new_session_id,
            )
            new_refresh = create_refresh_token(user.id, new_session_id)

            new_session = Session(
                id=new_session_id,
                user_id=user.id,
                refresh_token=hash_token(new_refresh),
                device_info=db_session.device_info,
                expires_at=datetime.now(UTC) + timedelta(days=7),
            )
            session.add(new_session)
            await session.commit()

            return {
                "access_token": new_access,
                "refresh_token": new_refresh,
                "token_type": "Bearer",
                "expires_in": 1800,
            }

    @staticmethod
    async def logout(user_id: str, refresh_token: str | None = None) -> None:
        """Revoke session(s)."""
        async with async_session_factory() as session:
            if refresh_token:
                token_hash = hash_token(refresh_token)
                result = await session.execute(
                    select(Session).where(
                        Session.refresh_token == token_hash,
                        Session.user_id == user_id,
                        Session.is_revoked == False,  # noqa: E712
                    )
                )
                db_session = result.scalar_one_or_none()
                if db_session:
                    db_session.is_revoked = True
            else:
                # Revoke all sessions
                result = await session.execute(
                    select(Session).where(
                        Session.user_id == user_id,
                        Session.is_revoked == False,  # noqa: E712
                    )
                )
                for s in result.scalars():
                    s.is_revoked = True
            await session.commit()

    @staticmethod
    async def forgot_password(email: str) -> None:
        """Send password reset email. Always succeeds to avoid email enumeration."""
        # In production, generate reset token + send email
        pass

    @staticmethod
    async def reset_password(token: str, password: str, password_confirm: str) -> None:
        """Reset password with reset token."""
        if password != password_confirm:
            raise InvalidInputException("Passwords do not match.")
        if len(password) < 8:
            raise InvalidInputException("Password must be at least 8 characters.")
        # In production: verify reset token, update password
        pass

    @staticmethod
    async def verify_email(token: str) -> None:
        """Verify email with verification token."""
        # In production: decode token, mark email_verified
        pass

    @staticmethod
    async def setup_2fa(user_id: str) -> dict[str, Any]:
        """Generate TOTP secret and return provisioning URI."""
        from app.core.security import generate_totp_secret, get_totp_provisioning_uri

        async with async_session_factory() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise UnauthorizedException("User not found.")

            secret = generate_totp_secret()
            uri = get_totp_provisioning_uri(secret, user.email)
            return {"secret": secret, "uri": uri}

    @staticmethod
    async def confirm_2fa(user_id: str, code: str) -> None:
        """Verify and enable 2FA."""
        from app.core.security import verify_totp_code

        async with async_session_factory() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise UnauthorizedException("User not found.")
            if not user.two_factor_secret:
                raise InvalidInputException("2FA not initialized. Call setup_2fa first.")
            if not verify_totp_code(user.two_factor_secret, code):
                raise InvalidInputException("Invalid TOTP code.")
            user.two_factor_enabled = True
            await session.commit()

    @staticmethod
    async def disable_2fa(user_id: str, code: str) -> None:
        """Disable 2FA."""
        from app.core.security import verify_totp_code

        async with async_session_factory() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise UnauthorizedException("User not found.")
            if user.two_factor_enabled and not verify_totp_code(user.two_factor_secret, code):
                raise InvalidInputException("Invalid TOTP code.")
            user.two_factor_enabled = False
            user.two_factor_secret = None
            await session.commit()

    @staticmethod
    async def verify_2fa(temp_token: str, code: str) -> dict[str, Any]:
        """Complete login with 2FA verification."""
        # In production: decode temp_token, verify TOTP, return real tokens
        raise NotImplementedError("2FA login flow not yet implemented.")


auth_service = AuthService()
