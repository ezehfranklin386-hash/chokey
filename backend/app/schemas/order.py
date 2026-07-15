"""Order and trade schemas."""

from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, Field


class CreateOrderRequest(BaseModel):
    asset: str
    side: str = Field(..., pattern="^(BUY|SELL)$")
    type: str = Field(default="MARKET", pattern="^(MARKET|LIMIT|STOP_LIMIT|STOP_LOSS|TAKE_PROFIT)$")
    quantity: Decimal = Field(..., gt=0)
    price: Decimal | None = None
    stop_price: Decimal | None = None
    time_in_force: str = Field(default="GTC", pattern="^(GTC|IOC|FOK)$")
    post_only: bool = False
    reduce_only: bool = False
    slippage: Decimal | None = None


class OrderResponse(BaseModel):
    id: str
    asset: str
    side: str
    type: str
    status: str
    price: str | None
    quantity: str
    filled_quantity: str
    remaining_quantity: str
    total: str | None
    filled_total: str | None
    avg_fill_price: str | None
    fee: str | None
    time_in_force: str
    created_at: str
    filled_at: str | None
    cancelled_at: str | None


class TradeResponse(BaseModel):
    id: str
    order_id: str
    asset: str
    side: str
    price: str
    quantity: str
    total: str
    fee: str
    created_at: str


class OrderBookResponse(BaseModel):
    bids: list[list[str]]  # [[price, quantity], ...]
    asks: list[list[str]]
    asset: str
