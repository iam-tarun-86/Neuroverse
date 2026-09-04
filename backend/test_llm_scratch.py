import json
import time
import urllib.request

def test_llm(user_query):
    payload = {
        "model": "Qwen3.5-4B-UD-Q4_K_XL.gguf",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a technical specification extraction engine. Analyze the procurement description and extract structured technical parameters into valid JSON ONLY. Output NO prose, NO markdown code fences, NO explanation.\n"
                    "Output Schema:\n"
                    "{\n"
                    '  "voltage": string or null,\n'
                    '  "material": string or null,\n'
                    '  "environment": string or null,\n'
                    '  "application": string or null,\n'
                    '  "exclusions": [string, ...],\n'
                    '  "missing_fields": [string, ...]\n'
                    "}\n"
                    "Rules:\n"
                    "- In 'exclusions', capture explicitly negated or excluded requirements (e.g., 'not weatherproof', 'indoor only', 'zero halogen', 'non-PVC', 'excludes outdoor use').\n"
                    "- In 'missing_fields', list critical omitted parameters (e.g., 'operating temperature', 'voltage grade', 'conductor material', 'armour type') needed for standard selection.\n"
                    "- If a field is not specified in the query, set its value to null.\n"
                    "- Return RAW JSON only."
                )
            },
            {
                "role": "user",
                "content": user_query
            }
        ],
        "temperature": 0.0,
        "max_tokens": 250
    }

    start = time.time()
    req = urllib.request.Request(
        "http://localhost:8085/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        data = json.loads(res.read().decode("utf-8"))
    elapsed = time.time() - start

    content = data["choices"][0]["message"]["content"]
    return elapsed, content

if __name__ == "__main__":
    queries = [
        "Procurement of heavy-duty PVC insulated and sheathed power cables for outdoor industrial distribution, 1.1kV rated voltage, multi-core copper conductor with steel wire armouring.",
        "Supply of 1100V low smoke zero halogen (LSZH) cables for underground metro tunnel, strictly non-PVC, no halogen acid gas emission during fire.",
        "Supply of 70 sq.mm extra-flexible annealed copper conductor single core rubber elastomer insulated welding cables for manual metal arc welding machine connection, oil and heat resistant."
    ]

    for q in queries:
        print("=" * 60)
        print("Query:", q)
        elapsed, content = test_llm(q)
        print(f"Latency: {elapsed*1000:.1f}ms ({elapsed:.2f}s)")
        print("Response content:\n", content)
        # Try cleaning markdown if any
        cleaned = content.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        try:
            parsed = json.loads(cleaned)
            print("Successfully parsed JSON:")
            print(json.dumps(parsed, indent=2))
        except Exception as e:
            print("Failed to parse JSON:", e)
