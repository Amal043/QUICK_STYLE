from app.agents.tools.elastic_tools import hybrid_search
from app.websocket.agent_broadcaster import broadcast_agent_event
import time

async def outfit_completion_node(state: dict) -> dict:
    session_id = state.get("session_id", "default")
    purchased_product = state.get("final_product", {})
    
    if not purchased_product:
        return {"outfit_suggestions": []}
        
    start_ms = time.time()
    
    await broadcast_agent_event(session_id, {
        "agent": "outfit_completion_agent",
        "action": "analyzing_pairs",
        "status": "running"
    })
    
    pairs_well_with = purchased_product.get("pairs_well_with", [])
    outfit_tags = purchased_product.get("outfit_tags", [])
    
    query = " ".join(pairs_well_with)
    if not query:
        query = " ".join(outfit_tags)
        
    # Search for complementary products
    results = await hybrid_search(query=query, top_k=2)
    
    # Filter out the exact same product
    product_id = purchased_product.get("_id", purchased_product.get("id"))
    filtered_results = [r for r in results if r.get("_id") != str(product_id)]
    
    await broadcast_agent_event(session_id, {
        "agent": "outfit_completion_agent",
        "action": "suggestions_ready",
        "status": "complete",
        "details": {"suggested_items": len(filtered_results)},
        "duration_ms": int((time.time() - start_ms) * 1000)
    })
    
    return {"outfit_suggestions": filtered_results}
