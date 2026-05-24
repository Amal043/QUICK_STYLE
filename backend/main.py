"""
QUICK_STYLE — FastAPI Backend Entry Point
Hyperlocal Fashion Platform with AI Stylist & Real-time Delivery Tracking
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.v1 import products, tracking, chat, orders, auth
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    print(f"🚀 QUICK_STYLE API starting up in [{settings.ENV}] mode")
    yield
    print("🛑 QUICK_STYLE API shutting down")


app = FastAPI(
    title="QUICK_STYLE API",
    description="Hyperlocal Fashion Platform — Zero-inventory boutique delivery with AI fit calibration",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# ─────────────────────────────────────────────
# CORS Middleware
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# API Routers
# ─────────────────────────────────────────────
app.include_router(auth.router,     prefix="/api/v1/auth",     tags=["Authentication"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(orders.router,   prefix="/api/v1/orders",   tags=["Orders"])
app.include_router(chat.router,     prefix="/api/v1/chat",     tags=["AI Stylist"])
app.include_router(tracking.router, prefix="/ws",              tags=["Real-time Tracking"])


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "QUICK_STYLE API",
        "version": "1.0.0",
        "env": settings.ENV,
    }
