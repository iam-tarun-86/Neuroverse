import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api():
    print("=== Testing /health ===")
    health = client.get("/health").json()
    print("Health response:", json.dumps(health, indent=2))
    assert health["allied_graph_nodes"] == 52
    assert health["allied_graph_edges"] == 105

    print("\n=== Testing /recommend for Query-01 (PVC Cables) ===")
    resp1 = client.post(
        "/recommend",
        json={
            "query": "Procurement of heavy-duty PVC insulated and sheathed power cables for outdoor industrial distribution, 1.1kV rated voltage",
            "top_k": 3,
        },
    ).json()

    results1 = resp1["results"]
    print(f"Total returned: {len(results1)}")
    r1 = results1[0]
    print(f"Rank #1: {r1['standard_id']}")
    assert r1["allied_standards"] is not None
    assert len(r1["allied_standards"]) > 0
    print("Rank #1 Allied groups:", list(r1["allied_standards"].keys()))
    for grp, items in r1["allied_standards"].items():
        print(f"  [{grp}] ({len(items)} items): {[it['standard_id'] for it in items]}")

    # Check that rank #2 and #3 have NO allied standards
    for other in results1[1:]:
        print(f"Rank #{other['rank']}: {other['standard_id']} allied_standards={other['allied_standards']}")
        assert other["allied_standards"] is None

    print("\n=== Testing /recommend for Query-03 (XLPE 11kV) ===")
    resp3 = client.post(
        "/recommend",
        json={
            "query": "Supply and delivery of 11 kV (E) grade, 3 core 185 sq mm compacted stranded aluminium conductor, crosslinked polyethylene (XLPE) insulated",
            "top_k": 3,
        },
    ).json()
    r3_top = resp3["results"][0]
    print(f"Rank #1: {r3_top['standard_id']}")
    assert r3_top["allied_standards"] is not None
    for grp, items in r3_top["allied_standards"].items():
        print(f"  [{grp}] ({len(items)} items): {[it['standard_id'] for it in items]}")

    print("\n=== Testing /recommend for Query-10 (Arc Welding Cable) ===")
    resp10 = client.post(
        "/recommend",
        json={
            "query": "Supply of 70 sq.mm extra-flexible annealed copper conductor single core rubber elastomer insulated welding cables for manual metal arc welding machine connection",
            "top_k": 3,
        },
    ).json()
    r10_top = resp10["results"][0]
    print(f"Rank #1: {r10_top['standard_id']}")
    assert r10_top["allied_standards"] is not None
    for grp, items in r10_top["allied_standards"].items():
        print(f"  [{grp}] ({len(items)} items): {[it['standard_id'] for it in items]}")

    print("\nALL API ASSERTIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api()
