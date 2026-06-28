
"""
research.py — API endpoints for initiating and resuming research sessions.
"""

import asyncio
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, verify_report_ownership
from app.models.domain import User
from app.schemas.domain import ResearchRequest, ClarificationSubmit, StatusResponse
from app.db.session import get_db_context, get_db
from app.services.state import ResearchStateService

logger = logging.getLogger(__name__)
router = APIRouter()

# Shared application state holding the compiled graph agent
# This needs to be populated by main.py
app_state: dict = {}

NODE_DISPLAY = {
    "validate_topic": "Validating research topic",
    "clarification": "Checking for clarifications",
    "analyze_query": "Planning research strategy",
    "web_search": "Searching the web",
    "synthesize": "Writing research report",
    "critic": "Evaluating report quality",
}

def sse_event(data: dict) -> str:
    """Format a Python dict as an SSE event string."""
    return f"data: {json.dumps(data)}\n\n"

async def _stream_research_events(agent, starting_state: dict, report_id: str, user_id: int, start_message: str):
    """
    Shared async generator to process LangGraph agent streams, yield SSE events,
    and manage database state saving to keep the endpoints DRY.
    """
    current_state = dict(starting_state)
    yield sse_event({
        "event": "start",
        "message": start_message,
        "report_id": report_id
    })

    try:
        async for chunk in agent.astream(starting_state, stream_mode="updates"):
            for node_name, output in chunk.items():
                if node_name not in NODE_DISPLAY:
                    continue

                current_state.update(output)

                yield sse_event({
                    "event": "node_start",
                    "node": node_name,
                    "display": NODE_DISPLAY[node_name],
                    "message": f"{NODE_DISPLAY[node_name]}...",
                })
                await asyncio.sleep(0.05)

                steps = output.get("thinking_steps", [])
                for step in steps:
                    yield sse_event({
                        "event": "thinking",
                        "node": node_name,
                        "message": step,
                    })
                    await asyncio.sleep(0.08)

                # State checkpoints per node
                if node_name == "validate_topic":
                    if not current_state.get("is_valid"):
                        async with get_db_context() as db_session:
                            current_state["error"] = {
                                "error_type": "INVALID_TOPIC",
                                "error_step": node_name,
                                "error_message": current_state.get('validation_reason')
                            }
                            await ResearchStateService.save_progress(
                                session=db_session, report_id=report_id, user_id=user_id,
                                state=current_state, status="FAILED"
                            )
                        yield sse_event({
                            "event": "error",
                            "message": f"Invalid topic: {current_state.get('validation_reason')}"
                        })
                        return

                elif node_name == "clarification":
                    if current_state.get("needs_clarification"):
                        async with get_db_context() as db_session:
                            await ResearchStateService.save_progress(
                                session=db_session, report_id=report_id, user_id=user_id,
                                state=current_state, status="WAITING_FOR_USER"
                            )
                        yield sse_event({
                            "event": "clarification_needed",
                            "questions": current_state.get("clarification_questions", []),
                            "report_id": report_id
                        })
                        return

                elif node_name == "synthesize":
                    async with get_db_context() as db_session:
                        await ResearchStateService.save_progress(
                            session=db_session, report_id=report_id, user_id=user_id,
                            state=current_state, status="SYNTHESIZING"
                        )

                elif node_name == "critic":
                    async with get_db_context() as db_session:
                        await ResearchStateService.save_progress(
                            session=db_session, report_id=report_id, user_id=user_id,
                            state=current_state, status="CRITIC"
                        )

        # Final Completion Check
        if current_state.get("report"):
            async with get_db_context() as db_session:
                await ResearchStateService.save_progress(
                    session=db_session, report_id=report_id, user_id=user_id,
                    state=current_state, status="COMPLETED"
                )

            yield sse_event({
                "event": "complete",
                "report": current_state.get("report"),
                "sources": current_state.get("sources"),
                "sub_questions": current_state.get("sub_questions"),
                "critic_feedback": current_state.get("critic_feedback"),
                "critic_score": current_state.get("critic_score"),
                "report_id": report_id,
            })

            yield sse_event({
                "event": "summary",
                "stats": {
                    "topic": current_state.get("refined_topic") or current_state.get("topic"),
                    "sub_questions": current_state.get("sub_questions"),
                    "urls_searched": len(current_state.get("sources") or []),
                    "critic_score": current_state.get("critic_score"),
                },
            })
        else:
            raise ValueError("Workflow complete but no report was synthesized.")

    except asyncio.CancelledError:
        # The client (browser) disconnected unexpectedly
        error_step = "PLANNING"
        error_message = "The research was interrupted before it could begin/resume."
        
        # Determine step from the last node processed
        if current_state.get("thinking_steps"):
            last_step = current_state["thinking_steps"][-1].lower()
            if "validat" in last_step:
                error_step = "VALIDATION"
                error_message = "The research was interrupted while validating your topic because the connection to the server was lost."
            elif "clarif" in last_step:
                error_step = "CLARIFICATION"
                error_message = "The research was interrupted while waiting for your clarification answers."
            elif "search" in last_step or "tavily" in last_step:
                error_step = "WEB_SEARCH"
                error_message = "The research was interrupted while searching the web for relevant information."
            elif "report" in last_step or "synthesiz" in last_step:
                error_step = "SYNTHESIS"
                error_message = "The research was interrupted while generating the research report."
            elif "critic" in last_step or "evaluat" in last_step:
                error_step = "CRITIC_REVIEW"
                error_message = "The research was interrupted while evaluating the report quality."
            else:
                error_step = "PLANNING"
                error_message = "The research was interrupted while preparing the research plan because the connection to the server was lost."
        
        logger.warning(f"Client disconnected during research. Marking as INTERRUPTED. Step: {error_step}")
        
        current_state["error"] = {
            "error_type": "CLIENT_DISCONNECTED",
            "error_step": error_step,
            "error_message": error_message
        }
        
        async with get_db_context() as db_session:
            await asyncio.shield(
                ResearchStateService.save_progress(
                    session=db_session, report_id=report_id, user_id=user_id,
                    state=current_state, status="INTERRUPTED"
                )
            )
        return

    except Exception as e:
        logger.error(f"Agent error in stream: {e}", exc_info=True)
        async with get_db_context() as db_session:
            await ResearchStateService.mark_failed(db_session, report_id, user_id)
        yield sse_event({"event": "error", "message": str(e)})

    finally:
        yield "data: [DONE]\n\n"


