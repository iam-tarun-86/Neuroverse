import json
import sys
import io
from pathlib import Path
from typing import Dict, Any, List

# Force UTF-8 on Windows console to prevent charmap errors
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# Add backend to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.config import SAMPLE_QUERIES_PATH, DATASET_PATH, EMBEDDING_MODEL_NAME
from app.database import get_db

def normalize_std_id(std_id: str) -> str:
    """Normalizes standard ID for robust matching (e.g. 'IS 1554 (Part 1)' vs 'IS 1554 (Part 1): 1988')."""
    return std_id.split(":")[0].strip().lower()

def run_evaluation():
    print("=" * 80)
    print("STANDARDIQ RETRIEVAL BENCHMARK EVALUATION")
    print(f"Model: {EMBEDDING_MODEL_NAME}")
    print(f"Standards Dataset: {DATASET_PATH.name}")
    print(f"Sample Queries Suite: {SAMPLE_QUERIES_PATH.name}")
    print("=" * 80)
    
    with open(SAMPLE_QUERIES_PATH, "r", encoding="utf-8") as f:
        queries = json.load(f)
        
    db = get_db()
    total_queries = len(queries)
    
    hit_at_1_count = 0
    hit_at_3_count = 0
    
    detailed_results = []
    
    for q_item in queries:
        qid = q_item["id"]
        query_text = q_item["query"]
        expected_primary = q_item["expected_primary_standard"]
        expected_allied = q_item.get("expected_allied_standards", [])
        is_incomplete = q_item.get("deliberately_incomplete", False)
        has_exclusion = q_item.get("has_exclusion", False)
        
        # Query top 3
        top_matches = db.search(query=query_text, top_k=3)
        
        # Check matching
        expected_norm = normalize_std_id(expected_primary)
        top_1_norm = normalize_std_id(top_matches[0]["standard_id"]) if top_matches else ""
        top_3_norms = [normalize_std_id(m["standard_id"]) for m in top_matches]
        
        is_hit_1 = (expected_norm == top_1_norm) or (expected_norm in top_1_norm) or (top_1_norm in expected_norm)
        is_hit_3 = any((expected_norm == t or expected_norm in t or t in expected_norm) for t in top_3_norms)
        
        if is_hit_1:
            hit_at_1_count += 1
        if is_hit_3:
            hit_at_3_count += 1
            
        detailed_results.append({
            "id": qid,
            "query": query_text,
            "expected_primary": expected_primary,
            "expected_allied": expected_allied,
            "is_incomplete": is_incomplete,
            "has_exclusion": has_exclusion,
            "top_1_hit": is_hit_1,
            "top_3_hit": is_hit_3,
            "retrieved_results": [
                {
                    "rank": m["rank"],
                    "standard_id": m["standard_id"],
                    "title": m["title"],
                    "similarity_score": m["similarity_score"],
                    "status": m["status"]
                }
                for m in top_matches
            ]
        })
        
    hit_at_1_pct = (hit_at_1_count / total_queries) * 100
    hit_at_3_pct = (hit_at_3_count / total_queries) * 100
    
    print("\nAGGREGATE RETRIEVAL PERFORMANCE:")
    print(f"Total Queries Evaluated: {total_queries}")
    print(f"Hit@1 (Primary standard at Rank 1): {hit_at_1_count}/{total_queries} ({hit_at_1_pct:.1f}%)")
    print(f"Hit@3 (Primary standard in Top 3):  {hit_at_3_count}/{total_queries} ({hit_at_3_pct:.1f}%)")
    print("-" * 80)
    
    for r in detailed_results:
        status_sym = "[MATCH - Rank 1]" if r["top_1_hit"] else ("[IN TOP 3]" if r["top_3_hit"] else "[MISS]")
        tag = ""
        if r["is_incomplete"]:
            tag = " (INCOMPLETE SPEC)"
        elif r["has_exclusion"]:
            tag = " (EXCLUSION/NEGATION)"
            
        print(f"[{r['id']}] {status_sym}{tag}")
        print(f"  Query: {r['query'][:95]}...")
        print(f"  Expected Primary: {r['expected_primary']}")
        for m in r["retrieved_results"]:
            print(f"    #{m['rank']} | Score: {m['similarity_score'] * 100:.2f}% | {m['standard_id']} - {m['title'][:65]} [{m['status']}]")
        print()
        
    # Save full evaluation report to JSON
    report_file = Path(__file__).resolve().parent / "retrieval_evaluation_report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump({
            "model_used": EMBEDDING_MODEL_NAME,
            "total_queries": total_queries,
            "hit_at_1_count": hit_at_1_count,
            "hit_at_1_pct": hit_at_1_pct,
            "hit_at_3_count": hit_at_3_count,
            "hit_at_3_pct": hit_at_3_pct,
            "results": detailed_results
        }, f, indent=2)
    print(f"Detailed JSON evaluation saved to: {report_file}")

if __name__ == "__main__":
    run_evaluation()
