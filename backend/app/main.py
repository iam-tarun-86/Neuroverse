import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.models import RecommendRequest, RecommendResponse, StandardResult, ExtractionResult
from app.database import get_db
from app.config import EMBEDDING_MODEL_NAME
from app.rules import validate_and_rank_candidates
from app.allied_standards import get_allied_standards, get_allied_graph
from app.extraction import extract_requirements, apply_exclusion_filter

logger = logging.getLogger("standardiq.api")
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing StandardIQ Vector DB and embedding model...")
    db = get_db()
    logger.info(f"Vector DB ready. Collection count: {db.collection.count()}")
    logger.info("Initializing StandardIQ in-memory Allied Standards graph...")
    graph = get_allied_graph()
    stats = graph.get_stats()
    logger.info(
        f"Allied standards graph ready: {stats['total_nodes']} nodes, "
        f"{stats['total_edges']} edges ({stats['standards_with_references']} standards with references)."
    )
    yield
    logger.info("Shutting down StandardIQ API.")

app = FastAPI(
    title="StandardIQ Recommendation API",
    description="Local, privacy-first recommendation engine for Bureau of Indian Standards (BIS) in public procurement.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health"])
def health_check():
    db = get_db()
    graph_stats = get_allied_graph().get_stats()
    return {
        "status": "online",
        "service": "StandardIQ Recommendation Engine",
        "air_gapped": True,
        "embedding_model": EMBEDDING_MODEL_NAME,
        "indexed_standards": db.collection.count(),
        "allied_graph_nodes": graph_stats["total_nodes"],
        "allied_graph_edges": graph_stats["total_edges"],
    }

@app.post("/recommend", response_model=RecommendResponse, tags=["Recommendations"])
def recommend_standards(payload: RecommendRequest):
    """
    Accepts a procurement specification query string and returns top matching
    Indian Standards ranked by dense cosine similarity score with:

    Tier 1 — Local LLM structured parameter extraction (runs first, non-blocking on failure).
    Tier 2 — BGE-M3 dense vector retrieval via ChromaDB.
    Tier 3 — Deterministic rule guardrails (status filter, exclusion demotion, confidence threshold).
    Tier 4 — Allied/normative standards graph (NetworkX, 1-hop, Rank #1 only).
    """
    query = payload.query.strip()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query string cannot be empty."
        )

    # ── Tier 1: Local LLM extraction (non-blocking — pipeline continues on failure) ──
    extraction_dict, extraction_latency_ms = extract_requirements(query)
    exclusions = extraction_dict.get("exclusions", [])
    extraction_result = ExtractionResult(
        voltage=extraction_dict.get("voltage"),
        material=extraction_dict.get("material"),
        environment=extraction_dict.get("environment"),
        application=extraction_dict.get("application"),
        exclusions=exclusions,
        missing_fields=extraction_dict.get("missing_fields", []),
        latency_ms=round(extraction_latency_ms, 1),
    )
    logger.info(
        f"Tier 1 extraction: latency={extraction_latency_ms:.0f}ms "
        f"exclusions={exclusions}"
    )

    # ── Tier 2: Dense vector retrieval ──
    db = get_db()
    raw_matches = db.search(query=query, top_k=payload.top_k)

    # ── Tier 3a: Deterministic status rules (active > inactive, confidence threshold) ──
    validated_matches, requires_human_review, human_review_reason = validate_and_rank_candidates(
        raw_matches,
        top_k=payload.top_k
    )

    # ── Tier 3b: Exclusion demotion (only if LLM found explicit exclusions) ──
    if exclusions:
        validated_matches = apply_exclusion_filter(validated_matches, exclusions)
        logger.info(
            f"Exclusion filter applied ({len(exclusions)} terms): "
            f"{[m.get('standard_id') for m in validated_matches]}"
        )

    results = [StandardResult(**match) for match in validated_matches]

    # ── Tier 4: Allied/normative standards graph (Rank #1 only) ──
    if results:
        results[0].allied_standards = get_allied_standards(results[0].standard_id)

    return RecommendResponse(
        query=query,
        model_used=EMBEDDING_MODEL_NAME,
        total_matches=len(results),
        results=results,
        requires_human_review=requires_human_review,
        human_review_reason=human_review_reason,
        extraction=extraction_result,
    )

from pydantic import BaseModel
from app.auth_store import (
    get_all_users,
    get_waitlist,
    register_user,
    login_user,
    approve_request,
    reject_request,
    add_user_direct,
    delete_user,
)

class RegisterPayload(BaseModel):
    name: str
    email: str
    password: str
    role: str = "Procurement Officer"

class LoginPayload(BaseModel):
    email: str
    password: str

class RequestActionPayload(BaseModel):
    requestId: str

class DirectUserPayload(BaseModel):
    name: str
    email: str
    password: str
    role: str = "Procurement Officer"


# ══════════════════════════════════════════════════════════════════
# AUTHENTICATION & USER MANAGEMENT ENDPOINTS
# ══════════════════════════════════════════════════════════════════

@app.post("/api/auth/register", tags=["Auth"])
def api_register(payload: RegisterPayload):
    if not payload.name.strip() or not payload.email.strip() or not payload.password.strip():
        raise HTTPException(status_code=400, detail="Name, email and password are required.")
    res = register_user(payload.name, payload.email, payload.password, payload.role)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@app.post("/api/auth/login", tags=["Auth"])
def api_login(payload: LoginPayload):
    res = login_user(payload.email, payload.password)
    if not res["success"]:
        status_code = 403 if res.get("status_code") in ["PENDING_APPROVAL", "REJECTED", "INACTIVE"] else 401
        raise HTTPException(status_code=status_code, detail=res["message"])
    return res

@app.get("/api/admin/waitlist", tags=["Admin"])
def api_get_waitlist():
    return {"waitlist": get_waitlist()}

@app.post("/api/admin/approve", tags=["Admin"])
def api_approve(payload: RequestActionPayload):
    res = approve_request(payload.requestId)
    if not res["success"]:
        raise HTTPException(status_code=404, detail=res["message"])
    return res

@app.post("/api/admin/reject", tags=["Admin"])
def api_reject(payload: RequestActionPayload):
    res = reject_request(payload.requestId)
    return res

@app.get("/api/admin/users", tags=["Admin"])
def api_get_users():
    return {"users": get_all_users()}

@app.post("/api/admin/users", tags=["Admin"])
def api_add_user(payload: DirectUserPayload):
    if not payload.name.strip() or not payload.email.strip() or not payload.password.strip():
        raise HTTPException(status_code=400, detail="Name, email and password are required.")
    res = add_user_direct(payload.name, payload.email, payload.password, payload.role)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@app.delete("/api/admin/users/{user_id}", tags=["Admin"])
def api_delete_user(user_id: str):
    res = delete_user(user_id)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

