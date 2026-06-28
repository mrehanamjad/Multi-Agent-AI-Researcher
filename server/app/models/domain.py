"""
models.py — SQLAlchemy database models for the Agentic Research Assistant.
"""

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy import String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import String, Integer, DateTime, ForeignKey, Float

class Base(DeclarativeBase):
    """Declarative Base class for SQLAlchemy 2.0 models."""
    pass

class User(Base):
    """
    SQLAlchemy model representing a Clerk-authenticated user.
    """
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    clerk_user_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # One-to-many relationship: User -> Reports
    reports: Mapped[List["Report"]] = relationship(
        "Report",
        back_populates="user",
        cascade="all, delete-orphan"
    )

class Report(Base):
    """
    SQLAlchemy model representing a research report.
    Persisted to PostgreSQL under a stateless Deep Research workflow.
    """
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(8), primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    topic: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    report: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sources: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSONB, nullable=True)
    critic_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    critic_feedback: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    clarification_questions: Mapped[Optional[List[str]]] = mapped_column(JSONB, nullable=True)
    clarification_answers: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(String, default="VALIDATING", nullable=False)
    meta: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Many-to-one relationship: Report -> User
    user: Mapped["User"] = relationship("User", back_populates="reports")

