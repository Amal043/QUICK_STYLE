"""
QUICK_STYLE — MongoDB Atlas Seed Script
Seeds: stores, products, a demo user
Run: python scripts/seed_atlas.py
"""

import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId
import hashlib

MONGODB_URI = "mongodb+srv://quickadmin:kQIlu2sCOpn6Veb5@cluster0.e2smnwz.mongodb.net/quick_style_db?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "quick_style_db"

# ── Stores ────────────────────────────────────────────────────────
store_a_id = ObjectId()
store_b_id = ObjectId()
store_c_id = ObjectId()
store_d_id = ObjectId()

STORES = [
    {
        "_id": store_a_id,
        "name": "Boutique A — Street Luxe",
        "owner_id": "owner_001",
        "phone": "+919876543210",
        "email": "boutiqueA@quickstyle.io",
        "address": "45 Main Road",
        "area": "Adityapur",
        "city": "Jamshedpur",
        "pincode": "831013",
        "location": {"type": "Point", "coordinates": [86.1445, 22.7767]},
        "categories": ["Streetwear", "Formals"],
        "rating": 4.8,
        "total_orders": 248,
        "active": True,
        "operating_hours": {"open": "09:00", "close": "21:00"},
        "created_at": datetime.utcnow(),
    },
    {
        "_id": store_b_id,
        "name": "Boutique B — Techwear Hub",
        "owner_id": "owner_002",
        "phone": "+919876543211",
        "email": "boutiqueB@quickstyle.io",
        "address": "12 Market Lane",
        "area": "Bistupur",
        "city": "Jamshedpur",
        "pincode": "831001",
        "location": {"type": "Point", "coordinates": [86.1478, 22.7795]},
        "categories": ["Streetwear", "Activewear"],
        "rating": 4.7,
        "total_orders": 189,
        "active": True,
        "operating_hours": {"open": "10:00", "close": "22:00"},
        "created_at": datetime.utcnow(),
    },
    {
        "_id": store_c_id,
        "name": "Boutique C — Luxe Knits",
        "owner_id": "owner_003",
        "phone": "+919876543212",
        "email": "boutiqueC@quickstyle.io",
        "address": "8 College Road",
        "area": "Sakchi",
        "city": "Jamshedpur",
        "pincode": "831001",
        "location": {"type": "Point", "coordinates": [86.1460, 22.7780]},
        "categories": ["Loungewear", "Formals"],
        "rating": 4.9,
        "total_orders": 312,
        "active": True,
        "operating_hours": {"open": "09:30", "close": "20:30"},
        "created_at": datetime.utcnow(),
    },
    {
        "_id": store_d_id,
        "name": "Boutique D — Active Zone",
        "owner_id": "owner_004",
        "phone": "+919876543213",
        "email": "boutiqueD@quickstyle.io",
        "address": "3 Sports Complex Road",
        "area": "NIT Campus Area",
        "city": "Jamshedpur",
        "pincode": "831014",
        "location": {"type": "Point", "coordinates": [86.1510, 22.7815]},
        "categories": ["Activewear"],
        "rating": 4.6,
        "total_orders": 410,
        "active": True,
        "operating_hours": {"open": "08:00", "close": "21:00"},
        "created_at": datetime.utcnow(),
    },
]

