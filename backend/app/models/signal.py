"""Signal, SignalPerformance, SignalSubscription, CopyTradingSubscription models."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, JSON, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

MONEY = Numeric(18, 8)


class Signal(Base):
    __tablename__ = "signals"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"))
    asset_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("assets.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    direction: Mapped[str] = mapped_column(String(15), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE")
    entry_price: Mapped[Decimal | None] = mapped_column(MONEY)
    current_price: Mapped[Decimal | None] = mapped_column(MONEY)
    target_price_1: Mapped[Decimal | None] = mapped_column(MONEY)
    target_price_2: Mapped[Decimal | None] = mapped_column(MONEY)
    target_price_3: Mapped[Decimal | None] = mapped_column(MONEY)
    stop_loss: Mapped[Decimal | None] = mapped_column(MONEY)
    confidence: Mapped[int | None] = mapped_column(Integer, default=70)
    timeframe: Mapped[str | None] = mapped_column(String(5))
    rationale: Mapped[str | None] = mapped_column(Text)
    indicators: Mapped[dict | None] = mapped_column(JSON)
    strategy_name: Mapped[str | None] = mapped_column(String(100))
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    subscribers: Mapped[int] = mapped_column(Integer, default=0)
    win_rate: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    total_pnl: Mapped[Decimal | None] = mapped_column(MONEY)
    meta_data: Mapped[dict | None] = mapped_column("metadata", JSON)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("ix_signals_asset_status", "asset_id", "status"),
        Index("ix_signals_type_status_direction", "type", "status", "direction"),
    )

    asset = relationship("Asset", back_populates="signals")
    performance = relationship("SignalPerformance", back_populates="signal", cascade="all, delete-orphan", lazy="selectin")
    subscriptions = relationship("SignalSubscription", back_populates="signal", cascade="all, delete-orphan", lazy="selectin")


class SignalPerformance(Base):
    __tablename__ = "signal_performance"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    signal_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("signals.id"), nullable=False)
    user_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"))
    entry_price: Mapped[Decimal] = mapped_column(MONEY, nullable=False)
    exit_price: Mapped[Decimal | None] = mapped_column(MONEY)
    quantity: Mapped[Decimal] = mapped_column(MONEY, nullable=False)
    pnl: Mapped[Decimal | None] = mapped_column(MONEY)
    pnl_percent: Mapped[Decimal | None] = mapped_column(Numeric(8, 4))
    roi: Mapped[Decimal | None] = mapped_column(Numeric(8, 4))
    held_days: Mapped[int | None] = mapped_column(Integer)
    exited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    signal = relationship("Signal", back_populates="performance")


class SignalSubscription(Base):
    __tablename__ = "signal_subscriptions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    signal_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("signals.id", ondelete="CASCADE"), nullable=False)
    auto_trade: Mapped[bool] = mapped_column(Boolean, default=False)
    max_allocation: Mapped[Decimal | None] = mapped_column(MONEY)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    signal = relationship("Signal", back_populates="subscriptions")


class CopyTradingSubscription(Base):
    __tablename__ = "copy_trading_subscriptions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    trader_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    allocation_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    max_allocation: Mapped[Decimal | None] = mapped_column(MONEY)
    min_signal_confidence: Mapped[int] = mapped_column(Integer, default=70)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])
    trader = relationship("User", foreign_keys=[trader_id])
