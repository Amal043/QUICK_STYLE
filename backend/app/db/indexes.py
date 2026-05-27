"""
Database Indexes — Run once on startup to ensure optimal query performance.
Covers: geo queries, text search, uniqueness, and TTL expiry.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING, GEOSPHERE, TEXT


async def create_indexes(db: AsyncIOMotorDatabase):
    print("Creating MongoDB indexes...")

    # ── users ──────────────────────────────────────────────────────
    await db.users.create_index("email", unique=True)
    try:
        await db.users.create_index("phone", unique=True, sparse=True)
    except Exception as e:
        if "IndexKeySpecsConflict" in str(e) or "IndexOptionsConflict" in str(e) or "same name" in str(e):
            print("  - phone index conflict detected. Dropping old 'phone_1' index and recreating...")
            try:
                await db.users.drop_index("phone_1")
                await db.users.create_index("phone", unique=True, sparse=True)
            except Exception as drop_err:
                print(f"  - Failed to drop conflicting phone index: {drop_err}. Retrying with custom name...")
                await db.users.create_index("phone", unique=True, sparse=True, name="phone_unique_sparse")
        else:
            raise e
    await db.users.create_index("role")
    await db.users.create_index("last_active")
    print("  - users indexes")

    # ── products ───────────────────────────────────────────────────
    await db.products.create_index("store_id")
    await db.products.create_index("category")
    await db.products.create_index("subcategory")
    await db.products.create_index("active")
    await db.products.create_index([("name", TEXT), ("description", TEXT), ("tags", TEXT)])
    await db.products.create_index([("store_location", GEOSPHERE)])
    await db.products.create_index("price.selling_price")
    await db.products.create_index([("rating.average", DESCENDING)])
    await db.products.create_index([("fit_confidence_avg", DESCENDING)])
    await db.products.create_index([("created_at", DESCENDING)])
    print("  - products indexes (geo + text + compound)")

    # ── orders ─────────────────────────────────────────────────────
    await db.orders.create_index("user_id")
    await db.orders.create_index("store_id")
    await db.orders.create_index("status")
    await db.orders.create_index([("created_at", DESCENDING)])
    await db.orders.create_index("order_number", unique=True)
    print("  - orders indexes")

    # ── stores (boutiques) ────────────────────────────────────────
    await db.stores.create_index([("location", GEOSPHERE)])
    await db.stores.create_index("active")
    await db.stores.create_index("owner_id")
    await db.stores.create_index([("name", TEXT)])
    print("  - stores indexes (geo)")

    # ── tracking ──────────────────────────────────────────────────
    await db.tracking.create_index("order_id", unique=True)
    await db.tracking.create_index("rider_id")
    await db.tracking.create_index("status")
    # TTL — auto-delete tracking docs 24h after delivery
    await db.tracking.create_index(
        "delivered_at",
        expireAfterSeconds=86400,
        sparse=True
    )
    print("  - tracking indexes (TTL=24h)")

    # ── notifications ─────────────────────────────────────────────
    await db.notifications.create_index("user_id")
    await db.notifications.create_index([("sent_at", DESCENDING)])
    # TTL — auto-delete notifications after 30 days
    await db.notifications.create_index(
        "sent_at",
        expireAfterSeconds=2592000
    )
    print("  - notifications indexes (TTL=30d)")

    print("All indexes created successfully")
