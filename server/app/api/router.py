"""
router.py — Main API router aggregating all route modules.
"""

from fastapi import APIRouter
from app.api.routes import research, history, system

api_router = APIRouter()

api_router.include_router(research.router, prefix="/research", tags=["Agent"])
api_router.include_router(history.router, prefix="/history", tags=["History"])
api_router.include_router(system.router, tags=["Ops"])
