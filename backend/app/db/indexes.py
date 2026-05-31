"""
Database Indexes — Run once on startup to ensure optimal query performance.
Covers: geo queries, text search, uniqueness, and TTL expiry.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING, GEOSPHERE, TEXT


async def create_indexes(db: AsyncIOMotorDatabase):
    print("Creating MongoDB indexes...")
    import pymongo.errors
    
    async def safe_create_index(collection, *args, **kwargs):
        try:
            await collection.create_index(*args, **kwargs)
        except pymongo.errors.OperationFailure as e:
            print(f"Warning: Index creation failed on {collection.name}: {e.details.get('errmsg', str(e))}")

    # ── users ──────────────────────────────────────────────────────
    await safe_create_index(db.users, "email", unique=True)
    await safe_create_index(db.users, "phone", unique=True, sparse=True)
    await safe_create_index(db.users, "role")
    await safe_create_index(db.users, "last_active")
    print("  - users indexes")

    # ── products ───────────────────────────────────────────────────
    await safe_create_index(db.products, "store_id")
    await safe_create_index(db.products, "category")
    await safe_create_index(db.products, "subcategory")
    await safe_create_index(db.products, "active")
    await safe_create_index(db.products, [("name", TEXT), ("description", TEXT), ("tags", TEXT)])
    await safe_create_index(db.products, [("store_location", GEOSPHERE)])
    await safe_create_index(db.products, "price.selling_price")
    await safe_create_index(db.products, [("rating.average", DESCENDING)])
    await safe_create_index(db.products, [("fit_confidence_avg", DESCENDING)])
    await safe_create_index(db.products, [("created_at", DESCENDING)])
    print("  - products indexes (geo + text + compound)")

    # ── orders ─────────────────────────────────────────────────────
    await safe_create_index(db.orders, "user_id")
    await safe_create_index(db.orders, "store_id")
    await safe_create_index(db.orders, "status")
    await safe_create_index(db.orders, [("created_at", DESCENDING)])
    await safe_create_index(db.orders, "order_number", unique=True)
    print("  - orders indexes")

    # ── stores (boutiques) ────────────────────────────────────────
    await safe_create_index(db.stores, [("location", GEOSPHERE)])
    await safe_create_index(db.stores, "active")
    await safe_create_index(db.stores, "owner_id")
    await safe_create_index(db.stores, [("name", TEXT)])
    print("  - stores indexes (geo)")

    # ── tracking ──────────────────────────────────────────────────
    await safe_create_index(db.tracking, "order_id", unique=True)
    await safe_create_index(db.tracking, "rider_id")
    await safe_create_index(db.tracking, "status")
    # TTL — auto-delete tracking docs 24h after delivery
    await safe_create_index(db.tracking, 
        "delivered_at",
        expireAfterSeconds=86400,
        sparse=True
    )
    print("  - tracking indexes (TTL=24h)")

    # ── notifications ─────────────────────────────────────────────
    await safe_create_index(db.notifications, "user_id")
    await safe_create_index(db.notifications, [("sent_at", DESCENDING)])
    # TTL — auto-delete notifications after 30 days
    await safe_create_index(db.notifications, 
        "sent_at",
        expireAfterSeconds=2592000
    )
    print("  - notifications indexes (TTL=30d)")

    print("All indexes created successfully")
