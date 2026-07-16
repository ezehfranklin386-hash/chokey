"""MarketPrice and Candle models."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Index, Integer, Numeric, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

MONEY = Numeric(18, 8)


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("assets.id"), nullable=False)
    price: Mapped[Decimal] = mapped_column(MONEY, nullable=False)
    price_change_24h: Mapped[Decimal | None] = mapped_column(MONEY)
    price_change_pct_24h: Mapped[Decimal | None] = mapped_column(MONEY)
    high_24h: Mapped[Decimal | None] = mapped_column(MONEY)
    low_24h: Mapped[Decimal | None] = mapped_column(MONEY)
    volume_24h: Mapped[Decimal | None] = mapped_column(MONEY)
    market_cap: Mapped[Decimal | None] = mapped_column(MONEY)
    bid_price: Mapped[Decimal | None] = mapped_column(MONEY)
    ask_price: Mapped[Decimal | None] = mapped_column(MONEY)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_market_prices_asset_ts", "asset_id", "timestamp"),
    )

    asset = relationship("Asset", back_populates="market_prices")


class Candle(Base):
    __tablename__ = "candles"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("assets.id"), nullable=False)
    interval: Mapped[str] = mapped_column(String(5), nullable=False)
    open_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    close_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    open: Mapped[Decimal] = mapped_column(MONEY, nullable=False)
    high: Mapped[Decimal] = mapped_column(MONEY, nullable=False)
    low: Mapped[Decimal] = mapped_column(MONEY, nullable=False)
    close: Mapped[Decimal] = mapped_column(MONEY, nullable=False)
    volume: Mapped[Decimal] = mapped_column(MONEY, nullable=False)
    trades: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("asset_id", "interval", "open_time", name="uq_candle_asset_interval_time"),
        Index("ix_candles_asset_interval_time", "asset_id", "interval", "open_time"),
    )
