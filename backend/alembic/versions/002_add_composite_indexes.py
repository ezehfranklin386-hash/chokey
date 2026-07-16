"""Add composite database indexes for high-query patterns.

Revision ID: 002
Revises: 001
Create Date: 2026-07-16
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Orders ──────────────────────────────────────────────────
    op.create_index("ix_orders_user_status_created", "orders", ["user_id", "status", "created_at"])
    op.create_index("ix_orders_status_created", "orders", ["status", "created_at"])

    # ── Trades ──────────────────────────────────────────────────
    op.create_index("ix_trades_user_created", "trades", ["user_id", "created_at"])
    op.create_index("ix_trades_asset_created", "trades", ["asset_id", "created_at"])

    # ── OrderBook ───────────────────────────────────────────────
    op.create_index("ix_orderbook_asset_side", "order_books", ["asset_id", "side"])

    # ── Transactions ────────────────────────────────────────────
    op.create_index(
        "ix_transactions_user_type_status_created",
        "transactions",
        ["user_id", "type", "status", "created_at"],
    )

    # ── MarketPrice ─────────────────────────────────────────────
    op.create_index("ix_market_prices_asset_ts", "market_prices", ["asset_id", "timestamp"])

    # ── Candles (adds index alongside existing unique constraint) ──
    op.create_index("ix_candles_asset_interval_time", "candles", ["asset_id", "interval", "open_time"])

    # ── Signals ─────────────────────────────────────────────────
    op.create_index("ix_signals_asset_status", "signals", ["asset_id", "status"])
    op.create_index("ix_signals_type_status_direction", "signals", ["type", "status", "direction"])

    # ── Sessions ────────────────────────────────────────────────
    op.create_index("ix_sessions_user_created", "sessions", ["user_id", "created_at"])

    # ── API Keys ────────────────────────────────────────────────
    op.create_index("ix_apikeys_user_active", "api_keys", ["user_id", "is_active"])

    # ── Notifications ───────────────────────────────────────────
    op.create_index(
        "ix_notifications_user_read_created",
        "notifications",
        ["user_id", "is_read", "created_at"],
    )

    # ── Price Alerts ────────────────────────────────────────────
    op.create_index(
        "ix_pricealerts_user_active_asset",
        "price_alerts",
        ["user_id", "status", "asset_id"],
    )
    op.create_index("ix_pricealerts_status_value", "price_alerts", ["status", "value"])

    # ── Wallets ─────────────────────────────────────────────────
    op.create_index("ix_wallets_user_asset", "wallets", ["user_id", "asset_id"])

    # ── KYC Documents ───────────────────────────────────────────
    op.create_index("ix_kyc_user_status", "kyc_documents", ["user_id", "status"])

    # ── Audit Logs ──────────────────────────────────────────────
    op.create_index("ix_auditlogs_user_created", "audit_logs", ["user_id", "created_at"])
    op.create_index("ix_auditlogs_action_created", "audit_logs", ["action", "created_at"])


def downgrade() -> None:
    # Drop all indexes in reverse order
    op.drop_index("ix_auditlogs_action_created")
    op.drop_index("ix_auditlogs_user_created")
    op.drop_index("ix_kyc_user_status")
    op.drop_index("ix_wallets_user_asset")
    op.drop_index("ix_pricealerts_status_value")
    op.drop_index("ix_pricealerts_user_active_asset")
    op.drop_index("ix_notifications_user_read_created")
    op.drop_index("ix_apikeys_user_active")
    op.drop_index("ix_sessions_user_created")
    op.drop_index("ix_signals_type_status_direction")
    op.drop_index("ix_signals_asset_status")
    op.drop_index("ix_candles_asset_interval_time")
    op.drop_index("ix_market_prices_asset_ts")
    op.drop_index("ix_transactions_user_type_status_created")
    op.drop_index("ix_orderbook_asset_side")
    op.drop_index("ix_trades_asset_created")
    op.drop_index("ix_trades_user_created")
    op.drop_index("ix_orders_status_created")
    op.drop_index("ix_orders_user_status_created")
