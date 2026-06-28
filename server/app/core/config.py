"""
config.py — Application settings using Pydantic Settings.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    All configurable values for the Agentic Research Assistant.
    Pydantic reads these from environment variables or the .env file.

    Fields without a default value (e.g. openai_api_key) are REQUIRED.
    The server will refuse to start if they are missing.

    Fields with a default value (e.g. tavily_api_key: str = "") are optional.
    """

    # ── Required API keys ─────────────────────────────────────────────────────
    openrouter_api_key: str
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    # No default → server crashes at startup if missing. Intentional: fail fast
    # rather than letting users run research that will fail later.

    # ── Required Web Search API key ───────────────────────────────────────────
    tavily_api_key: str

    qdrant_url: str = ""
    # Empty string = no knowledge base. The kb_search node skips gracefully.

    qdrant_api_key: str = ""
    qdrant_collection: str = "rag_uploads"

    # ── LLM settings ─────────────────────────────────────────────────────────
    llm_model: str = "openai/gpt-4o-mini"
    # openai/gpt-4o-mini is the recommended model via OpenRouter.

    # ── Database settings ─────────────────────────────────────────────────────
    database_url: str

    # ── Clerk Authentication Settings ──────────────────────────────────────────
    clerk_secret_key: str
    clerk_issuer: str
    clerk_jwks_url: str

    # ── Security & Environment Settings ────────────────────────────────────────
    environment: str = "production"
    allowed_origins: str = "http://localhost:5173"  # Comma-separated list of allowed origins
    
    # ── Development Bypass Settings ───────────────────────────────────────────
    auth_bypass: bool = False
    dev_user_id: str = "dev_user"
    dev_user_email: str = "dev_user@example.com"
    dev_user_name: str = "Development User"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


    # ── Server settings ───────────────────────────────────────────────────────
    port: int = 8002

    # ── Pydantic config ───────────────────────────────────────────────────────
    model_config = {
        "env_file": ".env",            # Read from .env file in the working directory
        "env_file_encoding": "utf-8",
        "extra": "ignore",             # Ignore extra env vars we don't know about
    }


# Module-level singleton — import this in other files
# "Singleton" means: one instance shared by the whole application.
# Python's import system ensures this is only created once.
settings = Settings()
