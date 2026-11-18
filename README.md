# AI Evolution Map

**AI Evolution Map** is an interactive, evidence-backed research atlas exploring the evolution of artificial intelligence across historical landmark milestones, conceptual genealogical family trees, multi-year empirical metrics, and canonical primary research literature.

Designed as a rigorous Data Science & Engineering platform demonstrating reproducible data pipelines, schema contracts, automated testing, FastAPI distribution, and a modern React + TypeScript research frontend.

---

## 1. Architectural Overview & System Components

The project bridges reproducible data engineering with an interactive dark-themed research interface:

1. **Deterministic Data Pipeline**:
   - Ingests raw publications and model registries from OpenAlex, arXiv, and Hugging Face with cryptographic provenance sidecars.
   - Cleans and normalizes 20 historical milestones (1950–2026) and Stanford AI Index / Epoch AI multi-year metrics across 2013–2023 (47 observations).
   - Enforces Pydantic v2 validation contracts, verifying zero orphan references and semantic edge directions across 22 verified research sources.
   - Generates deterministic JSON, CSV, and Parquet exports.

2. **FastAPI Data Distribution (`backend/`)**:
   - Provides `/health`, `/api/v1/schema-info`, and validated data contract endpoints:
     - `/api/v1/timeline` (20 milestones, 1950–2026)
     - `/api/v1/concept-graph` (nodes & directed edges)
     - `/api/v1/analytics-metrics` (47 observations, 2013–2023)
     - `/api/v1/research-sources` (22 bibliographic citations)

3. **Interactive React Research Frontend (`frontend/`)**:
   - **Orbit Timeline**: Radial constellation visualization mapping milestones (1950–2026) dynamically across concentric era tracks with linear view fallback, date precision, and search.
   - **AI Family Tree**: Directed concept graph visualizer tracking conceptual dependencies (`extends`, `uses`, `introduced`, `influenced`) with interactive pan, zoom, and source inspection.
   - **Research Analytics Dashboard**: Multi-year visualizer tracking constant-2021-USD private AI investment and notable AI systems by institutional sector (Epoch AI) with annual coverage matrices (2013–2023).
   - **Sources & Provenance Explorer**: Searchable directory of peer-reviewed papers, archives, and official reports with direct outbound DOI links.
   - **Methodology & Quality Section**: Comprehensive documentation of pipeline stages, audit results, and epistemological guardrails.

---

## 2. Repository Layout

```
AI-Evolution-Map/
├── backend/                       # FastAPI distribution service
│   ├── app/
│   │   ├── api/router.py          # API endpoints (/health, /api/v1/*)
│   │   ├── schemas/schema_info.py # Pydantic response models
│   │   └── main.py                # FastAPI entrypoint (Uvicorn)
│   └── tests/test_api.py          # Backend endpoint tests
├── frontend/                      # React 19 + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/            # UI Components:
│   │   │   ├── OrbitTimeline.tsx      # Orbital radial & linear timeline
│   │   │   ├── ConceptGraph.tsx       # Directed SVG concept family tree
│   │   │   ├── AnalyticsDashboard.tsx # Multi-year metrics line/area charts
│   │   │   ├── SourceExplorer.tsx     # Bibliographic source directory
│   │   │   ├── MethodologySection.tsx # Data governance & quality documentation
│   │   │   ├── TimelineControls.tsx   # Search, era filter, year sliders
│   │   │   └── DetailPanel.tsx        # Milestone inspection drawer
│   │   ├── data/                  # Loaders & configurations (eraConfig, graphConfig)
│   │   ├── types/timeline.ts      # Strict data contract TypeScript types
│   │   ├── test/timeline.test.ts  # Vitest unit test suite
│   │   ├── App.tsx                # Unified orchestrator & tab routing
│   │   └── App.css / index.css    # Midnight charcoal theme system
│   └── public/data/               # Synchronized pre-validated frontend datasets
├── data/
│   ├── raw/                       # Immutable raw API responses + provenance sidecars
│   ├── interim/                   # Cleaned records & audit reports
│   ├── processed/frontend_export/ # Deterministic export artifacts (JSON, CSV, Parquet)
│   └── reference/                 # Seed knowledge base
├── notebooks/                     # 8-step pipeline laboratory (ingestion to export)
├── src/                           # Python pipeline modules (cleaning, validation, export)
├── scripts/                       # Orchestration & reproducibility scripts:
│   ├── run_pipeline.py            # Executes full 4-step pipeline
│   ├── verify_reproducibility.py  # Bit-for-bit determinism verifier
│   └── sync_frontend_data.py      # Synchronizes export data to frontend public/
├── tests/                         # Pytest test suite (45 tests)
└── docs/                          # Architecture, contracts, source notes, quality audits
```

