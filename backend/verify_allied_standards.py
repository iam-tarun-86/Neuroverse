import json
import urllib.request
from pathlib import Path

DATASET_PATH = Path("../standardiq-dashboard/src/data/standardsDataset.json")
with open(DATASET_PATH, "r", encoding="utf-8") as f:
    standards_dataset = json.load(f)

dataset_by_id = {s["standard_id"]: s for s in standards_dataset}

QUERIES_TO_TEST = [
    {
        "id": "demo-preset-01",
        "description": "Heavy-duty Industrial Armoured PVC Power Cable (1.1kV)",
        "query": "Procurement of heavy-duty PVC insulated and sheathed power cables for outdoor industrial distribution, 1.1kV rated voltage, multi-core copper conductor with steel wire armouring.",
        "expected_primary": "IS 1554 (Part 1): 1988",
    },
    {
        "id": "query-03",
        "description": "Medium Voltage 11kV XLPE Power Cable",
        "query": "Supply and delivery of 11 kV (E) grade, 3 core 185 sq mm compacted stranded aluminium conductor, crosslinked polyethylene (XLPE) insulated, extruded semi-conducting screen, galvanized steel strip armoured and outer PVC sheathed power cables.",
        "expected_primary": "IS 7098 (Part 2): 2011",
    },
    {
        "id": "query-04",
        "description": "Low Voltage XLPE Power Cable 1100V (90 deg C)",
        "query": "Procurement of 1100 V working voltage, 4 core 120 sq.mm stranded copper conductor XLPE insulated and extruded PVC sheathed armoured power cables designed for 90 deg C continuous conductor operating temperature.",
        "expected_primary": "IS 7098 (Part 1): 1988",
    },
    {
        "id": "query-10",
        "description": "Arc Welding Extra-Flexible Cable (Rule Demoted Inactive Standard)",
        "query": "Supply of 70 sq.mm extra-flexible annealed copper conductor single core rubber elastomer insulated welding cables for manual metal arc welding machine connection, oil and heat resistant.",
        "expected_primary": "IS 9857: 1990",
    }
]

def run_verification():
    print("=" * 80)
    print("STANDARDIQ — ALLIED STANDARDS PIPELINE & GRAPH VERIFICATION")
    print("=" * 80)

    # 1. Health check telemetry
    health_req = urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=5)
    health = json.loads(health_req.read().decode("utf-8"))
    print(f"Health status: {health['status']}")
    print(f"Embedding model: {health['embedding_model']}")
    print(f"Indexed standards in ChromaDB: {health['indexed_standards']}")
    print(f"Allied graph nodes: {health['allied_graph_nodes']}")
    print(f"Allied graph edges: {health['allied_graph_edges']}")
    assert health["allied_graph_nodes"] == 52, f"Expected 52 nodes, got {health['allied_graph_nodes']}"
    assert health["allied_graph_edges"] == 105, f"Expected 105 edges, got {health['allied_graph_edges']}"
    print("[PASS] Graph telemetry validated: exactly 52 nodes and 105 directed edges.")
    print("-" * 80)

    results_summary = []

    for test_case in QUERIES_TO_TEST:
        qid = test_case["id"]
        qtext = test_case["query"]
        expected_primary = test_case["expected_primary"]
        desc = test_case["description"]

        print(f"\nEvaluating: {qid} — {desc}")
        print(f"Query text: {qtext[:75]}...")

        payload = json.dumps({"query": qtext, "top_k": 3}).encode("utf-8")
        req = urllib.request.Request(
            "http://127.0.0.1:8000/recommend",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req, timeout=10)
        resp_data = json.loads(res.read().decode("utf-8"))

        returned_results = resp_data["results"]
        rank1 = returned_results[0]
        rank2 = returned_results[1]
        rank3 = returned_results[2]

        print(f"Rank #1: {rank1['standard_id']} (similarity: {rank1['similarity_score']:.4f})")
        assert rank1["standard_id"] == expected_primary, f"Expected {expected_primary}, got {rank1['standard_id']}"
        print(f"  [PASS] Expected primary standard correctly ranked #1: {rank1['standard_id']}")

        # Validate allied standards attached to Rank #1
        allied = rank1.get("allied_standards")
        assert allied is not None, "Allied standards missing on Rank #1!"
        assert len(allied) > 0, "Allied standards empty on Rank #1!"

        # Cross-check with standardsDataset.json
        expected_refs = dataset_by_id[expected_primary].get("normative_references", [])
        expected_ref_types = dataset_by_id[expected_primary].get("reference_type", {})

        flattened_allied_ids = []
        for grp, items in allied.items():
            print(f"  Group '{grp}' ({len(items)} items):")
            for item in items:
                sid = item["standard_id"]
                stitle = item["title"]
                sstatus = item["status"]
                stype = item["reference_type"]
                label = item["reference_type_label"]
                flattened_allied_ids.append(sid)
                print(f"    - {sid} [{label}] ({sstatus}): {stitle[:45]}...")
                # Verify reference type matches dataset
                assert expected_ref_types.get(sid) == stype, f"Type mismatch for {sid}: expected {expected_ref_types.get(sid)}, got {stype}"

        # Assert all dataset normative references are returned
        assert set(flattened_allied_ids) == set(expected_refs), (
            f"Set mismatch: expected {set(expected_refs)}, got {set(flattened_allied_ids)}"
        )
        print(f"  [PASS] All {len(expected_refs)} normative references match standardsDataset.json exactly!")

        # Verify Rank #2 and Rank #3 have NO allied standards attached
        assert rank2.get("allied_standards") is None, f"Rank #2 must not have allied_standards: {rank2.get('allied_standards')}"
        assert rank3.get("allied_standards") is None, f"Rank #3 must not have allied_standards: {rank3.get('allied_standards')}"
        print(f"  [PASS] Rank #2 ({rank2['standard_id']}) and Rank #3 ({rank3['standard_id']}) allied_standards are None.")

        results_summary.append({
            "query_id": qid,
            "description": desc,
            "rank1_standard": rank1["standard_id"],
            "similarity_score": rank1["similarity_score"],
            "allied_count": len(flattened_allied_ids),
            "allied_groups": list(allied.keys()),
            "allied_standards": flattened_allied_ids,
            "rank2_allied_none": rank2.get("allied_standards") is None,
            "rank3_allied_none": rank3.get("allied_standards") is None,
        })

    # Save detailed report
    report_path = Path("allied_standards_verification_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "status": "ALL_VERIFIED",
                "health": health,
                "summary": results_summary
            },
            f,
            indent=2
        )
    print("\n" + "=" * 80)
    print(f"SUCCESS: All {len(QUERIES_TO_TEST)} queries verified against live API and dataset. Report saved to {report_path}.")
    print("=" * 80)

if __name__ == "__main__":
    run_verification()
