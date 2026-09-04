# PROJECT STANDARDIQ — AGENT OPERATING RULES

Applies to every task in this project unless explicitly overridden.

---

## 0. PROJECT INVARIANTS

**What this is:** StandardIQ — an AI-powered recommendation engine for identifying 
applicable Indian Standards (BIS) in government procurement specifications. 
Built for SIH26108 (Ministry of Consumer Affairs, Food & Public Distribution).

**Core design principle:** 100% local processing, zero data egress. No cloud 
API calls anywhere in the MVP. This is a non-negotiable architectural constraint, 
not a preference — it is the project's core differentiator.

**Architecture (current, locked):**
- Query understanding: Local LLM (fine-tuned or base + prompting — see context.txt for current decision)
- Retrieval: BGE-M3 embeddings + ChromaDB
- Reranking: bge-reranker-v2-m3
- Allied/normative standards: NetworkX in-memory graph (not Neo4j — that's Phase 2)
- Verification: Deterministic rule engine (certification, version/status checks)
- LLM is NEVER the final authority — retrieval + rules verify, LLM proposes/explains only

**Explicitly out of scope for MVP (do not build unless told):** Neo4j, full 
multilingual (IndicTrans2/Bhashini beyond a single demo-language stub), OCR, 
full 21,000-standard BIS corpus, GeM portal plugin, cloud API fallback of any kind.

**Tech stack:** React + Vite + Tailwind CSS (frontend), Python + FastAPI (backend, 
when built), ChromaDB (vector store).

**Source of truth:** `context.txt` (current build state), this file (rules), 
and the deck/architecture docs in `/docs` if present. When code and docs 
disagree, the actual code is the evidence — fix the docs, not the assumption.

---

## 1. PRIME DIRECTIVE

Never claim something works unless it was actually run and observed.

"Code compiles" is not "feature works."
"Looks correct" is not verification.

Classify every claim in a report as:
- **VERIFIED** — actually run/tested/observed
- **NOT TESTED** — couldn't verify, say why
- **FAILED / ISSUE** — didn't work
- **INFERENCE / JUDGMENT CALL** — reasoning, not evidence

Never present mock data results as if they were real pipeline output. If 
`mockStandards.js` is still in use, every report must say so explicitly.

---

## 2. NO SILENT ARCHITECTURE CHANGES

The architecture in Section 0 is decided. Do not swap models, add new 
databases, add fine-tuning, add API fallbacks, or introduce new ML/DL 
components without flagging it as a decision to confirm first.

If a genuinely better approach becomes obvious mid-build, state it clearly 
as a suggestion, explain the tradeoff, and wait for confirmation — don't 
just implement it.

---

## 3. SCOPE PROTECTION

Do not add: authentication systems, multi-user support, cloud deployment 
configs, payment/billing, admin panels, or any feature not explicitly 
requested for the current milestone.

Do not refactor working UI components while implementing unrelated features.

Do not replace mock data with real pipeline calls unless that is the 
specific task — flag clearly when a component still relies on mock data 
vs real logic.

---

## 4. MANDATORY WORKFLOW PER TASK

1. Read `context.txt` for current state before starting.
2. Inspect the current file(s) before editing — don't assume prior state.
3. Identify what's mock/placeholder vs real logic in the area being touched.
4. Implement only the requested scope.
5. Run the build (`npm run build` or equivalent) after changes.
6. Report 0 errors / list any errors found.
7. State clearly: what's real, what's still mocked, what wasn't tested.
8. Update `context.txt` with what changed.
9. Stop at task boundary — don't auto-continue to the next feature.

---

## 5. MOCK VS REAL — MANDATORY LABELING

This project moves from mock data → real pipeline over multiple sessions. 
Every report must clearly separate:

- **REAL:** actual dataset, actual model inference, actual retrieval
- **MOCK:** hardcoded/simulated data or timing (e.g. the current 1.25s 
  "processing" delay, `mockStandards.js` results)

Never let a report imply a mocked feature is a real pipeline result.

---

## 6. HONESTY OVER POLISH

If something is simplified, incomplete, or a placeholder for the demo, 
say so plainly in the report — don't let confident phrasing imply more 
than what was built. This project is being presented to judges; internal 
reports must be accurate so the team doesn't accidentally overclaim in 
the actual pitch.

---

## 7. CONTEXT.TXT DISCIPLINE

After each milestone, `context.txt` should record:
- What was built/changed
- What's real vs mock
- Key architectural decisions made this session
- Known issues or gaps
- What the next task/milestone should be

Keep it factual and short — it exists so the next session (or teammate) 
doesn't have to re-discover state from scratch.

---

## FINAL PRINCIPLE

Confidence is not evidence. A task is done when someone else (teammate, 
or you tomorrow) can look at the code and report and know exactly what's 
real, what's mocked, and what's left — not because it "sounds finished."