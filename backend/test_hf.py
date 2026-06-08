import os
import httpx

def main():
    token = os.getenv("HF_TOKEN", "YOUR_HF_TOKEN_HERE")
    url = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": "A premium, minimalist 3D render of a luxury glass perfume bottle sitting on a wet dark marble slab, dramatic studio lighting"
    }
    
    print("Sending request to Hugging Face Inference API (FLUX.1-schnell)...")
    try:
        response = httpx.post(url, headers=headers, json=payload, timeout=60.0)
        print("Status Code:", response.status_code)
        
        if response.status_code == 200:
            with open("my_generated_image.jpg", "wb") as f:
                f.write(response.content)
            print("Success! Image saved to my_generated_image.jpg")
        else:
            print("Error Response:")
            print(response.text)
    except Exception as e:
        print("Exception occurred:", e)

if __name__ == "__main__":
    main()
