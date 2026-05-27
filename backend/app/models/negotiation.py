from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class NegotiationOutcome(BaseModel):
    final_product_id: str
    final_product_name: str
    final_confidence: float
    total_rounds: int
    total_ms: int

class NegotiationRound(BaseModel):
    round: int
    stylist_recommendation: Dict[str, Any]
    anti_return_objection: Dict[str, Any]
    resolution: str

class NegotiationLogCreate(BaseModel):
    session_id: str
    user_id: str
    rounds: List[NegotiationRound] = []
    outcome: Optional[NegotiationOutcome] = None

class NegotiationLogResponse(NegotiationLogCreate):
    id: str
    triggered_at: datetime
