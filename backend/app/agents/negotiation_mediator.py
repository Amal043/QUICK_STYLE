from app.websocket.agent_broadcaster import broadcast_agent_event
import time, json
import os

MAX_NEGOTIATION_ROUNDS = 3
CONFIDENCE_FLOOR = 0.35

async def negotiation_mediator_node(state: dict) -> dict:
    """
    Called after every Anti-Return verdict.
    Decides whether negotiation continues or is resolved.
    """
    session_id = state.get("session_id", "default")
    round_num = state.get("negotiation_round", 1)
    proposal = state.get("stylist_proposal") or {}
    verdict = state.get("anti_return_verdict") or {}
    history = state.get("negotiation_history", [])

    start_ms = time.time()

    if not verdict.get("objection_raised"):
        await broadcast_negotiation_event(session_id, {
            "type": "negotiation_resolved",
            "round": round_num,
            "resolution": "approved",
            "message": f"✅ Supervisor → Approved: {proposal.get('product_name')} (confidence: {proposal.get('confidence', 0):.0%})",
            "final_product": proposal.get("product_name"),
            "final_confidence": proposal.get("confidence")
        })
        return {
            "negotiation_complete": True,
            "negotiation_history": [{"round": round_num, "resolution": "approved", "proposal": proposal, "verdict": verdict}],
            "agent_log": [{"agent": "negotiation_mediator", "action": "approved", "round": round_num}]
        }

    if round_num < MAX_NEGOTIATION_ROUNDS:
        await broadcast_negotiation_event(session_id, {
            "type": "negotiation_conflict",
            "round": round_num,
            "message": f"⚠️ Supervisor → Conflict detected. Asking Stylist Agent to reconsider...",
            "stylist_confidence": proposal.get("confidence"),
            "anti_return_penalty": verdict.get("confidence_penalty"),
            "adjusted_confidence": verdict.get("adjusted_confidence"),
            "evidence": verdict.get("evidence", [])
        })
        return {
            "negotiation_complete": False,
            "negotiation_round": round_num + 1,
            "negotiation_history": [{"round": round_num, "resolution": "conflict", "proposal": proposal, "verdict": verdict}],
            "agent_log": [{"agent": "negotiation_mediator", "action": "conflict_round", "round": round_num}]
        }

    # Using native google-generativeai
    import google.generativeai as genai
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
    
    if os.getenv("GOOGLE_API_KEY"):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

    safety_settings = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    }

    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash-lite',
        safety_settings=safety_settings
    )
    
    force_prompt = f"""You are the Supervisor Agent mediating a conflict.

Negotiation history (last {len(history)} rounds):
{json.dumps(history, indent=2)}

Current proposal:
- Product: {proposal.get('product_name')}
- Stylist confidence: {proposal.get('confidence')}
- Adjusted after Anti-Return penalty: {verdict.get('adjusted_confidence')}
- Anti-Return evidence: {verdict.get('evidence')}

Should we:
A) Accept this product with a warning to the user about fit risk
B) Tell the user no suitable product was found and ask for different criteria

Respond with JSON: {{"decision": "accept" or "reject", "user_message": "brief message to show user"}}"""

    try:
        response = model.generate_content(
            force_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0,
                response_mime_type="application/json"
            )
        )
        content = response.text.strip()
        decision_data = json.loads(content)
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        decision_data = {"decision": "accept", "user_message": "Found a match — note there may be a slight fit risk."}

    await broadcast_negotiation_event(session_id, {
        "type": "negotiation_forced",
        "round": round_num,
        "message": f"🔨 Supervisor → Max rounds reached. Forcing decision: {decision_data['decision'].upper()}",
        "decision": decision_data["decision"]
    })

    return {
        "negotiation_complete": True,
        "negotiation_history": [{"round": round_num, "resolution": f"forced_{decision_data['decision']}", "proposal": proposal, "verdict": verdict}],
        "agent_log": [{"agent": "negotiation_mediator", "action": f"forced_{decision_data['decision']}", "round": round_num}]
    }


async def broadcast_negotiation_event(session_id: str, event: dict):
    from app.db.redis_client import publish
    enriched = {**event, "session_id": session_id, "timestamp": time.time()}
    await publish("channel:negotiation", enriched)
    await publish("channel:agents", enriched)
