import asyncio
import os
from app.utils.idm_vton import _get_vton_client

async def test():
    print("Testing IDM-VTON...")
    key = os.getenv('HF_API_KEY')
    print(f"HF_API_KEY exists: {bool(key)}")
    
    try:
        client = _get_vton_client()
        if client:
            print("Successfully connected to VTON Client!")
        else:
            print("Failed to connect to VTON Client.")
    except Exception as e:
        print("Error during connection:", e)

if __name__ == "__main__":
    asyncio.run(test())
