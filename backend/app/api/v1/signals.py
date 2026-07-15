"""Signal routes: feed, detail, subscription, bookmark, providers."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id, get_optional_user_id
from app.services.signal_service import signal_service

router = APIRouter()


@router.get("")
async def list_signals(
    user_id: str | None = Depends(get_optional_user_id),
    asset: str | None = None,
    direction: str | None = None,
    type: str | None = None,
    page: int = 1,
    limit: int = 20,
):
    """Get signal feed (filterable by asset, direction, type)."""
    result = await signal_service.list_signals(
        user_id=user_id, asset=asset, direction=direction, type=type, page=page, limit=limit
    )
    return {"status": "success", "data": result}


@router.get("/{signal_id}")
async def get_signal(signal_id: str, user_id: str | None = Depends(get_optional_user_id)):
    """Get signal detail with performance."""
    result = await signal_service.get_signal(signal_id, user_id=user_id)
    if not result:
        return {"status": "error", "error": {"code": "NOT_FOUND", "message": "Signal not found."}}
    return {"status": "success", "data": result}


@router.post("", status_code=201)
async def create_signal(data: dict, user_id: str = Depends(get_current_user_id)):
    """Create a community signal."""
    result = await signal_service.create_signal(user_id, data)
    return {"status": "success", "data": result}


@router.post("/{signal_id}/subscribe")
async def subscribe_signal(signal_id: str, user_id: str = Depends(get_current_user_id)):
    """Subscribe to a premium signal."""
    await signal_service.subscribe(user_id, signal_id)
    return {"status": "success", "data": {"message": "Subscribed."}}


@router.delete("/{signal_id}/subscribe")
async def unsubscribe_signal(signal_id: str, user_id: str = Depends(get_current_user_id)):
    """Unsubscribe from a premium signal."""
    await signal_service.unsubscribe(user_id, signal_id)
    return {"status": "success", "data": {"message": "Unsubscribed."}}


@router.post("/{signal_id}/bookmark")
async def bookmark_signal(signal_id: str, user_id: str = Depends(get_current_user_id)):
    """Bookmark a signal."""
    await signal_service.bookmark(user_id, signal_id)
    return {"status": "success", "data": {"message": "Bookmarked."}}


@router.get("/providers")
async def list_providers():
    """List signal providers."""
    return {"status": "success", "data": {"providers": []}}


@router.get("/providers/{provider_id}")
async def get_provider(provider_id: str):
    """Get signal provider profile with stats."""
    return {
        "status": "success",
        "data": {
            "id": provider_id,
            "name": "Provider Name",
            "win_rate": 0,
            "total_signals": 0,
            "total_pnl": "0.00",
            "followers": 0,
        },
    }
