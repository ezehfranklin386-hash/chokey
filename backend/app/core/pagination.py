"""Cursor-based and offset-based pagination utilities.

Cursor pagination uses ``(created_at, id)`` as the cursor tuple, encoded
as a URL-safe base64 string. This is stable even when rows are inserted
between requests — unlike offset pagination which can skip or duplicate rows.

Usage:
    from app.core.pagination import CursorPage, paginate_cursor

    # In service layer:
    items, next_cursor, has_more = await paginate_cursor(
        session, select(Model).where(...),
        cursor=cursor, limit=20,
    )
    return CursorPage(items=items, next_cursor=next_cursor, has_more=has_more)
"""

from __future__ import annotations

import base64
import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Generic, TypeVar

from sqlalchemy import Select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")


@dataclass
class CursorPage(Generic[T]):
    """Standard cursor-paginated response."""

    items: list[T]
    next_cursor: str | None = None
    has_more: bool = False
    total: int | None = None  # Optional: only populated on first page if requested


def encode_cursor(created_at: datetime, last_id: str) -> str:
    """Encode a (timestamp, id) pair into a URL-safe cursor string.

    The timestamp is stored as ISO 8601 with microsecond precision to
    handle dense insert patterns.
    """
    raw = json.dumps([created_at.isoformat(), last_id], separators=(",", ":"))
    return base64.urlsafe_b64encode(raw.encode()).decode()


def decode_cursor(cursor: str | None) -> tuple[datetime, str] | None:
    """Decode a cursor string back to (created_at, id). Returns None if invalid."""
    if not cursor:
        return None
    try:
        raw = base64.urlsafe_b64decode(cursor.encode()).decode()
        ts_str, last_id = json.loads(raw)
        return datetime.fromisoformat(ts_str), last_id
    except (ValueError, TypeError, json.JSONDecodeError, IndexError):
        return None


async def paginate_cursor(
    session: AsyncSession,
    query: Select,
    cursor: str | None = None,
    limit: int = 20,
    sort_desc: bool = True,
    cursor_column: Any | None = None,
    id_column: Any | None = None,
) -> tuple[list[Any], str | None, bool]:
    """Apply cursor-based pagination to a query.

    Args:
        session: SQLAlchemy async session.
        query: A SELECT statement (without ORDER BY, LIMIT, OFFSET).
        cursor: Encoded cursor string from the previous page.
        limit: Maximum items per page (default 20, max 100).
        sort_desc: True for newest-first (default), False for oldest-first.
        cursor_column: The datetime column to cursor on (default: Model.created_at).
        id_column: The unique ID column to disambiguate ties (default: Model.id).

    Returns:
        Tuple of (items, next_cursor, has_more).
    """
    from sqlalchemy import Column
    from sqlalchemy.orm import InstrumentedAttribute

    # Infer columns from the query's entity
    if cursor_column is None or id_column is None:
        entity = _get_entity(query)
        if entity is not None:
            if cursor_column is None:
                cursor_column = getattr(entity, "created_at", None)
            if id_column is None:
                id_column = getattr(entity, "id", None)

    if cursor_column is None or id_column is None:
        raise ValueError("Could not infer cursor/id columns. Pass them explicitly.")

    limit = min(limit, 100)

    # Decode cursor and apply WHERE fence
    decoded = decode_cursor(cursor) if cursor else None
    if decoded:
        cursor_ts, cursor_id = decoded
        if sort_desc:
            query = query.where(
                (cursor_column < cursor_ts) | ((cursor_column == cursor_ts) & (id_column < cursor_id))
            )
        else:
            query = query.where(
                (cursor_column > cursor_ts) | ((cursor_column == cursor_ts) & (id_column > cursor_id))
            )

    # Apply ordering
    order = cursor_column.desc() if sort_desc else cursor_column.asc()
    id_order = id_column.desc() if sort_desc else id_column.asc()
    query = query.order_by(order, id_order).limit(limit + 1)

    result = await session.execute(query)
    rows = list(result.scalars().all())

    # Check if there's another page
    has_more = len(rows) > limit
    if has_more:
        rows = rows[:limit]

    # Compute next cursor from the last item
    next_cursor = None
    if rows and has_more:
        last_item = rows[-1]
        last_ts = getattr(last_item, cursor_column.key if hasattr(cursor_column, "key") else "created_at")
        last_id = getattr(last_item, id_column.key if hasattr(id_column, "key") else "id")
        if last_ts is not None and last_id is not None:
            next_cursor = encode_cursor(last_ts, last_id)

    return rows, next_cursor, has_more


def _get_entity(query: Select) -> Any | None:
    """Extract the primary ORM entity from a Select statement."""
    try:
        for col in query.selected_columns:
            if hasattr(col, "entity") and col.entity is not None:
                return col.entity
    except Exception:
        pass
    try:
        from sqlalchemy.orm import QueryContext
        # Fallback: check from clause
        for from_clause in query.froms:
            if hasattr(from_clause, "entity"):
                return from_clause.entity
    except Exception:
        pass
    return None


# ── Legacy offset pagination (kept for admin/reports) ──────────


@dataclass
class OffsetPage(Generic[T]):
    """Offset-based pagination response (legacy)."""

    items: list[T]
    total: int
    page: int
    limit: int
    pages: int = field(init=False)

    def __post_init__(self) -> None:
        self.pages = max(1, (self.total + self.limit - 1) // self.limit)
