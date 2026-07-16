"""Order and trade routes: place, cancel, list, history."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.services.order_service import order_service

router = APIRouter()


@router.post("", status_code=201)
async def create_order(data: dict, user_id: str = Depends(get_current_user_id)):
    """Place a new order (market / limit / stop)."""
    result = await order_service.create_order(
        user_id=user_id,
        asset=data["asset"],
        side=data["side"],
        type=data.get("order_type", "LIMIT"),
        quantity=float(data["quantity"]),
        price=float(data["price"]) if data.get("price") else None,
        stop_price=float(data["stop_price"]) if data.get("stop_price") else None,
        time_in_force=data.get("time_in_force", "GTC"),
        post_only=data.get("post_only", False),
        reduce_only=data.get("reduce_only", False),
        slippage=float(data["slippage"]) if data.get("slippage") else None,
    )
    return {"status": "success", "data": result}


@router.get("")
async def list_orders(
    user_id: str = Depends(get_current_user_id),
    status: str | None = None,
    cursor: str | None = None,
    limit: int = 20,
):
    """List orders with cursor pagination."""
    result = await order_service.list_orders(user_id, status=status, cursor=cursor, limit=limit)
    return {"status": "success", "data": result}


@router.get("/{order_id}")
async def get_order(order_id: str, user_id: str = Depends(get_current_user_id)):
    """Get order detail."""
    result = await order_service.get_order(user_id, order_id)
    if not result:
        return {"status": "error", "error": {"code": "NOT_FOUND", "message": "Order not found."}}
    return {"status": "success", "data": result}


@router.delete("/{order_id}")
async def cancel_order(order_id: str, user_id: str = Depends(get_current_user_id)):
    """Cancel an open order."""
    await order_service.cancel_order(user_id, order_id)
    return {"status": "success", "data": {"message": "Order cancelled."}}


@router.get("/trades")
async def list_trades(
    user_id: str = Depends(get_current_user_id),
    cursor: str | None = None,
    limit: int = 20,
):
    """Get user's trade history (cursor paginated)."""
    result = await order_service.list_trades(user_id, cursor=cursor, limit=limit)
    return {"status": "success", "data": result}


@router.get("/history")
async def order_history(
    user_id: str = Depends(get_current_user_id),
    cursor: str | None = None,
    limit: int = 20,
):
    """Get order history (filled + cancelled)."""
    result = await order_service.list_orders(user_id, cursor=cursor, limit=limit)
    return {"status": "success", "data": result}
