"""
system.py — System and health endpoints.
"""

from fastapi import APIRouter
# Need to import app_state from the main app or a shared module.
# To avoid circular imports, we can import it from app.api.routes.research
from app.api.routes.research import app_state

router = APIRouter()

@router.get("/health", tags=["Ops"])
def health():
    """Verify that the API server is alive and agent is ready."""
    return {
        "status": "ok",
        "agent_ready": "agent" in app_state,
    }
