"""Order management business logic — create, cancel, list with matching engine."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import func, select

from app.core.exceptions import InvalidInputException, NotFoundException
from app.core.pagination import paginate_cursor
from app.database import async_session_factory
from app.models.order import Order, Trade
from app.models.wallet import Asset, Wallet
from app.services.matching_engine import get_engine
from app.services.wallet_service import wallet_service

ZERO = Decimal("0")


class OrderService:
    @staticmethod
    async def create_order(
        user_id: str,
        asset: str,
        side: str,
        type: str,
        quantity: Decimal,
        price: Decimal | None = None,
        stop_price: Decimal | None = None,
        time_in_force: str = "GTC",
        post_only: bool = False,
        reduce_only: bool = False,
        slippage: Decimal | None = None,
    ) -> dict[str, Any]:
        """Validate and place an order."""
        symbol = asset.upper()
        side_upper = side.upper()
        type_upper = type.upper()

        if quantity <= ZERO:
            raise InvalidInputException("Quantity must be positive.")

        if type_upper == "LIMIT" and (price is None or price <= ZERO):
            raise InvalidInputException("Limit order requires a valid price.")

        async with async_session_factory() as session:
            check_symbol = symbol if side_upper == "SELL" else "USDT"
            check_asset_result = await session.execute(
                select(Asset).where(Asset.symbol == check_symbol)
            )
            check_asset = check_asset_result.scalar_one_or_none()

            w = None
            if check_asset:
                result = await session.execute(
                    select(Wallet).where(Wallet.user_id == user_id, Wallet.asset_id == check_asset.id)
                )
                w = result.scalar_one_or_none()

            if w and side_upper == "SELL":
                available = w.balance - w.locked_balance
                if available < quantity:
                    raise InvalidInputException(
                        f"Insufficient {symbol} balance. Available: {available}, needed: {quantity}"
                    )

            order_id = str(uuid.uuid4())

            if type_upper == "MARKET":
                engine = get_engine(symbol)
                fills = await engine.add_order(order_id, side_upper, 0.0, float(quantity))
                total_cost = sum(Decimal(str(f["price"])) * Decimal(str(f["quantity"])) for f in fills)

                avg_price = (
                    sum(Decimal(str(f["price"])) for f in fills) / len(fills)
                    if fills
                    else ZERO
                )

                trade = Trade(
                    id=str(uuid.uuid4()),
                    order_id=order_id,
                    user_id=user_id,
                    asset_id=None,
                    side=side_upper,
                    price=avg_price,
                    quantity=quantity,
                    total=total_cost,
                )
                session.add(trade)
                await session.flush()

                return {
                    "id": order_id,
                    "status": "FILLED",
                    "fills": fills,
                    "average_price": str(trade.price),
                    "total_cost": str(total_cost),
                }

            order = Order(
                id=order_id,
                user_id=user_id,
                asset_id=None,
                quote_asset_id=None,
                side=side_upper,
                type=type_upper,
                price=price or ZERO,
                quantity=quantity,
                filled_quantity=ZERO,
                remaining_quantity=quantity,
                status="OPEN",
                time_in_force=time_in_force,
                post_only=post_only,
                reduce_only=reduce_only,
            )
            session.add(order)

            engine = get_engine(symbol)
            fills = await engine.add_order(order_id, side_upper, float(price or 0), float(quantity))

            return {
                "id": order_id,
                "status": "OPEN",
                "fills": fills,
            }

    @staticmethod
    async def cancel_order(user_id: str, order_id: str) -> dict[str, Any]:
        """Cancel an open order."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Order).where(Order.id == order_id, Order.user_id == user_id)
            )
            order = result.scalar_one_or_none()
            if not order:
                raise NotFoundException("Order", order_id)

            if order.status not in ("OPEN", "PENDING"):
                raise InvalidInputException("Order cannot be cancelled.")

            asset_result = await session.execute(
                select(Asset.symbol).where(Asset.id == order.asset_id)
            )
            asset_symbol = asset_result.scalar_one_or_none() or "UNKNOWN"
            engine = get_engine(asset_symbol)
            await engine.cancel_order(order_id)

            order.status = "CANCELLED"
            order.cancelled_at = datetime.now(UTC)

            return {"id": order_id, "status": "CANCELLED"}

    @staticmethod
    async def get_order(user_id: str, order_id: str) -> dict[str, Any] | None:
        """Get single order detail."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Order).where(Order.id == order_id, Order.user_id == user_id)
            )
            order = result.scalar_one_or_none()
            if not order:
                return None
            asset_result_2 = await session.execute(
                select(Asset.symbol).where(Asset.id == order.asset_id)
            )
            asset_symbol = asset_result_2.scalar_one_or_none() or "UNKNOWN"
            return {
                "id": order.id,
                "asset": asset_symbol,
                "side": order.side,
                "type": order.type,
                "status": order.status,
                "price": str(order.price) if order.price else None,
                "quantity": str(order.quantity),
                "filled_quantity": str(order.filled_quantity),
                "remaining_quantity": str(order.remaining_quantity or ZERO),
                "total": str(order.total) if order.total else None,
                "filled_total": str(order.filled_total) if order.filled_total else None,
                "avg_fill_price": str(order.avg_fill_price) if order.avg_fill_price else None,
                "fee": str(order.fee) if order.fee else None,
                "time_in_force": order.time_in_force,
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "filled_at": order.filled_at.isoformat() if order.filled_at else None,
                "cancelled_at": order.cancelled_at.isoformat() if order.cancelled_at else None,
            }

    @staticmethod
    async def list_orders(
        user_id: str,
        cursor: str | None = None,
        limit: int = 20,
        status: str | None = None,
    ) -> dict[str, Any]:
        """List user orders with cursor pagination."""
        async with async_session_factory() as session:
            query = select(Order).where(Order.user_id == user_id)

            if status:
                query = query.where(Order.status == status.upper())

            orders, next_cursor, has_more = await paginate_cursor(
                session, query, cursor=cursor, limit=limit,
            )

            asset_ids = list({o.asset_id for o in orders})
            asset_map = {}
            if asset_ids:
                assets_result = await session.execute(
                    select(Asset).where(Asset.id.in_(asset_ids))
                )
                for a in assets_result.scalars().all():
                    asset_map[a.id] = a.symbol

            return {
                "items": [
                    {
                        "id": o.id,
                        "asset": asset_map.get(o.asset_id, "UNKNOWN"),
                        "side": o.side,
                        "type": o.type,
                        "status": o.status,
                        "price": str(o.price) if o.price else None,
                        "quantity": str(o.quantity),
                        "filled_quantity": str(o.filled_quantity),
                        "total": str(o.total) if o.total else None,
                        "created_at": o.created_at.isoformat() if o.created_at else None,
                    }
                    for o in orders
                ],
                "next_cursor": next_cursor,
                "has_more": has_more,
            }


    @staticmethod
    async def list_trades(
        user_id: str,
        cursor: str | None = None,
        limit: int = 20,
    ) -> dict[str, Any]:
        """List user trades with cursor pagination."""
        async with async_session_factory() as session:
            query = select(Trade).where(Trade.user_id == user_id)

            trades, next_cursor, has_more = await paginate_cursor(
                session, query, cursor=cursor, limit=limit,
            )

            asset_ids = list({t.asset_id for t in trades})
            asset_map = {}
            if asset_ids:
                assets_result = await session.execute(
                    select(Asset).where(Asset.id.in_(asset_ids))
                )
                for a in assets_result.scalars().all():
                    asset_map[a.id] = a.symbol

            return {
                "items": [
                    {
                        "id": t.id,
                        "order_id": t.order_id,
                        "asset": asset_map.get(t.asset_id, "UNKNOWN"),
                        "side": t.side,
                        "price": str(t.price),
                        "quantity": str(t.quantity),
                        "total": str(t.total),
                        "fee": str(t.fee) if t.fee else "0",
                        "created_at": t.created_at.isoformat() if t.created_at else None,
                    }
                    for t in trades
                ],
                "next_cursor": next_cursor,
                "has_more": has_more,
            }


order_service = OrderService()
