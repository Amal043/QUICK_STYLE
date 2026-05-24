"""
AI Stylist Chat API — POST /api/v1/chat/message
Processes user styling queries and returns intelligent recommendations.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
import random

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


PRODUCT_CATALOG = {
    1: {"name": "Apex Tech Hoodie", "price": 79.00, "boutique": "Boutique A", "fit_accuracy": 94},
    2: {"name": "Vanguard Utility Jacket", "price": 149.00, "boutique": "Boutique B", "fit_accuracy": 92},
    3: {"name": "Amethyst Knit Sweater", "price": 95.00, "boutique": "Boutique C", "fit_accuracy": 96},
    4: {"name": "Aero-Knit Activewear Tee", "price": 45.00, "boutique": "Boutique D", "fit_accuracy": 98},
    5: {"name": "Obsidian Formal Blazer", "price": 199.00, "boutique": "Boutique A", "fit_accuracy": 93},
}


def generate_ai_reply(message: str, location: str) -> tuple[str, list[dict]]:
    """Rule-based AI stylist reply generator. Replace with LLM integration when backend is live."""
    msg = message.lower()
    recommendations = []

    if any(w in msg for w in ["coffee", "spilled", "stain", "fresh shirt"]):
        reply = (
            "Emergency wardrobe rescue incoming! 🚨 No worries — we got you covered.\n\n"
            f"Based on your location near **{location}**, I've found the **Apex Tech Hoodie (Lavender)** "
            "at Boutique A just 0.8 km away. It has a **94% True Fit score** for your Zara M profile. "
            "Can be delivered in under **11 minutes**."
        )
        recommendations = [{"id": 1, "suggested_size": "L", **PRODUCT_CATALOG[1]}]

    elif any(w in msg for w in ["formal", "presentation", "interview", "office"]):
        reply = (
            "A polished look for the big moment! 👔\n\n"
            "I recommend the **Obsidian Formal Blazer** for a structured statement, or the elegant "
            "**Amethyst Knit Sweater** for smart-casual. Both pair perfectly with dark trousers. "
            "The Blazer has a **93% True Fit score** and is in stock at Boutique A."
        )
        recommendations = [
            {"id": 5, "suggested_size": "M", **PRODUCT_CATALOG[5]},
            {"id": 3, "suggested_size": "M", **PRODUCT_CATALOG[3]},
        ]

    elif any(w in msg for w in ["gym", "workout", "activewear", "running", "sport"]):
        reply = (
            "Let's get you geared up for peak performance! 💪\n\n"
            "The **Aero-Knit Activewear Tee** is unbeatable — moisture-wicking, 4-way stretch, "
            "and a stunning **98% True Fit accuracy**. Available at Boutique D (1.9 km), delivered in 15 mins."
        )
        recommendations = [{"id": 4, "suggested_size": "M", **PRODUCT_CATALOG[4]}]

    elif any(w in msg for w in ["night", "party", "club", "date", "evening"]):
        reply = (
            "Time to turn heads! ✨\n\n"
            "I suggest the **Vanguard Utility Jacket** for an edgy evening look — structured, "
            "bold, and available at Boutique B. At **92% True Fit**, it will fit perfectly for your profile. "
            "Estimated delivery: **12 minutes**."
        )
        recommendations = [{"id": 2, "suggested_size": "L", **PRODUCT_CATALOG[2]}]

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
        recommendations = [
            {"id": 1, "suggested_size": "M", **PRODUCT_CATALOG[1]},
            {"id": 3, "suggested_size": "S", **PRODUCT_CATALOG[3]},
        ]

    return reply, recommendations


@router.post("/message", response_model=ChatResponse)
async def send_message(body: ChatMessage):
    """Process a user chat message and return AI stylist reply with product suggestions."""
    reply, recommendations = generate_ai_reply(body.message, body.location)
    return ChatResponse(
        session_id=body.session_id,
        reply=reply,
        product_recommendations=recommendations,
        timestamp=datetime.utcnow().isoformat(),
    )
