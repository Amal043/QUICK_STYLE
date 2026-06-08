from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
import hashlib
import json
from app.db.connection import get_db
from app.agents.supervisor import negotiation_graph
from app.agents.pilot_agent import run_pilot_agent
from app.utils.gemini_fallback import FallbackGenerativeModel
from app.agents.safety_agent import pre_retrieval_guardrail, post_retrieval_guardrail
from app.websocket.connection_manager import manager
import os
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
    commands: list[dict] = []
    timestamp: str

def get_suggested_size(product: dict, extracted_size: str, user_profile: dict) -> str:
    # 1. User specified size in their query
    if extracted_size:
        return extracted_size
    
    # 2. Get base size from profile based on category
    category = product.get("category", "").lower()
    base_size = "M" # default fallback
    
    if any(k in category for k in ["footwear", "shoes", "boots", "loafers"]):
        base_size = user_profile.get("footwear", "9")
    elif any(k in category for k in ["bottom", "pants", "shorts", "joggers", "trousers"]):
        base_size = user_profile.get("bottoms", "M")
    else: # tops, hoodies, jackets, tees, sweaters, blazers
        base_size = user_profile.get("tops", "M")
        
    # 3. Apply size variance adjustments (if size is standard like S, M, L, XL)
    size_variance = product.get("size_variance", 0)
    sizes_order = ["XS", "S", "M", "L", "XL", "XXL"]
    
    if base_size in sizes_order and size_variance != 0:
        idx = sizes_order.index(base_size)
        # size_variance = 1 (brand runs large, so size DOWN)
        # size_variance = -1 (brand runs small, so size UP)
        adjusted_idx = idx - size_variance
        if 0 <= adjusted_idx < len(sizes_order):
            base_size = sizes_order[adjusted_idx]
            
    # 4. Fallback: if suggested size is not in sizes_available, find closest or first
    sizes_avail = product.get("sizes_available", [])
    if sizes_avail:
        if base_size in sizes_avail:
            return base_size
        original_base = user_profile.get("tops", "M")
        if original_base in sizes_avail:
            return original_base
        return sizes_avail[0]
        
    return base_size

