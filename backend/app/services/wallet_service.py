"""Wallet and balance business logic."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from sqlalchemy import select

from app.core.exceptions import InsufficientBalanceException, NotFoundException
from app.database import async_session_factory
from app.models.wallet import Asset, Wallet, WalletAddress

ZERO = Decimal("0")


class WalletService:
    @staticmethod
    async def list_wallets(user_id: str) -> dict[str, Any]:
        """Get all wallets with USD values."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Wallet).where(Wallet.user_id == user_id)
            )
            wallets = result.scalars().all()

            data = []
            total_usd = ZERO
            for w in wallets:
                from app.models.market import MarketPrice

                price_result = await session.execute(
                    select(MarketPrice.price).where(MarketPrice.asset_id == w.asset_id)
                )
                price_row = price_result.scalar_one_or_none()
                price = Decimal(str(price_row)) if price_row else ZERO
                usd_value = w.balance * price
                total_usd += usd_value

                available = w.balance - w.locked_balance
                data.append({
                    "id": w.id,
                    "asset": w.asset.symbol,
                    "balance": str(w.balance),
                    "locked": str(w.locked_balance),
                    "available": str(available),
                    "usd_value": str(usd_value.quantize(Decimal("0.01"))),
                    "price": str(price),
                })

            return {
                "wallets": data,
                "total_usd_value": str(total_usd.quantize(Decimal("0.01"))),
            }

    @staticmethod
    async def get_wallet(user_id: str, wallet_id: str) -> dict[str, Any] | None:
        """Get single wallet detail."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Wallet).where(Wallet.id == wallet_id, Wallet.user_id == user_id)
            )
            w = result.scalar_one_or_none()
            if not w:
                return None

            from app.models.market import MarketPrice

            price_result = await session.execute(
                select(MarketPrice.price).where(MarketPrice.asset_id == w.asset_id)
            )
            price_row = price_result.scalar_one_or_none()
            price = Decimal(str(price_row)) if price_row else ZERO

            available = w.balance - w.locked_balance
            return {
                "id": w.id,
                "asset": w.asset.symbol,
                "balance": str(w.balance),
                "locked": str(w.locked_balance),
                "available": str(available),
                "usd_value": str((w.balance * price).quantize(Decimal("0.01"))),
                "price": str(price),
            }

    @staticmethod
    async def get_wallet_summary(user_id: str) -> dict[str, Any]:
        """Portfolio summary with allocation."""
        wallets_data = await WalletService.list_wallets(user_id)
        total = Decimal(wallets_data["total_usd_value"])
        wallets = wallets_data["wallets"]

        allocation = {}
        for w in wallets:
            asset = w["asset"]
            usd = Decimal(w["usd_value"])
            allocation[asset] = round(float(usd / total * 100) if total > 0 else 0, 2)

        return {
            "total_balance_usd": str(total),
            "change_24h_usd": "0.00",
            "change_24h_percent": "0.00",
            "allocation": allocation,
        }

    @staticmethod
    async def deposit(user_id: str, asset: str, amount: Decimal) -> dict[str, Any]:
        """Deposit funds to a wallet."""
        async with async_session_factory() as session:
            asset_result = await session.execute(
                select(Asset).where(Asset.symbol == asset.upper())
            )
            a = asset_result.scalar_one_or_none()
            if not a:
                raise NotFoundException("Asset", asset)

            result = await session.execute(
                select(Wallet).where(Wallet.user_id == user_id, Wallet.asset_id == a.id)
            )
            w = result.scalar_one_or_none()
            if not w:
                raise NotFoundException("Wallet", f"{user_id}:{asset}")

            w.balance += amount
            w.total_deposited += amount

            return {"status": "success", "new_balance": str(w.balance)}

    @staticmethod
    async def withdraw(user_id: str, asset: str, amount: Decimal, address: str) -> dict[str, Any]:
        """Withdraw funds from a wallet."""
        async with async_session_factory() as session:
            asset_result = await session.execute(
                select(Asset).where(Asset.symbol == asset.upper())
            )
            a = asset_result.scalar_one_or_none()
            if not a:
                raise NotFoundException("Asset", asset)

            result = await session.execute(
                select(Wallet).where(Wallet.user_id == user_id, Wallet.asset_id == a.id)
            )
            w = result.scalar_one_or_none()
            if not w:
                raise NotFoundException("Wallet", f"{user_id}:{asset}")

            available = w.balance - w.locked_balance
            if available < amount:
                raise InsufficientBalanceException(f"Available: {available}, requested: {amount}")

            w.balance -= amount
            w.total_withdrawn += amount

            return {"status": "success", "new_balance": str(w.balance)}


wallet_service = WalletService()
