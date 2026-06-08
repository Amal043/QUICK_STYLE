import os
import json
from datetime import datetime
from bson import ObjectId
import google.generativeai as genai
import google.generativeai.protos as genai_protos
from app.utils.gemini_fallback import FallbackGenerativeModel


def _make_function_response(name: str, result: dict):
    """Build a properly-typed function response Part for the Gemini SDK."""
    return genai_protos.Part(
        function_response=genai_protos.FunctionResponse(
            name=name,
            response={"result": result.get("result", str(result))}
        )
    )

from app.agents.supervisor import negotiation_graph
from app.agents.intent_detector import intent_detector_node

# Tools definitions for Gemini
search_products_tool = {
    "name": "search_products",
    "description": "Searches for clothing products, acts as a personal stylist, and finds matching outfits. Use this whenever the user wants to buy, search, or find clothing.",
    "parameters": {
        "type": "OBJECT",
        "properties": {
            "query": {"type": "STRING", "description": "The user's exact styling request or search query"}
        },
        "required": ["query"]
    }
}

navigate_ui_tool = {
    "name": "navigate_ui",
    "description": "Navigates the user to a specific page in the website frontend. Valid pages: '/collection', '/cart', '/profile', '/history'.",
    "parameters": {
        "type": "OBJECT",
        "properties": {
            "path": {"type": "STRING", "description": "The URL path to navigate to, e.g., '/cart' or '/history'"}
        },
        "required": ["path"]
    }
}

update_account_tool = {
    "name": "update_account",
    "description": "Updates the user's account details. RISKY TASK: You MUST have asked the user for explicit permission before calling this tool.",
    "parameters": {
        "type": "OBJECT",
        "properties": {
            "field": {"type": "STRING", "description": "The field to update (e.g., 'email', 'phone', 'name')"},
            "value": {"type": "STRING", "description": "The new value"}
        },
        "required": ["field", "value"]
    }
}

checkout_cart_tool = {
    "name": "checkout_cart",
    "description": "Initiates the checkout and payment process. RISKY TASK: You MUST have asked the user for explicit permission before calling this tool.",
    "parameters": {
        "type": "OBJECT",
        "properties": {},
        "required": []
    }
}

pilot_tools = [search_products_tool, navigate_ui_tool, update_account_tool, checkout_cart_tool]

