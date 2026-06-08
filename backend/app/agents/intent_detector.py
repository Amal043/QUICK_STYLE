import google.generativeai as genai
import json
import typing_extensions as typing

class IntentSchema(typing.TypedDict):
    is_shopping: bool
    conversational_reply: str | None
    color: str | None
    occasion: str | None
    budget: float | None
    size: str | None
    search_keywords: str | None
    wants_combination: bool
    combination_target: str | None
    multiple_designs: bool

async def intent_detector_node(state: dict) -> dict:
    """
    Extracts entities from the user's raw query before passing to Stylist.
    """
    query = state.get("raw_query", "")
    
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    prompt = f"""
    Analyze the user's query and determine if it is a shopping request (e.g., looking for clothes, shoes, styling) or just a conversational greeting/general chat.
    Extract the entities based on the requested JSON schema.
    
    Query: "{query}"
    """
    
    try:
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=IntentSchema,
                temperature=0.0,
            ),
        )
        content = response.text.strip()
        entities = json.loads(content)
    except Exception as e:
        print(f"Error extracting entities: {e}")
        entities = {}
        
    entities["raw_query"] = query
    
    from app.websocket.agent_broadcaster import broadcast_agent_event
    await broadcast_agent_event(state.get("session_id", "default"), {
        "agent": "intent_detector",
        "action": "extracted_entities",
        "status": "complete",
        "details": entities
    })
    
    return {"extracted_entities": entities, "agent_log": [{"agent": "intent", "action": "extract"}]}


