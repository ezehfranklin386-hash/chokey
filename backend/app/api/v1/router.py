"""Aggregate all v1 API routers."""

from fastapi import APIRouter

from app.api.v1 import auth, users, wallets, transactions, orders, market, signals, kyc, admin, notifications, uploads

api_v1_router = APIRouter()

# Mount all sub-routers
api_v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(users.router, prefix="/users", tags=["users"])
api_v1_router.include_router(wallets.router, prefix="/wallets", tags=["wallets"])
api_v1_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_v1_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_v1_router.include_router(market.router, prefix="/market", tags=["market"])
api_v1_router.include_router(signals.router, prefix="/signals", tags=["signals"])
api_v1_router.include_router(kyc.router, prefix="/kyc", tags=["kyc"])
api_v1_router.include_router(notifications.router, tags=["notifications"])
api_v1_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_v1_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])


@api_v1_router.get("/ping")
async def ping() -> dict:
    """Simple liveness check."""
    return {"status": "pong"}
