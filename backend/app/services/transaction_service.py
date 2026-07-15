"""Transaction business logic — history, deposit, withdrawal."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from app.core.exceptions import InvalidInputException, NotFoundException
from app.database import async_session_factory
from app.models.transaction import Transaction
from app.models.wallet import Asset, Wallet

ZERO = Decimal("0")


class TransactionService:
    @staticmethod
    async def list_transactions(
        user_id: str,
        page: int = 1,
        limit: int = 20,
        type: str | None = None,
        status: str | None = None,
    ) -> dict[str, Any]:
        """Paginated transaction history."""
        offset = (page - 1) * limit
        async with async_session_factory() as session:
            query = (
                select(Transaction)
                .options(joinedload(Transaction.asset))
                .where(Transaction.user_id == user_id)
            )
            count_query = select(func.count(Transaction.id)).where(Transaction.user_id == user_id)

            if type:
                query = query.where(Transaction.type == type.upper())
                count_query = count_query.where(Transaction.type == type.upper())
            if status:
                query = query.where(Transaction.status == status.upper())
                count_query = count_query.where(Transaction.status == status.upper())

            total = (await session.execute(count_query)).scalar() or 0
            result = await session.execute(
                query.order_by(Transaction.created_at.desc()).offset(offset).limit(limit)
            )
            txns = result.scalars().all()

            return {
                "items": [
                    {
                        "id": t.id,
                        "type": t.type,
                        "status": t.status,
                        "asset": t.asset.symbol if t.asset else "UNKNOWN",
                        "amount": str(t.amount),
                        "fee": str(t.fee) if t.fee else "0",
                        "network": (t.meta_data or {}).get("network"),
                        "address": t.to_address or t.from_address,
                        "tx_hash": t.tx_hash,
                        "confirmations": t.confirmations,
                        "created_at": t.created_at.isoformat() if t.created_at else None,
                    }
                    for t in txns
                ],
                "total": total,
                "page": page,
                "limit": limit,
            }

    @staticmethod
    async def get_transaction(user_id: str, transaction_id: str) -> dict[str, Any] | None:
        """Get single transaction detail."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Transaction)
                .options(joinedload(Transaction.asset))
                .where(
                    Transaction.id == transaction_id,
                    Transaction.user_id == user_id,
                )
            )
            t = result.scalar_one_or_none()
            if not t:
                return None

            return {
                "id": t.id,
                "type": t.type,
                "status": t.status,
                "asset": t.asset.symbol if t.asset else "UNKNOWN",
                "amount": str(t.amount),
                "fee": str(t.fee) if t.fee else "0",
                "network": (t.meta_data or {}).get("network"),
                "address": t.to_address or t.from_address,
                "tx_hash": t.tx_hash,
                "confirmations": t.confirmations,
                "created_at": t.created_at.isoformat() if t.created_at else None,
                "updated_at": t.updated_at.isoformat() if t.updated_at else None,
            }

    @staticmethod
    async def create_deposit(
        user_id: str,
        asset_symbol: str,
        amount: Decimal,
        tx_hash: str | None = None,
    ) -> dict[str, Any]:
        """Create a pending deposit."""
        async with async_session_factory() as session:
            asset_result = await session.execute(
                select(Asset).where(Asset.symbol == asset_symbol.upper())
            )
            a = asset_result.scalar_one_or_none()
            if not a:
                raise NotFoundException("Asset", asset_symbol)

            txn = Transaction(
                id=str(uuid.uuid4()),
                user_id=user_id,
                type="DEPOSIT",
                status="PENDING",
                asset_id=a.id,
                amount=amount,
                tx_hash=tx_hash,
                created_at=datetime.now(UTC),
            )
            session.add(txn)
            await session.commit()
            return {"id": txn.id, "status": txn.status}

    @staticmethod
    async def create_withdrawal(
        user_id: str,
        asset_symbol: str,
        amount: Decimal,
        address: str,
        network: str,
        two_factor_code: str | None = None,
    ) -> dict[str, Any]:
        """Create a withdrawal with security checks."""
        if amount <= ZERO:
            raise InvalidInputException("Amount must be positive.")
        if not address:
            raise InvalidInputException("Destination address is required.")

        async with async_session_factory() as session:
            asset_result = await session.execute(
                select(Asset).where(Asset.symbol == asset_symbol.upper())
            )
            a = asset_result.scalar_one_or_none()
            if not a:
                raise NotFoundException("Asset", asset_symbol)

            result = await session.execute(
                select(Wallet).where(Wallet.user_id == user_id, Wallet.asset_id == a.id)
            )
            w = result.scalar_one_or_none()
            if not w:
                raise NotFoundException("Wallet", f"{user_id}:{asset_symbol}")

            available = w.balance - w.locked_balance
            if available < amount:
                raise InvalidInputException(
                    f"Insufficient available balance. Available: {available}, requested: {amount}"
                )

            w.locked_balance += amount

            txn = Transaction(
                id=str(uuid.uuid4()),
                user_id=user_id,
                wallet_id=w.id,
                type="WITHDRAWAL",
                status="PENDING",
                asset_id=a.id,
                amount=amount,
                fee=(amount * Decimal("0.001")).quantize(Decimal("1e-8")),
                to_address=address,
                metadata={"network": network} if network else None,
                created_at=datetime.now(UTC),
            )
            session.add(txn)
            await session.commit()

            return {"id": txn.id, "status": txn.status}

    @staticmethod
    async def update_transaction_status(
        transaction_id: str,
        status: str,
        **kwargs: Any,
    ) -> None:
        """Update transaction status and trigger related actions."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Transaction).where(Transaction.id == transaction_id)
            )
            t = result.scalar_one_or_none()
            if not t:
                return

            t.status = status.upper()
            for key, value in kwargs.items():
                if hasattr(t, key):
                    setattr(t, key, value)

            if status.upper() == "COMPLETED" and t.type == "WITHDRAWAL":
                result = await session.execute(
                    select(Wallet).where(Wallet.user_id == t.user_id, Wallet.asset_id == t.asset_id)
                )
                w = result.scalar_one_or_none()
                if w:
                    w.balance -= t.amount
                    w.locked_balance -= t.amount
                    if w.locked_balance < ZERO:
                        w.locked_balance = ZERO

            elif status.upper() == "COMPLETED" and t.type == "DEPOSIT":
                result = await session.execute(
                    select(Wallet).where(Wallet.user_id == t.user_id, Wallet.asset_id == t.asset_id)
                )
                w = result.scalar_one_or_none()
                if w:
                    w.balance += t.amount

            elif status.upper() == "FAILED" and t.type == "WITHDRAWAL":
                result = await session.execute(
                    select(Wallet).where(Wallet.user_id == t.user_id, Wallet.asset_id == t.asset_id)
                )
                w = result.scalar_one_or_none()
                if w:
                    w.locked_balance -= t.amount
                    if w.locked_balance < ZERO:
                        w.locked_balance = ZERO

            await session.commit()


transaction_service = TransactionService()
