"""
history.py — API endpoints for viewing and managing research history.
"""

import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, verify_report_ownership
from app.db.session import get_db
from app.models.domain import User
from app.schemas.domain import HistoryItem, HistoryListResponse, ResearchReport, DeleteResponse
from app.services.history import list_reports

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("", response_model=HistoryListResponse)
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Return a summary list of all past research reports for the authenticated user.
    """
    reports = await list_reports(db, user_id=current_user.id)
    return HistoryListResponse(
        reports=[HistoryItem(**r) for r in reports],
        total=len(reports),
    )


@router.get("/{report_id}")
async def get_history_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Return the detailed fields of a specific report.
    """
    report = await verify_report_ownership(db, report_id, current_user.id)
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
        "meta": report.meta,
        "created_at": report.created_at.strftime("%Y-%m-%dT%H:%M:%S") if isinstance(report.created_at, datetime) else str(report.created_at),
    }


@router.get("/{report_id}/pdf")
async def download_pdf(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate and return a PDF format file download of a completed research report.
    """
    report = await verify_report_ownership(db, report_id, current_user.id)

    if not report.report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot download PDF for an incomplete report"
        )

    # Lazy-load to keep startup fast
    from app.services.pdf import generate_pdf

    try:
        pdf_bytes = generate_pdf(
            topic=report.topic,
            report_md=report.report,
            sources=report.sources or [],
        )
    except Exception as e:
        logger.error(f"PDF generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF generation failed: {e}"
        )

    # Sanitize name
    safe_topic = "".join(c if c.isalnum() or c in " _-" else "_" for c in report.topic)
    safe_topic = safe_topic[:40].strip()
    filename = f"research_{safe_topic}_{report_id}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.delete("/{report_id}", response_model=DeleteResponse)
async def delete_history_report_endpoint(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific report from database history.
    """
    report = await verify_report_ownership(db, report_id, current_user.id)
    try:
        await db.delete(report)
        await db.commit()
        logger.info(f"Report deleted: id={report_id} user_id={current_user.id}")
    except Exception:
        await db.rollback()
        raise
    return DeleteResponse(status="deleted", id=report_id)
