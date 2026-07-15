"""WebSocket handlers for order status updates."""

from __future__ import annotations

from app.ws.manager import manager


async def send_order_update(user_id: str, order: dict) -> None:
    """Send order status update to a specific user."""
    await manager.send_to_user(user_id, "order", order)


async def send_trade_update(user_id: str, trade: dict) -> None:
    """Send trade fill notification to a specific user."""
    await manager.send_to_user(user_id, "trade", trade)