# ── Products ──────────────────────────────────────────────────────
PRODUCTS = [
    {
        "name": "Apex Tech Hoodie",
        "description": "Premium fleece-lined tech hoodie with mesh ventilation panels. Designed for urban mobility with hidden zip pockets.",
        "brand": "QUICK_STYLE Originals",
        "size_variance": 0,
        "size_note": "True to size. Size up for oversized fit.",
        "category": "Streetwear",
        "subcategory": "hoodies",
        "tags": ["hoodie", "tech", "streetwear", "lavender", "fleece", "urban"],
        "outfit_tags": ["streetwear", "casual", "urban"],
        "pairs_well_with": ["cargo_pants", "white_sneakers", "crossbody_bag"],
        "price": {"mrp": 2999, "selling_price": 1999, "discount_percent": 33},
        "sizes_available": ["S", "M", "L", "XL"],
        "colors": [{
            "name": "Lavender",
            "hex": "#B57BEE",
            "images": {
                "main": "https://storage.googleapis.com/quickstyle/products/hoodie/main.webp",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_a_id),
        "store_name": "Boutique A — Street Luxe",
        "store_location": {"type": "Point", "coordinates": [86.1445, 22.7767]},
        "stock": {"S": 2, "M": 3, "L": 1, "XL": 2},
        "embedding": [],
        "rating": {"average": 4.9, "count": 148},
        "fit_confidence_avg": 94,
        "active": True,
        "created_at": datetime.utcnow(),
    },
    {
        "name": "Vanguard Utility Jacket",
        "description": "Military-inspired multi-pocket techwear jacket with water-resistant shell and adjustable hood.",
        "brand": "Vanguard",
        "size_variance": 1,
        "size_note": "This brand runs large — consider sizing down.",
        "category": "Streetwear",
        "subcategory": "jackets",
        "tags": ["jacket", "techwear", "utility", "military", "waterproof", "pockets"],
        "outfit_tags": ["techwear", "urban", "edgy"],
        "pairs_well_with": ["slim_fit_joggers", "chunky_boots", "tactical_bag"],
        "price": {"mrp": 5999, "selling_price": 3999, "discount_percent": 33},
        "sizes_available": ["M", "L", "XL"],
        "colors": [{
            "name": "Obsidian",
            "hex": "#1A1A2E",
            "images": {
                "main": "https://storage.googleapis.com/quickstyle/products/jacket/main.webp",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_b_id),
        "store_name": "Boutique B — Techwear Hub",
        "store_location": {"type": "Point", "coordinates": [86.1478, 22.7795]},
        "stock": {"M": 1, "L": 0, "XL": 1},
        "embedding": [],
        "rating": {"average": 4.8, "count": 89},
        "fit_confidence_avg": 92,
        "active": True,
        "created_at": datetime.utcnow(),
    },
    {
        "name": "Amethyst Knit Sweater",
        "description": "Luxurious merino blend knit with relaxed dropped-shoulder silhouette. Perfect for smart-casual and presentations.",
        "brand": "LuxeKnit",
        "size_variance": -1,
        "size_note": "Runs slightly small. Consider sizing up.",
        "category": "Loungewear",
        "subcategory": "sweaters",
        "tags": ["knit", "sweater", "merino", "amethyst", "luxury", "cozy", "formal"],
        "outfit_tags": ["smart_casual", "cozy_luxe", "minimalist"],
        "pairs_well_with": ["tailored_trousers", "loafers", "leather_tote"],
        "price": {"mrp": 3999, "selling_price": 2499, "discount_percent": 37},
        "sizes_available": ["XS", "S", "M", "L"],
        "colors": [{
            "name": "Amethyst",
            "hex": "#9B59B6",
            "images": {
                "main": "https://storage.googleapis.com/quickstyle/products/sweater/main.webp",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_c_id),
        "store_name": "Boutique C — Luxe Knits",
        "store_location": {"type": "Point", "coordinates": [86.1460, 22.7780]},
        "stock": {"XS": 3, "S": 5, "M": 2, "L": 4},
        "embedding": [],
        "rating": {"average": 4.7, "count": 201},
        "fit_confidence_avg": 96,
        "active": True,
        "created_at": datetime.utcnow(),
    },
    {
        "name": "Aero-Knit Activewear Tee",
        "description": "High-performance moisture-wicking activewear top with 4-way stretch and flatlock seams.",
        "brand": "AeroFit",
        "size_variance": 0,
        "size_note": "True to size. Size up for looser athletic fit.",
        "category": "Activewear",
        "subcategory": "tees",
        "tags": ["tee", "activewear", "gym", "moisture-wicking", "coral", "performance"],
        "outfit_tags": ["athletic", "sporty", "performance"],
        "pairs_well_with": ["jogger_shorts", "running_shoes", "gym_bag"],
        "price": {"mrp": 1999, "selling_price": 1299, "discount_percent": 35},
        "sizes_available": ["S", "M", "L", "XL", "XXL"],
        "colors": [{
            "name": "Electric Coral",
            "hex": "#FF6B6B",
            "images": {
                "main": "https://storage.googleapis.com/quickstyle/products/tee/main.webp",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_d_id),
        "store_name": "Boutique D — Active Zone",
        "store_location": {"type": "Point", "coordinates": [86.1510, 22.7815]},
        "stock": {"S": 8, "M": 12, "L": 7, "XL": 5, "XXL": 3},
        "embedding": [],
        "rating": {"average": 4.6, "count": 320},
        "fit_confidence_avg": 98,
        "active": True,
        "created_at": datetime.utcnow(),
    },
    {
        "name": "Obsidian Formal Blazer",
        "description": "Tailored single-breasted blazer in premium obsidian wool blend. Structured shoulder with notched lapel.",
        "brand": "FormCraft",
        "size_variance": 0,
        "size_note": "True to size. Key measurement: chest circumference.",
        "category": "Formals",
        "subcategory": "blazers",
        "tags": ["blazer", "formal", "obsidian", "wool", "tailored", "office", "interview"],
        "outfit_tags": ["formal", "business", "power_dressing"],
        "pairs_well_with": ["dress_trousers", "oxford_shoes", "pocket_square"],
        "price": {"mrp": 8999, "selling_price": 5999, "discount_percent": 33},
        "sizes_available": ["S", "M", "L", "XL"],
        "colors": [{
            "name": "Obsidian",
            "hex": "#1C1C1E",
            "images": {
                "main": "https://storage.googleapis.com/quickstyle/products/blazer/main.webp",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_a_id),
        "store_name": "Boutique A — Street Luxe",
        "store_location": {"type": "Point", "coordinates": [86.1445, 22.7767]},
        "stock": {"S": 1, "M": 2, "L": 1, "XL": 0},
        "embedding": [],
        "rating": {"average": 4.9, "count": 67},
        "fit_confidence_avg": 93,
        "active": True,
        "created_at": datetime.utcnow(),
    },
]

# ── Demo User ─────────────────────────────────────────────────────
DEMO_USER = {
    "name": "Demo User",
    "email": "demo@quickstyle.io",
    "phone": "+919876543000",
    "password_hash": hashlib.sha256("demo1234".encode()).hexdigest(),
    "role": "customer",
    "profile_photo_url": None,
    "addresses": [{
        "label": "Campus",
        "street": "NIT Jamshedpur Main Gate",
        "area": "Adityapur",
        "city": "Jamshedpur",
        "pincode": "831014",
        "location": {"lat": 22.7867, "lon": 86.1550},
        "is_default": True
    }],
    "size_profile": {
        "tops": "M",
        "bottoms": "M",
        "footwear": "9",
        "height_cm": 175,
        "weight_kg": 70
    },
    "return_history": [],
    "purchase_history": [],
    "notification_prefs": {
        "whatsapp_enabled": True,
        "proactive_suggestions": True,
        "last_notified_at": None
    },
    "payment_preauth": None,
    "created_at": datetime.utcnow(),
    "last_active": datetime.utcnow(),
}


async def seed():
    print("🌱 Connecting to MongoDB Atlas...")
    client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=10000)
    await client.admin.command("ping")
    print("✅ Connected!")

    db = client[DB_NAME]

    # ── Stores ────────────────────────────────────
    await db.stores.drop()
    await db.stores.create_index([("location", "2dsphere")])
    result = await db.stores.insert_many(STORES)
    print(f"✅ Seeded {len(result.inserted_ids)} stores")

    # ── Products ──────────────────────────────────
    await db.products.drop()
    await db.products.create_index([("store_location", "2dsphere")])
    await db.products.create_index([("name", "text"), ("description", "text"), ("tags", "text")])
    result = await db.products.insert_many(PRODUCTS)
    print(f"✅ Seeded {len(result.inserted_ids)} products")

    # ── Demo User ─────────────────────────────────
    await db.users.create_index("email", unique=True)
    await db.users.replace_one(
        {"email": DEMO_USER["email"]},
        DEMO_USER,
        upsert=True
    )
    print("✅ Demo user seeded (demo@quickstyle.io / demo1234)")

    client.close()
    print("\n🎉 Atlas seed complete! Collections: stores, products, users")
    print(f"📊 View at: https://cloud.mongodb.com → Cluster0 → quick_style_db")


if __name__ == "__main__":
    asyncio.run(seed())
