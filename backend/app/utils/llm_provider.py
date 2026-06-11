import os
import json
import base64
from typing import Optional
import httpx
import groq
import google.generativeai as genai
from groq import Groq as GroqClient
from google.generativeai import GenerativeModel

# Configuration
GEMINI_MODEL = "gemini-2.5-flash"
GROQ_MODEL = "llama-3.3-70b-versatile"
HF_TEXT_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"
HF_VISION_MODEL = "llava-hf/llava-1.5-7b-hf"

_groq_client: Optional[GroqClient] = None
_gemini_client: Optional[GenerativeModel] = None

def _init_groq():
    """Initialize Groq client."""
    global _groq_client
    if _groq_client is None:
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            raise ValueError("GROQ_API_KEY not set in environment")
        _groq_client = GroqClient(api_key=groq_key)
    return _groq_client

def _init_gemini():
    """Initialize Gemini client."""
    global _gemini_client
    if _gemini_client is None:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not set in environment")
        genai.configure(api_key=api_key)
        _gemini_client = GenerativeModel(GEMINI_MODEL)
    return _gemini_client

def _get_hf_key():
    hf_key = os.getenv("HF_API_KEY")
    if not hf_key:
        raise ValueError("HF_API_KEY not set in environment")
    return hf_key

async def _hf_text_completion(messages: list, temperature: float = 0.7, max_tokens: int = 1024) -> str:
    """Hugging Face Inference API for Text"""
    headers = {"Authorization": f"Bearer {_get_hf_key()}", "Content-Type": "application/json"}
    url = f"https://api-inference.huggingface.co/models/{HF_TEXT_MODEL}/v1/chat/completions"
    
    payload = {
        "model": HF_TEXT_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

async def _gemini_completion(messages: list, temperature: float = 0.7, max_tokens: int = 1024) -> str:
    """Gemini API for text."""
    gemini_client = _init_gemini()
    gemini_messages = []
    for msg in messages:
        gemini_messages.append({
            "role": "user" if msg.get("role") != "assistant" else "model",
            "parts": [{"text": msg.get("content", "")}]
        })
    
    response = await gemini_client.generate_content_async(
        gemini_messages,
        generation_config=genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens
        )
    )
    return response.text.strip()

async def _groq_completion(messages: list, temperature: float = 0.7, max_tokens: int = 1024, response_format: Optional[dict] = None) -> str:
    """Groq API for text."""
    groq_client = _init_groq()
    kwargs = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format and response_format.get("type") == "json_object":
        kwargs["response_format"] = response_format

    response = groq_client.chat.completions.create(**kwargs)
    return response.choices[0].message.content.strip()

async def chat_completion(
    messages: list,
    temperature: float = 0.7,
    max_tokens: int = 1024,
    response_format: Optional[dict] = None,
    use_fallback: bool = False
) -> str:
    """
    Priority 1: Gemini
    Priority 2: Groq
    Priority 3: Hugging Face
    """
    try:
        return await _gemini_completion(messages, temperature, max_tokens)
    except Exception as e:
        print(f"[LLM] Gemini chat failed: {e}. Falling back to Groq...")
        try:
            return await _groq_completion(messages, temperature, max_tokens, response_format)
        except Exception as groq_err:
            print(f"[LLM] Groq chat failed: {groq_err}. Falling back to Hugging Face...")
            try:
                return await _hf_text_completion(messages, temperature, max_tokens)
            except Exception as hf_err:
                print(f"[LLM] HF chat also failed: {hf_err}")
                raise

def vision_completion(
    image_data,
    prompt: str,
    temperature: float = 0.2,
    use_fallback: bool = False
) -> str:
    """
    Priority 1: Gemini
    Priority 2: Hugging Face Vision (Groq has no vision right now)
    """
    try:
        gemini_client = _init_gemini()
        response = gemini_client.generate_content(
            [prompt, image_data],
            generation_config=genai.types.GenerationConfig(
                temperature=temperature
            )
        )
        return response.text.strip()
    except Exception as e:
        print(f"[LLM] Gemini Vision failed: {e}. Falling back to Hugging Face Vision...")
        try:
            b64_img = base64.b64encode(image_data["data"]).decode("utf-8")
            url = f"data:{image_data['mime_type']};base64,{b64_img}"
            
            headers = {"Authorization": f"Bearer {_get_hf_key()}", "Content-Type": "application/json"}
            api_url = f"https://api-inference.huggingface.co/models/{HF_VISION_MODEL}/v1/chat/completions"
            payload = {
                "model": HF_VISION_MODEL,
                "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": url}}]}],
                "temperature": temperature,
                "max_tokens": 1024
            }
            res = httpx.post(api_url, headers=headers, json=payload, timeout=40.0)
            res.raise_for_status()
            data = res.json()
            return data["choices"][0]["message"]["content"].strip()
        except Exception as hf_err:
            print(f"[LLM] HF Vision fallback failed: {hf_err}")
            raise

def format_json_request(prompt: str) -> dict:
    return {"type": "json_object", "schema": {"type": "object", "properties": {}}}

