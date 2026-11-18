# AI Evolution Map: Stage 1 Data Pipeline Audit Findings

**Audit Date**: October 2026 (Local timestamp: 2026-10-24)  
**Workspace**: `C:\Users\MANAS\Documents\AI-Evolution-Map`  
**Auditor**: Senior Data Engineer & Architect  
**Status**: Stage 1 Pipeline Audited & Verified

---

## 1. Confirmed Findings

### 1.1 Ingestion & Provenance
- **OpenAlex Works Ingestion**:
  - Live query: `filter=concepts.id:C154945302,publication_year:2018-2023`, `per-page=25`, `sort=publication_year:desc`.
  - Exactly 25 real records retrieved and saved to `data/raw/openalex_ai_works_sample.json`.
  - Provenance sidecar `data/raw/openalex_ai_works_sample.provenance.json` accurately reflects the source URL (`https://api.openalex.org/works`), UTC timestamp, collection method (`api`), and query parameters.
  - Zero duplicate IDs across records.
- **arXiv Preprints Ingestion**:
  - Live query: `search_query=cat:cs.AI`, `max_results=25`, `sortBy=submittedDate`, `sortOrder=descending`.
  - Exactly 25 real preprints retrieved and saved to `data/raw/arxiv_cs_ai_sample.json`.
  - Provenance sidecar matches the query and URL (`https://export.arxiv.org/api/query`).
  - Zero duplicate IDs across records.
- **Hugging Face Hub Models Ingestion**:
  - Live query: `filter=text-generation`, `sort=downloads`, `direction=-1`, `limit=25`, `full=true`.
  - Exactly 25 model repository metadata entries retrieved and saved to `data/raw/huggingface_models_sample.json`.
  - Provenance sidecar matches the query and URL (`https://huggingface.co/api/models`).
  - Zero duplicate IDs across records.
- **Idempotency & Immutability**:
  - Rerunning ingestion skips live API downloads when raw files exist on disk, preventing unintentional record multiplication or rate-limit violations.
  - Raw JSON files are preserved without in-place mutation; cleaning transformations emit distinct files into `data/interim/` and `data/processed/`.

### 1.2 Pipeline Execution & Notebook Synchronization
- Prior to this audit, notebooks 01 through 08 contained valid markdown and code definitions but had **zero executed cells** (0 outputs).
- Notebooks 01–08 have now been executed in sequence via `jupyter nbconvert --execute --inplace`. Every notebook now contains verified outputs and figures.
- File naming between notebooks (which used `openalex_ai_works_2018_2023.json`) and `scripts/run_pipeline.py` (which used `openalex_ai_works_sample.json`) has been unified and harmonized.

---

## 2. Data-Quality Issues Categorized by Severity

### Critical Severity (Must be resolved before frontend release)
1. **Conceptual Relationship Edge Reversal**:
   - **Location**: `data/reference/seed_knowledge_base.json` (`relationships`)
   - **Issue**: The `source_concept_id` and `target_concept_id` in several relationships are directed opposite to standard English and graph semantics ($A \xrightarrow{\text{relationship}} B$ meaning $A$ performs the action on $B$).
   - **Examples**:
     - `rel-perceptron-extended-by-backprop`: `source`: `concept-perceptron`, `target`: `concept-backpropagation`, `type`: `extends`. This literally asserts that *Perceptron extends Backpropagation*, which is chronologically and conceptually backward. Multi-layer backpropagation networks extended Rosenblatt's single-layer perceptron.
     - `rel-backprop-used-by-cnn`: `source`: `concept-backpropagation`, `target`: `concept-convolutional-neural-network`, `type`: `uses`. This asserts that *Backpropagation uses CNN*. In reality, CNN architectures use Backpropagation for gradient updates.
     - `rel-transformer-extended-by-bert`: `source`: `concept-transformer`, `target`: `concept-bidirectional-transformers`, `type`: `extends`. Asserts *Transformer extends BERT*, rather than BERT extending the Transformer.
     - `rel-transformer-successor-gpt`: `source`: `concept-transformer`, `target`: `concept-autoregressive-llm`, `type`: `successor_to`. Asserts *Transformer is the successor to Autoregressive LLM*, rather than Autoregressive LLMs being successors to early Transformers.
   - **Impact on Frontend**: The Expandable AI Family Tree will render parent and child arrows in the wrong direction.

