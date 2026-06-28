"""
dependencies.py — FastAPI dependency providers for endpoints.
"""

from app.core.auth import get_current_user, verify_report_ownership
from app.db.session import get_db

__all__ = ["get_current_user", "verify_report_ownership", "get_db"]
