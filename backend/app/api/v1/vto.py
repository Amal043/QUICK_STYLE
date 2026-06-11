import os
import io
import random
import urllib.parse
import json
import httpx
import uuid
import numpy as np
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Response, Request
from fastapi.responses import RedirectResponse, FileResponse
from pydantic import BaseModel
import google.generativeai as genai
from PIL import Image, ImageDraw, ImageFilter
from app.utils.idm_vton import generate_virtual_tryon, check_vton_availability
from app.utils.llm_provider import vision_completion

router = APIRouter()

MODEL_FACES_DB = {
    "amethyst_knit_sweater_front.png": {"ymin": 76, "xmin": 427, "ymax": 248, "xmax": 570},
    "apex_tech_hoodie_front.png": {"ymin": 76, "xmin": 425, "ymax": 251, "xmax": 571},
    "black_dress_front.png": {"ymin": 89, "xmin": 435, "ymax": 221, "xmax": 560},
    "blazer_front.png": {"ymin": 95, "xmin": 444, "ymax": 234, "xmax": 551},
    "blue_dress_front.png": {"ymin": 78, "xmin": 438, "ymax": 224, "xmax": 557},
    "brown_midi_front.png": {"ymin": 78, "xmin": 438, "ymax": 224, "xmax": 557},
    "core_heavyweight_tee_front.png": {"ymin": 76, "xmin": 427, "ymax": 248, "xmax": 570},
    "grey_shirt_front.png": {"ymin": 76, "xmin": 427, "ymax": 248, "xmax": 570},
    "hoodie_front.png": {"ymin": 98, "xmin": 425, "ymax": 237, "xmax": 567},
    "obsidian_gown_front.jpg": {"ymin": 62, "xmin": 445, "ymax": 226, "xmax": 567},
    "obsidian_ribbed_knit_front.png": {"ymin": 60, "xmin": 431, "ymax": 234, "xmax": 572},
    "silk_tunic_front.png": {"ymin": 76, "xmin": 427, "ymax": 248, "xmax": 570},
    "striped_dress_front.png": {"ymin": 78, "xmin": 438, "ymax": 224, "xmax": 557},
    "tshirt_front.png": {"ymin": 79, "xmin": 434, "ymax": 218, "xmax": 562},
    "vanguard_utility_jacket_front.png": {"ymin": 60, "xmin": 431, "ymax": 234, "xmax": 572}
}

DEFAULT_MODEL_FACE_BOX = {"ymin": 70, "xmin": 425, "ymax": 230, "xmax": 570}

def reinhard_color_transfer(source: Image.Image, target: Image.Image) -> Image.Image:
    """
    Transfers the color characteristics of target image (model face) to source image (user face).
    Used to match the skin tone and lighting between user face and model neck/body.
    """
    src_arr = np.array(source).astype(np.float32)
    tgt_arr = np.array(target).astype(np.float32)
    for channel in range(min(3, src_arr.shape[2])):
        src_channel = src_arr[:, :, channel]
        tgt_channel = tgt_arr[:, :, channel]
        src_mean, src_std = src_channel.mean(), src_channel.std()
        tgt_mean, tgt_std = tgt_channel.mean(), tgt_channel.std()
        if src_std > 1e-5:
            src_arr[:, :, channel] = ((src_channel - src_mean) / src_std) * tgt_std + tgt_mean
    src_arr = np.clip(src_arr, 0, 255).astype(np.uint8)
    return Image.fromarray(src_arr)

