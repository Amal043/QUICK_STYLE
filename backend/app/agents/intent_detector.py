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
    - is_shopping (boolean: true if looking for clothes/items, false if greeting or off-topic)
    - conversational_reply (string: if is_shopping is false, write a friendly AI stylist greeting or response. If true, set to null)
    - color (string or null)
    - occasion (string or null, e.g. formal, casual, party)
    - budget (number or null)
    - size (string or null, e.g. S, M, L)
    
    Query: "{query}"
    
    Respond in JSON format ONLY:
    {{"is_shopping": true, "conversational_reply": null, "color": "...", "occasion": "...", "budget": 1000, "size": "M"}}
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