@router.post("")
async def research(request: ResearchRequest, current_user: User = Depends(get_current_user)):
    """
    Start a new research session and stream progress via Server-Sent Events (SSE).
    """
    if "agent" not in app_state:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Agent not ready — server is still starting up"
        )

    agent = app_state["agent"]

    async with get_db_context() as db_session:
        report_id = await ResearchStateService.create_session(
            session=db_session,
            user_id=current_user.id,
            topic=request.topic
        )

    initial_state = {
        "topic": request.topic,
        "is_valid": None,
        "validation_reason": None,
        "needs_clarification": None,
        "clarification_questions": None,
        "clarification_answers": None,
        "refined_topic": None,
        "research_plan": None,
        "sub_questions": None,
        "reasoning": None,
        "web_results": None,
        "report": None,
        "sources": None,
        "critic_score": None,
        "critic_feedback": None,
        "thinking_steps": [],
    }

    return StreamingResponse(
        _stream_research_events(
            agent=agent,
            starting_state=initial_state,
            report_id=report_id,
            user_id=current_user.id,
            start_message=f"Starting research on: {request.topic}"
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/{report_id}/clarifications")
async def continue_research(
    report_id: str,
    submit: ClarificationSubmit,
    current_user: User = Depends(get_current_user)
):
    """
    Resume a paused research session using provided clarification answers.
    """
    if "agent" not in app_state:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Agent not ready"
        )

    agent = app_state["agent"]

    async with get_db_context() as db_session:
        try:
            loaded_state = await ResearchStateService.load_state(db_session, report_id, current_user.id)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

        if loaded_state.get("status") != "WAITING_FOR_USER":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot resume research session with status {loaded_state.get('status')}"
            )

        # Update state with answers and reset status
        loaded_state["clarification_answers"] = submit.answers
        loaded_state["status"] = "PLANNING"
        loaded_state["thinking_steps"] = []

        await ResearchStateService.save_progress(
            session=db_session,
            report_id=report_id,
            user_id=current_user.id,
            state=loaded_state,
            status="PLANNING"
        )

    return StreamingResponse(
        _stream_research_events(
            agent=agent,
            starting_state=loaded_state,
            report_id=report_id,
            user_id=current_user.id,
            start_message="Clarifications received. Resuming Deep Research..."
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/{report_id}/status", response_model=StatusResponse)
async def get_status(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Check the current status and pending questions for a research session.
    """
    report = await verify_report_ownership(db, report_id, current_user.id)
    return StatusResponse(
        id=report.id,
        status=report.status,
        clarification_questions=report.clarification_questions if report.status == "WAITING_FOR_USER" else None
    )