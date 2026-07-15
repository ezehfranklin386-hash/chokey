"""Celery application configuration."""

from __future__ import annotations

from celery import Celery

from app.config import settings

celery_app = Celery(
    "chokey",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "app.tasks.price_feed",
        "app.tasks.signal_generator",
        "app.tasks.email_tasks",
        "app.tasks.cleanup",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    task_soft_time_limit=25 * 60,
    worker_concurrency=8,
    beat_schedule={
        "update-prices": {
            "task": "app.tasks.price_feed.update_prices",
            "schedule": 30.0,  # every 30 seconds
        },
        "generate-signals": {
            "task": "app.tasks.signal_generator.generate_signals",
            "schedule": 3600.0,  # every hour
        },
        "cleanup-expired-sessions": {
            "task": "app.tasks.cleanup.cleanup_expired_sessions",
            "schedule": 3600.0,  # every hour
        },
        "check-price-alerts": {
            "task": "app.tasks.cleanup.check_price_alerts",
            "schedule": 60.0,  # every minute
        },
    },
)
