import time
from pymongo import MongoClient

client = MongoClient("mongodb://admin:quick_style_secret@localhost:27017/quick_style_db?authSource=admin")
db = client.quick_style_db

products = [
    {
        "name": "Luxury Silk Evening Gown",
        "description": "Luxury Silk Evening Gown made from premium materials.",
        "price": {
            "mrp": 5500,
            "selling_price": 4500,
            "discount_percent": 18
        },
        "image": "/images/emerald_silk_gown.png",
        "category": "Dresses",
        "store_name": "South City Luxe",
        "store_location": {
            "type": "Point",
            "coordinates": [88.3616, 22.5015]
        },
        "brand": "Zevana",
        "sizes_available": ["S", "M", "L", "XL"],
        "colors": [{"name": "Emerald Green", "hex": "#50C878"}],
        "fit_confidence_avg": 92,
        "created_at": time.time(),
        "return_policy": "Exchange"
    },
    {
        "name": "Tailored Wool Overcoat",
        "description": "Tailored Wool Overcoat made from premium materials.",
        "price": {
            "mrp": 7500,
            "selling_price": 6500,
            "discount_percent": 13
        },
        "image": "/images/camel_wool_overcoat.png",
        "category": "Jackets",
        "store_name": "Park Street Trends",
        "store_location": {
            "type": "Point",
            "coordinates": [88.3524, 22.5552]
        },
        "brand": "Zevana",
        "sizes_available": ["M", "L", "XL"],
        "colors": [{"name": "Camel", "hex": "#C19A6B"}],
        "fit_confidence_avg": 94,
        "created_at": time.time(),
        "return_policy": "Refund"
    }
]

for p in products:
    db.products.insert_one(p)
    print(f"Inserted {p['name']}")
