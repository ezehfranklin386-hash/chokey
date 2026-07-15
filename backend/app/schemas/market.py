"""Market data schemas."""

from __future__ import annotations

from pydantic import BaseModel


class PriceResponse(BaseModel):
    symbol: str
    price: str
    change_24h: str
    change_pct_24h: str
    high_24h: str
    low_24h: str
    volume_24h: str
    market_cap: str


class CandleResponse(BaseModel):
    open_time: int  # unix ms
    open: str
    high: str
    low: str
    close: str
    volume: str


class AssetInfoResponse(BaseModel):
    id: str
    symbol: str
    name: str
    type: str
    logo_url: str | None
    network: str | None
    is_supported: bool
    rank: int | None
