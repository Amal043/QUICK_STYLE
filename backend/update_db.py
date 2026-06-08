import asyncio
import random
from app.db.connection import connect_to_mongo, close_mongo_connection, get_db
from app.models.product import ProductDocument, ProductColor, ProductImages, ProductPrice

async def update_db():
    await connect_to_mongo()
    db = get_db()

    # 1. Update existing products with return_policy
    products_cursor = db.products.find({})
    count = 0
    async for product in products_cursor:
        policy = random.choice(["Refund", "Exchange"])
        await db.products.update_one({"_id": product["_id"]}, {"$set": {"return_policy": policy, "return_window_days": 5}})
        count += 1
    
    print(f"Updated {count} products with return_policy and return_window_days.")

    # 2. Insert new products
    new_products = [
        {
            "id": "qs_jacket_01",
            "name": "Streetwear Cargo Jacket",
            "brand": "Quick Style Co.",
            "description": "A highly aesthetic, premium, urban streetwear cargo jacket.",
            "category": "Streetwear",
            "subcategory": "Jackets",
            "price": {"mrp": 5999, "selling_price": 3499, "discount_percent": 41},
            "sizes_available": ["S", "M", "L", "XL"],
            "colors": [
                {
                    "name": "Dark Olive",
                    "hex": "#4B5320",
                    "images": {"main": "/cargo_jacket.png", "gallery": [], "frames_360": [], "has_360": False}
                }
            ],
            "store_name": "Boutique A — South City Luxe",
            "store_id": "boutique_a",
            "store_location": {"lat": 22.5015, "lon": 88.3616},
            "stock": {"S": 10, "M": 15, "L": 10, "XL": 5},
            "rating": {"average": 4.8, "count": 12},
            "fit_confidence_avg": 90,
            "active": True,
            "return_policy": "Exchange",
            "return_window_days": 5
        },
        {
            "id": "qs_dress_01",
            "name": "Minimal Casual Dress",
            "brand": "Quick Style Co.",
            "description": "A highly aesthetic, premium, minimal casual dress for women.",
            "category": "Runway",
            "subcategory": "Dresses",
            "price": {"mrp": 4999, "selling_price": 2499, "discount_percent": 50},
            "sizes_available": ["XS", "S", "M", "L"],
            "colors": [
                {
                    "name": "Beige",
                    "hex": "#F5F5DC",
                    "images": {"main": "/minimal_dress.png", "gallery": [], "frames_360": [], "has_360": False}
                }
            ],
            "store_name": "Boutique B — Park Street Trends",
            "store_id": "boutique_b",
            "store_location": {"lat": 22.555, "lon": 88.352},
            "stock": {"XS": 5, "S": 15, "M": 10, "L": 5},
            "rating": {"average": 4.6, "count": 8},
            "fit_confidence_avg": 85,
            "active": True,
            "return_policy": "Refund",
            "return_window_days": 5
        },
        {
            "id": "qs_tee_01",
            "name": "Premium Oversized Tee",
            "brand": "Quick Style Co.",
            "description": "A highly aesthetic, premium oversized graphic tee.",
            "category": "Streetwear",
            "subcategory": "T-Shirts",
            "price": {"mrp": 2499, "selling_price": 1499, "discount_percent": 40},
            "sizes_available": ["S", "M", "L", "XL", "XXL"],
            "colors": [
                {
                    "name": "Dark Grey",
                    "hex": "#A9A9A9",
                    "images": {"main": "/oversized_tee.png", "gallery": [], "frames_360": [], "has_360": False}
                }
            ],
            "store_name": "Boutique C — Salt Lake Knits",
            "store_id": "boutique_c",
            "store_location": {"lat": 22.583, "lon": 88.402},
            "stock": {"S": 20, "M": 30, "L": 25, "XL": 10, "XXL": 5},
            "rating": {"average": 4.9, "count": 22},
            "fit_confidence_avg": 95,
            "active": True,
            "return_policy": "Exchange",
            "return_window_days": 5
        }
    ]

    for np in new_products:
        await db.products.update_one({"id": np["id"]}, {"$set": np}, upsert=True)
    
    print("Inserted new products successfully.")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(update_db())
