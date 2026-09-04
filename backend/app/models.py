from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class RecommendRequest(BaseModel):
    query: str = Field(..., description="Tender or procurement technical specification description")
    top_k: int = Field(default=3, ge=1, le=10, description="Number of top standards to return")

class ExtractionResult(BaseModel):
    """Structured technical parameters extracted by the local LLM (Tier 1)."""
    voltage: Optional[str] = None
    material: Optional[str] = None
    environment: Optional[str] = None
    application: Optional[str] = None
    exclusions: List[str] = []
    missing_fields: List[str] = []
    latency_ms: Optional[float] = None

class StandardResult(BaseModel):
    rank: int
    standard_id: str
    title: str
    scope_text: str
    status: str
    sector: str
    certification: str
    similarity_score: float
    normative_references: Optional[List[str]] = []
    reference_type: Optional[Dict[str, str]] = {}
    superseded_warning: bool = False
    warning_reason: Optional[str] = None
    allied_standards: Optional[Dict[str, List[Dict[str, Any]]]] = None
    exclusion_match: bool = False
    exclusion_terms: List[str] = []

class RecommendResponse(BaseModel):
    query: str
    model_used: str
    total_matches: int
    results: List[StandardResult]
    requires_human_review: bool = False
    human_review_reason: Optional[str] = None
    extraction: Optional[ExtractionResult] = None
