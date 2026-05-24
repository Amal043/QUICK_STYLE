"""
MongoDB Atlas Connection Manager
Async motor client — singleton pattern for FastAPI lifespan.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

mongo = MongoDB()


async def connect_to_mongo():
    """Open Atlas connection on app startup."""
    print("Connecting to MongoDB Atlas...")
    mongo.client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000,
    )
    mongo.db = mongo.client[settings.MONGODB_DB_NAME]
    # Ping to verify connection
    await mongo.client.admin.command("ping")
    print(f"Connected to MongoDB Atlas — db: [{settings.MONGODB_DB_NAME}]")


async def close_mongo_connection():
    """Close Atlas connection on app shutdown."""
    if mongo.client:
        mongo.client.close()
        print("MongoDB Atlas connection closed")


def get_db() -> AsyncIOMotorDatabase:
    """Dependency injection — returns the active database instance."""
    return mongo.db