async def registry_agent_chat(
    chat_history: list,
    current_message: str,
    image_data_list: list,
    temperature: float = 0.2
) -> str:
    """
    Priority 1: Gemini
    Priority 2: Groq (text only)
    Priority 3: Hugging Face (text/vision)
    """
    system_prompt = """You are the QUICK_STYLE AI Registry Assistant.
Your goal is to help the store admin register new clothing products.
You MUST gather or generate the following 4 pieces of information:
1. Product Name (If not explicitly provided by the user, you should generate a catchy, marketable name yourself based on the photo/details).
2. Price (in INR as integer, e.g. 700. This must be provided by the user).
3. Category (e.g. Men, Women, Unisex, Streetwear, Formals - infer from details/photo if not explicitly specified).
4. Description (A premium 2-sentence description highlighting fabric, fit, and occasion. YOU must generate this yourself based on the photo and details once you have the price).

You also need at least one uploaded photo of the clothing item.

INSTRUCTIONS:
- Review the chat history and the current user message/images.
- If the image or the price is missing, output a JSON reply asking the user nicely for the missing information.
- Once you have the image and the price, you should generate the Product Name (if not specified), Category (if not specified), and Description yourself.
- Do NOT loop-ask the user to write the description or name if you can generate it yourself. If you have the image and the price, proceed to register the product immediately.

OUTPUT FORMAT (You MUST return exactly one of these JSON structures and nothing else):

If missing image or price:
{
  "action": "reply",
  "message": "Got the photos! What is the price of this item?"
}

If you have the image and price (generate Name, Category, and Description yourself if not provided):
{
  "action": "register",
  "name": "Catchy Product Name",
  "price": 700,
  "category": "Men",
  "description": "A premium description highlighting fabric, fit, and occasion that you generated.",
  "brand": "QUICK_STYLE",
  "sizes": ["S", "M", "L", "XL"],
  "color_name": "Default",
  "color_hex": "#888888",
  "return_policy": "Exchange",
  "return_window_days": 5,
  "gender": "unisex",
  "has_model": false
}

Note for 'has_model': Set to true ONLY if a real person is wearing the garment in the photo. False if it is a flat-lay or hanger shot."""
    
    def parse_llm_json(text: str) -> str:
        if text.startswith("```"):
            parts = text.split("```")
            text = parts[1] if len(parts) > 1 else text
            if text.startswith("json"):
                text = text[4:].strip()
        return text

    # Try Gemini FIRST
    try:
        gemini_client = _init_gemini()
        gemini_prompt = system_prompt + "\n\nChat History:\n"
        for msg in chat_history:
            role = "Agent" if msg.get("role") == "agent" else "User"
            gemini_prompt += f"{role}: {msg.get('text', '')}\n"
        gemini_prompt += f"\nCurrent Message:\nUser: {current_message}\n"
        
        gemini_content = [gemini_prompt]
        for img in image_data_list:
            gemini_content.append(img)
            
        response = await gemini_client.generate_content_async(
            gemini_content,
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
                response_mime_type="application/json"
            )
        )
        return parse_llm_json(response.text.strip())
    except Exception as e:
        print(f"[LLM] Registry agent Gemini failed: {e}. Falling back to next priority...")

    # If Gemini fails, use Groq (text) or HF (vision/text)
    try:
        if not image_data_list:
            # TEXT ONLY -> GROQ priority 2
            messages = [{"role": "system", "content": system_prompt}]
            for msg in chat_history:
                role = "assistant" if msg.get("role") == "agent" else "user"
                messages.append({"role": role, "content": msg.get("text", "")})
            messages.append({"role": "user", "content": current_message if current_message else "Hello"})
            
            # Use Groq Async client instead of sync client! 
            # Wait, _init_groq returns sync Groq(). I'll use the _groq_completion helper I wrote earlier!
            response_text = await _groq_completion(messages, temperature=temperature)
            return parse_llm_json(response_text)
        else:
            # HAS IMAGES -> Hugging Face Vision fallback (Priority 2 for vision)
            messages = [{"role": "system", "content": [{"type": "text", "text": system_prompt}]}]
            current_content = []
            if current_message:
                current_content.append({"type": "text", "text": current_message})
            else:
                current_content.append({"type": "text", "text": "Here are the images."})
                
            for img in image_data_list:
                b64_img = base64.b64encode(img["data"]).decode("utf-8")
                url = f"data:{img['mime_type']};base64,{b64_img}"
                current_content.append({"type": "image_url", "image_url": {"url": url}})
            
            messages.append({"role": "user", "content": current_content})
            
            headers = {"Authorization": f"Bearer {_get_hf_key()}", "Content-Type": "application/json"}
            api_url = f"https://api-inference.huggingface.co/models/{HF_VISION_MODEL}/v1/chat/completions"
            payload = {"model": HF_VISION_MODEL, "messages": messages, "temperature": temperature, "max_tokens": 1024}
            
            async with httpx.AsyncClient(timeout=40.0) as client:
                res = await client.post(api_url, headers=headers, json=payload)
                res.raise_for_status()
                return parse_llm_json(res.json()["choices"][0]["message"]["content"].strip())
            
    except Exception as fallback_err:
        print(f"[LLM] Fallback failed: {fallback_err}")
        # If Groq text failed, we should try HF Text too!
        if not image_data_list:
            try:
                messages = [{"role": "system", "content": system_prompt}]
                for msg in chat_history:
                    role = "assistant" if msg.get("role") == "agent" else "user"
                    messages.append({"role": role, "content": msg.get("text", "")})
                messages.append({"role": "user", "content": current_message if current_message else "Hello"})
                
                response_text = await _hf_text_completion(messages, temperature=temperature)
                return parse_llm_json(response_text)
            except Exception as final_err:
                print(f"[LLM] Ultimate HF Text Fallback failed: {final_err}")
        
        # Absolute final fallback if everything fails
        return json.dumps({
            "action": "reply",
            "message": "I'm experiencing heavy traffic. Could you please provide the price, name, category, and description?"
        })