"""
main.py — Entry point for the Agentic Research Assistant API.
"""

import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load .env file BEFORE importing app.config — config reads env vars at import time
load_dotenv()

from sqlalchemy import text
from app.services.agent import build_agent
from app.api.routes.research import app_state
from app.core.config import settings
from app.db.database import engine
from app.api.router import api_router as router

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ───────────────────────────────────────────────────────────────
    # Prevent bypassing authentication in production
    if settings.environment.lower() == "production" and settings.auth_bypass:
        raise RuntimeError("Clerk authentication bypass is not allowed in production environment")

    if not settings.openrouter_api_key:
        raise RuntimeError("OPENROUTER_API_KEY environment variable is required. Add it to .env")


    if not settings.tavily_api_key:
        logger.warning("TAVILY_API_KEY not set — web search will fail at runtime")

    # Verify PostgreSQL database connectivity
    logger.info("Verifying PostgreSQL database connectivity...")
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection verified successfully.")
    except Exception as e:
        logger.critical(f"Database connection failed: {e}")
        raise RuntimeError(f"Database connection failed: {e}") from e

    # Build the LangGraph agent (compiles the graph, creates the LLM clients)
    logger.info("Building research agent...")
    app_state["agent"] = build_agent(
        openrouter_api_key=settings.openrouter_api_key,
        openrouter_base_url=settings.openrouter_base_url,
    )
    logger.info("Research agent ready. Server is up at http://localhost:8000")
    logger.info("API docs: http://localhost:8000/docs")

    yield  # Server is now running and accepting requests

    # ── Shutdown ──────────────────────────────────────────────────────────────
    app_state.clear()
    logger.info("Server shut down.")


# ── FastAPI app ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Agentic Research Assistant ",
    description=(
        "Give the agent a topic. It validates the topic,ask cirtation questions from user, plans its research strategy, "
        "searches the web (up to 20 URLs), optionally searches a local knowledge base, "
        "and writes a structured report. "
        "Every step streams to the browser in real time via Server-Sent Events (SSE)."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes from routes.py
app.include_router(router)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
