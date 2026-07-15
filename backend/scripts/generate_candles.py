"""Generate historical candle data for charts.

Usage:
    python -m scripts.generate_candles [--symbols BTC,ETH,SOL] [--days 365] [--interval 1h]
"""

from __future__ import annotations

import argparse
import asyncio
import random
import uuid
import sys
from datetime import UTC, datetime, timedelta

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pathlib import Path

from app.database import async_session_factory
from app.models.market import Candle
from app.models.wallet import Asset


SYMBOLS = ["BTC", "ETH", "SOL", "ADA", "DOT", "AVAX", "MATIC"]
BASE_PRICES = {"BTC": 67000, "ETH": 3450, "SOL": 145, "ADA": 0.62, "DOT": 7.80, "AVAX": 38.0, "MATIC": 0.72}
VOLATILITIES = {"BTC": 0.015, "ETH": 0.020, "SOL": 0.035, "ADA": 0.025, "DOT": 0.030, "AVAX": 0.040, "MATIC": 0.028}


def simulate_price(price: float, volatility: float) -> float:
    """Random walk with mean reversion drift."""
    change = random.gauss(0, volatility)
    price *= 1 + change
    return round(price, 2)


async def generate_candles(
    symbols: list[str],
    days: int,
    interval: str,
    batch_size: int = 500,
) -> None:
    """Generate candle data for the given symbols."""
    interval_minutes = {"1m": 1, "5m": 5, "15m": 15, "30m": 30, "1h": 60, "4h": 240, "1d": 1440}
    minutes = interval_minutes.get(interval, 60)
    intervals_per_day = 1440 // minutes
    total_candles = days * intervals_per_day

    async with async_session_factory() as session:
        from sqlalchemy import select

        for symbol in symbols:
            result = await session.execute(select(Asset).where(Asset.symbol == symbol.upper()))
            asset = result.scalar_one_or_none()
            if not asset:
                print(f"Asset {symbol} not found in DB. Skipping.")
                continue

            price = BASE_PRICES.get(symbol.upper(), 100.0)
            volatility = VOLATILITIES.get(symbol.upper(), 0.02)
            now = datetime.now(UTC).replace(second=0, microsecond=0)
            candles = []

            for i in range(total_candles):
                ts = now - timedelta(minutes=minutes * (total_candles - i))
                open_price = price
                close_price = simulate_price(price, volatility)
                high = round(max(open_price, close_price) * (1 + random.uniform(0, volatility)), 2)
                low = round(min(open_price, close_price) * (1 - random.uniform(0, volatility)), 2)
                volume = round(random.uniform(100_000, 5_000_000), 2)
                price = close_price  # next candle starts here

                candle = Candle(
                    id=str(uuid.uuid4()),
                    asset_id=asset.id,
                    symbol=asset.symbol,
                    interval=interval,
                    open=open_price,
                    high=high,
                    low=low,
                    close=close_price,
                    volume=volume,
                    timestamp=ts,
                )
                candles.append(candle)

                if len(candles) >= batch_size:
                    session.add_all(candles)
                    await session.flush()
                    candles = []
                    print(f"  {symbol}: inserted {batch_size} candles...")

            if candles:
                session.add_all(candles)
                await session.flush()

            print(f"✅ {symbol}: {total_candles} candles generated.")

        await session.commit()
    print("\n🎉 All candles generated!")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate historical candle data")
    parser.add_argument("--symbols", default=",".join(SYMBOLS), help="Comma-separated symbols")
    parser.add_argument("--days", type=int, default=365, help="Days of history")
    parser.add_argument("--interval", default="1h", choices=["1m", "5m", "15m", "30m", "1h", "4h", "1d"])
    args = parser.parse_args()

    symbols = [s.strip() for s in args.symbols.split(",")]
    asyncio.run(generate_candles(symbols, args.days, args.interval))


if __name__ == "__main__":
    main()
