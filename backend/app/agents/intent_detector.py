from langchain_google_genai import ChatGoogleGenerativeAI
import json

async def intent_detector_node(state: dict) -> dict:
    """
    Extracts entities from the user's raw query before passing to Stylist.
    """
    query = state.get("raw_query", "")
    
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
    
    prompt = f"""
    Analyze the user's query and determine if it is a shopping request (e.g., looking for clothes, shoes, styling) or just a conversational greeting/general chat.
    Extract the following entities:
    - is_shopping (boolean: true if looking for clothes/items or styling advice/combinations, false if greeting or off-topic)
    - conversational_reply (string: if is_shopping is false, write a friendly AI stylist greeting or response. If true, set to null)
    - color (string or null)
    - occasion (string or null, e.g. formal, casual, party, gym, presentation)
    - budget (number or null)
    - size (string or null, e.g. S, M, L, XL)
    - search_keywords (string or null: the target clothing item or category keywords to search for, e.g. "hoodie", "jacket", "blazer", "tee", "sweater", "sneakers", "pants", or null if not applicable)
    - wants_combination (boolean: true if they want matching items, combinations, completing an outfit, pairing something, or coordinating products)
    - combination_target (string or null: the product name or item type they want to find matches for)
    - multiple_designs (boolean: true if they want to see all designs, multiple options, variety of styles, or different colors)
    
    Query: "{query}"
    
    Respond in JSON format ONLY:
    {{
      "is_shopping": true,
      "conversational_reply": null,
      "color": "...",
      "occasion": "...",
      "budget": 1000,
      "size": "M",
      "search_keywords": "hoodie",
      "wants_combination": false,
      "combination_target": null,
      "multiple_designs": false
    }}
    """
    
    try:
        response = llm.invoke(prompt)
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
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

