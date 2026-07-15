"""Notification and price alert business logic."""

from __future__ import annotations

from typing import Any

from sqlalchemy import func, select

from app.database import async_session_factory
from app.models.notification import Notification, PriceAlert


class NotificationService:
    @staticmethod
    async def list_notifications(
        user_id: str,
        page: int = 1,
        limit: int = 20,
    ) -> dict[str, Any]:
        """List notifications for the current user."""
        offset = (page - 1) * limit
        async with async_session_factory() as session:
            total = (await session.execute(
                select(func.count(Notification.id)).where(Notification.user_id == user_id)
            )).scalar() or 0

            unread = (await session.execute(
                select(func.count(Notification.id)).where(
                    Notification.user_id == user_id,
                    Notification.is_read == False,  # noqa: E712
                )
            )).scalar() or 0

            result = await session.execute(
                select(Notification)
                .where(Notification.user_id == user_id)
                .order_by(Notification.created_at.desc())
                .offset(offset)
                .limit(limit)
            )
            notifications = result.scalars().all()

            return {
                "notifications": [
                    {
                        "id": n.id,
                        "type": n.type,
                        "title": n.title,
                        "body": n.body,
                        "data": n.data,
                        "is_read": n.is_read,
                        "created_at": n.created_at.isoformat() if n.created_at else None,
                    }
                    for n in notifications
                ],
                "total": total,
                "unread_count": unread,
                "page": page,
                "limit": limit,
            }

    @staticmethod
    async def mark_read(user_id: str, notification_id: str) -> None:
        """Mark a single notification as read."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Notification).where(
                    Notification.id == notification_id,
                    Notification.user_id == user_id,
                )
            )
            n = result.scalar_one_or_none()
            if n:
                n.is_read = True
                await session.commit()

    @staticmethod
    async def mark_all_read(user_id: str) -> None:
        """Mark all notifications as read."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Notification).where(
                    Notification.user_id == user_id,
                    Notification.is_read == False,  # noqa: E712
                )
            )
            for n in result.scalars():
                n.is_read = True
            await session.commit()

    @staticmethod
    async def create_notification(
        user_id: str,
        type: str,
        title: str,
        body: str | None = None,
    ) -> dict[str, Any]:
        """Create a notification."""
        import uuid
        from datetime import UTC, datetime

        async with async_session_factory() as session:
            n = Notification(
                id=str(uuid.uuid4()),
                user_id=user_id,
                type=type,
                title=title,
                body=body,
                created_at=datetime.now(UTC),
            )
            session.add(n)
            await session.commit()
            return {"id": n.id}

    @staticmethod
    async def send_push(user_id: str, title: str, body: str) -> None:
        """Send push notification via FCM / Web Push."""
        # In production: integrate with Firebase Cloud Messaging
        pass

    @staticmethod
    async def send_email(to: str, subject: str, body: str) -> None:
        """Send transactional email via SendGrid."""
        # In production: integrate with SendGrid
        pass


notification_service = NotificationService()
