"""
auth.py — Clerk JWT Authentication validation and User synchronization.
"""

import logging
from datetime import datetime, timezone
from typing import Dict

import jwt
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import User, Report
from app.db.session import get_db

logger = logging.getLogger(__name__)

# Security scheme to extract Bearer token from the Authorization header
security = HTTPBearer(auto_error=True)  # False to bypass authentication in development

# Cache JWK clients by JWKS URL to reuse connections and cache keys
_jwk_clients: Dict[str, jwt.PyJWKClient] = {}

def get_jwk_client(jwks_url: str) -> jwt.PyJWKClient:
    """Gets or creates a PyJWKClient for the given JWKS URL to enable key caching."""
    if jwks_url not in _jwk_clients:
        # PyJWKClient automatically caches the public keys
        _jwk_clients[jwks_url] = jwt.PyJWKClient(jwks_url, cache_keys=True, lifespan=3600)
    return _jwk_clients[jwks_url]

async def fetch_clerk_user_profile(clerk_user_id: str) -> dict:
    """
    Fetches the user's detailed profile from the Clerk Backend API
    using the CLERK_SECRET_KEY.
    """
    if not settings.clerk_secret_key:
        logger.warning("CLERK_SECRET_KEY is not set. Cannot query Clerk Backend API for user profile.")
        return {}

    url = f"https://api.clerk.com/v1/users/{clerk_user_id}"
    headers = {
        "Authorization": f"Bearer {settings.clerk_secret_key}",
        "Accept": "application/json"
    }

    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(
                    f"Clerk Backend API returned status {response.status_code}: {response.text}"
                )
        except Exception as e:
            logger.error(f"Failed to connect to Clerk Backend API: {e}", exc_info=True)
    return {}

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency that validates the Clerk JWT token in the Authorization header.
    On first login, automatically creates the user record in PostgreSQL.
    On subsequent logins, returns the existing user.
    """
    # # --- bypasing auth starts --
    # # ── Development Bypass Check ──────────────────────────────────────────────
    # if settings.environment == "development" and settings.auth_bypass:
    #     logger.info("Authentication bypass enabled. Loading development user...")
    #     stmt = select(User).where(User.clerk_user_id == settings.dev_user_id)
    #     result = await session.execute(stmt)
    #     user = result.scalar_one_or_none()

    #     if not user:
    #         logger.info(f"Creating local development User: {settings.dev_user_id}")
    #         user = User(
    #             clerk_user_id=settings.dev_user_id,
    #             email=settings.dev_user_email,
    #             name=settings.dev_user_name,
    #             created_at=datetime.now(timezone.utc),
    #             updated_at=datetime.now(timezone.utc)
    #         )
    #         session.add(user)
    #         await session.commit()
    #         await session.refresh(user)
    #     return user

    # # ── Standard Clerk Flow ───────────────────────────────────────────────────
    # if not credentials or not credentials.credentials:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Not authenticated",
    #         headers={"WWW-Authenticate": "Bearer"},
    #     )
    # # --- bypasing auth ends --

    token = credentials.credentials

    # 1. Unverified decode to extract payload claims (specifically issuer 'iss')
    try:
        unverified_payload = jwt.decode(token, options={"verify_signature": False})
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token format: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    iss = unverified_payload.get("iss")
    if not iss:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing issuer ('iss') claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Validate issuer
    if settings.clerk_issuer:
        if iss != settings.clerk_issuer:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token issuer does not match configured clerk_issuer",
                headers={"WWW-Authenticate": "Bearer"},
            )
    else:
        # Standard Clerk issuer validation (must be clerk instance URL)
        if not (iss.endswith(".clerk.accounts.dev") or "clerk" in iss):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token issuer; does not match Clerk development or production pattern",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # 3. Retrieve JWKS URL and retrieve signing key
    jwks_url = settings.clerk_jwks_url or (iss.rstrip("/") + "/.well-known/jwks.json")
    try:
        jwk_client = get_jwk_client(jwks_url)
        signing_key = jwk_client.get_signing_key_from_jwt(token)
    except Exception as e:
        logger.error(f"Failed to fetch signing key from JWKS endpoint ({jwks_url}): {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not retrieve public key to verify token signature",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 4. Fully verify token signature and expiry
    try:
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}  # Clerk backend JWTs do not require verification of audience
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token signature verification failed: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing sub (Clerk User ID) claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 5. Fetch/Sync user record in PostgreSQL
    # Check if user already exists
    stmt = select(User).where(User.clerk_user_id == clerk_user_id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if user:
        return user

    # User does not exist, fetch profile details from Clerk Backend API
    logger.info(f"User '{clerk_user_id}' not found locally. Querying Clerk Backend API...")
    profile = await fetch_clerk_user_profile(clerk_user_id)

    # Determine email
    email = None
    email_addresses = profile.get("email_addresses") or []
    primary_email_id = profile.get("primary_email_address_id")

    if primary_email_id:
        for addr in email_addresses:
            if addr.get("id") == primary_email_id:
                email = addr.get("email_address")
                break
    if not email and email_addresses:
        email = email_addresses[0].get("email_address")

    # Fallback to token payload claims if API profile query returns empty results
    if not email:
        email = payload.get("email") or f"{clerk_user_id}@placeholder.com"

    # Determine Name
    first_name = profile.get("first_name") or ""
    last_name = profile.get("last_name") or ""
    name = f"{first_name} {last_name}".strip()

    if not name:
        name = payload.get("name") or f"{payload.get('first_name', '')} {payload.get('last_name', '')}".strip() or "Clerk User"

    # Create new User in database
    logger.info(f"Creating local User record for '{clerk_user_id}' with email '{email}'")
    user = User(
        clerk_user_id=clerk_user_id,
        email=email,
        name=name,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

    try:
        session.add(user)
        await session.commit()
        await session.refresh(user)
    except Exception as e:
        logger.error(f"Failed to save user {clerk_user_id} to database: {e}", exc_info=True)
        await session.rollback()
        # In case of concurrent register, try query again
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create user record in database"
            )

    return user


async def verify_report_ownership(
    session: AsyncSession,
    report_id: str,
    user_id: int
) -> Report:
    """
    Helper function to verify that a report exists and belongs to the specified user.
    Raises HTTP 404 if the report does not exist.
    Raises HTTP 403 if the report belongs to another user.
    """
    report = await session.get(Report, report_id)
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found"
        )
    if report.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to access this resource"
        )
    return report
