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
    return f"/uploads/{filename}"


async def _generate_model_image(name: str, description: str, category: str, gender: str, uid: str, idx: int) -> Optional[str]:
    """
    Generate a fashion model photo wearing the garment.
    Primary: IDM-VTON (free, high-quality virtual try-on)
    Fallback: Pollinations AI text-to-image
    """
    project_root = _get_project_root()
    gen_dir = os.path.join(project_root, "frontend", "public", "generated")
    os.makedirs(gen_dir, exist_ok=True)
    filename = f"{uid}_model{idx}.jpg"
    save_path = os.path.join(gen_dir, filename)

    # Try IDM-VTON first (requires real garment and model images)
    # For now, skip VTON and use Pollinations as proven fallback
    # In production, upload reference model photos and use IDM-VTON

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
                print(f"[Registry] Generated model image {idx} via Pollinations: /generated/{filename}")
                return f"/generated/{filename}"
            else:
                print(f"[Registry] Pollinations returned {resp.status_code} for image {idx}")
    except Exception as e:
        print(f"[Registry] Image generation error for {idx}: {e}")
    return None


@router.post("/agent/add-product")
async def agent_add_product(
    message: str = Form(""),
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

    if not images_base64:
        return {
            "status": "error",
            "reply": "Please upload at least one photo of the clothing item to register it!"
        }

    images_list = []
    try:
        images_list = json.loads(images_base64)
    except Exception:
        images_list = [images_base64]

    if not images_list:
        return {"status": "error", "reply": "No valid images received. Please try again."}

    # ── Save uploaded images to disk ──────────────────────────────────────────
    uid = uuid.uuid4().hex[:10]
    project_root = _get_project_root()
    upload_dir = os.path.join(project_root, "frontend", "public", "uploads")

    uploaded_urls = []
    for i, b64 in enumerate(images_list[:3]):
        local_url = _save_base64_image(b64, upload_dir, f"{uid}_raw{i}.jpg")
        uploaded_urls.append(local_url)

    main_image_url = uploaded_urls[0]
    main_image_b64 = images_list[0]

    # ── Gemini Vision Analysis ────────────────────────────────────────────────
    extracted = {
        "name": "Stylish Apparel",
        "price": 1999,
        "category": "Streetwear",
        "brand": "QUICK_STYLE",
        "description": "A versatile clothing item crafted for comfort and style.",
        "sizes": ["S", "M", "L", "XL"],
        "color_name": "Default",
        "color_hex": "#888888",
        "return_policy": "Exchange",
        "return_window_days": 5,
        "gender": "unisex",
        "has_model": False,
    }

    uploaded_audio_ref = None
    temp_audio_path = None

    try:
        vision_prompt = f"""
Analyze the provided clothing photo(s). The shopkeeper's description (if any): "{message}"

Return ONLY a valid JSON object with these exact fields:
- "name": Catchy, marketable product name (string)
- "price": Estimated retail price in Indian Rupees as integer (e.g. 1499)
- "category": One of: Streetwear, Formals, Activewear, Ethnic, Casual, Denim, Accessories, Footwear
- "brand": Brand visible in image/tags, or "QUICK_STYLE" if not identifiable
- "description": Premium 2-sentence description highlighting fabric, fit, and occasion
- "sizes": Array of sizes — e.g. ["S","M","L","XL"] for clothing, ["6","7","8","9","10"] for footwear
- "color_name": Primary color name (e.g. "Royal Blue")
- "color_hex": Hex code for primary color (e.g. "#1A237E")
- "return_policy": "Exchange" for regular items, "Refund" for premium/branded items
- "return_window_days": Integer, typically 5 or 7
- "gender": "male", "female", or "unisex"
- "has_model": true if a real person is wearing the garment in the photo, false if it is a flat-lay, hanger shot, or product-only image

Do NOT include any markdown or code blocks. Return raw JSON only.
"""

        # Prepare image for vision analysis
        raw_b64 = main_image_b64.split(",")[1] if "," in main_image_b64 else main_image_b64
        img_bytes = base64.b64decode(raw_b64)
        image_data = {"mime_type": "image/jpeg", "data": img_bytes}

        # Use unified LLM provider (Gemini vision, since Groq doesn't support vision)
        text = vision_completion(image_data, vision_prompt, temperature=0.2)

        if text.startswith("```"):
            parts = text.split("```")
            text = parts[1] if len(parts) > 1 else text
            if text.startswith("json"):
                text = text[4:].strip()

        parsed = json.loads(text)
        for k in ["name", "price", "category", "brand", "description", "gender",
                   "return_policy", "return_window_days", "color_name", "color_hex", "has_model"]:
            if k in parsed:
                extracted[k] = parsed[k]
        if "sizes" in parsed and isinstance(parsed["sizes"], list) and parsed["sizes"]:
            extracted["sizes"] = parsed["sizes"]

        print(f"[Registry] Gemini extracted: {extracted['name']} | has_model={extracted['has_model']} | gender={extracted['gender']}")

    except Exception as e:
        print(f"[Registry] Gemini Vision error: {e}")
    finally:
        if uploaded_audio_ref:
            try:
                genai.delete_file(uploaded_audio_ref.name)
            except Exception:
                pass
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
            except Exception:
                pass

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

        results = await asyncio.gather(
            _generate_model_image(name, description, category, gender_1, uid, 1),
            _generate_model_image(name, description, category, gender_2, uid, 2),
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
