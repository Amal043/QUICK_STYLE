"""
Auth API — POST /api/v1/auth/register & /api/v1/auth/login
JWT-based authentication for customers, shopkeepers, and admins.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import secrets

router = APIRouter()


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "customer"  # customer | shopkeeper | admin


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
    expires_in: int = 86400  # 24 hours


def hash_password(password: str) -> str:
    """Simple SHA-256 hash. In production, use bcrypt via passlib."""
    return hashlib.sha256(password.encode()).hexdigest()


def create_mock_token(user_id: str) -> str:
    """Generate a mock JWT-like token. In production, use python-jose."""
    return f"qs_tok_{secrets.token_urlsafe(32)}_{user_id[:8]}"


# Mock user store — replace with MongoDB in production
MOCK_USERS: dict[str, dict] = {
    "demo@quickstyle.io": {
        "id": "usr_001",
        "name": "Demo User",
        "email": "demo@quickstyle.io",
        "password_hash": hash_password("demo1234"),
        "role": "customer",
        "created_at": "2026-01-01T00:00:00",
    },
    "admin@quickstyle.io": {
        "id": "usr_admin",
        "name": "Admin",
        "email": "admin@quickstyle.io",
        "password_hash": hash_password("admin1234"),
        "role": "admin",
        "created_at": "2026-01-01T00:00:00",
    },
}


@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest):
    """Register a new user account."""
    if body.email in MOCK_USERS:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = f"usr_{secrets.token_hex(4)}"
    user = {
        "id": user_id,
        "name": body.name,
        "email": body.email,
        "password_hash": hash_password(body.password),
        "role": body.role,
        "created_at": datetime.utcnow().isoformat(),
    }
    MOCK_USERS[body.email] = user

    return AuthResponse(
        access_token=create_mock_token(user_id),
        user={"id": user_id, "name": body.name, "email": body.email, "role": body.role},
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    """Authenticate a user and return a JWT access token."""
    user = MOCK_USERS.get(body.email)
    if not user or user["password_hash"] != hash_password(body.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return AuthResponse(
        access_token=create_mock_token(user["id"]),
        user={"id": user["id"], "name": user["name"], "email": body.email, "role": user["role"]},
    )
