"""add assessment_results table

Revision ID: add_assessment_001
Revises: add_teachers_001
Create Date: 2026-01-30

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "add_assessment_001"
down_revision: Union[str, None] = "add_teachers_001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "assessment_results",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("submission_id", sa.Uuid(), nullable=False),
        sa.Column("genre", sa.String(), nullable=False),
        sa.Column("total_score", sa.Integer(), nullable=False),
        sa.Column("max_score", sa.Integer(), nullable=False),
        sa.Column("generated_at", sa.DateTime(), nullable=False),
        sa.Column("overall_strengths", sa.JSON(), nullable=False),
        sa.Column("overall_weaknesses", sa.JSON(), nullable=False),
        sa.Column("criteria_scores", sa.JSON(), nullable=False),
        sa.Column("full_report_md", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["submission_id"], ["submissions.id"], ondelete="CASCADE"),
    )


def downgrade() -> None:
    op.drop_table("assessment_results")
