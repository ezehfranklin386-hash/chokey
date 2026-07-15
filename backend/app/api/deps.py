"""FastAPI dependency injection: current user, DB session, etc."""

from __future__ import annotations

from fastapi import Depends, Header
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_token
from app.database import get_db


async def get_current_user_id(
    authorization: str | None = Header(None, description="Bearer <access_token>"),
) -> str:
    """Extract and validate the current user ID from the JWT."""
    if authorization is None:
        raise UnauthorizedException("Missing authorization header.")
    if not authorization.startswith("Bearer "):
        raise UnauthorizedException("Invalid authorization header.")
    token = authorization[7:]
    try:
        payload = decode_token(token)
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException("Invalid token payload.")
        return user_id
    except JWTError:
        raise UnauthorizedException("Invalid or expired token.")


async def get_current_admin_id(
    current_user_id: str = Depends(get_current_user_id),
) -> str:
    """Require admin role. Placeholder — actual role check against DB."""
    # TODO: Fetch user role from DB and verify ADMIN / SUPER_ADMIN
    return current_user_id


async def get_optional_user_id(
    authorization: str | None = Header(None),
) -> str | None:
    """Extract user ID if a valid token is provided, else None."""
    if authorization is None or not authorization.startswith("Bearer "):
        return None
    token = authorization[7:]
    try:
        payload = decode_token(token)
        return payload.get("sub")
    except JWTError:
        return None