2. **OpenAlex Abstract Extraction Blind Spot**:
   - **Location**: `src/ingestion/openalex_client.py`
   - **Issue**: The `select` parameter originally requested fields omitting `abstract_inverted_index`. Consequently, every ingested OpenAlex work had `abstract: None` in cleaned records.
   - **Impact**: While the abstract reconstruction logic (`reconstruct_abstract_from_inverted_index`) was unit-tested with synthetic data, it was never exercised on real OpenAlex payloads because the raw payload lacked the field.
   - **Status**: Remedied during audit by updating the `select` parameter to request `abstract_inverted_index`.

---

### Moderate Severity (Data representation & comparability caveats)
3. **Sparse Longitudinal Metrics (N=3 from a Single Year)**:
   - **Location**: `data/reference/seed_knowledge_base.json` (`metrics`) $\rightarrow$ `data/processed/frontend_export/analytics_metrics.json`
   - **Issue**: The metrics export contains only three observations, and all three are point-in-time figures for the year 2023:
     1. Notable ML systems in 2023 ($149.0$)
     2. Industry share of notable AI systems in 2023 ($61.0\%$)
     3. Global private AI investment in 2023 ($\$95.99\text{B}$)
   - **Impact**: Three scalar points from a single year cannot render a line chart, time series, or historical trajectory. Frontend components expecting multi-year time-series data will render empty or trivial charts until multi-year data (e.g. 2010–2023) is ingested.

4. **Sample Selection Skew in Notebook EDA (Notebook 06 & 07)**:
   - **Issue**: The publication year distributions and category charts in Notebook 06 and 07 are calculated from an $N=25$ descending sample, not population counts.
   - **Impact**: The distribution of records across 2018–2023 reflects API sorting and pagination limits, not actual global AI research publication velocity.
   - **Remediation**: Prominent disclaimers must be maintained to prevent portfolio reviewers from interpreting small API samples as global historical trends.

---

### Low Severity (Stylistic & non-blocking)
5. **Pydantic v2 `example` vs `json_schema_extra` Deprecation**:
   - **Location**: `backend/app/schemas/schema_info.py`
   - **Status**: Fixed during audit by replacing deprecated `example="ok"` with `json_schema_extra={"example": "ok"}`.
6. **nbformat 4.5 Cell ID Warnings**:
   - **Location**: Notebooks 01–08
   - **Issue**: Cells originally lacked explicit UUIDs, producing `MissingIDFieldWarning`.
   - **Status**: Fixed automatically by `nbconvert --inplace` during notebook execution.

---

## 3. Audit of Historical Knowledge Base Claims

Inspection of all 8 milestones in `data/reference/seed_knowledge_base.json`:

