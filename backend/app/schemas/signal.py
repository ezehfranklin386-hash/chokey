"""Signal schemas."""

from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel


class SignalResponse(BaseModel):
    id: str
    asset: str
    asset_name: str
    type: str
    direction: str
    status: str
    entry_price: str | None
    current_price: str | None
    target_price_1: str | None
    target_price_2: str | None
    target_price_3: str | None
    stop_loss: str | None
    confidence: int | None
    timeframe: str | None
    rationale: str | None
    strategy_name: str | None
    is_premium: bool
    provider: dict | None
    performance: dict | None
    published_at: str
    created_at: str


class CreateSignalRequest(BaseModel):
    asset: str
    direction: str
    entry_price: Decimal | None = None
    target_price_1: Decimal | None = None
    target_price_2: Decimal | None = None
    stop_loss: Decimal | None = None
    timeframe: str | None = None
    rationale: str | None = None
    strategy_name: str | None = None


class SignalProviderResponse(BaseModel):
    id: str
    name: str
    avatar_url: str | None
    is_verified: bool
    win_rate: Decimal | None = None
    total_signals: int
    total_pnl: str
    followers: int
