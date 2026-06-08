"""
Safety Agent — lightweight rules-based guardrails (no Gemini calls).
Replaces the previous LLM-based approach which consumed 2 API quota slots per message.
"""
import re
from typing import Tuple

_INJECTION_PATTERNS = re.compile(
    r"(ignore (previous|all) instructions|you are now|system prompt|drop table|delete (all|from)|"
    r"insert into|select \*|exec(ute)?\s*\(|<script|javascript:|api.?key|reveal your prompt)",
    re.IGNORECASE,
)

_LEAK_PATTERNS = re.compile(
    r"(system_instruction|QUICK_STYLE Multi-Tasking|you are the quick_style|"
    r"api[_\s]?key\s*=|bearer [a-z0-9]{20,})",
    re.IGNORECASE,
)


async def pre_retrieval_guardrail(query: str) -> Tuple[bool, str]:
    if _INJECTION_PATTERNS.search(query):
        return False, "Message contains disallowed content."
    return True, ""


async def post_retrieval_guardrail(reply: str) -> str:
    if _LEAK_PATTERNS.search(reply):
        return "I'm sorry, I cannot process this request due to safety policies."
    return reply
