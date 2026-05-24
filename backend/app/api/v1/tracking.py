"""
Real-time Tracking WebSocket — /ws/tracking/{order_id}
Simulates a live scooter rider moving toward the delivery destination.
"""

import asyncio
import json
import math
import random
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# Simulated route: Boutique A Hub → NIT Jamshedpur
ROUTE_WAYPOINTS = [
    {"lat": 22.7767, "lng": 86.1445, "label": "Boutique A Hub"},
    {"lat": 22.7780, "lng": 86.1462},
    {"lat": 22.7795, "lng": 86.1480},
    {"lat": 22.7812, "lng": 86.1492},
    {"lat": 22.7825, "lng": 86.1510},
    {"lat": 22.7840, "lng": 86.1525},
    {"lat": 22.7855, "lng": 86.1538},
    {"lat": 22.7867, "lng": 86.1550, "label": "NIT Jamshedpur Gate"},
]

STATUSES = [
    "Order confirmed",
    "Package being prepared",
    "Rider dispatched",
    "On the way",
    "Arriving soon",
    "Delivered!",
]


def interpolate(p1: dict, p2: dict, t: float) -> dict:
    """Linearly interpolate between two lat/lng points."""
    return {
        "lat": p1["lat"] + (p2["lat"] - p1["lat"]) * t,
        "lng": p1["lng"] + (p2["lng"] - p1["lng"]) * t,
    }


@router.websocket("/tracking/{order_id}")
async def tracking_websocket(websocket: WebSocket, order_id: str):
    """
    WebSocket endpoint that streams simulated rider GPS coordinates every 2 seconds.
    Sends JSON payloads: { lat, lng, status, eta_minutes, progress }
    """
    await websocket.accept()
    print(f"🛵 Tracking WS opened for order: {order_id}")

    total_steps = len(ROUTE_WAYPOINTS) - 1
    steps_per_segment = 5  # Sub-steps between waypoints

    try:
        step = 0
        total_sub_steps = total_steps * steps_per_segment

        for i in range(total_steps):
            for j in range(steps_per_segment):
                t = j / steps_per_segment
                pos = interpolate(ROUTE_WAYPOINTS[i], ROUTE_WAYPOINTS[i + 1], t)

                # Add slight jitter to simulate GPS noise
                pos["lat"] += random.uniform(-0.0001, 0.0001)
                pos["lng"] += random.uniform(-0.0001, 0.0001)

                progress = step / total_sub_steps
                status_idx = min(int(progress * len(STATUSES)), len(STATUSES) - 1)
                eta_minutes = max(1, round((1 - progress) * 12))

                payload = {
                    "order_id": order_id,
                    "lat": round(pos["lat"], 6),
                    "lng": round(pos["lng"], 6),
                    "status": STATUSES[status_idx],
                    "eta_minutes": eta_minutes,
                    "progress": round(progress * 100),
                }

                await websocket.send_text(json.dumps(payload))
                step += 1
                await asyncio.sleep(2)

        # Final delivery event
        await websocket.send_text(json.dumps({
            "order_id": order_id,
            "lat": ROUTE_WAYPOINTS[-1]["lat"],
            "lng": ROUTE_WAYPOINTS[-1]["lng"],
            "status": "Delivered! ✅",
            "eta_minutes": 0,
            "progress": 100,
        }))

    except WebSocketDisconnect:
        print(f"📵 Tracking WS disconnected: {order_id}")
