"""
Unified LLM Provider: Groq (primary) + Gemini 2.0 (fallback)
All AI agents (chat, registry, negotiation, intent) use this provider.
"""
import os
from typing import Optional, AsyncGenerator
import groq
import google.generativeai as genai
from groq import Groq as GroqClient
from google.generativeai import GenerativeModel

# Configuration
GROQ_MODEL = "mixtral-8x7b-32768"  # Fast, free tier available
GEMINI_FALLBACK_MODEL = "gemini-2.0-flash"

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
    """Initialize Gemini fallback client."""
    global _gemini_client
    if _gemini_client is None:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not set in environment")
        genai.configure(api_key=api_key)
        _gemini_client = GenerativeModel(GEMINI_FALLBACK_MODEL)
    return _gemini_client


async def chat_completion(
    messages: list,
    temperature: float = 0.7,
    max_tokens: int = 1024,
    response_format: Optional[dict] = None,
    use_fallback: bool = False
) -> str:
    """
    Primary: Groq (fast, free)
    Fallback: Gemini 2.0 on error
    """
    if use_fallback:
        return await _gemini_completion(messages, temperature, max_tokens)

    try:
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

    except Exception as e:
        print(f"[LLM] Groq failed: {e}. Falling back to Gemini 2.0...")
        try:
            return await _gemini_completion(messages, temperature, max_tokens)
        except Exception as fallback_err:
            print(f"[LLM] Gemini fallback also failed: {fallback_err}")
            raise


async def _gemini_completion(
    messages: list,
    temperature: float = 0.7,
    max_tokens: int = 1024
) -> str:
    """Gemini fallback using async API."""
    try:
        gemini_client = _init_gemini()

        # Convert OpenAI-style messages to Gemini format
        gemini_messages = []
        for msg in messages:
            gemini_messages.append({
                "role": msg.get("role", "user"),
                "parts": [{"text": msg.get("content", "")}]
            })

        response = await gemini_client.generate_content_async(
            gemini_messages[-1]["parts"][0]["text"],  # Use latest message as direct prompt
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens
            )
        )
        return response.text.strip()
    except Exception as e:
        print(f"[LLM] Gemini error: {e}")
        raise


def vision_completion(
    image_data,
    prompt: str,
    temperature: float = 0.2,
    use_fallback: bool = False
) -> str:
    """
    Vision: Groq doesn't support vision yet, so use Gemini directly.
    Falls back if Gemini fails.
    """
    try:
        gemini_client = _init_gemini()
        response = gemini_client.generate_content(
            [prompt, image_data],
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
                response_mime_type="application/json"
            )
        )
        text = response.text.strip()
        if text.startswith("```"):
            parts = text.split("```")
            text = parts[1] if len(parts) > 1 else text
            if text.startswith("json"):
                text = text[4:].strip()
        return text
    except Exception as e:
        print(f"[LLM] Vision completion error: {e}")
        raise


def format_json_request(prompt: str) -> dict:
    """Format a JSON request for Groq."""
    return {
        "type": "json_object",
        "schema": {
            "type": "object",
            "properties": {}
        }
    }