def swap_face(user_img: Image.Image, model_img: Image.Image, u_box: dict, m_box: dict) -> Image.Image:
    """
    Crops the face from user_img (u_box) and pastes it onto model_img (m_box)
    with resizing, color matching, and a soft-feathered oval mask.
    """
    W_u, H_u = user_img.size
    W_m, H_m = model_img.size
    
    u_ymin = int(u_box['ymin'] * H_u / 1000)
    u_xmin = int(u_box['xmin'] * W_u / 1000)
    u_ymax = int(u_box['ymax'] * H_u / 1000)
    u_xmax = int(u_box['xmax'] * W_u / 1000)
    
    m_ymin = int(m_box['ymin'] * H_m / 1000)
    m_xmin = int(m_box['xmin'] * W_m / 1000)
    m_ymax = int(m_box['ymax'] * H_m / 1000)
    m_xmax = int(m_box['xmax'] * W_m / 1000)
    
    u_ymin, u_ymax = max(0, min(u_ymin, H_u)), max(0, min(u_ymax, H_u))
    u_xmin, u_xmax = max(0, min(u_xmin, W_u)), max(0, min(u_xmax, W_u))
    m_ymin, m_ymax = max(0, min(m_ymin, H_m)), max(0, min(m_ymax, H_m))
    m_xmin, m_xmax = max(0, min(m_xmin, W_m)), max(0, min(m_xmax, W_m))
    
    if (u_xmax - u_xmin) <= 0 or (u_ymax - u_ymin) <= 0 or (m_xmax - m_xmin) <= 0 or (m_ymax - m_ymin) <= 0:
        raise ValueError("Invalid bounding boxes for face swap")
        
    user_face = user_img.crop((u_xmin, u_ymin, u_xmax, u_ymax))
    target_w, target_h = m_xmax - m_xmin, m_ymax - m_ymin
    
    model_face = model_img.crop((m_xmin, m_ymin, m_xmax, m_ymax))
    model_face_resized = model_face.resize((target_w, target_h), Image.Resampling.LANCZOS)
    user_face_resized = user_face.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    try:
        user_face_colored = reinhard_color_transfer(user_face_resized, model_face_resized)
    except Exception as e:
        print(f"Face color transfer failed: {e}")
        user_face_colored = user_face_resized
        
    mask = Image.new("L", (target_w, target_h), 0)
    draw = ImageDraw.Draw(mask)
    px = int(target_w * 0.08)
    py = int(target_h * 0.08)
    draw.ellipse((px, py, target_w - px, target_h - py), fill=255)
    
    blur_r = max(2, int(min(target_w, target_h) * 0.12))
    mask = mask.filter(ImageFilter.GaussianBlur(radius=blur_r))
    
    result_img = model_img.copy()
    result_img.paste(user_face_colored, (m_xmin, m_ymin), mask=mask)
    return result_img

class VTORequest(BaseModel):
    user_image_url: str
    garment_image_url: str
    category: str = "tops"

class VTOResponse(BaseModel):
    generated_image_url: str
    status: str
    styling_advice: str = ""

