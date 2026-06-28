"""
history.py — Database CRUD helpers for history endpoints.
"""

import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

logger = logging.getLogger(__name__)

async def list_reports(session: AsyncSession, user_id: int) -> list:
    """
    Return a summary list of all past reports for the given user, newest first.
    """
    from app.models.domain import Report

    stmt = select(
        Report.id,
        Report.topic,
        Report.title,
        Report.status,
        Report.created_at
    ).where(Report.user_id == user_id).order_by(Report.created_at.desc())

    result = await session.execute(stmt)
    rows = result.all()

    return [
        {
            "id": row.id,
            "topic": row.topic,
            "title": row.title,
            "status": row.status,
            "created_at": row.created_at.strftime("%Y-%m-%dT%H:%M:%S") if isinstance(row.created_at, datetime) else str(row.created_at),
        }
        for row in rows
    ]


async def get_report(session: AsyncSession, report_id: str, user_id: int) -> dict | None:
    """
    Return the full details of one report for the user, or None if not found or unauthorized.
    """
    from app.models.domain import Report

    stmt = select(Report).where(Report.id == report_id, Report.user_id == user_id)
    result = await session.execute(stmt)
    report = result.scalar_one_or_none()
    if report is None:
        return None

    return {
        "id": report.id,
        "topic": report.topic,
        "title": report.title,
        "report": report.report,
        "sources": report.sources,
        "critic_score": report.critic_score,
        "critic_feedback": report.critic_feedback,
        "clarification_questions": report.clarification_questions,
        "clarification_answers": report.clarification_answers,
        "status": report.status,
        "created_at": report.created_at.strftime("%Y-%m-%dT%H:%M:%S") if isinstance(report.created_at, datetime) else str(report.created_at),
    }


async def delete_report(session: AsyncSession, report_id: str, user_id: int) -> bool:
    """
    Delete a report by ID and user_id. Returns True if deleted, False if not found or unauthorized.
    """
    from app.models.domain import Report

    stmt = select(Report).where(Report.id == report_id, Report.user_id == user_id)
    result = await session.execute(stmt)
    report = result.scalar_one_or_none()
    if report is None:
        return False

    try:
        await session.delete(report)
        await session.commit()
        logger.info(f"Report deleted from PostgreSQL: id={report_id} user_id={user_id}")
        return True
    except Exception:
        await session.rollback()
        raise
