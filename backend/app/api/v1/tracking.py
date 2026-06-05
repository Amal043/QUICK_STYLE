"""
Real-time Tracking WebSocket — /ws/tracking/{order_id}
Finds nearest delivery partner, calculates route to store, then to customer,
and streams simulated live position over websocket.
"""

import asyncio
import json
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.db.connection import get_db

router = APIRouter()

# In-memory store to preserve simulated tracking states across reconnects
TRACKING_STATE = {}



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
        if order_id not in TRACKING_STATE:
            # Find Nearest Delivery Partner to Store (First Time Only)
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
                await db.delivery_partners.update_one(
                    {"_id": nearest_partner["_id"]},
                    {"$set": {"status": "busy"}}
                )
                
            partner_info = {
                "name": nearest_partner["name"] if nearest_partner else "Sukanta Das",
                "phone": nearest_partner["phone"] if nearest_partner else "+919876543000",
                "vehicle": nearest_partner["vehicle"] if nearest_partner else "scooter",
                "id": nearest_partner["_id"] if nearest_partner else None
            }
            TRACKING_STATE[order_id] = {
                "start_time": time.time(),
                "partner": partner_info
            }
        
        state = TRACKING_STATE[order_id]
        partner_info = state["partner"]
        
        while True:
            elapsed = time.time() - state["start_time"]
            
            # State 0: Assigning Partner (0 - 6.0s)
            if elapsed < 6.0:
                await websocket.send_text(json.dumps({
                    "order_id": order_id, 
                    "status": "Order confirmed! Assigning nearest partner...", 
                    "progress": 5,
                    "phase": "assigning",
                    "partner": partner_info
                }))
                await asyncio.sleep(6.0 - elapsed)
                continue
                
            # State 1: Heading to Store (6.0s - 18.0s)
            elif elapsed < 18.0:
                await websocket.send_text(json.dumps({
                    "order_id": order_id, 
                    "status": "Partner heading to store", 
                    "progress": 15,
                    "phase": "heading_to_store",
                    "duration": 12000,
                    "partner": partner_info
                }))
                await asyncio.sleep(18.0 - elapsed)
                continue
                
            # State 2: At Store Packing (18.0s - 24.0s)
            elif elapsed < 24.0:
                await websocket.send_text(json.dumps({
                    "order_id": order_id, 
                    "status": "Order Picked Up! Packing complete.", 
                    "progress": 45,
                    "phase": "packing",
                    "partner": partner_info
                }))
                await asyncio.sleep(24.0 - elapsed)
                continue
                
            # State 3: Out for Delivery (24.0s - 40.0s)
            elif elapsed < 40.0:
                await websocket.send_text(json.dumps({
                    "order_id": order_id, 
                    "status": "Out for Delivery", 
                    "progress": 55,
                    "phase": "delivering",
                    "duration": 16000,
                    "partner": partner_info
                }))
                await asyncio.sleep(40.0 - elapsed)
                continue
                
            # State 4: Delivered
            else:
                await websocket.send_text(json.dumps({
                    "order_id": order_id,
                    "status": "Delivered!",
                    "progress": 100,
                    "phase": "delivered",
                    "partner": partner_info
                }))
                
                # Free up partner if they haven't been freed yet
                if not state.get("partner_freed") and partner_info.get("id"):
                    await db.delivery_partners.update_one(
                        {"_id": partner_info["id"]},
                        {"$set": {"status": "vacant"}}
                    )
                    state["partner_freed"] = True
                
                # Stay open but stop loop, or break
                # We can just break and let the client know it's delivered
                break

    except WebSocketDisconnect:
        print(f"[TRACKING] Tracking WS disconnected: {order_id}")
    except Exception as e:
        print(f"[TRACKING] Error: {e}")
