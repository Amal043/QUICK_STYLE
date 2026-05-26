from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.db.connection import get_db
from app.agents.supervisor import negotiation_graph
from app.agents.safety_agent import pre_retrieval_guardrail, post_retrieval_guardrail
from app.websocket.connection_manager import manager

router = APIRouter()

class ChatMessage(BaseModel):
    session_id: str
    message: str
    user_id: Optional[str] = None
    location: str = "NIT Jamshedpur Campus"
    user_photo_url: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    product_recommendations: list[dict] = []
    timestamp: str

@router.post("/message", response_model=ChatResponse)
async def send_message(body: ChatMessage, db=Depends(get_db)):
    """Process a user chat message using the multi-agent Negotiation Graph."""
    
    # Pre-Retrieval Guardrail
    is_safe, error_msg = await pre_retrieval_guardrail(body.message)
    if not is_safe:
        return ChatResponse(
            session_id=body.session_id,
            reply=f"Message blocked by Safety Policy Checker: {error_msg}",
            product_recommendations=[],
            timestamp=datetime.utcnow().isoformat(),
        )
    
    initial_state = {
        "session_id": body.session_id,
        "user_id": body.user_id,
        "user_location": {"address": body.location},
        "user_photo_url": body.user_photo_url,
        "raw_query": body.message,
        "extracted_entities": {},
        "negotiation_round": 1,
        "negotiation_history": [],
        "negotiation_complete": False,
        "stylist_proposal": None,
        "anti_return_verdict": None,
        "filtered_products": [],
        "agent_log": []
    }
    
    # Run intent detector first
    from app.agents.intent_detector import intent_detector_node
    intent_state = await intent_detector_node(initial_state)
    initial_state.update(intent_state)
    
    extracted = intent_state.get("extracted_entities", {})
    if extracted.get("is_shopping") is False and extracted.get("conversational_reply"):
        return ChatResponse(
            session_id=body.session_id,
            reply=extracted["conversational_reply"],
            product_recommendations=[],
            timestamp=datetime.utcnow().isoformat(),
        )
    
    # Run the graph
    final_state = await negotiation_graph.ainvoke(initial_state)
    
    # Determine the reply
    reply = "Here's what I found for you!"
    recommendations = []
    
    if final_state.get("stylist_proposal"):
        proposal = final_state["stylist_proposal"]
        recommendations.append(proposal.get("product_data", {}))
        
        if final_state.get("negotiation_complete"):
            if "conflict" not in [h.get("resolution") for h in final_state.get("negotiation_history", [])]:
                reply = f"I found the perfect match: {proposal.get('product_name')}. It has an excellent fit confidence!"
            else:
                reply = f"After some debate with our Anti-Return system, we settled on the {proposal.get('product_name')}. Note: there might be a slight fit risk based on past returns, but it's the closest match."
        else:
             reply = f"I'm suggesting the {proposal.get('product_name')}, but our agents are still verifying fit."
    else:
        reply = "I couldn't find any products matching your exact criteria right now. Could you try adjusting your budget or style?"
        
    # Post-Retrieval Guardrail
    safe_reply = await post_retrieval_guardrail(reply)
        
    return ChatResponse(
        session_id=body.session_id,
        reply=safe_reply,
        product_recommendations=recommendations,
        timestamp=datetime.utcnow().isoformat(),
    )

@router.websocket("/{session_id}")
async def websocket_chat_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            # We just keep the connection open to receive broadcasted events
            data = await websocket.receive_text()
            # If client sends data, we could process it here
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
