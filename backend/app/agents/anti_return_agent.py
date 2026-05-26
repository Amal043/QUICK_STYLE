from app.db.connection import get_db
from app.websocket.agent_broadcaster import broadcast_agent_event
from bson import ObjectId
import time

CONFIDENCE_PENALTY_PER_RETURN = 0.24
OBJECTION_THRESHOLD = 0.50

async def anti_return_node(state: dict) -> dict:
    session_id = state.get("session_id", "default")
    user_id = state.get("user_id")
    proposal = state.get("stylist_proposal", {})
    round_num = state.get("negotiation_round", 1)

    if not proposal:
        return {"anti_return_verdict": {"objection_raised": False}, "fit_assessments": []}

    start_ms = time.time()

    await broadcast_agent_event(session_id, {
        "agent": "anti_return_agent",
        "action": "loading_return_history",
        "status": "running",
        "details": {"checking_brand": proposal.get("brand"), "round": round_num}
    })

    db = get_db()
    user = None
    if user_id:
        user = await db.users.find_one({"_id": ObjectId(user_id)}, {"return_history": 1, "size_profile": 1})
    
    return_history = user.get("return_history", []) if user else []

    proposed_brand = proposal.get("brand", "")
    proposed_product_id = proposal.get("product_id", "")
    original_confidence = proposal.get("confidence", 0.75)

    matching_returns = [
        r for r in return_history
        if r.get("brand", "").lower() == proposed_brand.lower()
    ]

    confidence_penalty = len(matching_returns) * CONFIDENCE_PENALTY_PER_RETURN
    adjusted_confidence = max(0, original_confidence - confidence_penalty)

    objection_raised = adjusted_confidence < OBJECTION_THRESHOLD

    evidence = [
        f"User returned {r['brand']} size {r.get('size_bought', '?')} on {r['date'].strftime('%Y-%m-%d')} ({r.get('fit_issue', 'unknown issue')})"
        for r in matching_returns
    ]

    verdict = {
        "objection_raised": objection_raised,
        "original_confidence": original_confidence,
        "confidence_penalty": confidence_penalty,
        "adjusted_confidence": adjusted_confidence,
        "matching_returns_count": len(matching_returns),
        "evidence": evidence
    }

    if objection_raised:
        negotiation_line = f"📏 Anti-Return Agent → OBJECTION: User returned {proposed_brand} {len(matching_returns)}x. Confidence drops to {adjusted_confidence:.0%}"
    else:
        negotiation_line = f"📏 Anti-Return Agent → APPROVED: No return risk for {proposed_brand} (confidence: {adjusted_confidence:.0%})"

    await broadcast_agent_event(session_id, {
        "agent": "anti_return_agent",
        "action": "verdict_complete",
        "status": "complete" if not objection_raised else "objection",
        "details": {
            "round": round_num,
            "brand": proposed_brand,
            "returns_found": len(matching_returns),
            "objection": objection_raised,
            "adjusted_confidence": f"{adjusted_confidence:.0%}"
        },
        "duration_ms": int((time.time() - start_ms) * 1000),
        "negotiation_line": negotiation_line
    })

    return {
        "anti_return_verdict": verdict,
        "fit_assessments": [{
            "product_id": proposed_product_id,
            "fit_score": int(adjusted_confidence * 100),
            "recommendation": "avoid" if objection_raised else "good_fit",
            "evidence": evidence
        }],
        "agent_log": [{"agent": "anti_return", "objection": objection_raised, "round": round_num}]
    }
