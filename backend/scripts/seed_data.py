"""Seed the database with initial demo data.

Usage:
    python -m scripts.seed_data [--drop]

Options:
    --drop    Drop existing tables before seeding
"""

from __future__ import annotations

import asyncio
import sys
import uuid
from datetime import UTC, datetime, timedelta

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pathlib import Path

from app.core.security import hash_password
from app.database import Base, engine, async_session_factory


async def seed(drop: bool = False) -> None:
    """Create tables and insert demo data."""
    if drop:
        print("Dropping existing tables...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created.")

    async with async_session_factory() as session:
        # ---------- demo user ----------
        from app.models.user import User

        demo_user = User(
            id=str(uuid.uuid4()),
            email="demo@chokey.com",
            password_hash=hash_password("Demo123!"),
            display_name="Demo User",
            is_verified=True,
            is_active=True,
        )
        session.add(demo_user)
        await session.flush()
        print(f"Created demo user: {demo_user.email} / Demo123!")

        # ---------- admin user ----------
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@chokey.com",
            password_hash=hash_password("Admin123!"),
            display_name="Admin",
            is_verified=True,
            is_active=True,
            is_admin=True,
        )
        session.add(admin)
        await session.flush()
        print(f"Created admin: {admin.email} / Admin123!")

        # ---------- assets ----------
        from app.models.wallet import Asset

        assets_data = [
            {"symbol": "BTC", "name": "Bitcoin", "decimals": 8, "icon": "https://cryptoicons.org/api/icon/btc/200"},
            {"symbol": "ETH", "name": "Ethereum", "decimals": 18, "icon": "https://cryptoicons.org/api/icon/eth/200"},
            {"symbol": "USDT", "name": "Tether", "decimals": 6, "icon": "https://cryptoicons.org/api/icon/usdt/200"},
            {"symbol": "SOL", "name": "Solana", "decimals": 9, "icon": "https://cryptoicons.org/api/icon/sol/200"},
            {"symbol": "ADA", "name": "Cardano", "decimals": 6, "icon": "https://cryptoicons.org/api/icon/ada/200"},
            {"symbol": "DOT", "name": "Polkadot", "decimals": 10, "icon": "https://cryptoicons.org/api/icon/dot/200"},
            {"symbol": "AVAX", "name": "Avalanche", "decimals": 18, "icon": "https://cryptoicons.org/api/icon/avax/200"},
            {"symbol": "MATIC", "name": "Polygon", "decimals": 18, "icon": "https://cryptoicons.org/api/icon/matic/200"},
        ]
        assets = {}
        for a in assets_data:
            asset = Asset(id=str(uuid.uuid4()), **a)
            session.add(asset)
            assets[a["symbol"]] = asset
        await session.flush()
        print(f"Created {len(assets_data)} assets.")

        # ---------- wallets for demo user ----------
        from app.models.wallet import Wallet

        wallets = []
        for symbol, asset in assets.items():
            wallet = Wallet(
                id=str(uuid.uuid4()),
                user_id=demo_user.id,
                asset_id=asset.id,
                balance=100.0 if symbol == "USDT" else 0.5,
                available_balance=100.0 if symbol == "USDT" else 0.5,
            )
            if symbol == "BTC":
                wallet.balance = 1.25
                wallet.available_balance = 1.25
            elif symbol == "ETH":
                wallet.balance = 15.0
                wallet.available_balance = 15.0
            session.add(wallet)
            wallets.append(wallet)
        await session.flush()
        print(f"Created {len(wallets)} wallets for demo user.")

        # ---------- market prices ----------
        from app.models.market import MarketPrice

        prices = [
            MarketPrice(asset_id=assets["BTC"].id, symbol="BTC", price=67450.0, change_24h=2.34, volume_24h=28_500_000_000, high_24h=68200.0, low_24h=65800.0, market_cap=1_320_000_000_000),
            MarketPrice(asset_id=assets["ETH"].id, symbol="ETH", price=3450.0, change_24h=-1.20, volume_24h=15_200_000_000, high_24h=3520.0, low_24h=3380.0, market_cap=415_000_000_000),
            MarketPrice(asset_id=assets["USDT"].id, symbol="USDT", price=1.0, change_24h=0.01, volume_24h=65_000_000_000, high_24h=1.001, low_24h=0.999, market_cap=95_000_000_000),
            MarketPrice(asset_id=assets["SOL"].id, symbol="SOL", price=145.80, change_24h=5.67, volume_24h=3_200_000_000, high_24h=148.0, low_24h=138.0, market_cap=62_000_000_000),
            MarketPrice(asset_id=assets["ADA"].id, symbol="ADA", price=0.62, change_24h=-0.45, volume_24h=850_000_000, high_24h=0.64, low_24h=0.60, market_cap=21_800_000_000),
            MarketPrice(asset_id=assets["DOT"].id, symbol="DOT", price=7.82, change_24h=1.10, volume_24h=420_000_000, high_24h=8.0, low_24h=7.60, market_cap=10_500_000_000),
            MarketPrice(asset_id=assets["AVAX"].id, symbol="AVAX", price=38.45, change_24h=3.20, volume_24h=1_100_000_000, high_24h=39.0, low_24h=37.0, market_cap=14_000_000_000),
            MarketPrice(asset_id=assets["MATIC"].id, symbol="MATIC", price=0.72, change_24h=0.80, volume_24h=520_000_000, high_24h=0.73, low_24h=0.70, market_cap=6_700_000_000),
        ]
        for p in prices:
            session.add(p)
        await session.flush()
        print(f"Created {len(prices)} market prices.")

        # ---------- sample signals ----------
        from app.models.signal import Signal

        signals = [
            Signal(
                id=str(uuid.uuid4()),
                asset_id=assets["BTC"].id,
                symbol="BTC",
                signal_type="BUY",
                entry_price=67000.0,
                target_price=72000.0,
                stop_loss=65000.0,
                confidence=85,
                timeframe="4h",
                strategy="Momentum Breakout",
                reasoning="BTC broke above resistance with volume. RSI bullish divergence on 4h.",
                status="ACTIVE",
            ),
            Signal(
                id=str(uuid.uuid4()),
                asset_id=assets["ETH"].id,
                symbol="ETH",
                signal_type="BUY",
                entry_price=3400.0,
                target_price=3800.0,
                stop_loss=3250.0,
                confidence=72,
                timeframe="1d",
                strategy="EMA Crossover",
                reasoning="ETH holding above 200 EMA on daily. Golden cross forming.",
                status="ACTIVE",
            ),
            Signal(
                id=str(uuid.uuid4()),
                asset_id=assets["SOL"].id,
                symbol="SOL",
                signal_type="SELL",
                entry_price=148.0,
                target_price=130.0,
                stop_loss=152.0,
                confidence=65,
                timeframe="1h",
                strategy="RSI Divergence",
                reasoning="SOL rejected at resistance. RSI showing bearish divergence on 1h.",
                status="ACTIVE",
            ),
        ]
        for s in signals:
            session.add(s)
        await session.flush()
        print(f"Created {len(signals)} signals.")

        # ---------- recent trades ----------
        from app.models.order import Order, Trade

        trades = [
            Trade(
                id=str(uuid.uuid4()),
                buyer_id=demo_user.id,
                seller_id=None,
                asset_id=assets["BTC"].id,
                symbol="BTC",
                side="BUY",
                price=66500.0,
                quantity=0.05,
                total=3325.0,
            ),
            Trade(
                id=str(uuid.uuid4()),
                buyer_id=demo_user.id,
                seller_id=None,
                asset_id=assets["ETH"].id,
                symbol="ETH",
                side="BUY",
                price=3420.0,
                quantity=1.5,
                total=5130.0,
            ),
        ]
        for t in trades:
            session.add(t)
        await session.flush()
        print(f"Created {len(trades)} trade records.")

        await session.commit()
    print("\n✅ Seed complete!")
    print(f"   Demo: demo@chokey.com / Demo123!")
    print(f"   Admin: admin@chokey.com / Admin123!")


async def main() -> None:
    drop = "--drop" in sys.argv
    await seed(drop=drop)


if __name__ == "__main__":
    asyncio.run(main())
