import os
import google.generativeai as genai
from google.generativeai import GenerativeModel

FALLBACK_MODEL = "gemini-2.5-flash-lite"

def _configure_primary():
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def _configure_fallback():
    fallback_key = os.getenv("GOOGLE_API_KEY_FALLBACK")
    if fallback_key:
        genai.configure(api_key=fallback_key)
        return True
    # No separate fallback key — stay on primary key but switch model
    _configure_primary()
    return True

def _is_quota_error(e: Exception) -> bool:
    msg = str(e).lower()
    return "quota" in msg or "429" in msg or "resource_exhausted" in msg or "exhausted" in msg

class FallbackGenerativeModel:
    def __init__(self, model_name="gemini-2.5-flash-lite", **kwargs):
        self.model_name = model_name
        self.kwargs = kwargs
        _configure_primary()
        self._model = GenerativeModel(self.model_name, **kwargs)

    def generate_content(self, *args, **kwargs):
        _configure_primary()
        try:
            return self._model.generate_content(*args, **kwargs)
        except Exception as e:
            print(f"Primary Gemini call failed: {e}. Trying fallback model {FALLBACK_MODEL}...")
            if _configure_fallback():
                fallback_model = GenerativeModel(FALLBACK_MODEL, **self.kwargs)
                return fallback_model.generate_content(*args, **kwargs)
            raise e

    async def generate_content_async(self, *args, **kwargs):
        _configure_primary()
        try:
            return await self._model.generate_content_async(*args, **kwargs)
        except Exception as e:
            print(f"Primary async Gemini call failed: {e}. Trying fallback model {FALLBACK_MODEL}...")
            if _configure_fallback():
                fallback_model = GenerativeModel(FALLBACK_MODEL, **self.kwargs)
                return await fallback_model.generate_content_async(*args, **kwargs)
            raise e

    def start_chat(self, **kwargs):
        return FallbackChatSession(self, **kwargs)

class FallbackChatSession:
    def __init__(self, fallback_model_wrapper, **kwargs):
        self.wrapper = fallback_model_wrapper
        self.kwargs = kwargs
        _configure_primary()
        self._chat = self.wrapper._model.start_chat(**kwargs)

    @property
    def history(self):
        return self._chat.history

    def send_message(self, *args, **kwargs):
        _configure_primary()
        try:
            return self._chat.send_message(*args, **kwargs)
        except Exception as e:
            print(f"Primary chat send_message failed: {e}. Trying fallback model {FALLBACK_MODEL}...")
            if _configure_fallback():
                fallback_model = GenerativeModel(FALLBACK_MODEL, **self.wrapper.kwargs)
                self._chat = fallback_model.start_chat(history=self._chat.history)
                return self._chat.send_message(*args, **kwargs)
            raise e

    async def send_message_async(self, *args, **kwargs):
        _configure_primary()
        try:
            return await self._chat.send_message_async(*args, **kwargs)
        except Exception as e:
            print(f"Primary async chat send_message failed: {e}. Trying fallback model {FALLBACK_MODEL}...")
            if _configure_fallback():
                fallback_model = GenerativeModel(FALLBACK_MODEL, **self.wrapper.kwargs)
                self._chat = fallback_model.start_chat(history=self._chat.history)
                return await self._chat.send_message_async(*args, **kwargs)
            raise e
