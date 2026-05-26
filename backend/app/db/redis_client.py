"""Redis Cache & Connection Manager"""
import json
import redis.asyncio as redis
from app.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def publish(channel: str, message: dict):
    await redis_client.publish(channel, json.dumps(message))

async def get_redis():
    return redis_client
