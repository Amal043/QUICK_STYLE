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

def interpolate(p1: dict, p2: dict, t: float) -> dict:
    """Linearly interpolate between two lat/lng points."""
    return {
        "lat": p1["lat"] + (p2["lat"] - p1["lat"]) * t,
        "lng": p1["lng"] + (p2["lng"] - p1["lng"]) * t,
    }

async def stream_route(websocket, order_id, waypoints, start_progress, end_progress, status_msg):
    total_steps = len(waypoints) - 1
    if total_steps <= 0:
        return
        
    steps_per_segment = 2 # Speed up simulation
    total_sub_steps = total_steps * steps_per_segment
    step = 0
    
    for i in range(total_steps):
        for j in range(steps_per_segment):
            t = j / steps_per_segment
            pos = interpolate(waypoints[i], waypoints[i + 1], t)
            
            # Add slight jitter to simulate GPS noise
            pos["lat"] += random.uniform(-0.0001, 0.0001)
            pos["lng"] += random.uniform(-0.0001, 0.0001)
            
            local_progress = step / total_sub_steps
            progress = start_progress + (end_progress - start_progress) * local_progress
            
            # Simulated ETA based on remaining progress
            eta_minutes = max(1, round((1 - (progress / 100.0)) * 15))
            
            payload = {
                 "order_id": order_id,
                 "lat": round(pos["lat"], 6),
                 "lng": round(pos["lng"], 6),
                 "status": status_msg,
                 "eta_minutes": eta_minutes,
                 "progress": round(progress),
            }
            
            await websocket.send_text(json.dumps(payload))
            step += 1
            await asyncio.sleep(2)

@router.websocket("/tracking/{order_id}")
async def tracking_websocket(websocket: WebSocket, order_id: str):
    """
    WebSocket endpoint that streams simulated rider GPS coordinates.
    """
    await websocket.accept()
    print(f"[TRACKING] Tracking WS opened for order: {order_id}")
    
    db = get_db()
    
    # 1. Fetch Store (Mocking with South City Luxe for Demo if order not found)
    # 2. Fetch User (Mocking with Admin User for Demo)
    # (In a real app, query `orders` collection. Here we hardcode to the seeded Kolkata data for demo)
    
    query_params = websocket.query_params
    lat_param = query_params.get("lat")
    lng_param = query_params.get("lng")
    store_lat_param = query_params.get("store_lat")
    store_lng_param = query_params.get("store_lng")
    
    store_coords = [88.3616, 22.5015] # South City Luxe
    
    if lat_param and lng_param:
        try:
            user_coords = [float(lng_param), float(lat_param)]
            print(f"[TRACKING] Using client geolocated coordinates: {user_coords}")
            
            # Check if store coordinates are provided by client
            if store_lat_param and store_lng_param:
                store_coords = [float(store_lng_param), float(store_lat_param)]
                print(f"[TRACKING] Using client-provided store coordinates: {store_coords}")
            else:
                # If coordinates are far away from Kolkata, let's also mock the store_coords
                # to be closer to the user so that the routing and distance look realistic!
                lat_diff = abs(user_coords[1] - 22.50)
                lng_diff = abs(user_coords[0] - 88.36)
                if lat_diff > 0.5 or lng_diff > 0.5:
                    # Place store ~1.2 km north-west of the user
                    store_coords = [user_coords[0] - 0.01, user_coords[1] + 0.008]
                    print(f"[TRACKING] Client is outside Kolkata. Adjusting store_coords to be nearby: {store_coords}")
        except Exception as err:
            print(f"[TRACKING] Error parsing query params: {err}")
            user_coords = [88.3653, 22.4981] # Jadavpur User
    else:
        user_coords = [88.3653, 22.4981] # Jadavpur User
    
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
            partner_coords = nearest_partner["current_location"]["coordinates"]
            # Mark partner as busy
            await db.delivery_partners.update_one(
                {"_id": nearest_partner["_id"]},
                {"$set": {"status": "busy"}}
            )
        else:
            # Fallback if all busy
            partner_coords = [88.3550, 22.5050] 
            
        # Get Route 1: Partner to Store
        print("[TRACKING] Fetching Route 1: Partner -> Store")
        route1 = await get_directions(partner_coords, store_coords)
        
        # Get Route 2: Store to User
        print("[TRACKING] Fetching Route 2: Store -> User")
        route2 = await get_directions(store_coords, user_coords)
        
        # Stream Phase 1: Partner heading to store
        await websocket.send_text(json.dumps({"order_id": order_id, "status": "Order confirmed! Assigning nearest partner...", "progress": 5}))
        await asyncio.sleep(2)
        
        await stream_route(
            websocket, 
            order_id, 
            route1["waypoints"], 
            start_progress=10, 
            end_progress=40, 
            status_msg="Partner heading to store (Preparing Order)"
        )
        
        # Picked up
        await websocket.send_text(json.dumps({"order_id": order_id, "status": "Order Picked Up!", "progress": 45}))
        await asyncio.sleep(2)
        
        # Stream Phase 2: Store to User
        await stream_route(
            websocket, 
            order_id, 
            route2["waypoints"], 
            start_progress=50, 
            end_progress=95, 
            status_msg="Out for Delivery"
        )
        
        # Final delivery event
        await websocket.send_text(json.dumps({
            "order_id": order_id,
            "lat": route2["waypoints"][-1]["lat"],
            "lng": route2["waypoints"][-1]["lng"],
            "status": "Delivered!",
            "eta_minutes": 0,
            "progress": 100,
        }))
        
        # Free up partner
        if nearest_partner:
            await db.delivery_partners.update_one(
                {"_id": nearest_partner["_id"]},
                {"$set": {"status": "vacant", "current_location": {"type": "Point", "coordinates": user_coords}}}
            )

    except WebSocketDisconnect:
        print(f"[TRACKING] Tracking WS disconnected: {order_id}")
    except Exception as e:
        print(f"[TRACKING] Error: {e}")
