"""add teachers table

Revision ID: add_teachers_001
Revises: 74a5dd673a7a
Create Date: 2026-01-30

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "add_teachers_001"
down_revision: Union[str, None] = "74a5dd673a7a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    import sqlalchemy
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        op.execute(
            """
            CREATE TABLE IF NOT EXISTS teachers (
                id CHAR(32) NOT NULL,
                username VARCHAR NOT NULL,
                password_hash VARCHAR NOT NULL,
                full_name VARCHAR NOT NULL,
                created_at DATETIME NOT NULL,
                PRIMARY KEY (id),
                UNIQUE (username)
            )
            """
        )
        return
    op.create_table(
        "teachers",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )


def downgrade() -> None:
    op.drop_table("teachers")
