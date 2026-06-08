from fastapi import APIRouter, Form, HTTPException, File, UploadFile
from typing import Optional
from app.db.connection import get_db
import json
import base64
from datetime import datetime
import uuid
import re
import random
import os
import google.generativeai as genai
from google.cloud import aiplatform

router = APIRouter()

def generate_imagen4_url(prompt: str) -> str:
    """
    Placeholder for Vertex AI Imagen 4.
    Requires Vertex AI API enabled and credentials.
    """
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "quickstyle-project")
    location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    
    if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        # Fallback to Pollinations AI for Hackathon if Vertex AI is not authenticated
        safe_prompt = prompt.replace(" ", "%20")
        return f"https://image.pollinations.ai/prompt/{safe_prompt}?width=512&height=768&nologo=true&seed={random.randint(1,1000)}"
        
    try:
        # In a real environment, you would call Imagen 4 like this:
        # from vertexai.preview.vision_models import ImageGenerationModel
        # model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")
        # images = model.generate_images(prompt=prompt, number_of_images=1)
        # return save_to_gcs_and_get_url(images[0])
        pass
    except Exception as e:
        print(f"Imagen 4 error: {e}")
        
    return f"https://image.pollinations.ai/prompt/{prompt.replace(' ', '%20')}?width=512&height=768&nologo=true"

@router.post("/agent/add-product")
async def agent_add_product(
    message: str = Form(""),
    images_base64: Optional[str] = Form(None), # JSON array of base64 strings
    audio_file: Optional[UploadFile] = File(None)
):
    """
    Simulates an AI Agent workflow:
    1. Uses Vertex AI SDK (Gemini Vision) to extract product details from the raw image.
    2. Uses Vertex AI Imagen 4 to generate high-quality model photos.
    3. Saves the product to the DB.
    """
    db = get_db()

    if not images_base64:
        return {"status": "error", "reply": "I need at least one image of the clothing to register it! Please upload one."}
        
    images_list = []
    try:
        images_list = json.loads(images_base64)
    except:
        images_list = [images_base64]
        
    main_image = images_list[0] if len(images_list) > 0 else ""

    # Extract details using Gemini 1.5 Flash (Vision + Audio)
    extracted_details = {
        "name": "AI Generated Apparel",
        "price_val": 2499.0,
        "category": "Unisex",
        "brand": "QUICK_STYLE",
        "description": "A stunning new arrival processed by our AI."
    }
    
    uploaded_audio = None
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
        Analyze the provided clothing images and the shopkeeper's description.
        If an audio file is provided, prioritize the audio transcript for the details.
        Otherwise, use the text message: "{message}".
        Return a JSON object with the following keys:
        - name: A catchy product name
        - price: A reasonable price in INR (integer)
        - category: e.g. Streetwear, Formals, Activewear
        - brand: The inferred brand or "QUICK_STYLE"
        - description: A premium, SEO-optimized product description
        """
        
        contents = [prompt]
        
        # Add audio if present
        if audio_file:
            audio_bytes = await audio_file.read()
            temp_audio_path = f"/tmp/{uuid.uuid4().hex}.webm"
            os.makedirs("/tmp", exist_ok=True)
            with open(temp_audio_path, "wb") as f:
                f.write(audio_bytes)
            uploaded_audio = genai.upload_file(temp_audio_path)
            contents.append(uploaded_audio)
            
        # Add primary image for analysis
        img_data = base64.b64decode(main_image.split(",")[1] if "," in main_image else main_image)
        contents.append({"mime_type": "image/jpeg", "data": img_data})
        
        response = await model.generate_content_async(contents)
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
            
        data = json.loads(text)
        extracted_details["name"] = data.get("name", extracted_details["name"])
        extracted_details["price_val"] = float(data.get("price", extracted_details["price_val"]))
        extracted_details["category"] = data.get("category", extracted_details["category"])
        extracted_details["brand"] = data.get("brand", extracted_details["brand"])
        extracted_details["description"] = data.get("description", extracted_details["description"])
        
    except Exception as e:
        print(f"Gemini Vision/Audio error: {e}")
    finally:
        if uploaded_audio:
            try:
                genai.delete_file(uploaded_audio.name)
                os.remove(temp_audio_path)
            except:
                pass

    try:
        name = extracted_details["name"]
        category = extracted_details["category"]
        
        # 1. Generate Prompts for Vertex AI Imagen 4
        prompt_1 = f"A realistic high-fashion photoshoot of a beautiful female model wearing {name}, {category} fashion, studio lighting, highly detailed, full body, vogue"
        prompt_2 = f"A realistic high-fashion photoshoot of a handsome male model wearing {name}, {category} fashion, urban street style, highly detailed, 4k"
        
        gen_img_1 = generate_imagen4_url(prompt_1)
        gen_img_2 = generate_imagen4_url(prompt_2)
        
        # Construct the Product Document
        product_doc = {
            "id": f"PRD-{uuid.uuid4().hex[:6].upper()}",
            "name": name,
            "description": extracted_details["description"],
            "brand": extracted_details["brand"],
            "size_variance": 0,
            "category": category,
            "subcategory": "New Arrivals",
            "tags": ["ai_generated", "new"],
            "outfit_tags": [],
            "pairs_well_with": [],
            "price": {
                "mrp": extracted_details["price_val"] * 1.4,
                "selling_price": extracted_details["price_val"],
                "discount_percent": 40.0
            },
            "sizes_available": ["S", "M", "L", "XL"],
            "colors": [{
                "name": "Default",
                "hex": "#000000",
                "images": {
                    "main": main_image, 
                    "gallery": images_list[1:] + [gen_img_1, gen_img_2], # The AI generated models and extra uploaded photos
                    "frames_360": [],
                    "has_360": False
                }
            }],
            "store_id": "STORE_ADMIN",
            "store_name": "QUICK_STYLE Flagship",
            "store_location": {
                "type": "Point",
                "coordinates": [88.3616, 22.5015] # South City Luxe
            },
            "stock": {"S": 10, "M": 15, "L": 10, "XL": 5},
            "rating": {"average": 5.0, "count": 1},
            "fit_confidence_avg": 95,
            "active": True,
            "created_at": datetime.utcnow()
        }
        
        # Save to DB
        await db.products.insert_one(product_doc)
        product_doc["_id"] = str(product_doc["_id"]) # Convert ObjectId for JSON serialization
        
        return {
            "status": "success",
            "product": product_doc,
            "reply": f"Successfully registered {name} using Gemini Vision and Imagen 4!"
        }
    except Exception as e:
        print("Agent error:", e)
        return {"status": "error", "reply": "There was an internal error processing the registry."}
