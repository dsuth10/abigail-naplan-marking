import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Student(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    year_level: Mapped[int] = mapped_column(nullable=False)
    id_code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    class_group: Mapped[str] = mapped_column(String, nullable=False)
    avatar_id: Mapped[str] = mapped_column(String, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    submissions: Mapped[List["Submission"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    genre: Mapped[str] = mapped_column(String, nullable=False)  # NARRATIVE, PERSUASIVE
    instructions: Mapped[str] = mapped_column(Text, nullable=False)
    stimulus_html: Mapped[str] = mapped_column(Text, nullable=False)
    asset_paths: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    assigned_class_groups: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    submissions: Mapped[List["Submission"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("students.id"), nullable=False)
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id"), nullable=False)
    content_raw: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String, default="DRAFT")  # DRAFT, SUBMITTED
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    student: Mapped["Student"] = relationship(back_populates="submissions")
    project: Mapped["Project"] = relationship(back_populates="submissions")
