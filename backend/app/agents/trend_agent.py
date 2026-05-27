import json
from app.db.redis_client import redis_client

async def trend_agent_node(state: dict) -> dict:
    session_id = state.get("session_id", "default")
    location = state.get("user_location", {})
    
    # In a real app we'd map coordinates to an area. 
    # Mocking location to Salt Lake for the prototype
    area = "Salt Lake" 
    
    cache_key = f"trending:{area.lower().replace(' ', '_')}"
    cached_data = await redis_client.get(cache_key)
    
    trends = []
    if cached_data:
        data = json.loads(cached_data)
        trends = data.get("items", [])
    
    from app.websocket.agent_broadcaster import broadcast_agent_event
    await broadcast_agent_event(session_id, {
        "agent": "trend_agent",
        "action": "fetched_hyperlocal_trends",
        "status": "complete",
        "details": {"area": area, "trends_found": len(trends)}
    })
    
    return {"hyperlocal_trends": trends}
