import os
import sys
import asyncio
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.db.connection import connect_to_mongo, get_db
import google.generativeai as genai

async def generate_embeddings():
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", ".env"))
    
    if os.getenv("GOOGLE_API_KEY"):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    else:
        print("GOOGLE_API_KEY not set.")
        return

    await connect_to_mongo()
    db = get_db()
    
    if db is None:
        print("Failed to connect to MongoDB.")
        return
        
    print("Fetching products...")
    cursor = db.products.find({"embedding": {"$exists": False}})
    products = await cursor.to_list(length=None)
    print(f"Found {len(products)} products without embeddings.")
    
    for idx, product in enumerate(products):
        text_to_embed = f"{product.get('name', '')} {product.get('description', '')} {' '.join(product.get('tags', []))} {product.get('category', '')}"
        try:
            print(f"Generating embedding for product {product['_id']} ({idx+1}/{len(products)})")
            result = genai.embed_content(
                model="models/text-embedding-004",
                contents=text_to_embed,
                task_type="retrieval_document",
            )
            embedding = result.get('embedding', [])
            
            if embedding:
                await db.products.update_one(
                    {"_id": product["_id"]},
                    {"$set": {"embedding": embedding}}
                )
        except Exception as e:
            print(f"Error embedding product {product['_id']}: {e}")
            
    print("Done generating embeddings.")

if __name__ == "__main__":
    asyncio.run(generate_embeddings())