| Milestone ID | Claimed Title & Event | Stated Date | Stated Precision | Cited Primary Source | Audit Finding & Verification Status |
|---|---|:---:|:---:|---|---|
| `milestone-turing-test-1950` | Publication of *Computing Machinery and Intelligence* | `1950-10` | `month` | `source-turing-1950` (*Mind*, Vol. LIX, No. 236) | **VERIFIED**: Accurate. Turing introduced the Imitation Game in the October 1950 issue of *Mind*. Primary DOI citation verified. |
| `milestone-dartmouth-workshop-1956` | Dartmouth Summer Research Project on Artificial Intelligence | `1956` | `year` | `source-mccarthy-1955-proposal` (Dated 1955-08-31) | **PARTIALLY VERIFIED**: The workshop took place in summer 1956 (June 18 – August 17, 1956). However, the cited source is the *1955 proposal* by McCarthy et al., not workshop proceedings. The proposal introduced the term "Artificial Intelligence" on August 31, 1955. Distinction between proposal date and workshop event must be clarified. |
| `milestone-backpropagation-rediscovery-1986` | Popularization of Multi-Layer Backpropagation | `1986-10-09` | `day` | `source-rumelhart-1986-backprop` (*Nature*, Vol. 323, pp. 533–536) | **VERIFIED**: Accurate. The title correctly states "Popularization" rather than initial invention, recognizing prior mathematical derivations (Linnainmaa 1970, Werbos 1974). Nature publication date verified. |
| `milestone-lenet-5-1998` | Release of LeNet-5 for Document Recognition | `1998-11` | `month` | `source-lecun-1998-lenet` (*Proc. IEEE*, Vol. 86, No. 11) | **PARTIALLY VERIFIED**: The cited paper is the landmark synthesis paper published in Nov 1998. However, LeNet-5 was deployed commercially on check reading at Bell Labs / NCR in 1994–1995. Title should be updated to *"Publication of LeNet-5 and Gradient-Based Learning Applied to Document Recognition"* to distinguish publication from deployment. |
| `milestone-alexnet-imagenet-2012` | AlexNet Dominates ImageNet Competition | `2012-12` | `month` | `source-krizhevsky-2012-alexnet` (*NeurIPS 2012*) | **VERIFIED**: The ILSVRC competition results were announced in October 2012 (ECCV workshop); formal publication at NeurIPS occurred in December 2012. Title should reflect *"AlexNet Wins ILSVRC 2012 and Publication at NeurIPS"*. |
| `milestone-transformer-attention-2017` | Publication of *Attention Is All You Need* | `2017-06-12` | `day` | `source-vaswani-2017-attention` (arXiv:1706.03762v1) | **VERIFIED**: Accurate. Initial preprint submission timestamp was June 12, 2017. Conference presentation followed at NeurIPS in Dec 2017. |
| `milestone-bert-release-2018` | Google Releases BERT | `2018-10-11` | `day` | `source-devlin-2018-bert` (arXiv:1810.04805v1) | **VERIFIED**: Accurate preprint submission date. Code was released on GitHub in Nov 2018; formal conference publication at NAACL 2019. |
| `milestone-gpt3-release-2020` | OpenAI Releases GPT-3 (*Language Models are Few-Shot Learners*) | `2020-05-28` | `day` | `source-brown-2020-gpt3` (arXiv:2005.14165v1) | **VERIFIED**: Accurate preprint submission date. Commercial API beta invitations began in June/July 2020. |

---

## 4. Provenance Gaps

1. **Preprint vs. Journal Provenance**:
   - For `milestone-transformer-attention-2017`, `milestone-bert-release-2018`, and `milestone-gpt3-release-2020`, the source type is registered as `preprint` (citing arXiv IDs).
   - *Recommendation*: Where formal peer-reviewed conference publications exist (e.g. NeurIPS 2017 for Transformer, NAACL 2019 for BERT), add the conference proceedings citation alongside the arXiv preprint citation.
2. **Missing Source Sidecars for Hand-Curated Milestones**:
   - Milestones in `data/reference/seed_knowledge_base.json` have internal provenance via `source_ids`, but they lack a dedicated `.provenance.json` sidecar describing who curated them and when. Adding a curation log sidecar ensures complete auditability.

---

## 5. Metric Comparability Issues

1. **Single-Year vs. Time-Series Metrics**:
   - `analytics_metrics.json` cannot be compared across eras because all 3 data points belong to 2023.
   - Attempting to display "AI Investment Over Time" with the current export will show only a single point ($\$95.99\text{B}$ in 2023).
2. **Platform-Specific Metrics**:
   - Hugging Face `downloads` represents rolling 30-day package fetches (heavily affected by automated CI/CD runners), while OpenAlex `cited_by_count` represents cumulative lifetime academic citations. These two numbers cannot be merged into a single "popularity" score.

---

## 6. Test Suite and Execution Audit

- **Pytest Suite Execution**:
  - Command: `python -m pytest tests backend/tests -v`
  - Total Tests: 22
  - Passed: **22** ($100\%$)
  - Failed: **0**
  - Execution Time: ~1.45 seconds
- **Notebook Pipeline Execution**:
  - All 8 notebooks executed to completion using `jupyter nbconvert --execute --inplace`.
  - Zero execution errors or tracebacks encountered.
  - Processed files, interim files, and validation reports all agree on record counts ($N=25$ per stream, $N=8$ milestones, $N=10$ concepts, $N=7$ relationships, $N=10$ sources, $N=3$ metrics).

---

## 7. Recommended Specific Fixes

### A. Graph Relationship Semantics (RESOLVED & VERIFIED)
Updated `data/reference/seed_knowledge_base.json` so directed edges respect $A \xrightarrow{\text{relationship}} B$ grammar:

