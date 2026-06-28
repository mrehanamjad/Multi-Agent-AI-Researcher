"""
schemas.py — Pydantic models for the Agentic Research Assistant.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# ── Request models ────────────────────────────────────────────────────────────

class ResearchRequest(BaseModel):
    """
    The body of POST /research.
    The user sends a topic.
    """
    topic: str

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"topic": "Impact of large language models on education"},
                {"topic": "Latest advances in quantum computing 2025"},
            ]
        }
    }


class ClarificationSubmit(BaseModel):
    """
    The body of POST /research/{id}/clarifications.
    Contains user answers to clarification questions.
    """
    answers: Dict[str, str]


# ── Response models ───────────────────────────────────────────────────────────

class Source(BaseModel):
    """A structured web source found during research."""
    title: str
    url: str
    domain: str
    snippet: str


class ResearchReport(BaseModel):
    """
    Returned by GET /history/{id}.
    Contains the full report text and all metadata.
    """
    id: str                  # Short 8-character ID
    topic: str
    title: Optional[str] = None
    report: Optional[str] = None
    sources: Optional[List[Source]] = None
    critic_score: Optional[float] = None
    critic_feedback: Optional[Dict[str, Any]] = None
    clarification_questions: Optional[List[str]] = None
    clarification_answers: Optional[Dict[str, str]] = None
    status: str
    meta: Optional[Dict[str, Any]] = None
    created_at: str


class StatusResponse(BaseModel):
    """
    Returned by GET /research/{id}/status.
    Lightweight status check for the frontend.
    """
    id: str
    status: str
    clarification_questions: Optional[List[str]] = None


# ── History models ────────────────────────────────────────────────────────────

class HistoryItem(BaseModel):
    """
    A summary row shown in the history list.
    """
    id: str            # Short 8-character ID
    topic: str
    title: Optional[str] = None
    status: str
    meta: Optional[Dict[str, Any]] = None
    created_at: str    # ISO timestamp


class HistoryListResponse(BaseModel):
    """Returned by GET /history."""
    reports: List[HistoryItem]
    total: int


class DeleteResponse(BaseModel):
    """Returned by DELETE /history/{id}."""
    status: str    # "deleted"
    id: str
