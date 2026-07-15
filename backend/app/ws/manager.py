"""WebSocket connection manager with Redis pub/sub for multi-instance support.

Architecture:
  Each API instance holds local WebSocket connections in memory.
  When broadcasting, the message is published to a Redis channel.
  A background listener subscribes to all channels and fans out
  messages to local connections. This allows horizontal scaling.
"""

from __future__ import annotations

import asyncio
import json
import structlog
from fastapi import WebSocket

from app.redis import get_redis

logger = structlog.get_logger()

REDIS_CHANNEL_BROADCAST = "ws:broadcast"
REDIS_CHANNEL_ROOM_PREFIX = "ws:room:"
REDIS_CHANNEL_USER_PREFIX = "ws:user:"


class ConnectionManager:
    """Multi-instance WebSocket manager backed by Redis pub/sub."""

    def __init__(self):
        self._connections: dict[str, WebSocket] = {}
        self._rooms: dict[str, set[str]] = {}
        self._pubsub = None
        self._listener_task = None

    # ── Local connection management ──────────────────────────────────

    async def connect(self, user_id: str, ws: WebSocket, rooms: list[str] | None = None) -> None:
        """Accept a WebSocket connection and join rooms."""
        await ws.accept()
        self._connections[user_id] = ws
        if rooms:
            for room in rooms:
                self._rooms.setdefault(room, set()).add(user_id)
        logger.info("ws connected", user_id=user_id, rooms=rooms)

    async def disconnect(self, user_id: str) -> None:
        """Remove a user from all rooms and connections."""
        self._connections.pop(user_id, None)
        for room_users in self._rooms.values():
            room_users.discard(user_id)
        logger.info("ws disconnected", user_id=user_id)

    # ── Sending (local only) ─────────────────────────────────────────

    async def send_to_user(self, user_id: str, event: str, data: dict) -> bool:
        """Send a JSON message to a specific user (local instance only)."""
        ws = self._connections.get(user_id)
        if ws is None:
            return False
        try:
            await ws.send_json({"event": event, "data": data})
            return True
        except Exception:
            self._connections.pop(user_id, None)
            return False

    # ── Broadcasting (local + Redis pub/sub) ─────────────────────────

    async def broadcast_to_room(self, room: str, event: str, data: dict) -> int:
        """Broadcast to all users in a room.

        Publishes to Redis so other instances pick it up, and also
        delivers to local connections in this instance.
        """
        await self._publish(REDIS_CHANNEL_ROOM_PREFIX + room, event, data)
        return await self._broadcast_local_room(room, event, data)

    async def broadcast_to_all(self, event: str, data: dict) -> int:
        """Broadcast to all connected users across all instances."""
        await self._publish(REDIS_CHANNEL_BROADCAST, event, data)
        return await self._broadcast_local_all(event, data)

    # ── Internal local delivery ──────────────────────────────────────

    async def _broadcast_local_room(self, room: str, event: str, data: dict) -> int:
        """Deliver to all local connections in a room."""
        user_ids = self._rooms.get(room, set())
        sent = 0
        for uid in list(user_ids):
            if await self.send_to_user(uid, event, data):
                sent += 1
        return sent

    async def _broadcast_local_all(self, event: str, data: dict) -> int:
        """Deliver to all local connections."""
        sent = 0
        for uid in list(self._connections.keys()):
            if await self.send_to_user(uid, event, data):
                sent += 1
        return sent

    async def _handle_remote_message(self, channel: str, event: str, data: dict) -> None:
        """Handle a message received from another instance via Redis."""
        if channel == REDIS_CHANNEL_BROADCAST:
            await self._broadcast_local_all(event, data)
        elif channel.startswith(REDIS_CHANNEL_ROOM_PREFIX):
            room = channel[len(REDIS_CHANNEL_ROOM_PREFIX):]
            await self._broadcast_local_room(room, event, data)

    # ── Redis pub/sub ────────────────────────────────────────────────

    async def _publish(self, channel: str, event: str, data: dict) -> None:
        """Publish a message to a Redis channel (non-blocking)."""
        redis = await get_redis()
        if redis is None:
            return
        try:
            payload = json.dumps({"event": event, "data": data})
            await redis.publish(channel, payload)
        except Exception as exc:
            logger.warning("redis publish failed", channel=channel, error=str(exc)[:80])

    async def start_listener(self) -> None:
        """Start background Redis pub/sub listener.

        Subscribes to all relevant channels and fans out received
        messages to local WebSocket connections.
        """
        redis = await get_redis()
        if redis is None:
            logger.warning("redis unavailable — ws cross-instance broadcast disabled")
            return

        try:
            self._pubsub = redis.pubsub()
            await self._pubsub.subscribe(
                REDIS_CHANNEL_BROADCAST,
                f"{REDIS_CHANNEL_ROOM_PREFIX}*",
            )
            logger.info("ws redis listener started")
        except Exception as exc:
            logger.warning("redis pubsub subscribe failed", error=str(exc)[:80])
            return

        try:
            async for message in self._pubsub.listen():
                if message["type"] != "message":
                    continue
                channel = message["channel"]
                try:
                    payload = json.loads(message["data"])
                    await self._handle_remote_message(
                        channel, payload.get("event"), payload.get("data", {})
                    )
                except json.JSONDecodeError:
                    logger.warning("invalid ws message from redis", channel=channel)
                except Exception as exc:
                    logger.error("ws handler error", error=str(exc)[:120])
        except asyncio.CancelledError:
            pass
        except Exception as exc:
            logger.error("redis listener crashed", error=str(exc)[:120])
        finally:
            await self._stop_listener()

    async def stop_listener(self) -> None:
        """Stop the Redis pub/sub listener."""
        if self._pubsub:
            try:
                await self._pubsub.unsubscribe()
                await self._pubsub.close()
            except Exception:
                pass
            self._pubsub = None
        logger.info("ws redis listener stopped")

    # ── Stats ────────────────────────────────────────────────────────

    @property
    def active_connections(self) -> int:
        return len(self._connections)

    @property
    def active_rooms(self) -> dict[str, int]:
        return {room: len(users) for room, users in self._rooms.items()}


manager = ConnectionManager()
