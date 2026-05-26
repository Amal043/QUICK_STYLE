from langchain_google_genai import ChatGoogleGenerativeAI
from app.agents.tools.elastic_tools import hybrid_search
from app.agents.tools.vision_tools import analyze_style_with_vision
from app.websocket.agent_broadcaster import broadcast_agent_event
import time, json

async def stylist_node(state: dict) -> dict:
    session_id = state.get("session_id", "default")
    round_num = state.get("negotiation_round", 1)
    entities = state.get("extracted_entities", {})
    history = state.get("negotiation_history", [])

    start_ms = time.time()

    # Build exclusion list from past negotiation rounds
    excluded_brands = []
    excluded_products = []
    for past_round in history:
        if past_round.get("resolution") == "conflict":
            rejected = past_round.get("proposal", {})
            excluded_brands.append(rejected.get("brand", ""))
            excluded_products.append(rejected.get("product_id", ""))

    await broadcast_agent_event(session_id, {
        "agent": "stylist_agent",
        "action": "elasticsearch_search",
        "status": "running",
        "details": {
            "round": round_num,
            "excluded_brands": excluded_brands,
            "query": entities
        }
    })

    # Search — exclude rejected brands in filter
    results = await hybrid_search(
        query=entities.get("raw_query", ""),
        location=state.get("user_location"),
        filters={
            "size": entities.get("size"),
            "max_price": entities.get("budget"),
            "exclude_brands": excluded_brands
        },
        top_k=5
    )

    if not results:
        return {
            "stylist_proposal": None,
            "filtered_products": [],
            "agent_log": [{"agent": "stylist", "status": "no_results", "round": round_num}]
        }

    # Pick top result and form the proposal
    top_product = results[0]
    confidence = top_product.get("_score", 0.75)

    style_note = None
    if round_num == 1 and state.get("user_photo_url"):
        style_note = await analyze_style_with_vision(
            user_photo_url=state["user_photo_url"],
            product_image_url=top_product.get("images", {}).get("main", ""),
            occasion=entities.get("occasion", ""),
            session_id=session_id
        )

    proposal = {
        "product_id": str(top_product["_id"]) if "_id" in top_product else top_product.get("id"),
        "product_name": top_product.get("name", "Unknown Product"),
        "brand": top_product.get("brand", "Unknown Brand"),
        "confidence": confidence,
        "reasoning": f"Strong semantic match for {entities.get('occasion', 'occasion')}, {entities.get('color', '')}, under ₹{entities.get('budget', 'budget')}",
        "product_data": top_product
    }

    await broadcast_agent_event(session_id, {
        "agent": "stylist_agent",
        "action": "proposal_ready",
        "status": "complete",
        "details": {
            "round": round_num,
            "product": top_product.get("name", ""),
            "brand": top_product.get("brand", ""),
            "confidence": f"{confidence:.0%}"
        },
        "duration_ms": int((time.time() - start_ms) * 1000),
        "negotiation_line": f"👗 Stylist Agent → Recommending: {top_product.get('name')} (confidence: {confidence:.0%})"
    })

    return {
        "stylist_proposal": proposal,
        "filtered_products": results,
        "style_note": style_note,
        "agent_log": [{"agent": "stylist", "proposal": top_product.get("name"), "round": round_num}]
    }
