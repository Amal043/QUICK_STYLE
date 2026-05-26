"""
Pre-populate Kolkata area trends in Redis for quick access.
Run: python scripts/seed_trends.py
"""

import asyncio
import os
import json
from datetime import datetime
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from app.db.redis_client import redis_client, connect_redis

AREAS = ["Salt Lake", "Park Street", "New Town", "Ballygunge"]

TREND_DATA = {
    "Salt Lake": [
        {"title": "Handloom Saree for Puja - The Ethnic Co", "content": "Trending in Salt Lake for upcoming Durga Puja events.", "score": 0.94},
        {"title": "Linen Co-ord sets for summer", "content": "Popular for casual outings and office wear.", "score": 0.87}
    ],
    "Park Street": [
        {"title": "Little Black Dress - Party wear", "content": "High demand for weekend parties.", "score": 0.96},
        {"title": "Sequin tops and blazers", "content": "Trending for nightlife and upscale dining.", "score": 0.91}
    ],
    "New Town": [
        {"title": "Techwear Cargo Pants", "content": "Popular among young IT professionals in New Town.", "score": 0.89},
        {"title": "Minimalist Sneakers", "content": "Clean aesthetics are in high demand.", "score": 0.85}
    ],
    "Ballygunge": [
        {"title": "Designer Silk Kurtas", "content": "Premium ethnic wear is trending heavily.", "score": 0.95},
        {"title": "Statement Jewelry Pieces", "content": "Heavy necklaces and earrings are popular.", "score": 0.90}
    ]
}

async def seed_trends():
    print("🌱 Connecting to Redis...")
    await connect_redis()
    print("✅ Connected!")

    for area in AREAS:
        cache_key = f"trending:{area.lower().replace(' ', '_')}"
        items = [
            {
                "keyword": data["title"].split(" - ")[0],
                "heat_score": int(data["score"] * 100),
                "source": "tavily_mock",
                "context": data["content"]
            } for data in TREND_DATA.get(area, [])
        ]
        
        trend_payload = {
            "area": area,
            "fetched_at": datetime.now().isoformat(),
            "answer": f"Based on recent activity in {area}, people are looking for {items[0]['keyword']}.",
            "items": items
        }
        
        # Cache for 2 hours
        await redis_client.setex(cache_key, 7200, json.dumps(trend_payload))
        print(f"✅ Seeded trends for {area}")

    print("\n🎉 Trend seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_trends())
