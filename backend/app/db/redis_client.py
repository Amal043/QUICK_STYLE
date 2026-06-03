"""Redis Cache & Connection Manager"""
import json
import redis.asyncio as redis
from app.config import settings
import asyncio
import logging

logger = logging.getLogger("redis")

class InMemoryPubSub:
    def __init__(self, parent):
        self.parent = parent
        self.channels = []
        self._queue = asyncio.Queue()

    async def subscribe(self, *channels):
        self.channels.extend(channels)
        for channel in channels:
            if channel not in self.parent.subscribers:
                self.parent.subscribers[channel] = set()
            self.parent.subscribers[channel].add(self)
        logger.info(f"Mock Redis: Subscribed to {channels}")

    async def unsubscribe(self, *channels):
        if not channels:
            channels = list(self.channels)
        for channel in channels:
            if channel in self.parent.subscribers:
                self.parent.subscribers[channel].discard(self)
            if channel in self.channels:
                self.channels.remove(channel)
        logger.info(f"Mock Redis: Unsubscribed from {channels}")

    async def get_message(self, ignore_subscribe_messages=True, timeout=1.0):
        try:
            return await asyncio.wait_for(self._queue.get(), timeout=timeout)
        except asyncio.TimeoutError:
            return None


class InMemoryRedis:
    def __init__(self):
        self.subscribers = {}
        logger.info("Using InMemoryRedis fallback")

    async def get(self, key):
        return None

    async def set(self, key, value, ex=None):
        return True

    async def publish(self, channel, message):
        logger.info(f"Mock Redis Publish on {channel}: {message}")
        if channel in self.subscribers:
            for sub in list(self.subscribers[channel]):
                await sub._queue.put({
                    "type": "message",
                    "channel": channel,
                    "data": message
                })
        return 1

    def pubsub(self):
        return InMemoryPubSub(self)


class RedisProxy:
    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self.real_client = redis.from_url(redis_url, decode_responses=True)
        self.mock_client = InMemoryRedis()
        self.is_connected = None

    async def check_connection(self):
        if self.is_connected is not None:
            return self.is_connected
        try:
            # 1.0 second timeout to ping Redis
            await asyncio.wait_for(self.real_client.ping(), timeout=1.0)
            self.is_connected = True
            logger.info("Successfully connected to Redis server.")
        except Exception as e:
            self.is_connected = False
            logger.warning(f"Failed to connect to Redis at {self.redis_url}: {e}. Falling back to InMemoryRedis.")
        return self.is_connected

    async def get(self, key):
        if await self.check_connection():
            return await self.real_client.get(key)
        return await self.mock_client.get(key)

    async def set(self, key, value, ex=None):
        if await self.check_connection():
            return await self.real_client.set(key, value, ex=ex)
        return await self.mock_client.set(key, value, ex=ex)

    async def publish(self, channel, message):
        if await self.check_connection():
            return await self.real_client.publish(channel, message)
        return await self.mock_client.publish(channel, message)

    def pubsub(self):
        if self.is_connected:
            return self.real_client.pubsub()
        return self.mock_client.pubsub()

redis_client = RedisProxy(settings.REDIS_URL)

async def publish(channel: str, message: dict):
    await redis_client.publish(channel, json.dumps(message))

async def get_redis():
    return redis_client

