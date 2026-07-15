"""User profile, settings, API keys, and session management routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.services.user_service import user_service

router = APIRouter()


@router.get("/me")
async def get_profile(user_id: str = Depends(get_current_user_id)):
    """Get current user profile."""
    profile = await user_service.get_profile(user_id)
    return {"status": "success", "data": profile}


@router.put("/me")
async def update_profile(data: dict, user_id: str = Depends(get_current_user_id)):
    """Update profile."""
    result = await user_service.update_profile(user_id, data)
    return {"status": "success", "data": result}


@router.get("/me/settings")
async def get_settings(user_id: str = Depends(get_current_user_id)):
    """Get user settings (language, currency, theme, notifications)."""
    settings = await user_service.get_settings(user_id)
    return {"status": "success", "data": settings}


@router.put("/me/settings")
@router.patch("/me/settings")
async def update_settings(data: dict, user_id: str = Depends(get_current_user_id)):
    """Update user settings."""
    result = await user_service.update_settings(user_id, data)
    return {"status": "success", "data": result}


@router.get("/me/sessions")
async def list_sessions(user_id: str = Depends(get_current_user_id)):
    """List active sessions."""
    sessions = await user_service.list_sessions(user_id)
    return {"status": "success", "data": {"sessions": sessions}}


@router.delete("/me/sessions/{session_id}")
async def revoke_session(session_id: str, user_id: str = Depends(get_current_user_id)):
    """Revoke a specific session."""
    await user_service.revoke_session(user_id, session_id)
    return {"status": "success", "data": {"message": "Session revoked."}}


@router.post("/me/sessions/revoke-all")
async def revoke_all_sessions(user_id: str = Depends(get_current_user_id)):
    """Revoke all sessions except current."""
    await user_service.revoke_all_sessions(user_id, current_session_id="")
    return {"status": "success", "data": {"message": "All other sessions revoked."}}


@router.get("/me/api-keys")
async def list_api_keys(user_id: str = Depends(get_current_user_id)):
    """List API keys."""
    keys = await user_service.list_api_keys(user_id)
    return {"status": "success", "data": {"keys": keys}}


@router.post("/me/api-keys", status_code=201)
async def create_api_key(data: dict, user_id: str = Depends(get_current_user_id)):
    """Create a new API key."""
    result = await user_service.create_api_key(
        user_id=user_id,
        label=data.get("label", "Default"),
        permissions=data.get("permissions", ["read"]),
    )
    return {"status": "success", "data": result}


@router.delete("/me/api-keys/{key_id}")
async def revoke_api_key(key_id: str, user_id: str = Depends(get_current_user_id)):
    """Revoke an API key."""
    await user_service.revoke_api_key(user_id, key_id)
    return {"status": "success", "data": {"message": "API key revoked."}}
