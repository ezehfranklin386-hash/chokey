"""Wallet and asset schemas."""

from __future__ import annotations

from pydantic import BaseModel


class AssetResponse(BaseModel):
    id: str
    symbol: str
    name: str
    type: str
    decimals: int
    logo_url: str | None
    network: str | None
    is_supported: bool


class WalletResponse(BaseModel):
    id: str
    asset_id: str
    asset_symbol: str
    asset_name: str
    asset_logo_url: str | None
    type: str
    balance: str
    locked: str
    available: str
    usd_value: str
    is_active: bool


class WalletSummaryResponse(BaseModel):
    total_balance_usd: str
    change_24h_usd: str
    change_24h_percent: str
    allocation: dict


class WalletAddressResponse(BaseModel):
    id: str
    address: str
    label: str | None
    is_default: bool
    created_at: str


class CreateAddressRequest(BaseModel):
    label: str | None = None
