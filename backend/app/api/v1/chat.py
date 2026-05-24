"""
AI Stylist Chat API — POST /api/v1/chat/message
Processes user styling queries and returns intelligent recommendations.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime
import random
from app.db.connection import get_db

router = APIRouter()


class ChatMessage(BaseModel):
    session_id: str
    message: str
    location: str = "NIT Jamshedpur Campus"


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    product_recommendations: list[dict] = []
    timestamp: str


async def generate_ai_reply(message: str, location: str, db) -> tuple[str, list[dict]]:
    """Rule-based AI stylist reply generator that queries MongoDB Atlas for actual products."""
    msg = message.lower()
    recommendations = []

    if any(w in msg for w in ["coffee", "spilled", "stain", "fresh shirt"]):
        prod = await db.products.find_one({"name": "Apex Tech Hoodie"})
        if prod:
            reply = (
                "Emergency wardrobe rescue incoming! 🚨 No worries — we got you covered.\n\n"
                f"Based on your location near **{location}**, I've found the **Apex Tech Hoodie (Lavender)** "
                f"at {prod['store_name']} just 0.8 km away. It has a **{prod.get('fit_confidence_avg', 94)}% True Fit score** "
                "for your size profile. Can be delivered in under **11 minutes**."
            )
            recommendations = [{
                "id": str(prod["_id"]),
                "name": prod["name"],
                "price": prod["price"]["selling_price"],
                "boutique": prod["store_name"],
                "fit_accuracy": prod.get("fit_confidence_avg", 94),
                "suggested_size": "L"
            }]
        else:
            reply = "I see you need a fresh hoodie or shirt due to a spill! Let me check what we have in stock near you."

    elif any(w in msg for w in ["formal", "presentation", "interview", "office"]):
        blazer = await db.products.find_one({"name": "Obsidian Formal Blazer"})
        sweater = await db.products.find_one({"name": "Amethyst Knit Sweater"})
        
        reply = "A polished look for the big moment! 👔\n\n"
        if blazer or sweater:
            reply += "I recommend the "
            if blazer:
                reply += f"**{blazer['name']}** for a structured statement, "
                recommendations.append({
                    "id": str(blazer["_id"]),
                    "name": blazer["name"],
                    "price": blazer["price"]["selling_price"],
                    "boutique": blazer["store_name"],
                    "fit_accuracy": blazer.get("fit_confidence_avg", 93),
                    "suggested_size": "M"
                })
            if sweater:
                if blazer:
                    reply += "or the elegant "
                reply += f"**{sweater['name']}** for smart-casual. "
                recommendations.append({
                    "id": str(sweater["_id"]),
                    "name": sweater["name"],
                    "price": sweater["price"]["selling_price"],
                    "boutique": sweater["store_name"],
                    "fit_accuracy": sweater.get("fit_confidence_avg", 96),
                    "suggested_size": "M"
                })
            reply += "Both pair perfectly with dark trousers."
        else:
            reply += "I'm checking our boutiques for formal wear near you now."

    elif any(w in msg for w in ["gym", "workout", "activewear", "running", "sport"]):
        prod = await db.products.find_one({"name": "Aero-Knit Activewear Tee"})
        if prod:
            reply = (
                "Let's get you geared up for peak performance! 💪\n\n"
                f"The **{prod['name']}** is unbeatable — moisture-wicking, 4-way stretch, "
                f"and a stunning **{prod.get('fit_confidence_avg', 98)}% True Fit accuracy**. "
                f"Available at {prod['store_name']} (1.9 km), delivered in 15 mins."
            )
            recommendations = [{
                "id": str(prod["_id"]),
                "name": prod["name"],
                "price": prod["price"]["selling_price"],
                "boutique": prod["store_name"],
                "fit_accuracy": prod.get("fit_confidence_avg", 98),
                "suggested_size": "M"
            }]
        else:
            reply = "I'm searching for performance activewear shirts near you."

    elif any(w in msg for w in ["night", "party", "club", "date", "evening"]):
        prod = await db.products.find_one({"name": "Vanguard Utility Jacket"})
        if prod:
            reply = (
                "Time to turn heads! ✨\n\n"
                f"I suggest the **{prod['name']}** for an edgy evening look — structured, "
                f"bold, and available at {prod['store_name']}. At **{prod.get('fit_confidence_avg', 92)}% True Fit**, "
                "it will fit perfectly for your profile. Estimated delivery: **12 minutes**."
            )
            recommendations = [{
                "id": str(prod["_id"]),
                "name": prod["name"],
                "price": prod["price"]["selling_price"],
                "boutique": prod["store_name"],
                "fit_accuracy": prod.get("fit_confidence_avg", 92),
                "suggested_size": "L"
            }]
        else:
            reply = "Looking for a stylish evening look? Let me browse nearby party/utility wear."

    else:
        tip = random.choice([
            "layering a hoodie over a slim-fit tee",
            "pairing earth tones with white sneakers",
            "structured blazers for an instant polish upgrade",
        ])
        reply = (
            f"Great styling question! 🎨 Based on current boutique stock near **{location}**, "
            f"here are some fresh picks. Pro styling tip: try **{tip}** for an effortless elevated look.\n\n"
            "Shall I narrow it down by occasion, color, or budget?"
        )
        
        cursor = db.products.find({"active": True}).limit(2)
        prods = await cursor.to_list(length=2)
        for p in prods:
            recommendations.append({
                "id": str(p["_id"]),
                "name": p["name"],
                "price": p["price"]["selling_price"],
                "boutique": p["store_name"],
                "fit_accuracy": p.get("fit_confidence_avg", 95),
                "suggested_size": "M"
            })

    return reply, recommendations


@router.post("/message", response_model=ChatResponse)
async def send_message(body: ChatMessage, db=Depends(get_db)):
    """Process a user chat message and return AI stylist reply with product suggestions."""
    reply, recommendations = await generate_ai_reply(body.message, body.location, db)
    return ChatResponse(
        session_id=body.session_id,
        reply=reply,
        product_recommendations=recommendations,
        timestamp=datetime.utcnow().isoformat(),
    )
