"""
database.py — Database connection configuration for PostgreSQL using SQLAlchemy.
"""

import logging
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

logger = logging.getLogger(__name__)

# Parse and format Neon / standard PostgreSQL connection string for asyncpg
raw_url = settings.database_url.strip("'\"")

if raw_url.startswith("postgres://"):
    database_url = raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif raw_url.startswith("postgresql://"):
    database_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    database_url = raw_url

# Split off query string to prevent asyncpg driver errors with parameters like sslmode
if "?" in database_url:
    database_url, _ = database_url.split("?", 1)

logger.info("Initializing async database engine...")

# Create the asynchronous engine with connection pooling settings
engine = create_async_engine(
    database_url,
    connect_args={"ssl": True},
    pool_size=10,             # Max number of permanent connections
    max_overflow=5,           # Additional temporary connections under peak loads
    pool_recycle=1800,        # Recycle connections after 30 minutes
    pool_pre_ping=True,       # Check health of connections on check-out
    echo=False                # Set to True for debugging SQL statements
)
