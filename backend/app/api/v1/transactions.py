"""Transaction routes: history, detail, deposit, withdrawal."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.services.transaction_service import transaction_service

router = APIRouter()


@router.get("")
async def list_transactions(
    user_id: str = Depends(get_current_user_id),
    page: int = 1,
    limit: int = 20,
    type: str | None = None,
    status: str | None = None,
):
    """Get paginated transaction history."""
    result = await transaction_service.list_transactions(
        user_id, page=page, limit=limit, type=type, status=status
    )
    return {"status": "success", "data": result}


@router.get("/{transaction_id}")
async def get_transaction(transaction_id: str, user_id: str = Depends(get_current_user_id)):
    """Get single transaction detail."""
    result = await transaction_service.get_transaction(user_id, transaction_id)
    if not result:
        return {"status": "error", "error": {"code": "NOT_FOUND", "message": "Transaction not found."}}
    return {"status": "success", "data": result}


@router.post("/deposit", status_code=201)
async def create_deposit(data: dict, user_id: str = Depends(get_current_user_id)):
    """Create a deposit (simulated)."""
    result = await transaction_service.create_deposit(
        user_id=user_id,
        asset=data.get("asset", "BTC"),
        amount=float(data.get("amount", 0)),
        tx_hash=data.get("tx_hash"),
    )
    return {"status": "success", "data": result}


@router.post("/withdraw", status_code=201)
async def create_withdrawal(data: dict, user_id: str = Depends(get_current_user_id)):
    """Create a withdrawal request."""
    result = await transaction_service.create_withdrawal(
        user_id=user_id,
        asset=data.get("asset", "BTC"),
        amount=float(data.get("amount", 0)),
        address=data.get("address", ""),
        network=data.get("network", "bitcoin"),
        two_factor_code=data.get("two_factor_code"),
    )
    return {"status": "success", "data": result}
