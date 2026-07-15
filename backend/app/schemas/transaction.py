"""Transaction schemas."""

from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, Field


class TransactionResponse(BaseModel):
    id: str
    type: str
    status: str
    asset: str
    amount: str
    fee: str
    price: str | None
    total: str | None
    from_address: str | None
    to_address: str | None
    tx_hash: str | None
    confirmations: int
    memo: str | None
    failure_reason: str | None
    completed_at: str | None
    created_at: str


class DepositRequest(BaseModel):
    asset: str
    amount: Decimal = Field(..., gt=0)
    tx_hash: str | None = None
    memo: str | None = None


class WithdrawRequest(BaseModel):
    asset: str
    amount: Decimal = Field(..., gt=0)
    address: str
    network: str
    memo: str | None = None
    two_factor_code: str | None = None
