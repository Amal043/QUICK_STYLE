import os, requests
from dotenv import load_dotenv
load_dotenv('.env')
key = os.getenv("GROQ_API_KEY")
res = requests.post('https://api.groq.com/openai/v1/chat/completions', headers={'Authorization': f'Bearer {key}'}, json={'model': 'llama3-8b-8192', 'messages': [{'role': 'system', 'content': 'You are an AI.'}, {'role': 'user', 'content': 'hi'}], 'max_tokens': 1024})
print(res.json())