1. **`rel-perceptron-extended-by-backprop`**:
   - **Correction**: `source: concept-perceptron`, `target: concept-backpropagation`, `relationship_type: influenced`.
   - **Rationale & Evidence**: A perceptron and backpropagation are not successive versions of the same technology; rather, the single-layer perceptron's representational limitations (Minsky & Papert 1969) directly influenced the development of multi-layer gradient-based training popularized by Rumelhart, Hinton, and Williams (1986).
   - **Rendered**: *"Perceptron influenced Backpropagation."*

2. **`rel-backprop-used-by-cnn`**:
   - **Correction**: `source: concept-convolutional-neural-network`, `target: concept-backpropagation`, `relationship_type: uses`.
   - **Rationale & Evidence**: Backpropagation is the training algorithm used across many architectures, including CNNs. In LeNet (LeCun et al. 1998), the convolutional network uses gradient-based backpropagation to optimize shared convolution kernels directly from input pixels.
   - **Rendered**: *"Convolutional Neural Network (CNN) uses Backpropagation."*

3. **`rel-transformer-extended-by-bert`**:
   - **Correction**: `source: concept-bidirectional-transformers`, `target: concept-transformer`, `relationship_type: extends`.
   - **Rationale & Evidence**: BERT is based on the Transformer architecture. Specifically, BERT extends the Transformer encoder architecture with bidirectional masked language modeling and next-sentence pre-training (Devlin et al. 2018).
   - **Rendered**: *"Bidirectional Masked Language Modeling extends Transformer Architecture."*

4. **`rel-transformer-successor-gpt`**:
   - **Correction**: `source: concept-autoregressive-llm`, `target: concept-transformer`, `relationship_type: uses`.
   - **Rationale & Evidence**: GPT-style autoregressive language models use Transformer-based architectures (causal decoders), scaled to hundreds of billions of parameters (Brown et al. 2020). Describing GPT as the historical successor to the Transformer architecture was inaccurate; it uses the architecture.
   - **Rendered**: *"Autoregressive Large Language Models uses Transformer Architecture."*

### B. Ingest Multi-Year Time-Series for REAVIZ Analytics (Completed)
- **Datasets Ingested**:
  1. Stanford AI Index 2024 Chapter 4 / NetBase Quid: Global Private AI Investment (2013–2023) in constant 2021 US$ Billions.
  2. Stanford AI Index 2024 Chapter 1 / Epoch AI: Notable AI Systems (2013–2023) categorized by institutional affiliation (Industry, Academia, Collaboration, Total).
- **Coverage**: Exactly 11 consecutive years (2013–2023) with 100% complete coverage for all 4 tracked series (44 observations total, plus 3 point-in-time seed metrics = 47 total metric observations).
- **Zero Fabrication**: Verified absence of interpolation, synthetic smoothing, or duplicate IDs.
- **Data Contract Exports**: Exported deterministically to JSON, CSV, and Parquet in `data/processed/frontend_export/analytics_metrics.*`.
- **Automated Tests**: 7 automated tests in `tests/test_metrics_pipeline.py` testing coverage, unique IDs, Pydantic validation, unit consistency, referential integrity, and export format fidelity.

---

## 8. Prioritized Checklist Before Frontend Development

| Priority | Task | Status | Action Required |
|:---:|---|:---:|---|
| **P0** | Correct relationship semantics in `seed_knowledge_base.json` | **Done** | Applied, verified with 6 dedicated tests, and exported. |
| **P0** | Implement relationship sentence rendering helper | **Done** | Implemented in `src/common/relationships.py`. |
| **P0** | Harmonize raw and interim filenames across script and notebooks | **Done** | Script and notebooks now share identical cache paths. |
| **P0** | Execute all 8 notebooks and verify outputs | **Done** | All 8 notebooks executed with real figures and cell outputs. |
| **P0** | Add multi-year time-series to `analytics_metrics.json` (2013–2023) | **Done** | Stanford AI Index & Epoch AI 2013–2023 ingested, validated, and exported. |
| **P1** | Add conference citations for Transformer and BERT | Pending Stage 2 Curation | Link NeurIPS 2017 and NAACL 2019 proceedings DOIs alongside arXiv preprints. |
| **P2** | Add formal provenance sidecar for hand-curated seed knowledge base | Pending Stage 2 Curation | Create `seed_knowledge_base.provenance.json`. |
