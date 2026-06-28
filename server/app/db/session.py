"""
session.py — Session management and dependency injection helpers for SQLAlchemy.
"""

from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from app.db.database import engine

# Create the sessionmaker bound to our async engine
async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Keep objects readable after commit
    autocommit=False,
    autoflush=False,
)

async def get_db():
    """
    FastAPI dependency that yields a database session.
    Automatically closes the session after the request finishes.
    """
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

@asynccontextmanager
async def get_db_context():
    """
    Asynchronous context manager to safely acquire and release database sessions
    outside HTTP request context (e.g. background tasks, SSE stream generators).
    """
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
