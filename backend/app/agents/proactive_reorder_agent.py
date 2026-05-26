import asyncio
from datetime import datetime
from app.db.connection import get_db
from app.websocket.agent_broadcaster import broadcast_agent_event

async def proactive_reorder_task():
    """
    Background task that scans user purchase history and suggests reorders
    based on season or time elapsed. 
    (In a real app, this runs via Celery Beat every day)
    """
    db = get_db()
    if not db:
        return
        
    current_season = "winter" if datetime.utcnow().month in [11, 12, 1, 2] else "summer"
    
    # Find users who bought something in the current season previously
    cursor = db.users.find({
        "notification_prefs.proactive_suggestions": True,
        "purchase_history": {"$elemMatch": {"season": current_season}}
    })
    
    async for user in cursor:
        past_purchases = [p for p in user.get("purchase_history", []) if p.get("season") == current_season]
        if past_purchases:
            # Recommend a related item for the season
            target_category = past_purchases[0].get("category")
            
            # Send notification via websocket
            # We assume session_id is user_id for proactive alerts when they login
            session_id = str(user["_id"])
            await broadcast_agent_event(session_id, {
                "agent": "proactive_reorder_agent",
                "action": "seasonal_recommendation",
                "status": "complete",
                "details": {
                    "message": f"Time to refresh your {current_season} wardrobe? Last year you bought {target_category}.",
                    "target_category": target_category
                }
            })
