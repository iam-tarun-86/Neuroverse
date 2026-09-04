import json
import os
import sys
import urllib.request
from typing import Dict, Any, List

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLE_QUERIES_PATH = os.path.join(BASE_DIR, "..", "standardiq-dashboard", "src", "data", "sampleQueries.json")
REPORT_PATH = os.path.join(BASE_DIR, "retrieval_rules_evaluation_report.json")
API_URL = "http://127.0.0.1:8000/recommend"

def run_benchmark():
    with open(SAMPLE_QUERIES_PATH, "r", encoding="utf-8") as f:
        queries = json.load(f)

    print(f"Loaded {len(queries)} sample queries from {SAMPLE_QUERIES_PATH}")
    print(f"Calling endpoint: {API_URL}\n")

    results_report = []
    hit_at_1 = 0
    hit_at_3 = 0
    human_review_count = 0

    print(f"{'ID':<10} | {'Hit@1':<6} | {'Hit@3':<6} | {'Review':<6} | {'Top Score':<10} | {'Top 1 Retrieved':<24} | {'Expected Primary'}")
    print("-" * 105)

    for q in queries:
        qid = q["id"]
        qtext = q["query"]
        expected = q["expected_primary_standard"]
        allied = q.get("expected_allied_standards", [])

        payload = {"query": qtext, "top_k": 3}
        req = urllib.request.Request(
            API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        retrieved = data.get("results", [])
        requires_hr = data.get("requires_human_review", False)
        hr_reason = data.get("human_review_reason")

        if requires_hr:
            human_review_count += 1

        top_1_match = retrieved[0]["standard_id"] if retrieved else None
        top_1_score = retrieved[0]["similarity_score"] if retrieved else 0.0
        top_3_ids = [r["standard_id"] for r in retrieved]

        is_hit_1 = (top_1_match == expected)
        is_hit_3 = (expected in top_3_ids)

        if is_hit_1:
            hit_at_1 += 1
        if is_hit_3:
            hit_at_3 += 1

        print(f"{qid:<10} | {str(is_hit_1):<6} | {str(is_hit_3):<6} | {str(requires_hr):<6} | {top_1_score:<10.4f} | {str(top_1_match):<24} | {expected}")

        results_report.append({
            "id": qid,
            "query": qtext,
            "expected_primary": expected,
            "expected_allied": allied,
            "is_incomplete": q.get("deliberately_incomplete", False),
            "has_exclusion": q.get("has_exclusion", False),
            "top_1_hit": is_hit_1,
            "top_3_hit": is_hit_3,
            "requires_human_review": requires_hr,
            "human_review_reason": hr_reason,
            "retrieved_results": retrieved
        })

    total = len(queries)
    hit_1_pct = (hit_at_1 / total) * 100
    hit_3_pct = (hit_at_3 / total) * 100

    print("-" * 105)
    print(f"Total Benchmark Queries:        {total}")
    print(f"Hit@1 Accuracy (Primary Exact): {hit_at_1}/{total} ({hit_1_pct:.1f}%)")
    print(f"Hit@3 Accuracy (In Top 3):     {hit_at_3}/{total} ({hit_3_pct:.1f}%)")
    print(f"Queries Requiring Human Review: {human_review_count}/{total} ({(human_review_count/total)*100:.1f}%)")

    # Specific Query-10 Analysis
    q10_res = next((r for r in results_report if r["id"] == "query-10"), None)
    if q10_res:
        print("\n==========================================")
        print("QUERY-10 BEFORE vs AFTER RULE ENGINE")
        print("==========================================")
        print("Expected Primary: IS 9857: 1990 (Active)")
        print("BEFORE Rule Engine (Raw Dense Vector Search):")
        print("  - Rank 1: IS 434 (Part 1): 1964 (Withdrawn) [Similarity: 78.85%]")
        print("  - Rank 2: IS 9857: 1990 (Active)           [Similarity: 78.02%]")
        print("  - Rank 3: IS 6380: 1984 (Active)           [Similarity: 77.92%]")
        print("AFTER Rule Engine (Status Filter Active):")
        for r in q10_res["retrieved_results"]:
            warn_str = f" [WARNING: {r['warning_reason']}]" if r.get('superseded_warning') else ""
            print(f"  - Rank {r['rank']}: {r['standard_id']} ({r['status']}) [Similarity: {r['similarity_score']*100:.2f}%]{warn_str}")
        print(f"Query-10 Hit@1 Corrected: {q10_res['top_1_hit']}")

    final_output = {
        "model_used": "BAAI/bge-small-en-v1.5",
        "total_queries": total,
        "hit_at_1_count": hit_at_1,
        "hit_at_1_pct": hit_1_pct,
        "hit_at_3_count": hit_at_3,
        "hit_at_3_pct": hit_3_pct,
        "human_review_count": human_review_count,
        "confidence_threshold": 0.72,
        "results": results_report
    }

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(final_output, f, indent=2)

    print(f"\nFull evaluation report written to {REPORT_PATH}")

if __name__ == "__main__":
    run_benchmark()
