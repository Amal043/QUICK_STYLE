from fastapi import APIRouter
from app.db.redis_client import redis_client
import json

router = APIRouter()

@router.get("/")
async def get_hyperlocal_trends(location: str = "Salt Lake"):
    """Fetch cached hyperlocal trends from Redis."""
    cache_key = f"trending:{location.lower().replace(' ', '_')}"
    cached_data = await redis_client.get(cache_key)
    
    if cached_data:
        return json.loads(cached_data)
        
    return {
        "area": location,
        "answer": "Currently analyzing local trends in your area...",
        "items": []
    }
