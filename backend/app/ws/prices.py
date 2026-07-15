"""WebSocket handlers for real-time price feeds."""

from __future__ import annotations

from app.ws.manager import manager


async def broadcast_price_update(asset: str, price: float, change_24h: float, change_pct: float) -> None:
    """Broadcast a price update to all users."""
    await manager.broadcast_to_all("price", {
        "asset": asset,
        "price": str(price),
        "change_24h": str(change_24h),
        "change_pct_24h": str(change_pct),
    })
