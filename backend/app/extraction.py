"""
backend/app/extraction.py

Tier 1 — Local LLM structured parameter extraction.

Sends the raw procurement query to the llama.cpp OpenAI-compatible server
running in WSL (localhost:8085) and extracts structured technical parameters
into JSON.

Role in pipeline: Runs BEFORE ChromaDB retrieval. Its output:
  - Is returned in the API response so the frontend can display real chips.
  - Feeds the exclusion_filter step that demotes candidates matching exclusion terms.

LLM is NEVER the final authority — it proposes, retrieval + rules verify.
"""

import json
import logging
import time
import urllib.request
from typing import Optional

logger = logging.getLogger("standardiq.extraction")

LLM_BASE_URL = "http://localhost:8085/v1"
MODEL_NAME = "Qwen3.5-4B-UD-Q4_K_XL.gguf"
LLM_TIMEOUT_SECONDS = 15  # Hard cap — if the model is overloaded, skip extraction

# ──────────────────────────────────────────────────────────────
# System prompt — tightly constrained to prevent hallucination.
# Key safeguard: "exclusions" only for terms the query
# EXPLICITLY NEGATES or EXCLUDES using negative language
# ("not", "without", "excluding", "strictly non-", "no X").
# Positive product attributes (e.g. "copper conductor") must NOT
# appear as exclusions.
# ──────────────────────────────────────────────────────────────
EXTRACTION_SYSTEM_PROMPT = """\
You are a technical parameter extraction engine for Indian government procurement specifications.
Extract structured technical parameters from the procurement query into valid JSON ONLY.
Output NO prose, NO markdown code fences, NO explanation — only raw JSON.

Output Schema (strict):
{
  "voltage": string or null,
  "material": string or null,
  "environment": string or null,
  "application": string or null,
  "exclusions": [string, ...],
  "missing_fields": [string, ...]
}

Field rules:
- "exclusions": Only capture requirements that the query EXPLICITLY NEGATES or EXCLUDES using negative language such as "not", "without", "excluding", "strictly non-", "no X", "except", "prohibit". Do NOT list positive product attributes as exclusions.
- "missing_fields": List critical omitted parameters (e.g. "voltage grade", "conductor material", "armour type", "operating temperature") that are necessary for precise standard selection but are absent from the query.
- Set any field to null if not mentioned in the query.
- "exclusions" and "missing_fields" default to empty list [] if none apply.
- Return RAW JSON only — no ```json``` wrapper, no extra text.\
"""


def _parse_llm_content(raw: str) -> dict:
    """
    Strips optional markdown fences and parses JSON.
    Raises ValueError if parsing fails.
    """
    cleaned = raw.strip()
    # Strip ```json ... ``` or ``` ... ``` wrappers (Qwen occasionally emits these)
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    return json.loads(cleaned)


_EMPTY_EXTRACTION = {
    "voltage": None,
    "material": None,
    "environment": None,
    "application": None,
    "exclusions": [],
    "missing_fields": [],
}


def extract_requirements(query: str) -> tuple[dict, float]:
    """
    Calls the local LLM to extract structured parameters from a raw query.

    Returns:
        (extraction_dict, latency_ms)
        On any failure (network, parse, timeout) returns (_EMPTY_EXTRACTION, latency_ms)
        so the /recommend pipeline always continues.
    """
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
            {"role": "user", "content": query},
        ],
        "temperature": 0.0,
        "max_tokens": 300,
    }

    start = time.time()
    try:
        # Fast socket check — fail-fast in <1ms if llama.cpp is not listening on port 8085
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.2)
            if s.connect_ex(('127.0.0.1', 8085)) != 0:
                raise ConnectionRefusedError("Local LLM server (port 8085) is offline")

        req = urllib.request.Request(
            f"{LLM_BASE_URL}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=1.5) as res:
            raw_response = json.loads(res.read().decode("utf-8"))

        latency_ms = (time.time() - start) * 1000
        content = raw_response["choices"][0]["message"]["content"]
        logger.info(f"LLM extraction raw content: {content!r}")

        parsed = _parse_llm_content(content)

        # Validate required keys are present; fill missing with defaults
        for key, default in _EMPTY_EXTRACTION.items():
            if key not in parsed:
                parsed[key] = default
            if parsed[key] is None and key in ("exclusions", "missing_fields"):
                parsed[key] = []

        logger.info(
            f"LLM extraction OK in {latency_ms:.0f}ms — "
            f"exclusions={parsed['exclusions']}, missing={parsed['missing_fields']}"
        )
        return parsed, latency_ms

    except TimeoutError:
        latency_ms = (time.time() - start) * 1000
        logger.warning(f"LLM extraction timed out after {LLM_TIMEOUT_SECONDS}s — skipping.")
        return dict(_EMPTY_EXTRACTION), latency_ms

    except Exception as exc:  # noqa: BLE001
        latency_ms = (time.time() - start) * 1000
        logger.warning(f"LLM extraction failed ({type(exc).__name__}: {exc}) — skipping.")
        return dict(_EMPTY_EXTRACTION), latency_ms


def apply_exclusion_filter(
    candidates: list[dict],
    exclusions: list[str],
) -> list[dict]:
    """
    Demotes candidates whose scope_text contains any exclusion term.

    Any candidate whose scope_text (lowercased) contains an exclusion term
    (lowercased) is flagged with exclusion_match=True and moved to the bottom
    of the list, below non-excluded candidates.

    The relative order within each partition is preserved (similarity score
    ordering from rules.py is maintained).
    """
    if not exclusions:
        return candidates

    exclusion_lower = [e.lower() for e in exclusions]
    clean: list[dict] = []
    flagged: list[dict] = []

    for c in candidates:
        scope = (c.get("scope_text") or "").lower()
        matched = [term for term in exclusion_lower if term in scope]
        if matched:
            c = dict(c)  # don't mutate original
            c["exclusion_match"] = True
            c["exclusion_terms"] = matched
            flagged.append(c)
        else:
            c = dict(c)
            c["exclusion_match"] = False
            c["exclusion_terms"] = []
            clean.append(c)

    ordered = clean + flagged
    # Re-rank after exclusion demotion
    for idx, item in enumerate(ordered):
        item["rank"] = idx + 1

    return ordered
