from typing import Dict, Any
from app.db.redis_client import publish
import json
import time

async def broadcast_agent_event(session_id: str, payload: Dict[str, Any]):
    """
    Broadcasts real-time events to the frontend via Redis Pub/Sub.
    """
    enriched_payload = {
        "session_id": session_id,
        "timestamp": time.time(),
        **payload
    }
    # Publish to Redis channel so WebSocket servers can forward it
    await publish("channel:agents", enriched_payload)
