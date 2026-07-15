"""Wallet routes: list, detail, addresses, balances."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.services.wallet_service import wallet_service

router = APIRouter()


@router.get("")
async def list_wallets(user_id: str = Depends(get_current_user_id)):
    """Get all wallets for the current user."""
    result = await wallet_service.list_wallets(user_id)
    return {"status": "success", "data": result}


@router.get("/{wallet_id}")
async def get_wallet(wallet_id: str, user_id: str = Depends(get_current_user_id)):
    """Get single wallet detail."""
    result = await wallet_service.get_wallet(user_id, wallet_id)
    if not result:
        return {"status": "error", "error": {"code": "NOT_FOUND", "message": "Wallet not found."}}
    return {"status": "success", "data": result}


@router.get("/{wallet_id}/addresses")
async def list_addresses(wallet_id: str, user_id: str = Depends(get_current_user_id)):
    """List deposit addresses for a wallet."""
    addresses = await wallet_service.list_addresses(user_id, wallet_id)
    return {"status": "success", "data": {"addresses": addresses}}


@router.post("/{wallet_id}/addresses", status_code=201)
async def create_address(
    wallet_id: str,
    data: dict = {},
    user_id: str = Depends(get_current_user_id),
):
    """Generate a new deposit address."""
    result = await wallet_service.create_address(user_id, wallet_id, label=data.get("label"))
    return {"status": "success", "data": result}


@router.get("/summary")
async def get_wallet_summary(user_id: str = Depends(get_current_user_id)):
    """Get portfolio summary (total balance, 24h change, allocation)."""
    result = await wallet_service.get_wallet_summary(user_id)
    return {"status": "success", "data": result}
