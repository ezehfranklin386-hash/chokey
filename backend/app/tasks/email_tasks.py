"""Celery task: send transactional emails via SendGrid."""

from __future__ import annotations

import structlog

from app.tasks.celery_app import celery_app

logger = structlog.get_logger()


@celery_app.task(name="app.tasks.email_tasks.send_email")
def send_email(to: str, subject: str, body: str) -> None:
    """Send a transactional email."""
    logger.info("Sending email", to=to, subject=subject)
    # TODO: integrate with SendGrid / Mailgun API


@celery_app.task(name="app.tasks.email_tasks.send_verification_email")
def send_verification_email(to: str, token: str) -> None:
    """Send email verification link."""
    send_email.delay(to, "Verify your email", f"Your verification token: {token}")


@celery_app.task(name="app.tasks.email_tasks.send_password_reset")
def send_password_reset(to: str, token: str) -> None:
    """Send password reset link."""
    send_email.delay(to, "Password Reset", f"Your reset token: {token}")
