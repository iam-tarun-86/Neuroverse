import logging
from typing import List, Dict, Any, Tuple, Optional

logger = logging.getLogger("standardiq.rules")

# Deterministic threshold for triggering human engineering review.
# Based on benchmark analysis of 18 representative procurement queries:
# - Normal, unambiguous tender queries exhibit cosine similarity scores >= 0.74 (avg ~0.79).
# - Incomplete queries (query-15: 0.7092) and negative-exclusion queries (query-17: 0.6799)
#   score below 0.72, signaling ambiguity or missing technical parameters.
CONFIDENCE_THRESHOLD = 0.72

# Known historical supersession and withdrawal mappings in the BIS Electrical corpus
SUPERSEDED_REASONS = {
    "IS 434 (Part 1): 1964": "Withdrawn standard (superseded by IS 9857: 1990 for arc welding cables and IS 9968 for elastomer cables) — do not cite in new tenders.",
    "IS 1554 (Part 1): 1976": "Superseded by IS 1554 (Part 1): 1988 — do not cite in new tenders."
}

def validate_and_rank_candidates(
    candidates: List[Dict[str, Any]],
    top_k: int = 3
) -> Tuple[List[Dict[str, Any]], bool, Optional[str]]:
    """
    Applies Tier 3 deterministic guardrail rules to raw vector retrieval candidates:
    
    1. Status Filter:
       Active standards are prioritized over Withdrawn or Superseded standards.
       Inactive standards are demoted behind active candidates and flagged with
       superseded_warning=True and a specific warning rationale.
       
    2. Certification Passthrough:
       Ensures certification scheme (ISI Mark, CRS, Voluntary) is attached for UI badges.
       
    3. Confidence Threshold Guardrail:
       If the top candidate's similarity score is below CONFIDENCE_THRESHOLD (0.72),
       the recommendation is flagged with requires_human_review=True and a detailed explanation.
       
    Returns:
        Tuple of (final_ranked_candidates, requires_human_review, human_review_reason)
    """
    if not candidates:
        return [], True, "No candidate standards found matching the query."

    active_candidates: List[Dict[str, Any]] = []
    inactive_candidates: List[Dict[str, Any]] = []

    for c in candidates:
        item = dict(c)
        status = item.get("status", "Active")
        
        if status in ("Withdrawn", "Superseded"):
            item["superseded_warning"] = True
            std_id = item.get("standard_id", "")
            item["warning_reason"] = SUPERSEDED_REASONS.get(
                std_id,
                f"{status} standard — do not cite in new procurement tenders."
            )
            inactive_candidates.append(item)
        else:
            item["superseded_warning"] = False
            item["warning_reason"] = None
            active_candidates.append(item)

    # Sort each partition by cosine similarity score descending
    active_candidates.sort(key=lambda x: x.get("similarity_score", 0.0), reverse=True)
    inactive_candidates.sort(key=lambda x: x.get("similarity_score", 0.0), reverse=True)

    # Demote inactive standards below all active candidates
    ordered = active_candidates + inactive_candidates

    # Re-assign ranks 1..N based on rule-adjusted ordering
    for idx, item in enumerate(ordered):
        item["rank"] = idx + 1

    final_results = ordered[:top_k]

    # Evaluate confidence threshold on the top candidate
    top_score = final_results[0].get("similarity_score", 0.0) if final_results else 0.0
    if top_score < CONFIDENCE_THRESHOLD:
        requires_human_review = True
        human_review_reason = (
            f"Top match similarity score ({top_score*100:.1f}%) is below the {CONFIDENCE_THRESHOLD*100:.0f}% confidence threshold. "
            f"The procurement specification may be incomplete, ambiguous, or contain conflicting constraints; "
            f"manual engineering review is recommended before publishing in tender documents."
        )
    else:
        requires_human_review = False
        human_review_reason = None

    return final_results, requires_human_review, human_review_reason
