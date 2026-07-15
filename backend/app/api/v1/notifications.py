"""Notification and price-alert routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.services.notification_service import notification_service

router = APIRouter()


@router.get("/notifications")
async def list_notifications(
    user_id: str = Depends(get_current_user_id),
    page: int = 1,
    limit: int = 20,
):
    """List notifications for the current user."""
    result = await notification_service.list_notifications(user_id, page=page, limit=limit)
    return {"status": "success", "data": result}


@router.get("/notifications/{notification_id}")
async def get_notification(
    notification_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a single notification."""
    n = await notification_service.list_notifications(user_id)
    for item in n.get("notifications", []):
        if item["id"] == notification_id:
            return {"status": "success", "data": item}
    return {"status": "error", "error": {"code": "NOT_FOUND", "message": "Notification not found."}}


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Mark a notification as read."""
    await notification_service.mark_read(user_id, notification_id)
    return {"status": "success", "data": {"message": "Notification marked as read."}}


@router.post("/notifications/read-all")
async def mark_all_read(user_id: str = Depends(get_current_user_id)):
    """Mark all notifications as read."""
    await notification_service.mark_all_read(user_id)
    return {"status": "success", "data": {"message": "All notifications marked as read."}}


@router.get("/price-alerts")
async def list_price_alerts(
    user_id: str = Depends(get_current_user_id),
    page: int = 1,
    limit: int = 20,
):
    """List price alerts for the current user."""
    # In production: query from PriceAlert model
    return {"status": "success", "data": {"alerts": [], "total": 0, "page": page, "limit": limit}}


@router.post("/price-alerts", status_code=201)
async def create_price_alert(user_id: str = Depends(get_current_user_id)):
    """Create a new price alert."""
    return {"status": "success", "data": {"id": "alert_id", "status": "ACTIVE"}}


@router.delete("/price-alerts/{alert_id}")
async def delete_price_alert(
    alert_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Delete a price alert."""
    return {"status": "success", "data": {"message": "Price alert deleted."}}
