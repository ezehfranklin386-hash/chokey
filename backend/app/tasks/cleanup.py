"""Celery tasks: periodic cleanup and maintenance."""

from __future__ import annotations

import structlog

from app.tasks.celery_app import celery_app

logger = structlog.get_logger()


@celery_app.task(name="app.tasks.cleanup.cleanup_expired_sessions")
def cleanup_expired_sessions() -> None:
    """Delete expired sessions from the database."""
    logger.info("Cleaning up expired sessions…")
    # TODO: DELETE FROM sessions WHERE expires_at < now()


@celery_app.task(name="app.tasks.cleanup.cleanup_expired_reset_tokens")
def cleanup_expired_reset_tokens() -> None:
    """Delete expired password reset tokens."""
    pass


@celery_app.task(name="app.tasks.cleanup.check_price_alerts")
def check_price_alerts() -> None:
    """Check active price alerts and trigger notifications."""
    logger.info("Checking price alerts…")
    # TODO: query active alerts
    # TODO: compare current price to condition
    # TODO: create Notification + send push/email
