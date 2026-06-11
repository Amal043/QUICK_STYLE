import os
import io
import json
import base64
import random
import uuid
import asyncio
import tempfile
import urllib.parse
from datetime import datetime
from fastapi import APIRouter, Form, File, UploadFile
from typing import Optional
import httpx
from PIL import Image
import google.generativeai as genai
from app.db.connection import get_db
from app.utils.llm_provider import vision_completion
from app.utils.idm_vton import generate_virtual_tryon, check_vton_availability

router = APIRouter()


def _configure_gemini():
    key = os.getenv("GOOGLE_API_KEY")
    if key:
        genai.configure(api_key=key)


def _get_project_root() -> str:
    current = os.path.dirname(os.path.abspath(__file__))
    return os.path.abspath(os.path.join(current, "..", "..", "..", ".."))


def _save_base64_image(b64_str: str, save_dir: str, filename: str) -> str:
    """Save a base64 data-URI image to disk. Returns the static URL path."""
    os.makedirs(save_dir, exist_ok=True)
    raw = b64_str.split(",")[1] if "," in b64_str else b64_str
    img_bytes = base64.b64decode(raw)
    save_path = os.path.join(save_dir, filename)
    try:
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img.save(save_path, "JPEG", quality=85)
    except Exception:
        with open(save_path, "wb") as f:
            f.write(img_bytes)
    return f"/api/v1/agent/images/{filename}"


async def _generate_model_image(name: str, description: str, category: str, gender: str, uid: str, idx: int, garment_image_path: str) -> Optional[str]:
    """
    Generate a fashion model photo wearing the garment.
    Primary: IDM-VTON (free, high-quality virtual try-on)
    Fallback: Pollinations AI text-to-image
    """
    api_dir = os.path.dirname(os.path.abspath(__file__))
    gen_dir = os.path.join(api_dir, "agent_images")
    os.makedirs(gen_dir, exist_ok=True)
    filename = f"{uid}_model{idx}.jpg"
    save_path = os.path.join(gen_dir, filename)

    # Primary: IDM-VTON
    try:
        base_model_name = "base_female.jpg" if gender == "female" else "base_male.jpg"
        
        # Try local assets directory first (production/docker package)
        project_root = _get_project_root()
        base_model_path = os.path.abspath(os.path.join(api_dir, "..", "..", "assets", "ai-models", base_model_name))
        
        # Fallback to frontend public folder (local dev compose setup)
        if not os.path.exists(base_model_path):
            base_model_path = os.path.join(project_root, "frontend", "public", "ai-models", base_model_name)
        
        if os.path.exists(base_model_path) and garment_image_path and os.path.exists(garment_image_path):
            vton_category = "Upper-body"
            cat_lower = category.lower()
            name_lower = name.lower()
            desc_lower = description.lower()
            combined_text = f"{cat_lower} {name_lower} {desc_lower}"
            
            if any(w in combined_text for w in ["dress", "gown", "suit", "midi", "maxi"]):
                vton_category = "Dress"
            elif any(w in combined_text for w in ["pant", "trouser", "jeans", "bottom", "short", "skirt"]):
                vton_category = "Lower-body"
                
            print(f"[Registry] Calling IDM-VTON with category: {vton_category}")
            res_path = await generate_virtual_tryon(base_model_path, garment_image_path, vton_category, gen_dir)
            if res_path and os.path.exists(res_path):
                print(f"[Registry] Generated model image {idx} via IDM-VTON: {res_path}")
                return f"/api/v1/agent/images/{os.path.basename(res_path)}"
            else:
                print(f"[Registry] IDM-VTON returned nothing, falling back to Pollinations.")
        else:
            print(f"[Registry] Missing base model or garment image for IDM-VTON, falling back.")
    except Exception as e:
        print(f"[Registry] IDM-VTON error for {idx}, falling back: {e}")

    # Fallback: Pollinations AI
    if gender == "female":
        subject = "beautiful young South Asian woman, feminine, stylish"
    elif gender == "male":
        subject = "handsome young South Asian man, masculine, stylish"
    else:
        subject = "stylish young person"

    prompt = (
        f"professional fashion editorial photography, {subject} wearing {name}, "
        f"{description[:60]}, {category} style, full body, neutral studio background, "
        f"soft studio lighting, high detail, photorealistic, sharp focus, 4k"
    )

    seed = random.randint(10000, 99999)
    encoded = urllib.parse.quote(prompt)
    url = (
        f"https://image.pollinations.ai/prompt/{encoded}"
        f"?width=512&height=768&nologo=true&seed={seed}&model=flux"
    )

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    try:
        async with httpx.AsyncClient(timeout=50.0) as client:
            resp = await client.get(url, headers=headers, follow_redirects=True)
            if resp.status_code == 200 and "image" in resp.headers.get("content-type", ""):
                with open(save_path, "wb") as f:
                    f.write(resp.content)
                print(f"[Registry] Generated model image {idx} via Pollinations: /api/v1/agent/images/{filename}")
                return f"/api/v1/agent/images/{filename}"
            else:
                print(f"[Registry] Pollinations returned {resp.status_code} for image {idx}")
    except Exception as e:
        print(f"[Registry] Image generation error for {idx}: {e}")
    return None


