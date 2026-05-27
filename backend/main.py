"""
QUICK_STYLE — FastAPI Backend Entry Point
Hyperlocal Fashion Platform with AI Stylist & Real-time Delivery Tracking
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.connection import connect_to_mongo, close_mongo_connection
from app.db.indexes import create_indexes
from app.db.connection import get_db
from app.api.v1 import products, tracking, chat, orders, auth, users
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to MongoDB Atlas and create indexes on startup."""
    await connect_to_mongo()
    db = get_db()
    await create_indexes(db)
    print(f"[STARTUP] QUICK_STYLE API ready — ENV: [{settings.ENV}]")
    yield
    await close_mongo_connection()
    print("[SHUTDOWN] QUICK_STYLE API shut down")


app = FastAPI(
    title="QUICK_STYLE API",
    description=(
        "Hyperlocal Fashion Platform — Zero-inventory boutique delivery "
        "with AI fit calibration, WebSocket live tracking, and 12-min delivery."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────
app.include_router(auth.router,     prefix="/api/v1/auth",     tags=["Auth"])
app.include_router(users.router,    prefix="/api/v1/users",    tags=["Users"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(orders.router,   prefix="/api/v1/orders",   tags=["Orders"])
app.include_router(chat.router,     prefix="/api/v1/chat",     tags=["AI Stylist"])
app.include_router(tracking.router, prefix="/ws",              tags=["Live Tracking"])


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "QUICK_STYLE API",
        "version": "1.0.0",
        "env": settings.ENV,
        "database": "MongoDB Atlas",
    }
