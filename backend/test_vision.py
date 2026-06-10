import asyncio
import os
import io
import base64
from app.utils.llm_provider import vision_completion

def test_vision():
    # Make a dummy 1x1 image
    from PIL import Image
    img = Image.new('RGB', (10, 10), color = 'red')
    b = io.BytesIO()
    img.save(b, format='JPEG')
    img_bytes = b.getvalue()
    
    image_data = {"mime_type": "image/jpeg", "data": img_bytes}
    prompt = "Is this a solid red image?"
    
    try:
        res = vision_completion(image_data, prompt)
        print("Vision completion successful:", res)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_vision()
