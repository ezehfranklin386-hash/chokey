"""WebSocket handlers for balance updates."""

from __future__ import annotations

from app.ws.manager import manager


async def send_balance_update(user_id: str, asset: str, balance: float, locked: float, available: float) -> None:
    """Send balance update to a specific user."""
    await manager.send_to_user(user_id, "balance", {
        "asset": asset,
        "balance": str(balance),
        "locked": str(locked),
        "available": str(available),
    })
