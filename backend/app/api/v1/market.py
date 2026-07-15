"""Market data routes: prices, candles, order book, search."""

from __future__ import annotations

from fastapi import APIRouter

from app.services.market_service import market_service

router = APIRouter()


@router.get("/prices")
async def list_prices():
    """Get all current asset prices (top ~100)."""
    prices = await market_service.list_prices()
    return {"status": "success", "data": {"prices": prices}}


@router.get("/prices/{asset}")
async def get_price(asset: str):
    """Get single asset price + 24h stats."""
    result = await market_service.get_price(asset)
    if not result:
        return {"status": "error", "error": {"code": "NOT_FOUND", "message": f"Price for {asset} not found."}}
    return {"status": "success", "data": result}


@router.get("/candles/{asset}")
async def get_candles(asset: str, interval: str = "1h", limit: int = 100):
    """Get OHLCV candle data."""
    candles = await market_service.get_candles(asset, interval=interval, limit=limit)
    return {"status": "success", "data": {"candles": candles, "asset": asset, "interval": interval}}


@router.get("/search")
async def search_assets(q: str = ""):
    """Search assets by symbol or name."""
    results = await market_service.search_assets(q) if q else []
    return {"status": "success", "data": {"results": results}}


@router.get("/assets")
async def list_assets():
    """List all supported assets."""
    assets = await market_service.list_assets()
    return {"status": "success", "data": {"assets": assets}}


@router.get("/orderbook/{asset}")
async def get_orderbook(asset: str):
    """Get order book snapshot (bids + asks aggregated by price)."""
    ob = await market_service.get_orderbook(asset)
    return {"status": "success", "data": ob}


@router.get("/trades/{asset}")
async def get_public_trades(asset: str, limit: int = 50):
    """Get recent public trades."""
    trades = await market_service.get_public_trades(asset, limit=limit)
    return {"status": "success", "data": {"trades": trades, "asset": asset}}
