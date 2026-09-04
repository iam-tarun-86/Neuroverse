"""
Test script: Verify Tier 1 extraction integration.
Tests:
  - query-17 (exclusion case): before/after demotion
  - 5 normal queries: confirm extraction works and ranking unchanged
Reports: actual JSON extraction, exclusion_match flags, similarity scores, latency.
"""
import json
import time
import urllib.request

BASE = "http://127.0.0.1:8000"

def recommend(query, top_k=3):
    payload = {"query": query, "top_k": top_k}
    req = urllib.request.Request(
        f"{BASE}/recommend",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    start = time.time()
    with urllib.request.urlopen(req, timeout=60) as res:
        data = json.loads(res.read().decode("utf-8"))
    elapsed_ms = (time.time() - start) * 1000
    return data, elapsed_ms

# Pull query-17 text from sampleQueries.json
with open("standardiq-dashboard/src/data/sampleQueries.json", encoding="utf-8") as f:
    sample_queries = json.load(f)

q17 = next(q for q in sample_queries if q["id"] == "query-17")
test_cases = [
    ("query-17 [EXCLUSION CASE]", q17["query"], q17.get("expected_primary_standard", "?"), True),
    ("query-01 [PVC 1.1kV armoured]",
     next(q for q in sample_queries if q["id"] == "query-01")["query"],
     next(q for q in sample_queries if q["id"] == "query-01").get("expected_primary_standard", "?"), False),
    ("query-02 [XLPE 11kV]",
     next(q for q in sample_queries if q["id"] == "query-02")["query"],
     next(q for q in sample_queries if q["id"] == "query-02").get("expected_primary_standard", "?"), False),
    ("query-03 [Welding cable]",
     next(q for q in sample_queries if q["id"] == "query-03")["query"],
     next(q for q in sample_queries if q["id"] == "query-03").get("expected_primary_standard", "?"), False),
    ("query-05 [LSZH fire]",
     next(q for q in sample_queries if q["id"] == "query-05")["query"],
     next(q for q in sample_queries if q["id"] == "query-05").get("expected_primary_standard", "?"), False),
    ("query-10 [Arc welding — withdrawn check]",
     next(q for q in sample_queries if q["id"] == "query-10")["query"],
     next(q for q in sample_queries if q["id"] == "query-10").get("expected_primary_standard", "?"), False),
]

for label, query_text, expected_primary, is_exclusion_case in test_cases:
    print("=" * 70)
    print(f"  {label}")
    print(f"  Query: {query_text[:100]}...")
    print(f"  Expected Rank #1: {expected_primary}")
    data, elapsed_ms = recommend(query_text)
    ext = data.get("extraction", {})
    print(f"\n  [EXTRACTION] latency={ext.get('latency_ms', '?'):.0f}ms" if ext else "\n  [EXTRACTION] NONE (LLM call may have failed)")
    if ext:
        print(f"    voltage={ext.get('voltage')}  material={ext.get('material')}")
        print(f"    environment={ext.get('environment')}  application={ext.get('application')}")
        print(f"    exclusions={ext.get('exclusions', [])}")
        print(f"    missing_fields={ext.get('missing_fields', [])}")

    results = data.get("results", [])
    actual_rank1 = results[0]["standard_id"] if results else "NONE"
    print(f"\n  [RETRIEVAL] Total API latency={elapsed_ms:.0f}ms  requires_human_review={data.get('requires_human_review')}")
    for r in results:
        flag = ""
        if r.get("exclusion_match"):
            flag += " [EXCLUSION_DEMOTED]"
        if r.get("superseded_warning"):
            flag += " [SUPERSEDED]"
        print(f"    Rank {r['rank']}: {r['standard_id']} | score={r['similarity_score']:.4f} | status={r['status']}{flag}")

    match = "[MATCH]" if actual_rank1 == expected_primary else f"[MISMATCH] (got {actual_rank1})"
    print(f"\n  Primary standard check: {match}")
    if is_exclusion_case:
        demoted = [r for r in results if r.get("exclusion_match")]
        if demoted:
            print(f"  Exclusion filter: {len(demoted)} result(s) demoted: {[r['standard_id'] for r in demoted]}")
        else:
            print(f"  Exclusion filter: No candidates demoted (check scope_text vs exclusion terms)")

print("\n" + "=" * 70)
print("Test complete.")
