"""Authentication routes: register, login, 2FA, refresh, logout, password reset."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from app.api.deps import get_current_user_id
from app.services.auth_service import auth_service

router = APIRouter()


@router.post("/register", status_code=201)
async def register(data: dict):
    """Register a new user account."""
    result = await auth_service.register(
        email=data["email"],
        password=data["password"],
        password_confirm=data["password_confirm"],
        referral_code=data.get("referral_code"),
    )
    return {"status": "success", "data": result}


@router.post("/login")
async def login(data: dict, request: Request = None):
    """Authenticate with email + password."""
    result = await auth_service.login(
        email=data["email"],
        password=data["password"],
        device_info={"ip": request.client.host if request else None},
    )
    return {"status": "success", "data": result}


@router.post("/2fa/verify")
async def verify_2fa(data: dict):
    """Complete login with 2FA TOTP code."""
    result = await auth_service.verify_2fa(
        temp_token=data["temp_token"],
        code=data["code"],
    )
    return {"status": "success", "data": result}


@router.post("/refresh")
async def refresh_token(data: dict):
    """Rotate refresh token -> new access + refresh tokens."""
    result = await auth_service.refresh_tokens(
        refresh_token=data["refresh_token"],
    )
    return {"status": "success", "data": result}


@router.post("/logout")
async def logout(
    data: dict = {},
    user_id: str = Depends(get_current_user_id),
):
    """Revoke refresh token + session."""
    await auth_service.logout(
        user_id=user_id,
        refresh_token=data.get("refresh_token"),
    )
    return {"status": "success", "data": {"message": "Logged out."}}


@router.post("/forgot-password")
async def forgot_password(data: dict):
    """Send password reset email."""
    await auth_service.forgot_password(email=data["email"])
    return {"status": "success", "data": {"message": "If email exists, reset link sent."}}


@router.post("/reset-password")
async def reset_password(data: dict):
    """Reset password with reset token."""
    await auth_service.reset_password(
        token=data["token"],
        password=data["password"],
        password_confirm=data["password_confirm"],
    )
    return {"status": "success", "data": {"message": "Password reset."}}


@router.get("/verify-email")
async def verify_email(token: str = ""):
    """Verify email address with token."""
    await auth_service.verify_email(token=token)
    return {"status": "success", "data": {"message": "Email verified."}}


@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user_id)):
    """Get current user profile."""
    from app.services.user_service import user_service

    profile = await user_service.get_profile(user_id)
    return {"status": "success", "data": profile}


@router.put("/me")
async def update_me(data: dict, user_id: str = Depends(get_current_user_id)):
    """Update current user profile."""
    from app.services.user_service import user_service

    result = await user_service.update_profile(user_id, data)
    return {"status": "success", "data": result}


@router.post("/2fa/setup")
async def setup_2fa(user_id: str = Depends(get_current_user_id)):
    """Enable 2FA - returns secret + QR URI."""
    result = await auth_service.setup_2fa(user_id)
    return {"status": "success", "data": result}


@router.post("/2fa/confirm")
async def confirm_2fa(data: dict, user_id: str = Depends(get_current_user_id)):
    """Confirm 2FA setup with verification code."""
    await auth_service.confirm_2fa(user_id, code=data["code"])
    return {"status": "success", "data": {"message": "2FA enabled."}}


@router.post("/2fa/disable")
async def disable_2fa(data: dict, user_id: str = Depends(get_current_user_id)):
    """Disable 2FA."""
    await auth_service.disable_2fa(user_id, code=data["code"])
    return {"status": "success", "data": {"message": "2FA disabled."}}
