"""Application configuration using pydantic-settings."""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    ENV: str = "development"
    SECRET_KEY: str = "change-me-in-production"

    # MongoDB Atlas
    MONGODB_URI: str = "mongodb://localhost:27017/quick_style_db"
    MONGODB_DB_NAME: str = "quick_style_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # External APIs
    GOOGLE_MAPS_KEY: str = ""
    TAVILY_API_KEY: str = ""
    WHATSAPP_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""

    # Auth
    JWT_SECRET: str = "jwt-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:80",
        "http://localhost:3000",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
