"""User profile and settings schemas."""

from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel


class UpdateProfileRequest(BaseModel):
    display_name: str | None = None
    avatar_url: str | None = None


class UserSettingsResponse(BaseModel):
    language: str = "en"
    currency: str = "USD"
    theme: str = "system"
    notification_price: bool = True
    notification_signal: bool = True
    notification_trade: bool = True
    notification_system: bool = True
    email_notifications: bool = True
    sms_notifications: bool = False
    push_notifications: bool = True
    default_slippage: Decimal = Decimal("0.5")


class UpdateSettingsRequest(BaseModel):
    language: str | None = None
    currency: str | None = None
    theme: str | None = None
    notification_price: bool | None = None
    notification_signal: bool | None = None
    notification_trade: bool | None = None
    notification_system: bool | None = None
    email_notifications: bool | None = None
    sms_notifications: bool | None = None
    push_notifications: bool | None = None
    default_slippage: Decimal | None = None


class ApiKeyResponse(BaseModel):
    id: str
    label: str
    key_prefix: str
    permissions: list[str]
    last_used_at: str | None
    created_at: str


class CreateApiKeyRequest(BaseModel):
    label: str
    permissions: list[str] = ["read"]


class CreateApiKeyResponse(BaseModel):
    id: str
    label: str
    key: str  # full key shown only once
    key_prefix: str
    permissions: list[str]


class SessionResponse(BaseModel):
    id: str
    device_info: dict | None
    ip_address: str | None
    created_at: str
    expires_at: str
    is_current: bool = False