async def run_pilot_agent(db, session_id: str, user_id: str, location: str, message: str) -> dict:
    """
    The master Multi-Tasking Pilot Agent.
    Manages session memory and orchestrates tasks.
    """
    # 1. Load Session Memory
    session_doc = await db.chat_sessions.find_one({"session_id": session_id})
    if not session_doc:
        session_doc = {
            "session_id": session_id,
            "user_id": user_id,
            "history": [],
            "created_at": datetime.utcnow()
        }
    
    # 2. Append User Message
    history = session_doc.get("history", [])
    history.append({"role": "user", "parts": [{"text": message}]})
    
    # Optional: Summarize history if too long to save tokens
    if len(history) > 15:
        history = history[-15:] # Naive truncate for hackathon
        
    # 3. Setup Gemini
    model = FallbackGenerativeModel(
        model_name="gemini-2.5-flash-lite",
        tools=pilot_tools,
        system_instruction=(
            "You are the QUICK_STYLE Multi-Tasking AI Pilot. You can perform complex multi-step instructions (e.g., 'Find a red shirt and buy it'). "
            "You have tools to search products, navigate the UI, update accounts, and checkout. "
            "CRITICAL: If a task is RISKY (changing account details, buying, checkout, payment), you MUST FIRST ask the user for explicit permission. "
            "Explain exactly what you are going to do and wait for them to reply 'Yes' or 'Approve'. DO NOT call the update_account or checkout_cart tool until they approve. "
            "If they give a multi-step prompt where one step is risky, you can do the safe steps (like searching products) but pause and ask permission for the risky step. "
            "When responding, format nicely with HTML (e.g. <br>, <strong>). Never use markdown block code ticks."
        )
    )
    
    def _get_function_calls(resp):
        """Extract function calls from sync or async response objects."""
        # Sync GenerateContentResponse has .function_calls directly
        if hasattr(resp, "function_calls") and resp.function_calls:
            return list(resp.function_calls)
        # AsyncGenerateContentResponse / candidates-based structure
        try:
            parts = resp.candidates[0].content.parts
            return [p.function_call for p in parts if hasattr(p, "function_call") and p.function_call]
        except Exception:
            return []

    def _get_text(resp):
        """Safely get text from sync or async response objects."""
        try:
            return (resp.text or "").strip()
        except Exception:
            pass
        try:
            parts = resp.candidates[0].content.parts
            return " ".join(p.text for p in parts if hasattr(p, "text") and p.text).strip()
        except Exception:
            return ""

    # 4. Invoke Model
    chat = model.start_chat(history=history[:-1]) # Start chat with previous history
    response = await chat.send_message_async(message)

    # 5. Handle Tool Calls
    final_reply_text = ""
    commands = []
    product_recommendations = []

    while _get_function_calls(response):
        function_responses = []
        for call in _get_function_calls(response):
            tool_name = call.name
            args = {k: v for k, v in call.args.items()}
            
            if tool_name == "search_products":
                # Fallback to existing Stylist & Negotiation graph
                initial_state = {
                    "session_id": session_id,
                    "user_id": user_id,
                    "user_location": {"address": location},
                    "raw_query": args.get("query", message),
                    "extracted_entities": {},
                    "negotiation_round": 1,
                    "negotiation_history": [],
                    "negotiation_complete": False,
                    "filtered_products": [],
                    "agent_log": []
                }
                intent_state = await intent_detector_node(initial_state)
                initial_state.update(intent_state)
                final_state = await negotiation_graph.ainvoke(initial_state)
                
                # Extract products
                from app.api.v1.chat import get_suggested_size # Import helper safely
                raw_products = []
                if final_state.get("stylist_proposal"):
                    primary_product = final_state["stylist_proposal"].get("product_data", {})
                    raw_products.append(primary_product)
                    for item in final_state.get("filtered_products", []):
                        if str(item.get("_id")) != str(primary_product.get("_id")):
                            raw_products.append(item)
                
                user_profile = {} # Assuming default for now
                for item in raw_products:
                    prod_id = str(item.get("_id", item.get("id")))
                    s_size = get_suggested_size(item, intent_state["extracted_entities"].get("size"), user_profile)
                    mapped = {
                        "id": prod_id,
                        "name": item.get("name", "Unknown Product"),
                        "price": item.get("price", {"mrp": 1999, "selling_price": 1599, "discount_percent": 20}),
                        "suggested_size": s_size,
                        "fit_accuracy": item.get("fit_confidence_avg", 95),
                        "boutique": item.get("store_name", "Boutique A"),
                        "brand": item.get("brand", "Quick Style"),
                        "sizes_available": item.get("sizes_available", []),
                        "colors": item.get("colors", []),
                        "store_location": item.get("store_location", {"type": "Point", "coordinates": [88.36, 22.50]})
                    }
                    product_recommendations.append(mapped)
                    
                function_responses.append(_make_function_response(
                    "search_products",
                    {"result": f"Found {len(product_recommendations)} products. Provide them to the user."}
                ))

            elif tool_name == "navigate_ui":
                commands.append({"type": "navigate", "path": args.get("path")})
                function_responses.append(_make_function_response(
                    "navigate_ui",
                    {"result": f"Navigated user to {args.get('path')}"}
                ))

            elif tool_name == "update_account":
                # Real execution since agent asked permission first
                if user_id:
                    await db.users.update_one(
                        {"_id": ObjectId(user_id)},
                        {"$set": {args.get("field"): args.get("value")}}
                    )
                    res = "Account updated successfully."
                else:
                    res = "Failed: user is not logged in."
                function_responses.append(_make_function_response("update_account", {"result": res}))

            elif tool_name == "checkout_cart":
                commands.append({"type": "checkout"})
                function_responses.append(_make_function_response(
                    "checkout_cart",
                    {"result": "Triggered checkout on frontend. Tell user checkout is complete."}
                ))

        response = await chat.send_message_async(function_responses)

    final_reply_text = _get_text(response)
    
    # 6. Save Memory
    history.append({"role": "model", "parts": [{"text": final_reply_text}]})
    await db.chat_sessions.update_one(
        {"session_id": session_id},
        {"$set": {"history": history, "user_id": user_id, "updated_at": datetime.utcnow()}},
        upsert=True
    )
    
    return {
        "reply": final_reply_text,
        "product_recommendations": product_recommendations,
        "commands": commands
    }
