import os, requests
from dotenv import load_dotenv
load_dotenv('.env')
key = os.getenv("GROQ_API_KEY")
res = requests.post('https://api.groq.com/openai/v1/chat/completions', headers={'Authorization': f'Bearer {key}'}, json={'model': 'llama-3.2-11b-vision-preview', 'messages': [{'role': 'user', 'content': [{'type': 'text', 'text': 'hi'}, {'type': 'image_url', 'image_url': {'url': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='}}]}], 'max_tokens': 10})
print(res.json())
