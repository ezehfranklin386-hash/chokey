"""Transaction model."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

MONEY = Numeric(18, 8)


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    wallet_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("wallets.id"))
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    asset_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("assets.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(MONEY, nullable=False)
    fee: Mapped[Decimal] = mapped_column(MONEY, default=Decimal("0"))
    fee_asset_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("assets.id"))
    price: Mapped[Decimal | None] = mapped_column(MONEY)
    total: Mapped[Decimal | None] = mapped_column(MONEY)
    from_address: Mapped[str | None] = mapped_column(String(255))
    to_address: Mapped[str | None] = mapped_column(String(255))
    tx_hash: Mapped[str | None] = mapped_column(String(255), unique=True)
    block_number: Mapped[int | None] = mapped_column(BigInteger)
    confirmations: Mapped[int] = mapped_column(Integer, default=0)
    required_confirmations: Mapped[int] = mapped_column(Integer, default=1)
    memo: Mapped[str | None] = mapped_column(String(255))
    meta_data: Mapped[dict | None] = mapped_column("metadata", JSON)
    failure_reason: Mapped[str | None] = mapped_column(Text)
    approved_by: Mapped[str | None] = mapped_column(String(100))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="transactions")
    wallet = relationship("Wallet", back_populates="transactions", foreign_keys=[wallet_id])
    asset = relationship("Asset", back_populates="transactions", foreign_keys=[asset_id])
