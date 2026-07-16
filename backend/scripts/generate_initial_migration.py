#!/usr/bin/env python
"""Generate an initial Alembic migration from SQLAlchemy models.

Usage:
    cd backend
    python scripts/generate_initial_migration.py

This creates alembic/versions/000_initial_tables.py with CREATE TABLE
statements for every model in app.models. It uses SQLAlchemy's DDL
compiler so the output is syntactically correct for your target DB.

After generation, run:
    alembic upgrade head
"""

from __future__ import annotations

import importlib
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import create_meta
from sqlalchemy.schema import CreateTable

from app.database import Base

# Import all models so they register on Base.metadata
import app.models  # noqa: F401

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "alembic" / "versions"


def generate_migration() -> str:
    """Generate an Alembic migration that creates all tables."""
    lines = []
    now = datetime.now(timezone.utc)

    lines.append(f'"""Create all initial tables from SQLAlchemy models')
    lines.append(f'')
    lines.append(f'Revision ID: 000')
    lines.append(f'Revises: None')
    lines.append(f'Create Date: {now.strftime("%Y-%m-%d %H:%M:%S")}')
    lines.append(f'"""')
    lines.append(f'')
    lines.append(f'from __future__ import annotations')
    lines.append(f'')
    lines.append(f'from typing import Sequence, Union')
    lines.append(f'')
    lines.append(f'from alembic import op')
    lines.append(f'import sqlalchemy as sa')
    lines.append(f'from sqlalchemy.dialects import postgresql')
    lines.append(f'')
    lines.append(f'revision: str = "000"')
    lines.append(f'down_revision: Union[str, None] = None')
    lines.append(f'branch_labels: Union[str, Sequence[str], None] = None')
    lines.append(f'depends_on: Union[str, Sequence[str], None] = None')
    lines.append(f'')

    # Upgrade
    lines.append(f'')
    lines.append(f'def upgrade() -> None:')

    for table_name in sorted(Base.metadata.tables.keys()):
        table = Base.metadata.tables[table_name]
        compiled = str(CreateTable(table).compile(dialect=postgresql.dialect()))

        # Split into individual column lines for a cleaner migration
        col_lines = compiled.strip().split("\n")
        first = True
        for cl in col_lines:
            if first:
                lines.append(f'    op.execute("""{cl}""")')
                first = False
            else:
                lines.append(f'    op.execute("""{cl}""")')

        # Create indexes
        for index in table.indexes:
            idx_cols = ", ".join(c.name for c in index.columns)
            unique = "unique=True" if index.unique else ""
            if unique:
                lines.append(f'    op.create_index("{index.name}", "{table_name}", ["{idx_cols}"], unique=True)')
            else:
                lines.append(f'    op.create_index("{index.name}", "{table_name}", ["{idx_cols}"])')

    # Downgrade
    lines.append(f'')
    lines.append(f'')
    lines.append(f'def downgrade() -> None:')
    for table_name in sorted(Base.metadata.tables.keys(), reverse=True):
        lines.append(f'    op.drop_table("{table_name}")')

    lines.append(f'')
    return "\n".join(lines)


if __name__ == "__main__":
    MIGRATIONS_DIR.mkdir(parents=True, exist_ok=True)
    content = generate_migration()
    output_path = MIGRATIONS_DIR / "000_initial_tables.py"
    output_path.write_text(content)
    print(f"Generated: {output_path}")
    print(f"Tables: {', '.join(sorted(Base.metadata.tables.keys()))}")