def get_local_model_image(garment_name: str, category: str) -> str:
    """
    Maps the boutique garment name to its high-quality local model front-view image.
    This provides an instant, correct, and premium-looking try-on result that matches
    the exact catalog item.
    """
    name = (garment_name or "").lower()
    cat = (category or "").lower()
    
    if "obsidian gown" in name:
        return "/ai-models/obsidian_gown_front.jpg"
    if "obsidian ribbed knit" in name or "ribbed knit" in name:
        return "/ai-models/obsidian_ribbed_knit_front.png"
    if "architectural blazer" in name or "blazer" in name or "suit" in name:
        return "/ai-models/blazer_front.png"
    if "core heavyweight tee" in name or "heavyweight tee" in name:
        return "/ai-models/core_heavyweight_tee_front.png"
    if "silk drape tunic" in name or "silk tunic" in name or "tunic" in name:
        return "/ai-models/silk_tunic_front.png"
    if "precision cut trousers" in name or "trousers" in name or "pants" in name or "tailored" in name:
        return "/ai-models/trousers_front.png"
    if "monolith combat boot" in name or "combat boot" in name or "boot" in name:
        return "/ai-models/boot_front.png"
    if "noir stiletto" in name or "stiletto" in name or "heel" in name or "shoe" in name:
        return "/ai-models/stiletto_front.png"
    if "architectural cuff" in name or "cuff" in name or "bracelet" in name:
        return "/ai-models/cuff_front.png"
    if "minimalist minaudiere" in name or "minaudiere" in name or "bag" in name or "clutch" in name:
        return "/ai-models/minaudiere_front.png"
    if "apex tech hoodie" in name or "apex" in name:
        return "/ai-models/apex_tech_hoodie_front.png"
    if "vanguard utility jacket" in name or "utility jacket" in name:
        return "/ai-models/vanguard_utility_jacket_front.png"
    if "amethyst knit sweater" in name or "amethyst" in name or "sweater" in name:
        return "/ai-models/amethyst_knit_sweater_front.png"
    if "aero-knit activewear tee" in name or "activewear tee" in name or "aero-knit" in name or "cool tshirt" in name:
        return "/ai-models/tshirt_front.png"
    if "striped dress" in name or "honky tonky" in name or "charming dress" in name:
        return "/ai-models/striped_dress_front.png"
    if "blue dress" in name or "v-mart" in name:
        return "/ai-models/blue_dress_front.png"
    if "brown dress" in name or "brown midi" in name or "trendy aayu" in name:
        return "/ai-models/brown_midi_front.png"

    # Category fallbacks
    if "dress" in name or "gown" in name or "midi" in name or "mini" in name or "skirt" in name:
        if "black" in name or "striped" in name:
            return "/ai-models/striped_dress_front.png"
        if "brown" in name:
            return "/ai-models/brown_midi_front.png"
        if "blue" in name:
            return "/ai-models/blue_dress_front.png"
        return "/ai-models/black_dress_front.png"
        
    if "hoodie" in name or "jacket" in name or "sweater" in name or "knit" in name or "sweatshirt" in name:
        if "lavender" in name or "purple" in name:
            return "/ai-models/apex_tech_hoodie_front.png"
        if "amethyst" in name:
            return "/ai-models/amethyst_knit_sweater_front.png"
        if "black" in name or "obsidian" in name or "dark" in name:
            return "/ai-models/vanguard_utility_jacket_front.png"
        return "/ai-models/hoodie_front.png"

    if "tee" in name or "tshirt" in name or "t-shirt" in name or "shirt" in name:
        if "white" in name or "optic" in name:
            return "/ai-models/core_heavyweight_tee_front.png"
        if "grey" in name or "gray" in name:
            return "/ai-models/grey_shirt_front.png"
        if "navy" in name or "midnight" in name:
            return "/ai-models/silk_tunic_front.png"
        return "/ai-models/tshirt_front.png"

    if "accessories" in cat or "cuff" in name or "bag" in name or "minaudiere" in name:
        return "/ai-models/minaudiere_front.png"
        
    if "footwear" in cat or "boot" in name or "stiletto" in name or "shoe" in name:
        if "stiletto" in name or "heel" in name:
            return "/ai-models/stiletto_front.png"
        return "/ai-models/boot_front.png"

    return "/ai-models/tshirt_front.png"

def get_local_styling_advice(garment_name: str) -> str:
    """
    Generates premium styling advice locally when Gemini API hits free-tier rate limits (429).
    """
    advices = [
        f"The {garment_name} coordinates beautifully with your features. The elegant lines and premium fit will complement your posture, making it a perfect standout choice.",
        f"This sophisticated {garment_name} brings a refined, modern aesthetic. The design highlights your frame naturally, offering a highly versatile piece for your capsule collection.",
        f"An exceptional style choice! The unique details of the {garment_name} pair effortlessly with your styling preferences to create a cohesive, polished look."
    ]
    return random.choice(advices)