---

## 3. Installation & Prerequisites

### Prerequisites
- Python 3.11+
- Node.js 20+ & npm

### Backend & Pipeline Setup
```powershell
cd C:\Users\MANAS\Documents\AI-Evolution-Map

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt
```

### Frontend Setup
```powershell
cd C:\Users\MANAS\Documents\AI-Evolution-Map\frontend
npm install
```

---

## 4. Running the Application

### 1. Execute Data Pipeline (Optional - exports are pre-built)
```powershell
cd C:\Users\MANAS\Documents\AI-Evolution-Map
$env:PYTHONPATH="C:\Users\MANAS\Documents\AI-Evolution-Map"
python scripts/run_pipeline.py
python scripts/sync_frontend_data.py
```

### 2. Launch FastAPI Backend Service
```powershell
cd C:\Users\MANAS\Documents\AI-Evolution-Map
$env:PYTHONPATH="C:\Users\MANAS\Documents\AI-Evolution-Map"
python backend/app/main.py
# Server running at http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)
```

### 3. Launch React Development Server
```powershell
cd C:\Users\MANAS\Documents\AI-Evolution-Map\frontend
npm run dev
# Frontend live at http://localhost:5173
```

---

## 5. Verification & Testing Commands

### Backend Test Suite (Pytest)
```powershell
cd C:\Users\MANAS\Documents\AI-Evolution-Map
$env:PYTHONPATH="C:\Users\MANAS\Documents\AI-Evolution-Map"
pytest -v
# 45 passed
```

### Deterministic Reproducibility Verification
```powershell
cd C:\Users\MANAS\Documents\AI-Evolution-Map
$env:PYTHONPATH="C:\Users\MANAS\Documents\AI-Evolution-Map"
python scripts/verify_reproducibility.py
# SUCCESS: All derived exports are strictly deterministic and reproducible!
```

### Frontend Vitest Suite
```powershell
cd C:\Users\MANAS\Documents\AI-Evolution-Map\frontend
npm test
# 3 passed
```

### Frontend Linting (Oxlint)
```powershell
cd C:\Users\MANAS\Documents\AI-Evolution-Map\frontend
npm run lint
# Found 0 warnings and 0 errors.
```

### Frontend TypeScript Production Build
```powershell
cd C:\Users\MANAS\Documents\AI-Evolution-Map\frontend
npm run build
# Built successfully: tsc -b && vite build
```

---

## 6. Data Methodology & Known Guardrails

- **Constant vs. Nominal Investment**: The 2013–2023 private AI investment series uses constant 2021 US$ billions. Nominal values are isolated to prevent inflation skew.
- **Investment Exclusions**: Measures funding into privately held startups (> \$1.5M). Internal corporate R&D and capital expenditure by tech conglomerates are excluded.
- **Affiliation Categorization**: Model developments are classified by author institutional affiliation (Industry vs. Academia) according to Epoch AI criteria.
- **Directional Relationship Semantics**: Every graph relationship strictly follows `source_concept --relationship_type--> target_concept` (e.g., `BERT extends Transformer`, `CNN uses Backpropagation`).
