"""
QUICK_STYLE — MongoDB Atlas Seed Script
Seeds: stores, products, a demo user, delivery partners
Run: python scripts/seed_atlas.py
"""

import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from bson import ObjectId
import hashlib

from dotenv import load_dotenv

# Load env variables from backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://admin:quick_style_secret@mongodb:27017/quick_style_db?authSource=admin")
DB_NAME = "quick_style_db"

# ── Stores (Kolkata) ────────────────────────────────────────────────────────
store_a_id = ObjectId()
store_b_id = ObjectId()
store_c_id = ObjectId()
store_d_id = ObjectId()

STORES = [
    {
        "_id": store_a_id,
        "name": "Boutique A — South City Luxe",
        "owner_id": "owner_001",
        "phone": "+919876543210",
        "email": "boutiqueA@quickstyle.io",
        "address": "South City Mall",
        "area": "Jodhpur Park",
        "city": "Kolkata",
        "pincode": "700068",
        "location": {"type": "Point", "coordinates": [88.3616, 22.5015]},
        "categories": ["Streetwear", "Formals"],
        "rating": 4.8,
        "total_orders": 248,
        "active": True,
        "operating_hours": {"open": "09:00", "close": "21:00"},
        "created_at": datetime.now(timezone.utc),
    },
    {
        "_id": store_b_id,
        "name": "Boutique B — Park Street Trends",
        "owner_id": "owner_002",
        "phone": "+919876543211",
        "email": "boutiqueB@quickstyle.io",
        "address": "Park Street",
        "area": "Park Street",
        "city": "Kolkata",
        "pincode": "700016",
        "location": {"type": "Point", "coordinates": [88.3524, 22.5555]},
        "categories": ["Streetwear", "Activewear"],
        "rating": 4.7,
        "total_orders": 189,
        "active": True,
        "operating_hours": {"open": "10:00", "close": "22:00"},
        "created_at": datetime.now(timezone.utc),
    },
    {
        "_id": store_c_id,
        "name": "Boutique C — Salt Lake Knits",
        "owner_id": "owner_003",
        "phone": "+919876543212",
        "email": "boutiqueC@quickstyle.io",
        "address": "City Centre 1",
        "area": "Salt Lake",
        "city": "Kolkata",
        "pincode": "700064",
        "location": {"type": "Point", "coordinates": [88.4231, 22.5804]},
        "categories": ["Loungewear", "Formals"],
        "rating": 4.9,
        "total_orders": 312,
        "active": True,
        "operating_hours": {"open": "09:30", "close": "20:30"},
        "created_at": datetime.now(timezone.utc),
    },
    {
        "_id": store_d_id,
        "name": "Boutique D — New Town Active",
        "owner_id": "owner_004",
        "phone": "+919876543213",
        "email": "boutiqueD@quickstyle.io",
        "address": "Axis Mall",
        "area": "New Town",
        "city": "Kolkata",
        "pincode": "700156",
        "location": {"type": "Point", "coordinates": [88.4633, 22.5726]},
        "categories": ["Activewear"],
        "rating": 4.6,
        "total_orders": 410,
        "active": True,
        "operating_hours": {"open": "08:00", "close": "21:00"},
        "created_at": datetime.now(timezone.utc),
    },
]

