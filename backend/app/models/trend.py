from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

class TrendItem(BaseModel):
    keyword: str
    heat_score: int
    source: str
    context: str

class TrendCreate(BaseModel):
    area: str
    city: str
    trending_items: List[TrendItem] = []
    raw_tavily_results: List[Dict[str, Any]] = []

class TrendResponse(TrendCreate):
    id: str
    fetched_at: datetime
    expires_at: datetime
