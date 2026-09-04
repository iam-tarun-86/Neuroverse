# StandardIQ — AI-Powered Standards Intelligence

> **Smart India Hackathon (SIH 2026)** | **Team Neuroverse**  
> Problem Statement: Automated Indian Standards (BIS) Identification for Public Procurement  
> **100% On-Premise • Zero Data Egress • Explainable AI**

---

## 📌 Overview

**StandardIQ** is a government-grade, privacy-first AI intelligence engine designed to map complex, unformatted public procurement specifications and tender clauses directly to applicable **Bureau of Indian Standards (BIS)** codes.

Operating with **zero data egress**, it prevents non-compliant tenders, flags missing technical requirements before tender publication, and provides explainable, evidence-backed recommendations for procurement officers on GeM and CPPP portals.

---

## 🏗️ 3-Tier Innovation Architecture

```
[Procurement Specification / Tender Clauses]
                     │
                     ▼
[Tier 1: Fine-Tuned Local LLM]
  ├── Understands procurement terminology & intent
  ├── Extracts structured key-value parameters (Voltage, Material, Environment, etc.)
  └── Flags ambiguous / incomplete requirements (e.g., Missing Operating Temperature)
                     │
                     ▼
[Tier 2: Hybrid Semantic Retrieval (RAG)]
  ├── Embeddings generated via BGE-M3 (dense semantic matching)
  └── Queries curated BIS standards database (ChromaDB / Qdrant)
                     │
                     ▼
[Tier 3: Rule-Based Guardrail & Verification]
  ├── Checks active vs. superseded/withdrawn standard versions
  ├── Enforces mandatory Quality Control Orders (QCO)
  └── Flags numerical or rating mismatches (e.g., 750V vs 1.1kV)
                     │
                     ▼
[Confidence Scoring & Routing]
  ├── High (>= 80%): Recommended with source clause citations
  ├── Moderate (50-80%): Flagged with specific mismatch warnings
  └── Low (< 50%) / Superseded: Flagged and routed for human review
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

### Installation & Run

1. Navigate to the dashboard directory:
   ```bash
   cd standardiq-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173/`.

### Production Build
```bash
npm run build
```

---

## 📂 Repository Structure

```
.
├── README.md                          # Project documentation
├── context.txt                        # Complete architecture & agent tracking document
├── .gitignore                         # Git ignore rules
└── standardiq-dashboard/              # React + Vite + Tailwind CSS frontend
    ├── index.html                     # HTML shell with typography (Plus Jakarta Sans, JetBrains Mono)
    ├── vite.config.js                 # Vite configuration with @tailwindcss/vite
    ├── package.json                   # Project scripts and dependencies
    └── src/
        ├── App.jsx                    # Primary application component & UI state machine
        ├── index.css                  # Light enterprise styling & CSS keyframe animations
        └── data/
            └── mockStandards.js       # Curated benchmark BIS standards & spec datasets
```

---

## 🛡️ Key Guarantees
- **100% Air-Gapped / Zero Data Egress**: Fully local processing ensures sensitive tender data never leaves the deployment network.
- **Explainable Recommendations**: Every recommendation is paired with source evidence clauses.
- **Hallucination Defense**: Deterministic rule verification acts as a hard filter before displaying results.

---

**Built with pride by Team Neuroverse for Smart India Hackathon 2026.**
