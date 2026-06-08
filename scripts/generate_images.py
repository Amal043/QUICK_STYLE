import os
import requests
import time
from pymongo import MongoClient

HF_TOKEN = os.getenv("HF_TOKEN", "")
API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

# We'll generate 4 new products
prompts = [
    {
        "name": "Luxury Silk Evening Gown",
        "prompt": "A premium, minimalist 3D render of a luxury emerald green silk evening gown on a mannequin, dramatic studio lighting, dark background, ultra high detail",
        "category": "Dresses",
        "price": 4500,
        "filename": "silk_gown.jpg"
    },
    {
        "name": "Designer Leather Jacket",
        "prompt": "A premium, minimalist 3D render of a sleek black designer leather jacket, dramatic studio lighting, grey marble slab, fashion photography",
        "category": "Jackets",
        "price": 8900,
        "filename": "leather_jacket.jpg"
    },
    {
        "name": "Summer Floral Sundress",
        "prompt": "A premium fashion editorial photo of a light yellow summer floral sundress floating gracefully, bright natural lighting, soft shadows",
        "category": "Dresses",
        "price": 2400,
        "filename": "floral_sundress.jpg"
    },
    {
        "name": "Tailored Wool Overcoat",
        "prompt": "A premium fashion photo of a luxurious camel wool overcoat, perfectly tailored, standing against a dark concrete wall, cinematic lighting",
        "category": "Jackets",
        "price": 6500,
        "filename": "wool_overcoat.jpg"
    }
]

client = MongoClient("mongodb://localhost:27017")
db = client.quick_clothing

def generate_and_save(prompt_data):
    print(f"Generating image for: {prompt_data['name']}...")
    payload = {"inputs": prompt_data["prompt"]}
    
    # Retry mechanism for HF API
    for i in range(3):
        response = requests.post(API_URL, headers=headers, json=payload)
        if response.status_code == 200:
            filepath = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "images", prompt_data["filename"])
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, "wb") as f:
                f.write(response.content)
            print(f"Saved to {filepath}")
            return f"/images/{prompt_data['filename']}"
        else:
            print(f"Attempt {i+1} failed: {response.status_code} - {response.text}")
            time.sleep(2)
    return None

def main():
    for p in prompts:
        image_url = generate_and_save(p)
        if image_url:
            # Create a product in DB
            new_product = {
                "name": p["name"],
                "description": p["name"] + " made from premium materials.",
                "price": {
                    "mrp": p["price"] + 1000,
                    "selling_price": p["price"],
                    "discount_percent": round((1000 / (p["price"] + 1000)) * 100)
                },
                "image": image_url,
                "category": p["category"],
                "store_name": "South City Luxe",
                "store_location": {
                    "type": "Point",
                    "coordinates": [88.3616, 22.5015]
                },
                "brand": "Zevana",
                "sizes_available": ["S", "M", "L", "XL"],
                "colors": [{"name": "Standard", "hex": "#000000"}],
                "fit_confidence_avg": 92,
                "created_at": time.time(),
                "return_policy": "Exchange"
            }
            db.products.insert_one(new_product)
            print(f"Inserted {p['name']} into MongoDB.")
            
    print("Done generating new products.")

if __name__ == "__main__":
    main()
