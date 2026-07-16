"""Unit tests for cursor and offset pagination utilities."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import select

from app.core.pagination import (
    CursorPage,
    OffsetPage,
    _get_entity,
    decode_cursor,
    encode_cursor,
    paginate_cursor,
)


class TestEncodeDecodeCursor:
    """Cursor encoding/decoding round-trip and edge cases."""

    def test_round_trip(self):
        """Encode then decode returns the original values."""
        now = datetime.now(UTC)
        cursor_str = encode_cursor(now, "abc-123")
        decoded = decode_cursor(cursor_str)
        assert decoded is not None
        decoded_ts, decoded_id = decoded
        assert decoded_id == "abc-123"
        # Timestamps should be within 1 second (microsecond precision)
        assert abs((decoded_ts - now).total_seconds()) < 1

    def test_decode_none(self):
        """decode_cursor(None) returns None."""
        assert decode_cursor(None) is None

    def test_decode_empty_string(self):
        """decode_cursor('') returns None."""
        assert decode_cursor("") is None

    def test_decode_invalid_base64(self):
        """decode_cursor with garbage returns None."""
        assert decode_cursor("!!!not-base64!!!") is None

    def test_decode_invalid_json(self):
        """decode_cursor with valid base64 but not JSON returns None."""
        import base64
        raw = base64.urlsafe_b64encode(b"not-json").decode()
        assert decode_cursor(raw) is None

    def test_decode_malformed_json(self):
        """decode_cursor with JSON that isn't a 2-element list returns None."""
        import base64
        import json
        raw = base64.urlsafe_b64encode(json.dumps("just a string").encode()).decode()
        assert decode_cursor(raw) is None

    def test_microsecond_precision(self):
        """Cursor preserves microsecond precision."""
        now = datetime(2026, 7, 16, 12, 30, 0, 123456, tzinfo=UTC)
        cursor_str = encode_cursor(now, "id-1")
        decoded = decode_cursor(cursor_str)
        assert decoded is not None
        assert decoded[0].microsecond == 123456

    def test_id_round_trip_special_chars(self):
        """IDs with hyphens and underscores survive round-trip."""
        cursor_str = encode_cursor(datetime.now(UTC), "user-uuid_v2-abc")
        decoded = decode_cursor(cursor_str)
        assert decoded is not None
        assert decoded[1] == "user-uuid_v2-abc"


class TestCursorPage:
    """CursorPage dataclass."""

    def test_defaults(self):
        page = CursorPage(items=[])
        assert page.items == []
        assert page.next_cursor is None
        assert page.has_more is False
        assert page.total is None

    def test_with_data(self):
        page = CursorPage(
            items=[1, 2, 3],
            next_cursor="next-page-cursor",
            has_more=True,
            total=50,
        )
        assert page.items == [1, 2, 3]
        assert page.next_cursor == "next-page-cursor"
        assert page.has_more is True
        assert page.total == 50

    def test_total_optional(self):
        page = CursorPage(items=["a"], has_more=False)
        assert page.total is None


class TestOffsetPage:
    """OffsetPage dataclass with pages calculation."""

    def test_exact_pages(self):
        page = OffsetPage(items=[], total=20, page=1, limit=10)
        assert page.pages == 2

    def test_partial_last_page(self):
        page = OffsetPage(items=[], total=25, page=1, limit=10)
        assert page.pages == 3

    def test_single_page(self):
        page = OffsetPage(items=[], total=5, page=1, limit=10)
        assert page.pages == 1

    def test_zero_total(self):
        page = OffsetPage(items=[], total=0, page=1, limit=10)
        assert page.pages == 1  # minimum 1

    def test_exact_fit(self):
        page = OffsetPage(items=[], total=30, page=1, limit=10)
        assert page.pages == 3


class TestGetEntity:
    """Entity extraction from Select statements."""

    def test_entity_from_model(self):
        """_get_entity extracts the model from a select(Model) query."""
        from app.models.user import User
        query = select(User)
        entity = _get_entity(query)
        assert entity is not None
        assert entity is User


class TestPaginateCursorIntegration:
    """Integration tests for paginate_cursor using the test DB.

    These use the existing test_session_factory and models already
    built in the test database.
    """

    @pytest.mark.asyncio
    async def test_empty_table(self, setup_database):
        """paginate_cursor on an empty table returns ([], None, False)."""
        from app.database import Base
        from app.models.user import User

        from app.core.pagination import paginate_cursor
        from tests.conftest import test_session_factory

        async with test_session_factory() as session:
            query = select(User)
            items, next_cursor, has_more = await paginate_cursor(
                session, query, cursor=None, limit=20,
            )
            assert items == []
            assert next_cursor is None
            assert has_more is False

    @pytest.mark.asyncio
    async def test_paginate_respects_limit(self, setup_database):
        """paginate_cursor returns at most 'limit' items."""
        import uuid
        from datetime import UTC, datetime

        from app.models.user import User
        from tests.conftest import test_session_factory

        # Insert a few users directly
        async with test_session_factory() as session:
            for i in range(5):
                uid = str(uuid.uuid4())
                user = User(
                    id=uid,
                    email=f"user{i}@test.app",
                    display_name=f"User {i}",
                    hashed_password="hash",
                    created_at=datetime.now(UTC),
                )
                session.add(user)
            await session.commit()

        async with test_session_factory() as session:
            query = select(User)
            items, next_cursor, has_more = await paginate_cursor(
                session, query, cursor=None, limit=3,
            )
            assert len(items) == 3
            assert has_more is True
            assert next_cursor is not None

    @pytest.mark.asyncio
    async def test_paginate_last_page(self, setup_database):
        """On the last page, has_more is False and next_cursor is None."""
        import uuid
        from datetime import UTC, datetime

        from app.models.user import User
        from tests.conftest import test_session_factory

        async with test_session_factory() as session:
            for i in range(2):
                uid = str(uuid.uuid4())
                user = User(
                    id=uid,
                    email=f"last{i}@test.app",
                    display_name=f"Last {i}",
                    hashed_password="hash",
                    created_at=datetime.now(UTC),
                )
                session.add(user)
            await session.commit()

        async with test_session_factory() as session:
            query = select(User)
            items, next_cursor, has_more = await paginate_cursor(
                session, query, cursor=None, limit=10,
            )
            assert len(items) == 2
            assert has_more is False
            assert next_cursor is None
