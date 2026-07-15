"""WebSocket handlers for real-time signal updates."""

from __future__ import annotations

from app.ws.manager import manager


async def broadcast_signal_update(signal: dict) -> None:
    """Broadcast a new signal to all users (or signal subscribers)."""
    await manager.broadcast_to_all("signal", signal)


async def send_signal_to_asset_subscribers(asset: str, signal: dict) -> None:
    """Send signal update to users subscribed to a specific asset."""
    await manager.broadcast_to_room(f"signals:{asset}", "signal", signal)
