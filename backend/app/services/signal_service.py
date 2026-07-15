"""Trading signal business logic — CRUD with pagination."""

from __future__ import annotations

import uuid
from decimal import Decimal
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from app.core.exceptions import NotFoundException
from app.database import async_session_factory
from app.models.signal import Signal
from app.models.wallet import Asset


class SignalService:
    @staticmethod
    async def list_signals(
        user_id: str | None = None,
        asset: str | None = None,
        direction: str | None = None,
        type: str | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> dict[str, Any]:
        """List signals with optional filters."""
        offset = (page - 1) * limit
        async with async_session_factory() as session:
            query = select(Signal).options(joinedload(Signal.asset))
            count_query = select(func.count(Signal.id))

            if asset:
                asset_result = await session.execute(
                    select(Asset).where(Asset.symbol == asset.upper())
                )
                asset_obj = asset_result.scalar_one_or_none()
                if asset_obj:
                    query = query.where(Signal.asset_id == asset_obj.id)
                    count_query = count_query.where(Signal.asset_id == asset_obj.id)
            if direction:
                query = query.where(Signal.direction == direction.upper())
                count_query = count_query.where(Signal.direction == direction.upper())
            if type:
                query = query.where(Signal.strategy_name.ilike(f"%{type}%"))
                count_query = count_query.where(Signal.strategy_name.ilike(f"%{type}%"))

            total = (await session.execute(count_query)).scalar() or 0

            result = await session.execute(
                query.order_by(Signal.created_at.desc()).offset(offset).limit(limit)
            )
            signals = result.scalars().all()

            return {
                "signals": [
                    {
                        "id": s.id,
                        "symbol": s.asset.symbol if s.asset else "UNKNOWN",
                        "direction": s.direction,
                        "entry_price": str(s.entry_price),
                        "target_price_1": str(s.target_price_1) if s.target_price_1 else None,
                        "target_price_2": str(s.target_price_2) if s.target_price_2 else None,
                        "target_price_3": str(s.target_price_3) if s.target_price_3 else None,
                        "stop_loss": str(s.stop_loss),
                        "confidence": s.confidence,
                        "timeframe": s.timeframe,
                        "strategy": s.strategy_name,
                        "rationale": s.rationale,
                        "status": s.status,
                        "created_at": s.created_at.isoformat() if s.created_at else None,
                    }
                    for s in signals
                ],
                "total": total,
                "page": page,
                "limit": limit,
            }

    @staticmethod
    async def get_signal(signal_id: str, user_id: str | None = None) -> dict[str, Any] | None:
        """Get single signal detail."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Signal).options(joinedload(Signal.asset)).where(Signal.id == signal_id)
            )
            s = result.scalar_one_or_none()
            if not s:
                return None

            return {
                "id": s.id,
                "symbol": s.asset.symbol if s.asset else "UNKNOWN",
                "direction": s.direction,
                "entry_price": str(s.entry_price),
                "target_price_1": str(s.target_price_1) if s.target_price_1 else None,
                "target_price_2": str(s.target_price_2) if s.target_price_2 else None,
                "target_price_3": str(s.target_price_3) if s.target_price_3 else None,
                "stop_loss": str(s.stop_loss),
                "confidence": s.confidence,
                "timeframe": s.timeframe,
                "strategy": s.strategy_name,
                "rationale": s.rationale,
                "status": s.status,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "updated_at": s.updated_at.isoformat() if s.updated_at else None,
            }

    @staticmethod
    async def create_signal(user_id: str, data: dict) -> dict[str, Any]:
        """Create a new signal (admin)."""
        async with async_session_factory() as session:
            signal = Signal(
                id=str(uuid.uuid4()),
                asset_id=data.get("asset_id"),
                direction=data.get("direction", "BUY"),
                entry_price=Decimal(str(data.get("entry_price", 0))),
                target_price_1=Decimal(str(data["target_price_1"])) if data.get("target_price_1") else None,
                target_price_2=Decimal(str(data["target_price_2"])) if data.get("target_price_2") else None,
                target_price_3=Decimal(str(data["target_price_3"])) if data.get("target_price_3") else None,
                stop_loss=Decimal(str(data.get("stop_loss", 0))) if data.get("stop_loss") else None,
                confidence=int(data.get("confidence", 70)),
                timeframe=data.get("timeframe", "1h"),
                strategy_name=data.get("strategy", ""),
                rationale=data.get("rationale", data.get("reasoning", "")),
                status=data.get("status", "ACTIVE"),
            )
            session.add(signal)
            await session.commit()

            return {"id": signal.id, "status": signal.status}

    @staticmethod
    async def subscribe(user_id: str, signal_id: str) -> None:
        """Subscribe to copy a signal."""
        pass

    @staticmethod
    async def unsubscribe(user_id: str, signal_id: str) -> None:
        """Unsubscribe from a signal."""
        pass

    @staticmethod
    async def bookmark(user_id: str, signal_id: str) -> None:
        """Bookmark a signal."""
        pass


signal_service = SignalService()
