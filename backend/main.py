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
from app.api.v1 import products, tracking, chat, orders, auth, users, agent_product
from app.api.v1.chat import ws_router as chat_ws_router
from app.config import settings
import asyncio
import json

async def redis_pubsub_listener():
    """
    Background worker that listens to Redis channels and broadcasts
    agent and negotiation updates to active WebSocket connections.
    """
    from app.db.redis_client import redis_client
    from app.websocket.connection_manager import manager

    pubsub = redis_client.pubsub()
    await pubsub.subscribe("channel:agents", "channel:negotiation")
    print("[STARTUP] Redis PubSub listener subscribed to channel:agents and channel:negotiation")
    
    try:
        while True:
            # Check for messages periodically
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message:
                try:
                    data = json.loads(message["data"])
                    session_id = data.get("session_id")
                    if session_id:
                        # Broadcast to the specific websocket session
                        await manager.broadcast_to_session(session_id, data)
                except Exception as e:
                    print(f"[REDIS LISTENER] Error processing message: {e}")
            await asyncio.sleep(0.1)
    except asyncio.CancelledError:
        print("[SHUTDOWN] Redis PubSub listener task cancelled")
    finally:
        await pubsub.unsubscribe()
        print("[SHUTDOWN] Redis PubSub listener unsubscribed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to MongoDB Atlas and create indexes on startup."""
    await connect_to_mongo()
    db = get_db()
    await create_indexes(db)
    
    # Check redis connection to determine fallback
    from app.db.redis_client import redis_client
    if hasattr(redis_client, "check_connection"):
        await redis_client.check_connection()
        
    # Start the background Redis Pub/Sub listener
    app.state.redis_listener = asyncio.create_task(redis_pubsub_listener())
    
    print(f"[STARTUP] QUICK_STYLE API ready — ENV: [{settings.ENV}]")
    yield
    
    # Cancel the background Redis Pub/Sub listener
    if hasattr(app.state, "redis_listener"):
        app.state.redis_listener.cancel()
        try:
            await app.state.redis_listener
        except asyncio.CancelledError:
            pass
            
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
app.include_router(chat_ws_router,  prefix="/ws/chat",         tags=["AI Stylist WS"])
app.include_router(tracking.router, prefix="/ws",              tags=["Live Tracking"])
app.include_router(agent_product.router, tags=["Agent"])



@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "QUICK_STYLE API",
        "version": "1.0.0",
        "env": settings.ENV,
        "database": "MongoDB Atlas",
    }