# ── Products ──────────────────────────────────────────────────────
PRODUCTS = [
{
        "name": "Obsidian Gown",
        "description": "A masterclass in minimal extravagance. The Obsidian Gown is sculpted from heavyweight Italian silk crepe, featuring a dramatic asymmetric neckline and a fluid, sweeping train.",
        "brand": "ZEVANA",
        "size_variance": 0,
        "size_note": "Fits true to size.",
        "category": "Atelier",
        "subcategory": "gowns",
        "gender": "women",
        "tags": ["gown", "silk", "black", "obsidian", "women", "formal", "atelier"],
        "outfit_tags": ["formal", "avant-garde"],
        "pairs_well_with": ["noir_stiletto", "arch_cuff"],
        "price": {"mrp": 3500, "selling_price": 3200, "discount_percent": 8},
        "sizes_available": ["XS", "S", "M", "L"],
        "colors": [{
            "name": "Vanta Black",
            "hex": "#0a0a0a",
            "images": {
                "main": "/stitch/obsidian_gown.jpg",
                "gallery": ["/stitch/gown_detail1.jpg", "/stitch/gown_detail2.jpg"],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_a_id),
        "store_name": "Boutique A — South City Luxe",
        "store_location": {"type": "Point", "coordinates": [88.3616, 22.5015]},
        "stock": {"XS": 1, "S": 2, "M": 1, "L": 0},
        "embedding": [],
        "rating": {"average": 4.9, "count": 24},
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Obsidian Ribbed Knit",
        "description": "Minimalist black turtleneck sweater. Crafted from a fine knit fabric that offers a soft sheen.",
        "brand": "ZEVANA",
        "size_variance": 0,
        "size_note": "True to size.",
        "category": "Runway",
        "subcategory": "sweaters",
        "gender": "men",
        "tags": ["knit", "sweater", "black", "obsidian", "men", "minimalist"],
        "outfit_tags": ["casual", "minimalist"],
        "pairs_well_with": ["precision_trousers", "combat_boot"],
        "price": {"mrp": 295, "selling_price": 245, "discount_percent": 16},
        "sizes_available": ["S", "M", "L", "XL"],
        "colors": [{
            "name": "Obsidian",
            "hex": "#1a1a1a",
            "images": {
                "main": "/stitch/ribbed_knit.jpg",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_b_id),
        "store_name": "Boutique B — Park Street Trends",
        "store_location": {"type": "Point", "coordinates": [88.3524, 22.5555]},
        "stock": {"S": 3, "M": 5, "L": 4, "XL": 2},
        "embedding": [],
        "rating": {"average": 4.8, "count": 89},
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Architectural Blazer",
        "description": "Charcoal grey structured blazer. Precise tailoring with matte texture wool blend fabric and geometric lines.",
        "brand": "ZEVANA",
        "size_variance": 0,
        "size_note": "True to size.",
        "category": "Editorial",
        "subcategory": "blazers",
        "gender": "men",
        "tags": ["blazer", "tailored", "charcoal", "grey", "men", "architectural"],
        "outfit_tags": ["formal", "sophisticated"],
        "pairs_well_with": ["precision_trousers"],
        "price": {"mrp": 1050, "selling_price": 890, "discount_percent": 15},
        "sizes_available": ["48", "50", "52", "54"],
        "colors": [{
            "name": "Charcoal",
            "hex": "#36454F",
            "images": {
                "main": "/stitch/arch_blazer.jpg",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_a_id),
        "store_name": "Boutique A — South City Luxe",
        "store_location": {"type": "Point", "coordinates": [88.3616, 22.5015]},
        "stock": {"48": 2, "50": 3, "52": 1, "54": 1},
        "embedding": [],
        "rating": {"average": 5.0, "count": 12},
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Monolith Combat Boot",
        "description": "Heavy, matte black combat boots with silver hardware details. Dark, industrial, and high-end.",
        "brand": "ZEVANA",
        "size_variance": 0,
        "size_note": "True to size.",
        "category": "Runway",
        "subcategory": "footwear",
        "gender": "unisex",
        "tags": ["boots", "combat", "black", "leather", "unisex"],
        "outfit_tags": ["edgy", "industrial"],
        "pairs_well_with": ["precision_trousers"],
        "price": {"mrp": 750, "selling_price": 650, "discount_percent": 13},
        "sizes_available": ["40", "41", "42", "43", "44"],
        "colors": [{
            "name": "Matte Black",
            "hex": "#111111",
            "images": {
                "main": "/stitch/combat_boot.jpg",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_b_id),
        "store_name": "Boutique B — Park Street Trends",
        "store_location": {"type": "Point", "coordinates": [88.3524, 22.5555]},
        "stock": {"40": 4, "41": 5, "42": 3, "43": 2, "44": 1},
        "embedding": [],
        "rating": {"average": 4.7, "count": 45},
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Core Heavyweight Tee",
        "description": "Minimalist white t-shirt with thick and premium fabric. Refined casual aesthetic.",
        "brand": "ZEVANA",
        "size_variance": 0,
        "size_note": "Oversized fit.",
        "category": "Atelier",
        "subcategory": "tees",
        "gender": "unisex",
        "tags": ["tee", "white", "heavyweight", "casual", "unisex"],
        "outfit_tags": ["casual", "minimalist"],
        "pairs_well_with": ["precision_trousers", "combat_boot"],
        "price": {"mrp": 150, "selling_price": 120, "discount_percent": 20},
        "sizes_available": ["S", "M", "L", "XL"],
        "colors": [{
            "name": "Optic White",
            "hex": "#FFFFFF",
            "images": {
                "main": "/stitch/heavyweight_tee.jpg",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_c_id),
        "store_name": "Boutique C — Salt Lake Knits",
        "store_location": {"type": "Point", "coordinates": [88.4231, 22.5804]},
        "stock": {"S": 10, "M": 15, "L": 12, "XL": 8},
        "embedding": [],
        "rating": {"average": 4.9, "count": 210},
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Silk Drape Tunic",
        "description": "Dark silk garment draping softly, creating fluid, silver-like highlights against deep shadows.",
        "brand": "ZEVANA",
        "size_variance": 0,
        "size_note": "Relaxed fit.",
        "category": "Runway",
        "subcategory": "tops",
        "gender": "women",
        "tags": ["tunic", "silk", "black", "drape", "women"],
        "outfit_tags": ["elegant", "avant-garde"],
        "pairs_well_with": ["precision_trousers"],
        "price": {"mrp": 550, "selling_price": 480, "discount_percent": 12},
        "sizes_available": ["XS", "S", "M", "L"],
        "colors": [{
            "name": "Midnight",
            "hex": "#191970",
            "images": {
                "main": "/stitch/silk_tunic.jpg",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_a_id),
        "store_name": "Boutique A — South City Luxe",
        "store_location": {"type": "Point", "coordinates": [88.3616, 22.5015]},
        "stock": {"XS": 2, "S": 4, "M": 3, "L": 1},
        "embedding": [],
        "rating": {"average": 4.8, "count": 34},
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Precision Cut Trousers",
        "description": "Sharply tailored trousers in a deep charcoal grey. Straight leg cut and clean break.",
        "brand": "ZEVANA",
        "size_variance": 0,
        "size_note": "True to size.",
        "category": "Editorial",
        "subcategory": "bottoms",
        "gender": "men",
        "tags": ["trousers", "charcoal", "grey", "tailored", "men"],
        "outfit_tags": ["formal", "sophisticated"],
        "pairs_well_with": ["arch_blazer", "combat_boot"],
        "price": {"mrp": 380, "selling_price": 320, "discount_percent": 15},
        "sizes_available": ["30", "32", "34", "36"],
        "colors": [{
            "name": "Charcoal Grey",
            "hex": "#36454F",
            "images": {
                "main": "/stitch/precision_trousers.jpg",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_b_id),
        "store_name": "Boutique B — Park Street Trends",
        "store_location": {"type": "Point", "coordinates": [88.3524, 22.5555]},
        "stock": {"30": 5, "32": 7, "34": 4, "36": 2},
        "embedding": [],
        "rating": {"average": 4.7, "count": 56},
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Architectural Cuff",
        "description": "Striking, geometric silver bangle bracelet. Modern, architectural design.",
        "brand": "ZEVANA",
        "size_variance": 0,
        "size_note": "One size fits all.",
        "category": "Accessories",
        "subcategory": "jewelry",
        "gender": "unisex",
        "tags": ["cuff", "bracelet", "silver", "jewelry", "unisex", "accessories"],
        "outfit_tags": ["avant-garde"],
        "pairs_well_with": ["obsidian_gown", "silk_tunic"],
        "price": {"mrp": 500, "selling_price": 450, "discount_percent": 10},
        "sizes_available": ["OS"],
        "colors": [{
            "name": "Silver",
            "hex": "#C0C0C0",
            "images": {
                "main": "/stitch/arch_cuff.jpg",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_c_id),
        "store_name": "Boutique C — Salt Lake Knits",
        "store_location": {"type": "Point", "coordinates": [88.4231, 22.5804]},
        "stock": {"OS": 10},
        "embedding": [],
        "rating": {"average": 4.9, "count": 15},
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Noir Stiletto",
        "description": "Sleek, black pointed-toe stiletto heels standing on a mirrored surface. Elegant and minimalist.",
        "brand": "ZEVANA",
        "size_variance": 0,
        "size_note": "True to size.",
        "category": "Runway",
        "subcategory": "footwear",
        "gender": "women",
        "tags": ["stiletto", "heels", "black", "leather", "women", "footwear"],
        "outfit_tags": ["formal", "elegant"],
        "pairs_well_with": ["obsidian_gown"],
        "price": {"mrp": 950, "selling_price": 890, "discount_percent": 6},
        "sizes_available": ["36", "37", "38", "39", "40", "41"],
        "colors": [{
            "name": "Patent Black",
            "hex": "#000000",
            "images": {
                "main": "/stitch/noir_stiletto.jpg",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_d_id),
        "store_name": "Boutique D — New Town Active",
        "store_location": {"type": "Point", "coordinates": [88.4633, 22.5726]},
        "stock": {"36": 2, "37": 4, "38": 5, "39": 3, "40": 2, "41": 1},
        "embedding": [],
        "rating": {"average": 4.8, "count": 78},
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Minimalist Minaudiere",
        "description": "Structured black leather clutch bag with minimal silver hardware. Highlighting the texture of premium leather.",
        "brand": "ZEVANA",
        "size_variance": 0,
        "size_note": "One size fits all.",
        "category": "Accessories",
        "subcategory": "bags",
        "gender": "women",
        "tags": ["clutch", "bag", "black", "leather", "women", "accessories"],
        "outfit_tags": ["formal", "elegant"],
        "pairs_well_with": ["obsidian_gown", "noir_stiletto"],
        "price": {"mrp": 1400, "selling_price": 1200, "discount_percent": 14},
        "sizes_available": ["OS"],
        "colors": [{
            "name": "Black",
            "hex": "#000000",
            "images": {
                "main": "/stitch/minaudiere.jpg",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_a_id),
        "store_name": "Boutique A — South City Luxe",
        "store_location": {"type": "Point", "coordinates": [88.3616, 22.5015]},
        "stock": {"OS": 5},
        "embedding": [],
        "rating": {"average": 5.0, "count": 9},
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
{
        "name": "Apex Tech Hoodie",
        "description": "Premium fleece-lined tech hoodie with mesh ventilation panels. Designed for urban mobility with hidden zip pockets.",
        "brand": "QUICK_STYLE Originals",
        "size_variance": 0,
        "size_note": "True to size. Size up for oversized fit.",
        "category": "Streetwear",
        "subcategory": "hoodies",
        "gender": "men",
        "tags": ["hoodie", "tech", "streetwear", "lavender", "fleece", "urban", "men"],
        "outfit_tags": ["streetwear", "casual", "urban"],
        "pairs_well_with": ["cargo_pants", "white_sneakers", "crossbody_bag"],
        "price": {"mrp": 2999, "selling_price": 1999, "discount_percent": 33},
        "sizes_available": ["S", "M", "L", "XL"],
        "colors": [{
            "name": "Lavender",
            "hex": "#B57BEE",
            "images": {
                "main": "/photos/hoodie_tech/main.png",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_a_id),
        "store_name": "Boutique A — South City Luxe",
        "store_location": {"type": "Point", "coordinates": [88.3616, 22.5015]},
        "stock": {"S": 2, "M": 3, "L": 1, "XL": 2},
        "embedding": [],
        "rating": {"average": 4.9, "count": 148},
        "fit_confidence_avg": 94,
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Vanguard Utility Jacket",
        "description": "Military-inspired multi-pocket techwear jacket with water-resistant shell and adjustable hood.",
        "brand": "Vanguard",
        "size_variance": 1,
        "size_note": "This brand runs large — consider sizing down.",
        "category": "Streetwear",
        "subcategory": "jackets",
        "gender": "men",
        "tags": ["jacket", "techwear", "utility", "military", "waterproof", "pockets", "men"],
        "outfit_tags": ["techwear", "urban", "edgy"],
        "pairs_well_with": ["slim_fit_joggers", "chunky_boots", "tactical_bag"],
        "price": {"mrp": 5999, "selling_price": 3999, "discount_percent": 33},
        "sizes_available": ["M", "L", "XL"],
        "colors": [{
            "name": "Obsidian",
            "hex": "#1A1A2E",
            "images": {
                "main": "/photos/jacket_utility/main.png",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_b_id),
        "store_name": "Boutique B — Park Street Trends",
        "store_location": {"type": "Point", "coordinates": [88.3524, 22.5555]},
        "stock": {"M": 1, "L": 0, "XL": 1},
        "embedding": [],
        "rating": {"average": 4.8, "count": 89},
        "fit_confidence_avg": 92,
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Amethyst Knit Sweater",
        "description": "Luxurious merino blend knit with relaxed dropped-shoulder silhouette. Perfect for smart-casual and presentations.",
        "brand": "LuxeKnit",
        "size_variance": -1,
        "size_note": "Runs slightly small. Consider sizing up.",
        "category": "Loungewear",
        "subcategory": "sweaters",
        "gender": "unisex",
        "tags": ["knit", "sweater", "merino", "amethyst", "luxury", "cozy", "formal", "unisex"],
        "outfit_tags": ["smart_casual", "cozy_luxe", "minimalist"],
        "pairs_well_with": ["tailored_trousers", "loafers", "leather_tote"],
        "price": {"mrp": 3999, "selling_price": 2499, "discount_percent": 37},
        "sizes_available": ["XS", "S", "M", "L"],
        "colors": [{
            "name": "Amethyst",
            "hex": "#9B59B6",
            "images": {
                "main": "/photos/sweater_knit/main.png",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_c_id),
        "store_name": "Boutique C — Salt Lake Knits",
        "store_location": {"type": "Point", "coordinates": [88.4231, 22.5804]},
        "stock": {"XS": 3, "S": 5, "M": 2, "L": 4},
        "embedding": [],
        "rating": {"average": 4.7, "count": 201},
        "fit_confidence_avg": 96,
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Aero-Knit Activewear Tee",
        "description": "High-performance moisture-wicking activewear top with 4-way stretch and flatlock seams.",
        "brand": "AeroFit",
        "size_variance": 0,
        "size_note": "True to size. Size up for looser athletic fit.",
        "category": "Activewear",
        "subcategory": "tees",
        "gender": "unisex",
        "tags": ["tee", "activewear", "gym", "moisture-wicking", "coral", "performance", "unisex"],
        "outfit_tags": ["athletic", "sporty", "performance"],
        "pairs_well_with": ["jogger_shorts", "running_shoes", "gym_bag"],
        "price": {"mrp": 1999, "selling_price": 1299, "discount_percent": 35},
        "sizes_available": ["S", "M", "L", "XL", "XXL"],
        "colors": [{
            "name": "Electric Coral",
            "hex": "#FF6B6B",
            "images": {
                "main": "/photos/tshirt_coral/main.png",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_d_id),
        "store_name": "Boutique D — New Town Active",
        "store_location": {"type": "Point", "coordinates": [88.4633, 22.5726]},
        "stock": {"S": 8, "M": 12, "L": 7, "XL": 5, "XXL": 3},
        "embedding": [],
        "rating": {"average": 4.6, "count": 320},
        "fit_confidence_avg": 98,
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Obsidian Formal Blazer",
        "description": "Tailored single-breasted blazer in premium obsidian wool blend. Structured shoulder with notched lapel.",
        "brand": "FormCraft",
        "size_variance": 0,
        "size_note": "True to size. Key measurement: chest circumference.",
        "category": "Formals",
        "subcategory": "blazers",
        "gender": "men",
        "tags": ["blazer", "formal", "obsidian", "wool", "tailored", "office", "interview", "men"],
        "outfit_tags": ["formal", "business", "power_dressing"],
        "pairs_well_with": ["dress_trousers", "oxford_shoes", "pocket_square"],
        "price": {"mrp": 8999, "selling_price": 5999, "discount_percent": 33},
        "sizes_available": ["S", "M", "L", "XL"],
        "colors": [{
            "name": "Obsidian",
            "hex": "#1C1C1E",
            "images": {
                "main": "/photos/blazer_formal/main.png",
                "gallery": [],
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": str(store_a_id),
        "store_name": "Boutique A — South City Luxe",
        "store_location": {"type": "Point", "coordinates": [88.3616, 22.5015]},
        "stock": {"S": 1, "M": 2, "L": 1, "XL": 0},
        "embedding": [],
        "rating": {"average": 4.9, "count": 67},
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Honky Tonky Women Fit and Flare Dress",
        "description": "Women Fit and Flare Black, White Above Knee/Mid Thigh Length Dress in comfortable crepe fabric.",
        "brand": "Honky Tonky",
        "size_variance": 0,
        "size_note": "True to size.",
        "category": "Streetwear",
        "subcategory": "dresses",
        "gender": "women",
        "tags": ["dress", "women", "western", "black", "white", "flare", "striped", "women"],
        "outfit_tags": ["casual", "western", "party"],
        "pairs_well_with": ["heels", "sling_bag"],
        "price": {"mrp": 999, "selling_price": 324, "discount_percent": 68},
        "sizes_available": ["S", "M", "L", "XL", "XXL"],
        "colors": [{
            "name": "Black & White Striped",
            "hex": "#000000",
            "images": {
                "main": "/photos/dress_black_striped/main.jpg",
                "gallery": ["/photos/dress_black_striped/angle_2.jpg"],
                "frames_360": ["/photos/dress_black_striped/main.jpg", "/photos/dress_black_striped/angle_2.jpg"],
                "has_360": True
            }
        }],
        "store_id": str(store_b_id),
        "store_name": "Boutique B — Park Street Trends",
        "store_location": {"type": "Point", "coordinates": [88.3524, 22.5555]},
        "stock": {"S": 12, "M": 15, "L": 10, "XL": 4, "XXL": 2},
        "embedding": [],
        "rating": {"average": 4.1, "count": 1200},
        "fit_confidence_avg": 92,
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Trendy AAYU Women Shirt Brown Midi",
        "description": "Elegant brown midi shirt dress with button-down design and side slit.",
        "brand": "AAYU",
        "size_variance": -1,
        "size_note": "Runs slightly small around bust.",
        "category": "Streetwear",
        "subcategory": "dresses",
        "gender": "women",
        "tags": ["dress", "women", "western", "brown", "midi", "shirt", "women"],
        "outfit_tags": ["casual", "smart_casual"],
        "pairs_well_with": ["sandals", "tote_bag"],
        "price": {"mrp": 2999, "selling_price": 618, "discount_percent": 79},
        "sizes_available": ["S", "M", "L", "XL"],
        "colors": [{
            "name": "Brown",
            "hex": "#5C4033",
            "images": {
                "main": "/photos/dress_brown_midi/main.jpg",
                "gallery": ["/photos/dress_brown_midi/angle_2.jpg"],
                "frames_360": ["/photos/dress_brown_midi/main.jpg", "/photos/dress_brown_midi/angle_2.jpg"],
                "has_360": True
            }
        }],
        "store_id": str(store_c_id),
        "store_name": "Boutique C — Salt Lake Knits",
        "store_location": {"type": "Point", "coordinates": [88.4231, 22.5804]},
        "stock": {"S": 5, "M": 8, "L": 4, "XL": 1},
        "embedding": [],
        "rating": {"average": 4.0, "count": 3000},
        "fit_confidence_avg": 89,
        "active": True,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "V-MART Women A-line Light Blue Dress",
        "description": "Beautiful light blue A-line dress with subtle ruffle detailing, perfect for summer.",
        "brand": "V-MART",
        "size_variance": 0,
        "size_note": "True to size.",
        "category": "Streetwear",
        "subcategory": "dresses",
        "gender": "women",
        "tags": ["dress", "women", "western", "blue", "a-line", "summer", "women"],
        "outfit_tags": ["casual", "summer", "beach"],
        "pairs_well_with": ["white_sneakers", "sunglasses"],
        "price": {"mrp": 999, "selling_price": 899, "discount_percent": 10},
        "sizes_available": ["M", "L", "XL"],
        "colors": [{
            "name": "Light Blue",
            "hex": "#ADD8E6",
            "images": {
                "main": "/photos/dress_blue_aline/main.jpg",
                "gallery": ["/photos/dress_blue_aline/angle_2.jpg"],
                "frames_360": ["/photos/dress_blue_aline/main.jpg", "/photos/dress_blue_aline/angle_2.jpg"],
                "has_360": True
            }
        }],
        "store_id": str(store_d_id),
        "store_name": "Boutique D — New Town Active",
        "store_location": {"type": "Point", "coordinates": [88.4633, 22.5726]},
        "stock": {"M": 20, "L": 15, "XL": 10},
        "embedding": [],
        "rating": {"average": 4.3, "count": 450},
        "fit_confidence_avg": 95,
        "active": True,
        "created_at": datetime.now(timezone.utc),
    }
]

# ── Demo User (Admin in Kolkata) ─────────────────────────────────────────────────────
DEMO_USER = {
    "name": "Admin User",
    "email": "admin@quickstyle.io",
    "phone": "+919876543000",
    "password_hash": hashlib.sha256("admin1234".encode()).hexdigest(),
    "role": "admin",
    "profile_photo_url": None,
    "addresses": [{
        "label": "Home",
        "street": "Jadavpur University Road",
        "area": "Jadavpur",
        "city": "Kolkata",
        "pincode": "700032",
        "location": {"lat": 22.4981, "lon": 88.3653},
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
    "created_at": datetime.now(timezone.utc),
    "last_active": datetime.now(timezone.utc),
}

# ── Delivery Partners ─────────────────────────────────────────────────────
DELIVERY_PARTNERS = [
    {
        "name": "Ramesh Singh",
        "phone": "+919876543001",
        "vehicle": "bike",
        "status": "vacant",
        "current_location": {"type": "Point", "coordinates": [88.3620, 22.5020]}, # Near South City
    },
    {
        "name": "Sukanta Das",
        "phone": "+919876543002",
        "vehicle": "scooter",
        "status": "vacant",
        "current_location": {"type": "Point", "coordinates": [88.3530, 22.5560]}, # Near Park Street
    },
    {
        "name": "Amit Roy",
        "phone": "+919876543003",
        "vehicle": "bike",
        "status": "vacant",
        "current_location": {"type": "Point", "coordinates": [88.4235, 22.5810]}, # Near Salt Lake
    },
    {
        "name": "Souvik Banerjee",
        "phone": "+919876543004",
        "vehicle": "scooter",
        "status": "vacant",
        "current_location": {"type": "Point", "coordinates": [88.4635, 22.5730]}, # Near New Town
    },
    {
        "name": "Prakash Sen",
        "phone": "+919876543005",
        "vehicle": "bike",
        "status": "vacant",
        "current_location": {"type": "Point", "coordinates": [88.3650, 22.4980]}, # Near Jadavpur
    }
]

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
    await db.users.drop()
    await db.users.create_index("email", unique=True)
    await db.users.create_index("phone", unique=True)
    await db.users.replace_one(
        {"email": DEMO_USER["email"]},
        DEMO_USER,
        upsert=True
    )
    print("✅ Admin user seeded (admin@quickstyle.io / admin1234)")

    # ── Delivery Partners ─────────────────────────────────
    await db.delivery_partners.drop()
    await db.delivery_partners.create_index([("current_location", "2dsphere")])
    result = await db.delivery_partners.insert_many(DELIVERY_PARTNERS)
    print(f"✅ Seeded {len(result.inserted_ids)} delivery partners")

    client.close()
    print("\n🎉 Atlas seed complete! Collections: stores, products, users, delivery_partners")
    print(f"📊 View at: https://cloud.mongodb.com → Cluster0 → quick_style_db")


if __name__ == "__main__":
    asyncio.run(seed())
