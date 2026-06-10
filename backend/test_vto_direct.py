import asyncio
import os
import httpx
import tempfile
import shutil
from app.utils.idm_vton import generate_virtual_tryon

async def run():
    print("Downloading person image...")
    person_img = None
    # Let's download a person image (a woman) from unsplash source
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")
        if resp.status_code == 200:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                tmp.write(resp.content)
                person_img = tmp.name
        
    print("Downloading garment image via Nginx...")
    garment_img = None
    async with httpx.AsyncClient() as client:
        resp = await client.get("http://nginx/ai-models/striped_dress_front.png")
        if resp.status_code == 200:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                tmp.write(resp.content)
                garment_img = tmp.name
                
    if not person_img or not garment_img:
        print("Failed to download images")
        return

    print(f"Person image saved at: {person_img} (Size: {os.path.getsize(person_img)} bytes)")
    print(f"Garment image saved at: {garment_img} (Size: {os.path.getsize(garment_img)} bytes)")

    output_dir = "/app/try-on"
    os.makedirs(output_dir, exist_ok=True)
    
    print("Calling IDM-VTON API...")
    try:
        res = await generate_virtual_tryon(person_img, garment_img, "Dress", output_dir)
        print(f"IDM-VTON completed. Result path: {res}")
        if res and os.path.exists(res):
            print(f"Result file size: {os.path.getsize(res)} bytes")
            if os.path.getsize(res) < 1000:
                print("Result file is too small! Reading its contents...")
                with open(res, "r", encoding='utf-8', errors='ignore') as f:
                    print(f.read())
        else:
            print("Result path is None or does not exist.")
    except Exception as e:
        print(f"Exception during IDM-VTON: {e}")

if __name__ == "__main__":
    asyncio.run(run())
