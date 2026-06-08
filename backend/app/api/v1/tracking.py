"""
Real-time Tracking WebSocket — /ws/tracking/{order_id}
Sends updates every 1.5s with phaseProgress (0.0-1.0) so the frontend can
start map animation at the correct waypoint (eliminates marker catch-up lag).
"""

import asyncio
import json
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.db.connection import get_db

router = APIRouter()

TICK_INTERVAL = 1.5  # seconds between status pushes


@router.websocket("/tracking/{order_id}")
async def tracking_websocket(
    websocket: WebSocket,
    order_id: str,
    createdAt: int = None,
    storeLat: float = 22.5015,
    storeLng: float = 88.3616,
    mode: str = "Delivery"
):
    """
    State machine: 40-second delivery/return/exchange timeline.
    createdAt is the frontend timestamp (ms) so phase is deterministic on reconnect.
    phaseProgress (0.0-1.0) lets the frontend skip the marker to the correct waypoint.
    """
    await websocket.accept()
    print(f"[TRACKING] WS opened — order: {order_id}, mode: {mode}")

    db = get_db()

    try:
        nearest_partner = await db.delivery_partners.find_one({
            "current_location": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [storeLng, storeLat]
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

        partner_object_id = nearest_partner["_id"] if nearest_partner else None
        partner_info = {
            "name": nearest_partner["name"] if nearest_partner else "Sukanta Das",
            "phone": nearest_partner["phone"] if nearest_partner else "+919876543000",
            "vehicle": nearest_partner["vehicle"] if nearest_partner else "scooter",
            "id": str(partner_object_id) if partner_object_id else None
        }

        start_time = (createdAt / 1000.0) if createdAt else time.time()
        partner_freed = False

        while True:
            elapsed = time.time() - start_time
            payload = None
            done = False

            # ── RETURN ───────────────────────────────────────────────────────
            if mode == "Return":
                if elapsed < 6.0:
                    pp = elapsed / 6.0
                    payload = {
                        "phase": "assigning",
                        "status": "Initiating Return... Assigning partner.",
                        "progress": round(5 + pp * 5),
                        "phaseProgress": round(pp, 3),
                    }
                elif elapsed < 18.0:
                    pp = (elapsed - 6) / 12.0
                    payload = {
                        "phase": "heading_to_user",
                        "status": "Partner heading to your location",
                        "progress": round(10 + pp * 70),
                        "phaseProgress": round(pp, 3),
                    }
                elif elapsed < 30.0:
                    pp = (elapsed - 18) / 12.0
                    payload = {
                        "phase": "picked_up_return",
                        "status": "Partner picked up the item",
                        "progress": round(80 + pp * 15),
                        "phaseProgress": round(pp, 3),
                    }
                else:
                    payload = {
                        "phase": "returned",
                        "status": "Returned!",
                        "progress": 100,
                        "phaseProgress": 1.0,
                    }
                    done = True

            # ── EXCHANGE ─────────────────────────────────────────────────────
            elif mode == "Exchange":
                if elapsed < 6.0:
                    pp = elapsed / 6.0
                    payload = {
                        "phase": "assigning",
                        "status": "Assigning partner for Exchange",
                        "progress": round(5 + pp * 5),
                        "phaseProgress": round(pp, 3),
                    }
                elif elapsed < 18.0:
                    pp = (elapsed - 6) / 12.0
                    payload = {
                        "phase": "heading_to_store",
                        "status": "Partner heading to store to pick up new item",
                        "progress": round(10 + pp * 25),
                        "phaseProgress": round(pp, 3),
                    }
                elif elapsed < 24.0:
                    pp = (elapsed - 18) / 6.0
                    payload = {
                        "phase": "packing",
                        "status": "Packing new item at store",
                        "progress": round(35 + pp * 15),
                        "phaseProgress": round(pp, 3),
                    }
                elif elapsed < 40.0:
                    pp = (elapsed - 24) / 16.0
                    payload = {
                        "phase": "delivering_and_picking_up",
                        "status": "Partner heading to your location for Exchange",
                        "progress": round(50 + pp * 45),
                        "phaseProgress": round(pp, 3),
                    }
                else:
                    payload = {
                        "phase": "exchanged",
                        "status": "Exchanged Successfully!",
                        "progress": 100,
                        "phaseProgress": 1.0,
                    }
                    done = True

            # ── DELIVERY ─────────────────────────────────────────────────────
            else:
                if elapsed < 6.0:
                    pp = elapsed / 6.0
                    payload = {
                        "phase": "assigning",
                        "status": "Order confirmed! Assigning nearest partner...",
                        "progress": round(5 + pp * 5),
                        "phaseProgress": round(pp, 3),
                    }
                elif elapsed < 18.0:
                    pp = (elapsed - 6) / 12.0
                    payload = {
                        "phase": "heading_to_store",
                        "status": "Partner heading to store",
                        "progress": round(10 + pp * 30),
                        "phaseProgress": round(pp, 3),
                    }
                elif elapsed < 24.0:
                    pp = (elapsed - 18) / 6.0
                    payload = {
                        "phase": "packing",
                        "status": "Order Picked Up! Packing complete.",
                        "progress": round(40 + pp * 15),
                        "phaseProgress": round(pp, 3),
                    }
                elif elapsed < 40.0:
                    pp = (elapsed - 24) / 16.0
                    payload = {
                        "phase": "delivering",
                        "status": "Out for Delivery",
                        "progress": round(55 + pp * 40),
                        "phaseProgress": round(pp, 3),
                    }
                else:
                    payload = {
                        "phase": "delivered",
                        "status": "Delivered!",
                        "progress": 100,
                        "phaseProgress": 1.0,
                    }
                    done = True
                    if not partner_freed and partner_object_id:
                        await db.delivery_partners.update_one(
                            {"_id": partner_object_id},
                            {"$set": {"status": "vacant"}}
                        )
                        partner_freed = True

            if payload:
                payload["order_id"] = order_id
                payload["partner"] = partner_info
                payload["elapsed"] = round(elapsed, 2)
                await websocket.send_text(json.dumps(payload))

            if done:
                break

            await asyncio.sleep(TICK_INTERVAL)

    except WebSocketDisconnect:
        print(f"[TRACKING] WS disconnected: {order_id}")
    except Exception as e:
        print(f"[TRACKING] Error in tracking WS: {e}")
