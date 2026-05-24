"""
Seed Script — Populate MongoDB with initial product catalog.
Run: python scripts/seed_products.py
"""

import asyncio
import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/quick_style_db")

PRODUCTS = [
    {
        "id": 1, "name": "Apex Tech Hoodie",
        "price": 79.00, "category": "Streetwear", "boutique": "Boutique A",
        "boutique_lat": 22.7767, "boutique_lng": 86.1445,
        "distance": 0.8, "fitAccuracy": 94, "stock": 3,
        "rating": 4.9, "reviewsCount": 148,
        "description": "Premium fleece-lined tech hoodie with mesh ventilation panels.",
        "sizes": ["S", "M", "L", "XL"], "colors": ["Lavender", "Charcoal", "White"],
        "image": ""
    },
    {
        "id": 2, "name": "Vanguard Utility Jacket",
        "price": 149.00, "category": "Streetwear", "boutique": "Boutique B",
        "boutique_lat": 22.7795, "boutique_lng": 86.1478,
        "distance": 1.2, "fitAccuracy": 92, "stock": 1,
        "rating": 4.8, "reviewsCount": 89,
        "description": "Military-inspired multi-pocket techwear jacket.",
        "sizes": ["M", "L", "XL"], "colors": ["Khaki", "Obsidian"],
        "image": ""
    },
    {
        "id": 3, "name": "Amethyst Knit Sweater",
        "price": 95.00, "category": "Loungewear", "boutique": "Boutique C",
        "boutique_lat": 22.7780, "boutique_lng": 86.1460,
        "distance": 0.5, "fitAccuracy": 96, "stock": 5,
        "rating": 4.7, "reviewsCount": 201,
        "description": "Luxurious merino blend knit with relaxed silhouette.",
        "sizes": ["XS", "S", "M", "L"], "colors": ["Amethyst", "Sage", "Cream"],
        "image": ""
    },
    {
        "id": 4, "name": "Aero-Knit Activewear Tee",
        "price": 45.00, "category": "Activewear", "boutique": "Boutique D",
        "boutique_lat": 22.7815, "boutique_lng": 86.1510,
        "distance": 1.9, "fitAccuracy": 98, "stock": 8,
        "rating": 4.6, "reviewsCount": 320,
        "description": "High-performance moisture-wicking activewear top.",
        "sizes": ["S", "M", "L", "XL", "XXL"], "colors": ["Electric Coral", "Midnight", "White"],
        "image": ""
    },
    {
        "id": 5, "name": "Obsidian Formal Blazer",
        "price": 199.00, "category": "Formals", "boutique": "Boutique A",
        "boutique_lat": 22.7767, "boutique_lng": 86.1445,
        "distance": 0.8, "fitAccuracy": 93, "stock": 2,
        "rating": 4.9, "reviewsCount": 67,
        "description": "Tailored single-breasted blazer in premium obsidian wool.",
        "sizes": ["S", "M", "L", "XL"], "colors": ["Obsidian", "Navy", "Charcoal"],
        "image": ""
    },
]


async def seed():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
    db = client["quick_style_db"]
    collection = db["products"]

    # Drop and re-seed
    await collection.drop()
    result = await collection.insert_many(PRODUCTS)
    print(f"✅ Seeded {len(result.inserted_ids)} products into MongoDB")

    # Create indexes
    await collection.create_index("id", unique=True)
    await collection.create_index("category")
    await collection.create_index("boutique")
    print("✅ Indexes created")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
