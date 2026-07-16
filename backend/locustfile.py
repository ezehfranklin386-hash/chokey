"""
Locust load-test script for the Chokey trading/matching engine.

Run:
    locust -f locustfile.py --host=http://localhost:8000

Or headless:
    locust -f locustfile.py --host=http://localhost:8000 \
        --users 50 --spawn-rate 5 --run-time 5m --headless
"""

from __future__ import annotations

import random
from datetime import datetime

from locust import FastHttpUser, between, task

# ── Test user pool ─────────────────────────────────────────────
TEST_USERS = [
    {"email": "loadtest1@chokey.app", "password": "LoadTest123!"},
    {"email": "loadtest2@chokey.app", "password": "LoadTest123!"},
    {"email": "loadtest3@chokey.app", "password": "LoadTest123!"},
]

MARKET_SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT"]

ORDER_SIDES = ["buy", "sell"]
ORDER_TYPES = ["market", "limit"]


class AuthenticatedUser(FastHttpUser):
    """Authenticated user performing market operations."""

    wait_time = between(0.5, 3.0)
    token: str | None = None
    current_user: dict | None = None

    def on_start(self):
        """Log in as a random test user and store the JWT."""
        creds = random.choice(TEST_USERS)
        with self.client.post(
            "/api/v1/auth/login",
            json=creds,
            catch_response=True,
            name="login",
        ) as resp:
            if resp.status_code == 200:
                data = resp.jsond()
                self.token = data.get("access_token") or (
                    data.get("data") or {}
                ).get("access_token")
                self.current_user = creds
            else:
                resp.failure(f"Login failed: {resp.status_code}")

    @task(3)
    def get_prices(self):
        """Fetch current prices — most frequent operation."""
        symbol = random.choice(MARKET_SYMBOLS)
        with self.client.get(
            "/api/v1/market/prices",
            params={"symbol": symbol.split("/")[0]},
            name="market_prices",
            catch_response=True,
        ) as resp:
            if resp.status_code != 200:
                resp.failure(f"Prices failed: {resp.status_code}")

    @task(2)
    def get_candles(self):
        """Fetch OHLCV candles."""
        symbol = random.choice(MARKET_SYMBOLS)
        with self.client.get(
            "/api/v1/market/candles",
            params={
                "symbol": symbol.replace("/", ""),
                "interval": random.choice(["1m", "5m", "15m", "1h"]),
                "limit": 100,
            },
            name="market_candles",
            catch_response=True,
        ) as resp:
            if resp.status_code != 200:
                resp.failure(f"Candles failed: {resp.status_code}")

    @task(1)
    def get_orderbook(self):
        """Fetch order book snapshot."""
        symbol = random.choice(MARKET_SYMBOLS)
        with self.client.get(
            "/api/v1/market/orderbook",
            params={"symbol": symbol.replace("/", "")},
            name="market_orderbook",
            catch_response=True,
        ) as resp:
            if resp.status_code != 200:
                resp.failure(f"Orderbook failed: {resp.status_code}")

    @task(2)
    def place_order(self):
        """Place a limit or market order."""
        if not self.token:
            return

        symbol = random.choice(MARKET_SYMBOLS)
        side = random.choice(ORDER_SIDES)
        order_type = random.choice(ORDER_TYPES)

        payload = {
            "symbol": symbol.replace("/", ""),
            "side": side,
            "type": order_type,
            "quantity": round(random.uniform(0.001, 0.1), 6),
        }

        if order_type == "limit":
            base_price = 50000 if "BTC" in symbol else 3000
            jitter = random.uniform(-0.02, 0.02)
            payload["price"] = round(base_price * (1 + jitter), 2)
            payload["time_in_force"] = "GTC"

        with self.client.post(
            "/api/v1/orders",
            json=payload,
            headers={"Authorization": f"Bearer {self.token}"},
            name="place_order",
            catch_response=True,
        ) as resp:
            if resp.status_code not in (200, 201):
                resp.failure(f"Order placement failed: {resp.status_code}")

    @task(1)
    def list_orders(self):
        """List open orders."""
        if not self.token:
            return

        with self.client.get(
            "/api/v1/orders",
            headers={"Authorization": f"Bearer {self.token}"},
            name="list_orders",
            catch_response=True,
        ) as resp:
            if resp.status_code != 200:
                resp.failure(f"List orders failed: {resp.status_code}")

    @task(1)
    def get_wallet_balance(self):
        """Check wallet balances."""
        if not self.token:
            return

        with self.client.get(
            "/api/v1/wallets",
            headers={"Authorization": f"Bearer {self.token}]"},
            name="wallet_balance",
            catch_response=True,
        ) as resp:
            if resp.status_code != 200:
                resp.failure(f"Wallet failed: {resp.status_code}")

    @task(1)
    def get_trade_history(self):
        """Fetch recent trades."""
        if not self.token:
            return

        with self.client.get(
            "/api/v1/orders/trades",
            headers={"Authorization": f"Bearer {self.token}"},
            name="trade_history",
            catch_response=True,
        ) as resp:
            if resp.status_code != 200:
                resp.failure(f"Trades failed: {resp.status_code}")


class HealthCheckUser(FastHttpUser):
    """Lightweight user that only hits health endpoints."""

    wait_time = between(1, 5)

    @task
    def health(self):
        with self.client.get("/health", name="health", catch_response=True) as resp:
            if resp.status_code != 200:
                resp.failure(f"Health failed: {resp.status_code}")

    @task
    def ready(self):
        with self.client.get("/ready", name="ready", catch_response=True) as resp:
            if resp.status_code != 200:
                resp.failure(f"Ready failed: {resp.status_code}")