def create_mock_matching_product(item_tag: str, primary_product: dict) -> dict:
    # Deterministic ID
    m = hashlib.md5(item_tag.encode('utf-8'))
    mock_id = str(m.hexdigest())[:24]
    
    # Store info from primary product
    store_name = primary_product.get("store_name") or primary_product.get("boutique") or "Boutique A — South City Luxe"
    store_id = primary_product.get("store_id", "")
    store_loc = primary_product.get("store_location", {"type": "Point", "coordinates": [88.3616, 22.5015]})
    
    item_details = {
        "cargo_pants": {
            "name": "Apex Utility Cargo Pants",
            "price": {"mrp": 2499, "selling_price": 1699, "discount_percent": 32},
            "sizes_available": ["S", "M", "L", "XL"],
            "category": "Streetwear"
        },
        "white_sneakers": {
            "name": "Classic White Sneakers",
            "price": {"mrp": 3999, "selling_price": 2499, "discount_percent": 37},
            "sizes_available": ["7", "8", "9", "10", "11"],
            "category": "Streetwear"
        },
        "crossbody_bag": {
            "name": "Streetwear Crossbody Bag",
            "price": {"mrp": 1299, "selling_price": 799, "discount_percent": 38},
            "sizes_available": ["One Size"],
            "category": "Streetwear"
        },
        "slim_fit_joggers": {
            "name": "Vanguard Slim-Fit Joggers",
            "price": {"mrp": 2199, "selling_price": 1499, "discount_percent": 31},
            "sizes_available": ["S", "M", "L", "XL"],
            "category": "Streetwear"
        },
        "chunky_boots": {
            "name": "Vanguard Chunky Tactical Boots",
            "price": {"mrp": 4999, "selling_price": 3299, "discount_percent": 34},
            "sizes_available": ["8", "9", "10", "11"],
            "category": "Streetwear"
        },
        "tactical_bag": {
            "name": "Vanguard Tactical Sling Bag",
            "price": {"mrp": 1499, "selling_price": 999, "discount_percent": 33},
            "sizes_available": ["One Size"],
            "category": "Streetwear"
        },
        "tailored_trousers": {
            "name": "Luxe Tailored Trousers",
            "price": {"mrp": 2999, "selling_price": 1899, "discount_percent": 36},
            "sizes_available": ["S", "M", "L", "XL"],
            "category": "Formals"
        },
        "loafers": {
            "name": "Premium Suede Loafers",
            "price": {"mrp": 4500, "selling_price": 2999, "discount_percent": 33},
            "sizes_available": ["7", "8", "9", "10"],
            "category": "Formals"
        },
        "leather_tote": {
            "name": "Signature Leather Tote Bag",
            "price": {"mrp": 5999, "selling_price": 3899, "discount_percent": 35},
            "sizes_available": ["One Size"],
            "category": "Formals"
        },
        "jogger_shorts": {
            "name": "Aero-Active Jogger Shorts",
            "price": {"mrp": 1299, "selling_price": 849, "discount_percent": 34},
            "sizes_available": ["S", "M", "L", "XL"],
            "category": "Activewear"
        },
        "running_shoes": {
            "name": "Aero-Speed Running Shoes",
            "price": {"mrp": 3499, "selling_price": 2299, "discount_percent": 34},
            "sizes_available": ["7", "8", "9", "10", "11"],
            "category": "Activewear"
        },
        "gym_bag": {
            "name": "Aero-Fit Gym Duffle Bag",
            "price": {"mrp": 1999, "selling_price": 1299, "discount_percent": 35},
            "sizes_available": ["One Size"],
            "category": "Activewear"
        },
        "dress_trousers": {
            "name": "FormCraft Dress Trousers",
            "price": {"mrp": 2799, "selling_price": 1799, "discount_percent": 35},
            "sizes_available": ["S", "M", "L", "XL"],
            "category": "Formals"
        },
        "oxford_shoes": {
            "name": "Classic Oxford Leather Shoes",
            "price": {"mrp": 4999, "selling_price": 3299, "discount_percent": 34},
            "sizes_available": ["8", "9", "10", "11"],
            "category": "Formals"
        },
        "pocket_square": {
            "name": "Obsidian Silk Pocket Square",
            "price": {"mrp": 699, "selling_price": 399, "discount_percent": 42},
            "sizes_available": ["One Size"],
            "category": "Formals"
        }
    }
    
    details = item_details.get(item_tag)
    if not details:
        name = item_tag.replace("_", " ").title()
        details = {
            "name": name,
            "price": {"mrp": 1999, "selling_price": 1399, "discount_percent": 30},
            "sizes_available": ["S", "M", "L", "XL"],
            "category": "Streetwear"
        }
        
    return {
        "_id": mock_id,
        "id": mock_id,
        "name": details["name"],
        "brand": "Quick Style Co.",
        "description": f"A stylish matching {details['name'].lower()} to complete your outfit.",
        "category": details["category"],
        "price": details["price"],
        "sizes_available": details["sizes_available"],
        "store_name": store_name,
        "store_id": store_id,
        "store_location": store_loc,
        "stock": {sz: 5 for sz in details["sizes_available"]},
        "fit_confidence_avg": 95,
        "size_variance": 0,
        "active": True
    }

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
        
    # Query default user profile if user_id is missing to ensure return checks / sizes are functional
    user_id_to_pass = body.user_id
    user_profile = {}
    if not user_id_to_pass:
        default_user = await db.users.find_one({"email": "admin@quickstyle.io"})
        if default_user:
            user_id_to_pass = str(default_user["_id"])
            user_profile = default_user.get("size_profile", {})
    else:
        try:
            user_doc = await db.users.find_one({"_id": ObjectId(user_id_to_pass)})
            if user_doc:
                user_profile = user_doc.get("size_profile", {})
        except Exception:
            pass
    
    # Pass to Multi-Tasking Pilot Agent
    pilot_result = await run_pilot_agent(
        db=db,
        session_id=body.session_id,
        user_id=user_id_to_pass,
        location=body.location,
        message=body.message
    )
    
    # Post-Retrieval Guardrail on the agent's reply
    safe_reply = await post_retrieval_guardrail(pilot_result["reply"])
        
    return ChatResponse(
        session_id=body.session_id,
        reply=safe_reply,
        product_recommendations=pilot_result["product_recommendations"],
        commands=pilot_result["commands"],
        timestamp=datetime.utcnow().isoformat(),
    )

ws_router = APIRouter()

@ws_router.websocket("/{session_id}")
async def websocket_chat_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            # We keep the connection alive and listen for any client messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)

@router.post("/message/audio", response_model=ChatResponse)
async def send_audio_message(
    session_id: str = Form(...),
    location: str = Form("NIT Jamshedpur Campus"),
    user_id: Optional[str] = Form(None),
    audio_file: UploadFile = File(...),
    db=Depends(get_db)
):
    """
    Process an audio chat message.
    Uses Gemini 1.5 Flash natively to transcribe/understand Hindi or English audio.
    """
    import tempfile
    
    # Save the uploaded audio to a temporary file
    temp_audio_path = ""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        content = await audio_file.read()
        temp_file.write(content)
        temp_audio_path = temp_file.name

    try:
        # Upload the audio file to Gemini
        gemini_audio = genai.upload_file(temp_audio_path)
        
        # Use Gemini 1.5 Flash to transcribe and extract the user's intent
        model = FallbackGenerativeModel('gemini-2.5-flash-lite')
        prompt = "Listen to this audio. It may be in Hindi, English, or a mix. Transcribe exactly what the user is asking for in English text, preserving their exact shopping intent."
        
        response = await model.generate_content_async([prompt, gemini_audio])
        transcribed_text = response.text.strip()
        print(f"Transcribed Audio Intent: {transcribed_text}")
        
        # Delete file from Gemini storage
        genai.delete_file(gemini_audio.name)
        
    except Exception as e:
        print(f"Audio processing error: {e}")
        transcribed_text = "I'm looking for some stylish clothes."
    finally:
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

    # Re-use the existing send_message logic with the transcribed text
    chat_message = ChatMessage(
        session_id=session_id,
        message=transcribed_text,
        user_id=user_id,
        location=location
    )
    
    return await send_message(chat_message, db)
