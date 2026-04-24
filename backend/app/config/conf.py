from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    GROQ_API_KEY: str = ""
    TAVILY_API_KEY: str = ""

    # Pydantic Config: tells the model to read from a .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        frozen=True,
    )

@lru_cache
def get_settings():
    """
    Creates a cached instance of the settings.
    This prevents the app from re-reading the .env file on every request.
    """
    return Settings()

# Global instance for easy access
settings = get_settings()