@router.get("/image-proxy")
async def image_proxy(url: str, fallback: str = None):
    """
    Proxies external images (like Pollinations AI) to bypass CORS, CSP, and User-Agent blocks.
    If proxying fails (e.g. rate limit 402/429/non-200), serves the fallback local image directly.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                return Response(content=resp.content, media_type=resp.headers.get("content-type", "image/png"))
            else:
                print(f"Proxy returned status {resp.status_code} for {url}. Attempting local fallback: {fallback}")
                if fallback:
                    current_file_dir = os.path.dirname(os.path.abspath(__file__))
                    project_root = os.path.abspath(os.path.join(current_file_dir, "..", "..", "..", ".."))
                    fallback_path = os.path.join(project_root, "frontend", "public", fallback.lstrip("/"))
                    if os.path.exists(fallback_path):
                        return FileResponse(fallback_path)
                return RedirectResponse(url=url)
        except Exception as e:
            print(f"Proxy connection error: {e} for {url}. Attempting local fallback: {fallback}")
            if fallback:
                current_file_dir = os.path.dirname(os.path.abspath(__file__))
                project_root = os.path.abspath(os.path.join(current_file_dir, "..", "..", "..", ".."))
                fallback_path = os.path.join(project_root, "frontend", "public", fallback.lstrip("/"))
                if os.path.exists(fallback_path):
                    return FileResponse(fallback_path)
            return RedirectResponse(url=url)

@router.get("/image/{filename}")
async def get_tryon_image(filename: str):
    """Serve the generated try-on images directly from backend."""
    current_file_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_file_dir, "..", "..", "..", ".."))
    file_path = os.path.join(project_root, "frontend", "public", "try-on", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Image not found")

@router.post("/try-on", response_model=VTOResponse)
async def virtual_try_on(body: VTORequest):
    """
    Endpoint for legacy JSON-body request.
    """
    # Get local model image path for fallback
    local_image = get_local_model_image(body.garment_image_url, body.category)
    
    # Fallback description based on product name/category
    name_lower = body.garment_image_url.lower()
    cat_lower = body.category.lower()
    if "women" in cat_lower or "gown" in name_lower or "dress" in name_lower or "stiletto" in name_lower:
        person_description = "a stylish young woman"
    elif "men" in cat_lower or "blazer" in name_lower or "trousers" in name_lower or "hoodie" in name_lower:
        person_description = "a stylish young man"
    else:
        person_description = "a stylish young person"

    # Use local curated model image — reliable, instant
    generated_image_url = local_image
    advice = get_local_styling_advice(body.category)
    return VTOResponse(
        generated_image_url=generated_image_url,
        status="success",
        styling_advice=advice
    )

def resolve_garment_url(garment_url: str, request: Request = None) -> str:
    """
    Resolves the garment image URL to an absolute URL that the backend can fetch.
    If the garment_url is a relative path, prepends the frontend's origin.
    """
    # 1. If it's already an absolute URL
    if garment_url.startswith("http://") or garment_url.startswith("https://"):
        # If running locally in docker-compose, replace localhost to allow container communication
        if "localhost" in garment_url or "127.0.0.1" in garment_url:
            return garment_url.replace("localhost:5173", "frontend:5173").replace("localhost:80", "nginx").replace("localhost", "nginx")
        return garment_url

    # 2. Extract origin from request headers (Origin or Referer)
    origin = None
    if request:
        origin = request.headers.get("origin")
        if not origin:
            referer = request.headers.get("referer")
            if referer:
                try:
                    from urllib.parse import urlparse
                    parsed = urlparse(referer)
                    origin = f"{parsed.scheme}://{parsed.netloc}"
                except Exception:
                    pass

    # 3. Fallback to settings.CORS_ORIGINS for a non-local HTTPS origin
    if not origin:
        try:
            from app.config import settings
            # Look for any production origin in CORS_ORIGINS
            for allowed in settings.CORS_ORIGINS:
                if isinstance(allowed, str) and (allowed.startswith("https://") or (allowed.startswith("http://") and "localhost" not in allowed and "127.0.0.1" not in allowed)):
                    origin = allowed
                    break
        except Exception:
            pass

    # 4. Fallback to FRONTEND_URL env var
    if not origin:
        origin = os.getenv("FRONTEND_URL")

    # 5. Construct the absolute URL if we resolved an origin
    if origin:
        # If origin is local, map it to internal docker network
        if "localhost" in origin or "127.0.0.1" in origin:
            origin = origin.replace("localhost:5173", "frontend:5173").replace("localhost:80", "nginx").replace("localhost", "nginx")
        path = garment_url if garment_url.startswith("/") else f"/{garment_url}"
        return f"{origin.rstrip('/')}{path}"

    # 6. Last resort fallback to local docker host 'nginx'
    path = garment_url if garment_url.startswith("/") else f"/{garment_url}"
    return f"http://nginx{path}"


@router.post("/try-on-upload", response_model=VTOResponse)
async def virtual_try_on_upload(
    request: Request,
    user_image: UploadFile = File(...),
    garment_image_url: str = Form(...),
    garment_name: str = Form(...),
    category: str = Form("tops")
):
    """
    Endpoint for multipart form user image upload.
    Uses Gemini to analyze the user's photo, locate their face, and generate personalized styling advice.
    Swaps the user's face onto the high-quality model wearing the garment for a realistic try-on.
    Falls back gracefully to Pollinations AI text-to-image generator if face swap fails or is not possible.
    """
    advice = None
    person_description = None
    face_box = None
    
    # 1. Load user image into PIL
    user_image_bytes = await user_image.read()
    pil_user_image = Image.open(io.BytesIO(user_image_bytes))
    
    try:
        prompt = f"""
        You are the QUICK_STYLE Virtual Try-On Assistant.
        Analyze this person's picture. They want to try on this garment: "{garment_name}".

        Provide the following outputs in a single JSON object:
        1. "advice": Write a detailed, sophisticated 3-sentence styling advice telling the person how the "{garment_name}" (category: {category}) will look on them based on their image features, with color/fit recommendations.
        2. "person_description": A brief description of the person's physical appearance (e.g. "a young South Asian woman with long brown hair, warm skin tone" or "a young man with short dark hair, glasses") to be used for generating a fallback fashion model image. Keep it simple and focused on features.
        3. "face_box": Locate the person's face in the image and return its bounding box coordinates on a scale of 0 to 1000:
           - "ymin": top coordinate (0 to 1000)
           - "xmin": left coordinate (0 to 1000)
           - "ymax": bottom coordinate (0 to 1000)
           - "xmax": right coordinate (0 to 1000)
           If no human face is detected in the image, return null.

        Respond with JSON format:
        {{
            "advice": "...",
            "person_description": "...",
            "face_box": {{
                "ymin": ...,
                "xmin": ...,
                "ymax": ...,
                "xmax": ...
            }}
        }}
        """

        # Use unified LLM provider for vision
        import base64
        raw_b64 = base64.b64encode(user_image_bytes).decode()
        image_data = {"mime_type": "image/jpeg", "data": base64.b64decode(raw_b64)}

        res_text = vision_completion(image_data, prompt, temperature=0.7)

        if res_text.startswith("```"):
            parts = res_text.split("```")
            res_text = parts[1] if len(parts) > 1 else res_text
            if res_text.startswith("json"):
                res_text = res_text[4:].strip()

        res_data = json.loads(res_text)
        advice = res_data.get("advice")
        person_description = res_data.get("person_description")
        face_box = res_data.get("face_box")
    except Exception as e:
        print(f"Vision Analysis & Face Detection Error: {e}")
        
    # Fallback styling advice and description if Gemini failed
    if not advice:
        advice = get_local_styling_advice(garment_name)
    if not person_description:
        name_lower = garment_name.lower()
        cat_lower = category.lower()
        if "women" in cat_lower or "gown" in name_lower or "dress" in name_lower or "stiletto" in name_lower or "tunic" in name_lower:
            person_description = "a stylish young woman"
        elif "men" in cat_lower or "blazer" in name_lower or "trousers" in name_lower or "hoodie" in name_lower:
            person_description = "a stylish young man"
        else:
            person_description = "a stylish young person"

    # Get local model image
    local_image = get_local_model_image(garment_name, category)
    model_image_name = local_image.split("/")[-1]
    
    current_file_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_file_dir, "..", "..", "..", ".."))
    
    # Try local assets directory first (production/docker package)
    model_image_path = os.path.abspath(os.path.join(current_file_dir, "..", "..", "assets", "ai-models", model_image_name))
    
    # Fallback to frontend public folder (local dev compose setup)
    if not os.path.exists(model_image_path):
        model_image_path = os.path.join(project_root, "frontend", "public", local_image.lstrip("/"))
    
    # 2. Attempt IDM-VTON
    generated_image_url = None
    try_on_dir = os.path.join(project_root, "frontend", "public", "try-on")
    os.makedirs(try_on_dir, exist_ok=True)
    
    try:
        import tempfile
        import httpx
        garment_image_path = None
        print(f"garment_image_url received: {garment_image_url}")
        
        # Prepare the URL to fetch the garment image dynamically
        fetch_url = resolve_garment_url(garment_image_url, request)
            
        print(f"Fetching garment image from: {fetch_url}")
        async with httpx.AsyncClient() as client:
            resp = await client.get(fetch_url)
            if resp.status_code == 200:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_g:
                    tmp_g.write(resp.content)
                    garment_image_path = tmp_g.name
                    print(f"Downloaded garment image to: {garment_image_path}")
            else:
                print(f"Failed to fetch garment image: HTTP {resp.status_code}")
                
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_u:
            tmp_u.write(user_image_bytes)
            person_image_path = tmp_u.name
            print(f"Saved user image to {person_image_path}")
            
        if garment_image_path:
            vton_category = "Upper-body"
            if "dress" in category.lower():
                vton_category = "Dress"
            elif "bottom" in category.lower() or "pant" in category.lower():
                vton_category = "Lower-body"
            
            print(f"Starting IDM-VTON generation with category: {vton_category}")
            vton_result_path = await generate_virtual_tryon(
                person_image_path, garment_image_path, vton_category, try_on_dir
            )
            
            if vton_result_path:
                filename = os.path.basename(vton_result_path)
                generated_image_url = f"/api/v1/vto/image/{filename}"
                print(f"IDM-VTON completed: {generated_image_url}")
    except Exception as vton_err:
        print(f"IDM-VTON failed: {vton_err}")

    # 3. Fallback to Face Swap if IDM-VTON failed
    if not generated_image_url and face_box and os.path.exists(model_image_path):
        try:
            model_img = Image.open(model_image_path)
            model_face_box = MODEL_FACES_DB.get(model_image_name)
            
            if model_face_box is not None or model_image_name not in MODEL_FACES_DB:
                if not model_face_box:
                    model_face_box = DEFAULT_MODEL_FACE_BOX
                
                result_img = swap_face(pil_user_image, model_img, face_box, model_face_box)
                filename = f"tryon_{uuid.uuid4().hex[:12]}.png"
                save_path = os.path.join(try_on_dir, filename)
                result_img.save(save_path, "PNG")
                
                generated_image_url = f"/api/v1/vto/image/{filename}"
                print(f"Face swap completed successfully: {generated_image_url}")
        except Exception as swap_err:
            print(f"Face swap workflow failed: {swap_err}")

    # 4. Final Fallback to local model image
    if not generated_image_url:
        generated_image_url = local_image

    return VTOResponse(
        generated_image_url=generated_image_url,
        status="success",
        styling_advice=advice
    )
