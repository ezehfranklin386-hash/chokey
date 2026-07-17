"""Asset, Wallet, and WalletAddress models."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, Numeric, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

MONEY = Numeric(18, 8)


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    symbol: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(20), default="cryptocurrency")
    decimals: Mapped[int] = mapped_column(Integer, default=8)
    logo_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_supported: Mapped[bool] = mapped_column(Boolean, default=True)
    min_withdrawal: Mapped[Decimal | None] = mapped_column(MONEY, default=Decimal("0.0001"))
    max_withdrawal: Mapped[Decimal | None] = mapped_column(MONEY)
    withdrawal_fee: Mapped[Decimal | None] = mapped_column(MONEY, default=Decimal("0.0005"))
    deposit_fee: Mapped[Decimal] = mapped_column(MONEY, default=Decimal("0"))
    trading_fee: Mapped[Decimal] = mapped_column(MONEY, default=Decimal("0.001"))
    network: Mapped[str | None] = mapped_column(String(50))
    contract_address: Mapped[str | None] = mapped_column(String(255), unique=True)
    rank: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    wallets = relationship("Wallet", back_populates="asset", lazy="selectin")
    market_prices = relationship("MarketPrice", back_populates="asset", lazy="selectin")
    signals = relationship("Signal", back_populates="asset", lazy="selectin")
    transactions = relationship("Transaction", back_populates="asset", lazy="selectin", foreign_keys="[Transaction.asset_id]")


class Wallet(Base):
    __tablename__ = "wallets"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    asset_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("assets.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(20), default="CUSTODIAL")
    balance: Mapped[Decimal] = mapped_column(MONEY, default=Decimal("0"))
    locked_balance: Mapped[Decimal] = mapped_column(MONEY, default=Decimal("0"))
    total_deposited: Mapped[Decimal] = mapped_column(MONEY, default=Decimal("0"))
    total_withdrawn: Mapped[Decimal] = mapped_column(MONEY, default=Decimal("0"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "asset_id", "type", name="uq_user_asset_type"),
        Index("ix_wallets_user_asset", "user_id", "asset_id"),
    )

    user = relationship("User", back_populates="wallets")
    asset = relationship("Asset", back_populates="wallets")
    addresses = relationship("WalletAddress", back_populates="wallet", cascade="all, delete-orphan", lazy="selectin")
    transactions = relationship("Transaction", back_populates="wallet", lazy="selectin")


class WalletAddress(Base):
    __tablename__ = "wallet_addresses"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("wallets.id", ondelete="CASCADE"), nullable=False)
    address: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    derivation_path: Mapped[str | None] = mapped_column(String(255))
    label: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    wallet = relationship("Wallet", back_populates="addresses")
