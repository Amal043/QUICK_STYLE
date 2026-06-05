from fastapi import APIRouter, Form, HTTPException, File, UploadFile
from typing import Optional
from app.db.connection import get_db
import json
import base64
from datetime import datetime
import uuid
import re
import random

router = APIRouter()

def generate_model_image_url(prompt: str, seed: int = 42) -> str:
    """Uses pollinations.ai for free, keyless on-the-fly AI image generation."""
    safe_prompt = prompt.replace(" ", "%20")
    return f"https://image.pollinations.ai/prompt/{safe_prompt}?width=512&height=768&nologo=true&seed={seed}"

@router.post("/agent/add-product")
async def agent_add_product(
    message: str = Form(...),
    image_base64: Optional[str] = Form(None)
):
    """
    Simulates an AI Agent workflow:
    1. Parses the text input for product details
    2. Uses Pollinations.ai to generate model photos
    3. Saves the product to the DB
    """
    
    db = get_db()
    
    # Very basic "agentic" extraction using regex/heuristics since we don't have an LLM API key here.
    # We will try to extract Name, Price, Category, Brand, Size from the manual string or chat.
    
    name_match = re.search(r'(?:name|product):?\s*([^,.]*)', message, re.IGNORECASE)
    price_match = re.search(r'price:?\s*(\d+)', message, re.IGNORECASE)
    cat_match = re.search(r'category:?\s*([^,.]*)', message, re.IGNORECASE)
    brand_match = re.search(r'brand:?\s*([^,.]*)', message, re.IGNORECASE)
    desc_match = re.search(r'description:?\s*(.*)', message, re.IGNORECASE)
    
    name = name_match.group(1).strip() if name_match else "AI Generated Apparel"
    price_val = float(price_match.group(1)) if price_match else 2499.0
    category = cat_match.group(1).strip() if cat_match else "Unisex"
    brand = brand_match.group(1).strip() if brand_match else "QUICK_STYLE"
    description = desc_match.group(1).strip() if desc_match else "A stunning new arrival processed by our AI."

    # Need an image to register
    if not image_base64:
        return {"status": "error", "reply": "I need an image of the clothing to register it! Please upload one."}
        
    if len(name) < 2:
        return {"status": "error", "reply": "Could you provide a name for this product?"}

    try:
        # 1. Generate Prompts for Pollinations AI Model Generation
        prompt_1 = f"A realistic high-fashion photoshoot of a beautiful female model wearing {name}, {category} fashion, studio lighting, highly detailed, full body, vogue"
        prompt_2 = f"A realistic high-fashion photoshoot of a handsome male model wearing {name}, {category} fashion, urban street style, highly detailed, 4k"
        
        gen_img_1 = generate_model_image_url(prompt_1, seed=random.randint(1, 100000))
        gen_img_2 = generate_model_image_url(prompt_2, seed=random.randint(1, 100000))
        
        # Construct the Product Document
        product_doc = {
            "id": f"PRD-{uuid.uuid4().hex[:6].upper()}",
            "name": name,
            "description": description,
            "brand": brand,
            "size_variance": 0,
            "category": category,
            "subcategory": "New Arrivals",
            "tags": ["ai_generated", "new"],
            "outfit_tags": [],
            "pairs_well_with": [],
            "price": {
                "mrp": price_val * 1.4,
                "selling_price": price_val,
                "discount_percent": 40.0
            },
            "sizes_available": ["S", "M", "L", "XL"],
            "colors": [{
                "name": "Default",
                "hex": "#000000",
                "images": {
                    "main": image_base64, # The raw uploaded image
                    "gallery": [gen_img_1, gen_img_2], # The AI generated models
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
            "reply": f"Successfully registered {name} and generated model images!"
        }
    except Exception as e:
        print("Agent error:", e)
        return {"status": "error", "reply": "There was an internal error processing the registry."}
