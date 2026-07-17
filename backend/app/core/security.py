"""Security utilities: JWT, password hashing, 2FA."""

from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt

from jose import JWTError, jwt

from app.config import settings


# ── Password Hashing ──────────────────────────────────────────────

_BCRYPT_COST = 12


def hash_password(password: str) -> str:
    """Hash a password using bcrypt (cost factor 12)."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(_BCRYPT_COST)).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


# ── JWT ───────────────────────────────────────────────────────────


def create_access_token(
    subject: str,
    role: str = "USER",
    kyc_level: str = "NONE",
    session_id: str | None = None,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """Create a short-lived JWT access token."""
    now = datetime.now(timezone.utc)
    claims = {
        "sub": subject,
        "role": role,
        "kycLevel": kyc_level,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.jwt_access_expire_minutes)).timestamp()),
        "jti": secrets.token_hex(16),
    }
    if session_id:
        claims["sessionId"] = session_id
    if extra_claims:
        claims.update(extra_claims)
    return jwt.encode(claims, settings.secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str, session_id: str) -> str:
    """Create a long-lived JWT refresh token."""
    now = datetime.now(timezone.utc)
    claims = {
        "sub": subject,
        "sessionId": session_id,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=settings.jwt_refresh_expire_days)).timestamp()),
        "jti": secrets.token_hex(16),
        "type": "refresh",
    }
    return jwt.encode(claims, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT token. Raises JWTError on failure."""
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        raise


def hash_token(token: str) -> str:
    """SHA-256 hash of a token (for storing refresh tokens)."""
    return hashlib.sha256(token.encode()).hexdigest()


# ── 2FA / TOTP ────────────────────────────────────────────────────


def generate_totp_secret() -> str:
    """Generate a random base32 TOTP secret."""
    return pyotp.random_base32()


def get_totp_provisioning_uri(secret: str, email: str) -> str:
    """Get the otpauth:// URI for QR code generation."""
    import pyotp

    return pyotp.TOTP(secret).provisioning_uri(name=email, issuer_name=settings.app_name)


def verify_totp_code(secret: str, code: str) -> bool:
    """Verify a TOTP code against a secret."""
    import pyotp

    return pyotp.TOTP(secret).verify(code)


# ── Random ────────────────────────────────────────────────────────


def generate_temp_token() -> str:
    """Generate a cryptographically secure random temp token."""
    return f"temp_{secrets.token_urlsafe(32)}"


def generate_api_key() -> tuple[str, str]:
    """Generate an API key pair: (full_key, prefix)."""
    key = f"cky_{secrets.token_urlsafe(32)}"
    prefix = key[:10]
    return key, prefix
