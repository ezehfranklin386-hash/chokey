"""Convert all financial float columns to NUMERIC(18,8)

Revision ID: 001
Revises:
Create Date: 2026-07-14
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

MONEY = sa.Numeric(18, 8)
PCT = sa.Numeric(5, 2)


def upgrade() -> None:
    # ── Asset ──
    op.alter_column("assets", "min_withdrawal", type_=MONEY, existing_type=sa.Float, postgresql_using="min_withdrawal::numeric(18,8)")
    op.alter_column("assets", "max_withdrawal", type_=MONEY, existing_type=sa.Float, postgresql_using="max_withdrawal::numeric(18,8)")
    op.alter_column("assets", "withdrawal_fee", type_=MONEY, existing_type=sa.Float, postgresql_using="withdrawal_fee::numeric(18,8)")
    op.alter_column("assets", "deposit_fee", type_=MONEY, existing_type=sa.Float, postgresql_using="deposit_fee::numeric(18,8)")
    op.alter_column("assets", "trading_fee", type_=MONEY, existing_type=sa.Float, postgresql_using="trading_fee::numeric(18,8)")

    # ── Wallet ──
    op.alter_column("wallets", "balance", type_=MONEY, existing_type=sa.Float, postgresql_using="balance::numeric(18,8)")
    op.alter_column("wallets", "locked_balance", type_=MONEY, existing_type=sa.Float, postgresql_using="locked_balance::numeric(18,8)")
    op.alter_column("wallets", "total_deposited", type_=MONEY, existing_type=sa.Float, postgresql_using="total_deposited::numeric(18,8)")
    op.alter_column("wallets", "total_withdrawn", type_=MONEY, existing_type=sa.Float, postgresql_using="total_withdrawn::numeric(18,8)")

    # ── Order ──
    op.alter_column("orders", "price", type_=MONEY, existing_type=sa.Float, postgresql_using="price::numeric(18,8)")
    op.alter_column("orders", "stop_price", type_=MONEY, existing_type=sa.Float, postgresql_using="stop_price::numeric(18,8)")
    op.alter_column("orders", "quantity", type_=MONEY, existing_type=sa.Float, postgresql_using="quantity::numeric(18,8)")
    op.alter_column("orders", "filled_quantity", type_=MONEY, existing_type=sa.Float, postgresql_using="filled_quantity::numeric(18,8)")
    op.alter_column("orders", "remaining_quantity", type_=MONEY, existing_type=sa.Float, postgresql_using="remaining_quantity::numeric(18,8)")
    op.alter_column("orders", "total", type_=MONEY, existing_type=sa.Float, postgresql_using="total::numeric(18,8)")
    op.alter_column("orders", "filled_total", type_=MONEY, existing_type=sa.Float, postgresql_using="filled_total::numeric(18,8)")
    op.alter_column("orders", "avg_fill_price", type_=MONEY, existing_type=sa.Float, postgresql_using="avg_fill_price::numeric(18,8)")
    op.alter_column("orders", "fee", type_=MONEY, existing_type=sa.Float, postgresql_using="fee::numeric(18,8)")
    op.alter_column("orders", "slippage", type_=MONEY, existing_type=sa.Float, postgresql_using="slippage::numeric(18,8)")

    # ── Trade ──
    op.alter_column("trades", "price", type_=MONEY, existing_type=sa.Float, postgresql_using="price::numeric(18,8)")
    op.alter_column("trades", "quantity", type_=MONEY, existing_type=sa.Float, postgresql_using="quantity::numeric(18,8)")
    op.alter_column("trades", "total", type_=MONEY, existing_type=sa.Float, postgresql_using="total::numeric(18,8)")
    op.alter_column("trades", "fee", type_=MONEY, existing_type=sa.Float, postgresql_using="fee::numeric(18,8)")

    # ── OrderBook ──
    op.alter_column("order_books", "price", type_=MONEY, existing_type=sa.Float, postgresql_using="price::numeric(18,8)")
    op.alter_column("order_books", "quantity", type_=MONEY, existing_type=sa.Float, postgresql_using="quantity::numeric(18,8)")
    op.alter_column("order_books", "total", type_=MONEY, existing_type=sa.Float, postgresql_using="total::numeric(18,8)")

    # ── MarketPrice ──
    op.alter_column("market_prices", "price", type_=MONEY, existing_type=sa.Float, postgresql_using="price::numeric(18,8)")
    op.alter_column("market_prices", "price_change_24h", type_=MONEY, existing_type=sa.Float, postgresql_using="price_change_24h::numeric(18,8)")
    op.alter_column("market_prices", "price_change_pct_24h", type_=MONEY, existing_type=sa.Float, postgresql_using="price_change_pct_24h::numeric(18,8)")
    op.alter_column("market_prices", "high_24h", type_=MONEY, existing_type=sa.Float, postgresql_using="high_24h::numeric(18,8)")
    op.alter_column("market_prices", "low_24h", type_=MONEY, existing_type=sa.Float, postgresql_using="low_24h::numeric(18,8)")
    op.alter_column("market_prices", "volume_24h", type_=MONEY, existing_type=sa.Float, postgresql_using="volume_24h::numeric(18,8)")
    op.alter_column("market_prices", "market_cap", type_=MONEY, existing_type=sa.Float, postgresql_using="market_cap::numeric(18,8)")
    op.alter_column("market_prices", "bid_price", type_=MONEY, existing_type=sa.Float, postgresql_using="bid_price::numeric(18,8)")
    op.alter_column("market_prices", "ask_price", type_=MONEY, existing_type=sa.Float, postgresql_using="ask_price::numeric(18,8)")

    # ── Candle ──
    op.alter_column("candles", "open", type_=MONEY, existing_type=sa.Float, postgresql_using="\"open\"::numeric(18,8)")
    op.alter_column("candles", "high", type_=MONEY, existing_type=sa.Float, postgresql_using="high::numeric(18,8)")
    op.alter_column("candles", "low", type_=MONEY, existing_type=sa.Float, postgresql_using="low::numeric(18,8)")
    op.alter_column("candles", "close", type_=MONEY, existing_type=sa.Float, postgresql_using="\"close\"::numeric(18,8)")
    op.alter_column("candles", "volume", type_=MONEY, existing_type=sa.Float, postgresql_using="volume::numeric(18,8)")

    # ── Transaction ──
    op.alter_column("transactions", "amount", type_=MONEY, existing_type=sa.Float, postgresql_using="amount::numeric(18,8)")
    op.alter_column("transactions", "fee", type_=MONEY, existing_type=sa.Float, postgresql_using="fee::numeric(18,8)")
    op.alter_column("transactions", "price", type_=MONEY, existing_type=sa.Float, postgresql_using="price::numeric(18,8)")
    op.alter_column("transactions", "total", type_=MONEY, existing_type=sa.Float, postgresql_using="total::numeric(18,8)")

    # ── Signal ──
    op.alter_column("signals", "entry_price", type_=MONEY, existing_type=sa.Float, postgresql_using="entry_price::numeric(18,8)")
    op.alter_column("signals", "current_price", type_=MONEY, existing_type=sa.Float, postgresql_using="current_price::numeric(18,8)")
    op.alter_column("signals", "target_price_1", type_=MONEY, existing_type=sa.Float, postgresql_using="target_price_1::numeric(18,8)")
    op.alter_column("signals", "target_price_2", type_=MONEY, existing_type=sa.Float, postgresql_using="target_price_2::numeric(18,8)")
    op.alter_column("signals", "target_price_3", type_=MONEY, existing_type=sa.Float, postgresql_using="target_price_3::numeric(18,8)")
    op.alter_column("signals", "stop_loss", type_=MONEY, existing_type=sa.Float, postgresql_using="stop_loss::numeric(18,8)")
    op.alter_column("signals", "win_rate", type_=PCT, existing_type=sa.Float, postgresql_using="win_rate::numeric(5,2)")
    op.alter_column("signals", "total_pnl", type_=MONEY, existing_type=sa.Float, postgresql_using="total_pnl::numeric(18,8)")

    # ── SignalPerformance ──
    op.alter_column("signal_performance", "entry_price", type_=MONEY, existing_type=sa.Float, postgresql_using="entry_price::numeric(18,8)")
    op.alter_column("signal_performance", "exit_price", type_=MONEY, existing_type=sa.Float, postgresql_using="exit_price::numeric(18,8)")
    op.alter_column("signal_performance", "quantity", type_=MONEY, existing_type=sa.Float, postgresql_using="quantity::numeric(18,8)")
    op.alter_column("signal_performance", "pnl", type_=MONEY, existing_type=sa.Float, postgresql_using="pnl::numeric(18,8)")
    op.alter_column("signal_performance", "pnl_percent", type_=sa.Numeric(8, 4), existing_type=sa.Float, postgresql_using="pnl_percent::numeric(8,4)")
    op.alter_column("signal_performance", "roi", type_=sa.Numeric(8, 4), existing_type=sa.Float, postgresql_using="roi::numeric(8,4)")

    # ── SignalSubscription ──
    op.alter_column("signal_subscriptions", "max_allocation", type_=MONEY, existing_type=sa.Float, postgresql_using="max_allocation::numeric(18,8)")

    # ── CopyTradingSubscription ──
    op.alter_column("copy_trading_subscriptions", "allocation_pct", type_=PCT, existing_type=sa.Float, postgresql_using="allocation_pct::numeric(5,2)")
    op.alter_column("copy_trading_subscriptions", "max_allocation", type_=MONEY, existing_type=sa.Float, postgresql_using="max_allocation::numeric(18,8)")

    # ── PriceAlert ──
    op.alter_column("price_alerts", "value", type_=MONEY, existing_type=sa.Float, postgresql_using="\"value\"::numeric(18,8)")
    op.alter_column("price_alerts", "current_value", type_=MONEY, existing_type=sa.Float, postgresql_using="current_value::numeric(18,8)")


def downgrade() -> None:
    # Reverse all conversions back to Float
    MONEY_FLOAT = sa.Float

    op.alter_column("price_alerts", "value", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("price_alerts", "current_value", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("copy_trading_subscriptions", "allocation_pct", type_=MONEY_FLOAT, existing_type=sa.Numeric(5, 2))
    op.alter_column("copy_trading_subscriptions", "max_allocation", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("signal_subscriptions", "max_allocation", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("signal_performance", "entry_price", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("signal_performance", "exit_price", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("signal_performance", "quantity", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("signal_performance", "pnl", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("signal_performance", "pnl_percent", type_=MONEY_FLOAT, existing_type=sa.Numeric(8, 4))
    op.alter_column("signal_performance", "roi", type_=MONEY_FLOAT, existing_type=sa.Numeric(8, 4))
    op.alter_column("signals", "entry_price", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("signals", "current_price", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("signals", "target_price_1", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("signals", "target_price_2", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("signals", "target_price_3", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("signals", "stop_loss", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("signals", "win_rate", type_=MONEY_FLOAT, existing_type=sa.Numeric(5, 2))
    op.alter_column("signals", "total_pnl", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("transactions", "amount", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("transactions", "fee", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("transactions", "price", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("transactions", "total", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("candles", "open", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("candles", "high", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("candles", "low", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("candles", "close", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("candles", "volume", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("market_prices", "price", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("market_prices", "price_change_24h", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("market_prices", "price_change_pct_24h", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("market_prices", "high_24h", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("market_prices", "low_24h", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("market_prices", "volume_24h", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("market_prices", "market_cap", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("market_prices", "bid_price", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("market_prices", "ask_price", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("order_books", "price", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("order_books", "quantity", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("order_books", "total", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("trades", "price", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("trades", "quantity", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("trades", "total", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("trades", "fee", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("orders", "price", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("orders", "stop_price", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("orders", "quantity", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("orders", "filled_quantity", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("orders", "remaining_quantity", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("orders", "total", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("orders", "filled_total", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("orders", "avg_fill_price", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("orders", "fee", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("orders", "slippage", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("wallets", "balance", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("wallets", "locked_balance", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("wallets", "total_deposited", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("wallets", "total_withdrawn", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("assets", "min_withdrawal", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("assets", "max_withdrawal", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("assets", "withdrawal_fee", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("assets", "deposit_fee", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
    op.alter_column("assets", "trading_fee", type_=MONEY_FLOAT, existing_type=sa.Numeric(18, 8))