@router.post("/agent/add-product")
async def agent_add_product(
    message: str = Form(""),
    chat_history: str = Form("[]"),
    images_base64: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None)
):
    """
    AI Registry Agent:
    1. Gemini Vision (gemini-2.5-flash-lite) analyzes clothing images + optional voice description
    2. Detects if it's a raw cloth photo (no model) — if so, generates 2 model photos via Pollinations AI
    3. Saves all images to disk (not base64 in DB)
    4. Registers the product with return_policy, sizing, and full metadata
    """
    db = get_db()
    _configure_gemini()

    images_list = []
    if images_base64:
        try:
            images_list = json.loads(images_base64)
        except Exception:
            images_list = [images_base64]
            
    history_list = []
    try:
        history_list = json.loads(chat_history)
    except Exception:
        pass

    # ── Conversational LLM Analysis ───────────────────────────────────────────
    extracted = {}
    
    # Prepare image data for vision
    image_data_list = []
    for b64 in images_list:
        raw_b64 = b64.split(",")[1] if "," in b64 else b64
        img_bytes = base64.b64decode(raw_b64)
        image_data_list.append({"mime_type": "image/jpeg", "data": img_bytes})

    from app.utils.llm_provider import registry_agent_chat
    
    response_text = await registry_agent_chat(history_list, message, image_data_list)
    
    try:
        parsed = json.loads(response_text)
    except Exception:
        parsed = {"action": "reply", "message": "I didn't quite catch that. Could you repeat?"}
        
    if parsed.get("action") == "reply":
        return {
            "status": "error", # Using 'error' status stops frontend from clearing UI and renders the text
            "reply": parsed.get("message", "Can you provide more details?")
        }
        
    # If action is register, proceed to save images and generate models
    extracted = parsed
    print(f"[Registry] Agent ready to register: {extracted.get('name')} | has_model={extracted.get('has_model')}")
    
    # ── Save uploaded images to disk ──────────────────────────────────────────
    uid = uuid.uuid4().hex[:10]
    api_dir = os.path.dirname(os.path.abspath(__file__))
    upload_dir = os.path.join(api_dir, "agent_images")

    uploaded_urls = []
    for i, b64 in enumerate(images_list[:3]):
        local_url = _save_base64_image(b64, upload_dir, f"{uid}_raw{i}.jpg")
        uploaded_urls.append(local_url)

    main_image_url = uploaded_urls[0] if uploaded_urls else ""

    # ── Generate Model Photos if cloth-only image ─────────────────────────────
    name = str(extracted["name"])
    category = str(extracted["category"])
    description = str(extracted["description"])
    gender = str(extracted.get("gender", "unisex"))
    has_model = bool(extracted.get("has_model", False))

    gen_img_1 = None
    gen_img_2 = None

    if not has_model:
        # No model in the photo — generate 2 fashion model images concurrently
        gender_1 = "female" if gender in ("female", "unisex") else "male"
        gender_2 = "male" if gender in ("male", "unisex") else "female"

        garment_image_path = os.path.join(project_root, "frontend", "public", "uploads", f"{uid}_raw0.jpg")
        results = await asyncio.gather(
            _generate_model_image(name, description, category, gender_1, uid, 1, garment_image_path),
            _generate_model_image(name, description, category, gender_2, uid, 2, garment_image_path),
            return_exceptions=True
        )
        gen_img_1 = results[0] if isinstance(results[0], str) else None
        gen_img_2 = results[1] if isinstance(results[1], str) else None
        print(f"[Registry] Generated: {gen_img_1}, {gen_img_2}")
    else:
        print("[Registry] Uploaded photo already has a model — skipping image generation.")

    # Build gallery: extra raw uploads + AI-generated model shots
    gallery: list = uploaded_urls[1:]
    if gen_img_1:
        gallery.append(gen_img_1)
    if gen_img_2:
        gallery.append(gen_img_2)

    # ── Build Product Document ─────────────────────────────────────────────────
    price_val = float(extracted.get("price", 1999))
    mrp = round(price_val * 1.3)
    discount_pct = round(((mrp - price_val) / mrp) * 100)

    product_doc = {
        "id": f"PRD-{uid.upper()}",
        "name": name,
        "description": description,
        "brand": str(extracted.get("brand", "QUICK_STYLE")),
        "size_variance": 0,
        "category": category,
        "subcategory": "New Arrivals",
        "tags": ["ai_generated", "new"],
        "outfit_tags": [],
        "pairs_well_with": [],
        "price": {
            "mrp": mrp,
            "selling_price": price_val,
            "discount_percent": float(discount_pct)
        },
        "sizes_available": extracted.get("sizes", ["S", "M", "L", "XL"]),
        "colors": [{
            "name": str(extracted.get("color_name", "Default")),
            "hex": str(extracted.get("color_hex", "#888888")),
            "images": {
                "main": main_image_url,
                "gallery": gallery,
                "frames_360": [],
                "has_360": False
            }
        }],
        "store_id": "STORE_ADMIN",
        "store_name": "QUICK_STYLE Flagship",
        "store_location": {
            "type": "Point",
            "coordinates": [88.3616, 22.5015]
        },
        "stock": {size: 10 for size in extracted.get("sizes", ["S", "M", "L", "XL"])},
        "rating": {"average": 5.0, "count": 0},
        "fit_confidence_avg": 92,
        "return_policy": str(extracted.get("return_policy", "Exchange")),
        "return_window_days": int(extracted.get("return_window_days", 5)),
        "active": True,
        "created_at": datetime.utcnow()
    }

    try:
        await db.products.insert_one(product_doc)
        product_doc["_id"] = str(product_doc["_id"])
    except Exception as e:
        print(f"[Registry] DB insert error: {e}")
        return {"status": "error", "reply": "Failed to save product to database. Please try again."}

    generated_count = sum(1 for x in [gen_img_1, gen_img_2] if x)

    if not has_model and generated_count > 0:
        reply = (
            f"✅ Registered **{name}** with {generated_count} AI-generated model photo(s)! "
            f"₹{int(price_val)} | {category} | {extracted.get('return_policy', 'Exchange')} policy ({extracted.get('return_window_days', 5)} days)"
        )
    elif has_model:
        reply = (
            f"✅ Registered **{name}**! Your photo already shows a model — used directly as the product image. "
            f"₹{int(price_val)} | {category} | {extracted.get('return_policy', 'Exchange')} policy"
        )
    else:
        reply = (
            f"✅ Registered **{name}**! Image generation timed out but the product is live. "
            f"₹{int(price_val)} | {category}"
        )

    return {
        "status": "success",
        "product": product_doc,
        "reply": reply,
        "generated_images": [x for x in [gen_img_1, gen_img_2] if x]
    }


from fastapi.responses import FileResponse

@router.get("/agent/images/{filename}")
async def get_agent_image(filename: str):
    """Serve images generated or uploaded by the agent."""
    api_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(api_dir, "agent_images", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Image not found")
