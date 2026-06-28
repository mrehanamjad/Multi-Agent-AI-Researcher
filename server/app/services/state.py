import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Report

logger = logging.getLogger(__name__)

class ResearchStateService:
    """
    Service responsible for managing research session state,
    abstracting PostgreSQL persistence from LangGraph and API endpoints.
    """

    @staticmethod
    async def create_session(session: AsyncSession, user_id: int, topic: str) -> str:
        """
        Create a new research report session in the database with status VALIDATING.
        """
        report_id = str(uuid.uuid4())[:8]
        now = datetime.now(timezone.utc)

        # Initialize the baseline meta state dictionary
        initial_meta = {
            "topic": topic,
            "refined_topic": None,
            "research_plan": None,
            "sub_questions": None,
            "web_results": None,
            "report": None,
            "sources": None,
            "critic_score": None,
            "critic_feedback": None,
            "clarification_questions": None,
            "clarification_answers": None,
            "needs_clarification": False,
            "is_valid": None,
            "validation_reason": None,
            "thinking_steps": []
        }

        report = Report(
            id=report_id,
            user_id=user_id,
            topic=topic,
            title=None,
            report=None,
            sources=None,
            critic_score=None,
            critic_feedback=None,
            clarification_questions=None,
            clarification_answers=None,
            status="VALIDATING",
            meta=initial_meta,
            created_at=now,
            updated_at=now
        )

        try:
            session.add(report)
            await session.commit()
            logger.info(f"Research session created: id={report_id} topic={topic!r} user_id={user_id}")
            return report_id
        except Exception as e:
            await session.rollback()
            logger.error(f"Failed to create research session: {e}")
            raise

    @staticmethod
    async def load_state(session: AsyncSession, report_id: str, user_id: int) -> Dict[str, Any]:
        """
        Load the persisted research state from the database.
        Returns a dict conforming to ResearchState.
        """
        stmt = select(Report).where(Report.id == report_id, Report.user_id == user_id)
        result = await session.execute(stmt)
        report = result.scalar_one_or_none()

        if not report:
            raise ValueError(f"Research session not found or unauthorized: {report_id}")

        # If meta exists, use it. Otherwise, initialize a fallback dictionary.
        state = report.meta if report.meta else {}

        # Ensure all key fields are populated from dedicated columns as source of truth
        state["topic"] = report.topic
        state["refined_topic"] = report.title or state.get("refined_topic")
        state["report"] = report.report or state.get("report")
        state["sources"] = report.sources or state.get("sources")
        state["critic_score"] = report.critic_score or state.get("critic_score")
        state["critic_feedback"] = report.critic_feedback or state.get("critic_feedback")
        state["clarification_questions"] = report.clarification_questions or state.get("clarification_questions")
        state["clarification_answers"] = report.clarification_answers or state.get("clarification_answers")
        state["status"] = report.status

        # Default standard lists/dicts if not present
        if "thinking_steps" not in state or state["thinking_steps"] is None:
            state["thinking_steps"] = []

        return state

    @staticmethod
    async def save_progress(
        session: AsyncSession,
        report_id: str,
        user_id: int,
        state: Dict[str, Any],
        status: str
    ) -> None:
        """
        Persist the complete state in the JSONB meta field and update dedicated columns.
        """
        stmt = select(Report).where(Report.id == report_id, Report.user_id == user_id)
        result = await session.execute(stmt)
        report = result.scalar_one_or_none()

        if not report:
            raise ValueError(f"Research session not found or unauthorized: {report_id}")

        now = datetime.now(timezone.utc)

        # 1. Update dedicated columns
        report.status = status
        report.title = state.get("refined_topic") or report.title
        report.report = state.get("report") or report.report
        report.sources = state.get("sources") or report.sources
        report.critic_score = state.get("critic_score") or report.critic_score
        report.critic_feedback = state.get("critic_feedback") or report.critic_feedback
        report.clarification_questions = state.get("clarification_questions") or report.clarification_questions
        report.clarification_answers = state.get("clarification_answers") or report.clarification_answers
        report.updated_at = now

        # 2. Serialize full state in meta (excluding SQLAlchemy model elements or non-serializable objects)
        serialized_state = {k: v for k, v in state.items() if not k.startswith("_")}
        report.meta = serialized_state

        try:
            await session.commit()
            logger.info(f"Research session progress saved: id={report_id} status={status}")
        except Exception as e:
            await session.rollback()
            logger.error(f"Failed to save research session progress: {e}")
            raise

    @staticmethod
    async def mark_failed(session: AsyncSession, report_id: str, user_id: int) -> None:
        """
        Mark a research session as FAILED in case of unhandled execution errors.
        """
        stmt = select(Report).where(Report.id == report_id, Report.user_id == user_id)
        result = await session.execute(stmt)
        report = result.scalar_one_or_none()

        if not report:
            return

        now = datetime.now(timezone.utc)
        report.status = "FAILED"
        report.updated_at = now

        try:
            await session.commit()
            logger.info(f"Research session marked FAILED: id={report_id}")
        except Exception as e:
            await session.rollback()
            logger.error(f"Failed to mark research session as failed: {e}")
            raise
