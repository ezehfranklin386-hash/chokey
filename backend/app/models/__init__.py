"""SQLAlchemy ORM models — import all so Alembic can detect them."""

from app.models.user import User, Session, ApiKey, UserSettings
from app.models.wallet import Asset, Wallet, WalletAddress
from app.models.transaction import Transaction
from app.models.order import Order, Trade, OrderBook
from app.models.market import MarketPrice, Candle
from app.models.signal import Signal, SignalPerformance, SignalSubscription, CopyTradingSubscription
from app.models.kyc import KycDocument, WhitelistedAddress
from app.models.notification import Notification, PriceAlert
from app.models.audit import AuditLog, SystemConfig

__all__ = [
    "User", "Session", "ApiKey", "UserSettings",
    "Asset", "Wallet", "WalletAddress",
    "Transaction",
    "Order", "Trade", "OrderBook",
    "MarketPrice", "Candle",
    "Signal", "SignalPerformance", "SignalSubscription", "CopyTradingSubscription",
    "KycDocument", "WhitelistedAddress",
    "Notification", "PriceAlert",
    "AuditLog", "SystemConfig",
]
