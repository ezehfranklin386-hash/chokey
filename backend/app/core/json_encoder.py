"""Custom JSON encoder supporting Decimal serialization."""

from __future__ import annotations

import json
from decimal import Decimal
from datetime import datetime


class DecimalEncoder(json.JSONEncoder):
    """JSON encoder that converts Decimal to string and datetime to ISO format."""

    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


def json_dumps(obj, **kwargs) -> str:
    """Wrapper around json.dumps that uses DecimalEncoder."""
    return json.dumps(obj, cls=DecimalEncoder, **kwargs)
