"""Auth request/response Pydantic schemas."""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    password_confirm: str
    referral_code: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    device_info: dict | None = None


class TokenResponse(BaseModel):
    access_token: str
    expires_in: int
    refresh_token: str
    token_type: str = "Bearer"


class TwoFactorRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6)


class TwoFactorVerifyRequest(BaseModel):
    temp_token: str
    code: str = Field(..., min_length=6, max_length=6)


class TwoFactorSetupResponse(BaseModel):
    secret: str
    uri: str
    qr_code: str  # base64 PNG


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8, max_length=128)
    password_confirm: str


class UserResponse(BaseModel):
    id: str
    email: str
    email_verified: bool
    display_name: str | None
    avatar_url: str | None
    role: str
    kyc_level: str
    two_factor_enabled: bool
    created_at: str
