"""Admin routes: user management, KYC review, system config, stats."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_admin_id

router = APIRouter()


@router.get("/users")
async def list_users(admin_id: str = Depends(get_current_admin_id)):
    """List all users (filterable by KYC level, role, active)."""
    return {"status": "success", "data": {"users": [], "total": 0}}


@router.get("/users/{user_id}")
async def get_user(user_id: str, admin_id: str = Depends(get_current_admin_id)):
    """Get user detail with all relations."""
    return {"status": "success", "data": {"id": user_id, "email": "", "role": "USER"}}


@router.put("/users/{user_id}")
async def update_user(user_id: str, admin_id: str = Depends(get_current_admin_id)):
    """Update user (role, KYC level, lock/unlock)."""
    return {"status": "success", "data": {"message": "User updated."}}


@router.get("/kyc/pending")
async def pending_kyc(admin_id: str = Depends(get_current_admin_id)):
    """List pending KYC documents."""
    return {"status": "success", "data": {"documents": []}}


@router.post("/kyc/{doc_id}/approve")
async def approve_kyc(doc_id: str, admin_id: str = Depends(get_current_admin_id)):
    """Approve a KYC document."""
    return {"status": "success", "data": {"message": "KYC approved."}}


@router.post("/kyc/{doc_id}/reject")
async def reject_kyc(doc_id: str, admin_id: str = Depends(get_current_admin_id)):
    """Reject a KYC document with reason."""
    return {"status": "success", "data": {"message": "KYC rejected."}}


@router.get("/transactions")
async def list_all_transactions(admin_id: str = Depends(get_current_admin_id)):
    """List all transactions (admin view)."""
    return {"status": "success", "data": {"transactions": [], "total": 0}}


@router.get("/orders")
async def list_all_orders(admin_id: str = Depends(get_current_admin_id)):
    """List all orders (admin view)."""
    return {"status": "success", "data": {"orders": [], "total": 0}}


@router.get("/settings")
async def get_system_settings(admin_id: str = Depends(get_current_admin_id)):
    """Get system configuration."""
    return {"status": "success", "data": {}}


@router.put("/settings")
async def update_system_settings(admin_id: str = Depends(get_current_admin_id)):
    """Update system configuration."""
    return {"status": "success", "data": {"message": "Settings updated."}}


@router.get("/stats")
async def get_stats(admin_id: str = Depends(get_current_admin_id)):
    """Get dashboard statistics (users, volume, signals, etc.)."""
    return {
        "status": "success",
        "data": {
            "total_users": 0,
            "total_volume_24h": "0.00",
            "active_signals": 0,
            "pending_kyc": 0,
            "open_orders": 0,
        },
    }


@router.post("/webhooks")
async def handle_webhook():
    """Handle incoming external webhooks (deposits, etc.)."""
    return {"status": "success", "data": {"message": "Webhook received."}}
