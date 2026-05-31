"""
Real-time Tracking WebSocket — /ws/tracking/{order_id}
Finds nearest delivery partner, calculates route to store, then to customer,
and streams simulated live position over websocket.
"""

import asyncio
import json
import random
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.db.connection import get_db
from app.services.tracking_service import get_directions

router = APIRouter()



@router.websocket("/tracking/{order_id}")
async def tracking_websocket(websocket: WebSocket, order_id: str):
    """
    WebSocket endpoint that streams a simulated 10-second order delivery state machine.
    Coordinate interpolation is handled smoothly by the frontend.
    """
    await websocket.accept()
    print(f"[TRACKING] Tracking WS opened for order: {order_id}")
    
    db = get_db()
    
    # Store Coords (South City Luxe dummy)
    store_coords = [88.3616, 22.5015]
    
    try:
        # Find Nearest Delivery Partner to Store
        nearest_partner = await db.delivery_partners.find_one({
            "current_location": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": store_coords
                    }
                }
            },
            "status": "vacant"
        })
        
        if nearest_partner:
            # Mark partner as busy
            await db.delivery_partners.update_one(
                {"_id": nearest_partner["_id"]},
                {"$set": {"status": "busy"}}
            )
            
        partner_info = {
            "name": nearest_partner["name"] if nearest_partner else "Sukanta Das",
            "phone": nearest_partner["phone"] if nearest_partner else "+919876543000",
            "vehicle": nearest_partner["vehicle"] if nearest_partner else "scooter",
        }
        
        # State 0: Assigning Partner (0 - 1.5s)
        await websocket.send_text(json.dumps({
            "order_id": order_id, 
            "status": "Order confirmed! Assigning nearest partner...", 
            "progress": 5,
            "phase": "assigning",
            "partner": partner_info
        }))
        await asyncio.sleep(1.5)
        
        # State 1: Heading to Store (1.5s - 4.5s) -> 3 seconds duration
        await websocket.send_text(json.dumps({
            "order_id": order_id, 
            "status": "Partner heading to store", 
            "progress": 15,
            "phase": "heading_to_store",
            "duration": 3000,
            "partner": partner_info
        }))
        await asyncio.sleep(3.0)
        
        # State 2: At Store Packing (4.5s - 6.0s) -> 1.5 seconds duration
        await websocket.send_text(json.dumps({
            "order_id": order_id, 
            "status": "Order Picked Up! Packing complete.", 
            "progress": 45,
            "phase": "packing",
            "partner": partner_info
        }))
        await asyncio.sleep(1.5)
        
        # State 3: Out for Delivery (6.0s - 10.0s) -> 4 seconds duration
        await websocket.send_text(json.dumps({
            "order_id": order_id, 
            "status": "Out for Delivery", 
            "progress": 55,
            "phase": "delivering",
            "duration": 4000,
            "partner": partner_info
        }))
        await asyncio.sleep(4.0)
        
        # State 4: Delivered
        await websocket.send_text(json.dumps({
            "order_id": order_id,
            "status": "Delivered!",
            "progress": 100,
            "phase": "delivered",
            "partner": partner_info
        }))
        
        # Free up partner
        if nearest_partner:
            await db.delivery_partners.update_one(
                {"_id": nearest_partner["_id"]},
                {"$set": {"status": "vacant"}}
            )

    except WebSocketDisconnect:
        print(f"[TRACKING] Tracking WS disconnected: {order_id}")
    except Exception as e:
        print(f"[TRACKING] Error: {e}")
