# AI Evolution Map: Frontend Data Contract Specification

Version: **0.1.0**  
Implementation Reference: [`src/common/schemas.py`](file:///C:/Users/MANAS/Documents/AI-Evolution-Map/src/common/schemas.py)  
Export Generator: [`src/export/exporters.py`](file:///C:/Users/MANAS/Documents/AI-Evolution-Map/src/export/exporters.py)  
Target Consumers: Orbit Timeline, Expandable AI Family Tree, REAVIZ Analytics Dashboard

---

## 1. Overview & Golden Principle

This document defines the strict, binding data contract between the Python/Jupyter data pipeline and the React frontend. 

**The Golden Frontend Rule**:  
The frontend client application **never performs data cleaning, date parsing guesswork, imputation, or schema repairs**. Every dataset exported to `data/processed/frontend_export/` is pre-validated against Pydantic v2 schemas, type-enforced, referentially complete, and structurally final.

### Envelope Structure
Every exported JSON file follows a standard two-tier envelope structure separating non-deterministic export metadata from deterministic analytical data:

```json
{
  "_meta": {
    "schema_version": "0.1.0",
    "entity_type": "milestone | concept_graph | research_source | metric_observation",
    "exported_at": "2026-10-26T17:41:54Z",
    "record_count": 47,
    "notes": "Descriptive context regarding the exported collection"
  },
  "data": [
    { "...": "..." }
  ]
}
```

- `_meta.exported_at`: Non-deterministic UTC timestamp recording the exact pipeline execution time.
- `_meta.record_count`: Guaranteed integer matching `len(data)`.
- `data`: Deterministic, immutable array of validated records.

---

## 2. Entity Specifications & Real Export Examples

### A. Milestone (`orbit_timeline.json`, `orbit_timeline.csv`)
A discrete, historically verified landmark in AI history displayed along the interactive Orbit Timeline.

| Field | Type | Nullable | Constraints / Enum Values | Description |
|---|---|:---:|---|---|
| `id` | `string` | No | `^[a-z0-9][a-z0-9\-]{1,98}[a-z0-9]$` | Stable deterministic slug, e.g. `milestone-turing-test-1950` |
| `title` | `string` | No | 3 to 300 characters | Formal title of the landmark discovery or release |
| `date_start` | `string` | No | `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` | ISO 8601 date preserving known precision. Never fabricate days/months. |
| `date_precision` | `string` | No | `day`, `month`, `year`, `decade`, `unknown` | Guides UI formatting (e.g. "October 1950" vs "1956") |
| `era` | `string` | No | `foundations`, `birth`, `first_winter`, `expert_systems`, `second_winter`, `revival`, `deep_learning`, `transformer_era`, `generative_ai` | Chronological era bucket for color-coding and orbit grouping |
| `description` | `string` | No | Min 10 characters | Evidence-backed factual description of the milestone |
| `source_ids` | `list[string]` | No | Min 1 item; references `ResearchSource.id` | Bibliographic provenance links |
| `concept_ids` | `list[string]` | Yes (empty) | References `Concept.id` | Direct links to nodes in the AI Family Tree |
| `confidence` | `string` | No | `verified`, `partially_verified`, `unverified` | Historiographical verification status |

#### Real Export Record from `orbit_timeline.json`:
```json
{
  "id": "milestone-turing-test-1950",
  "title": "Publication of Computing Machinery and Intelligence (Turing Test)",
  "date_start": "1950-10",
  "date_precision": "month",
  "era": "foundations",
  "description": "Alan Turing proposed the Imitation Game as an operational benchmark for machine intelligence, analyzing philosophical objections and machine learning foundations.",
  "source_ids": [
    "source-turing-1950"
  ],
  "concept_ids": [
    "concept-turing-test"
  ],
  "confidence": "verified"
}
```

---

### B. Concept (`concept_graph.json` $\rightarrow$ `nodes`)
An algorithmic technique, architectural paradigm, or foundational theory. Concepts constitute the nodes of the AI Family Tree graph.

| Field | Type | Nullable | Constraints / Enum Values | Description |
|---|---|:---:|---|---|
| `id` | `string` | No | `^[a-z0-9][a-z0-9\-]{1,98}[a-z0-9]$` | Stable unique slug, e.g. `concept-transformer` |
| `name` | `string` | No | 2 to 200 characters | Canonical human-readable name |
| `category` | `string` | No | `algorithm`, `architecture`, `dataset`, `framework`, `hardware`, `methodology`, `organization`, `paradigm`, `task`, `theory` | Functional categorization for node grouping and styling |
| `summary` | `string` | No | Min 10 characters | Educational summary of the concept's mechanism |
| `introduced_date`| `string` | Yes | `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` | Date first introduced in scientific literature |
| `introduced_date_precision` | `string` | Conditional | `day`, `month`, `year`, `unknown` | Required if `introduced_date` is non-null |
| `source_ids` | `list[string]` | Yes (empty) | References `ResearchSource.id` | Citations introducing or defining the concept |

#### Real Export Record from `concept_graph.json`:
```json
{
  "id": "concept-transformer",
  "name": "Transformer Architecture",
  "category": "architecture",
  "summary": "Sequence-to-sequence model relying entirely on self-attention without recurrence or convolutions.",
  "introduced_date": "2017-06-12",
  "introduced_date_precision": "day",
  "source_ids": [
    "source-vaswani-2017-attention"
  ]
}
```

---

### C. Relationship (`concept_graph.json` $\rightarrow$ `edges`)
A directed, typed, evidence-backed relationship connecting two concepts in the AI Family Tree.

**Directed Grammar**:  
Every relationship edge is directed strictly as:  
$$\text{source\_concept\_id} \xrightarrow{\text{relationship\_type}} \text{target\_concept\_id}$$  
*(e.g., Autoregressive LLM $\xrightarrow{\text{uses}}$ Transformer Architecture)*. Self-loops ($\text{source} = \text{target}$) are strictly prohibited.

| Field | Type | Nullable | Constraints / Enum Values | Description |
|---|---|:---:|---|---|
| `id` | `string` | No | `^[a-z0-9][a-z0-9\-]{1,98}[a-z0-9]$` | Stable edge slug |
| `source_concept_id` | `string` | No | Must exist in `concept_graph.nodes` | Origin concept |
| `target_concept_id` | `string` | No | Must exist in `concept_graph.nodes` | Destination concept (no self-loops) |
| `relationship_type` | `string` | No | `influenced`, `introduced`, `extends`, `uses`, `successor_to` | Semantic relationship classification |
| `evidence_source_ids`| `list[string]`| No | Min 1 item; references `ResearchSource.id` | Literature citations establishing the link |
| `description` | `string` | No | Min 10 characters | Sourced historical explanation of the relationship |

#### Real Export Record from `concept_graph.json`:
```json
{
  "id": "rel-transformer-successor-gpt",
  "source_concept_id": "concept-autoregressive-llm",
  "target_concept_id": "concept-transformer",
  "relationship_type": "uses",
  "evidence_source_ids": [
    "source-brown-2020-gpt3"
  ],
  "description": "GPT-style autoregressive language models use Transformer-based architectures (causal decoders), scaled to hundreds of billions of parameters."
}
```

---

### D. ResearchSource (`research_sources.json`, `research_sources.csv`)
A peer-reviewed scientific paper, technical preprint, institutional report, or benchmark dataset providing provenance for all historical and technical claims.

| Field | Type | Nullable | Constraints / Enum Values | Description |
|---|---|:---:|---|---|
| `id` | `string` | No | `^[a-z0-9][a-z0-9\-]{1,98}[a-z0-9]$` | Canonical source ID |
| `title` | `string` | No | Min 3 characters | Full title of the publication |
| `authors` | `list[string]` | Yes (empty) | Normalized string names | List of contributing authors |
| `publication_date` | `string` | Yes | `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` | Date of publication |
| `date_precision` | `string` | No | `day`, `month`, `year`, `unknown` | Precision of publication date |
| `publisher` | `string` | Yes | String | Academic journal, conference venue, or publisher |
| `source_type` | `string` | No | `original_research`, `preprint`, `official_documentation`, `institutional_report`, `dataset`, `secondary_reporting`, `api_metadata` | Bibliographic category |
| `url` | `string` | Yes | Valid HTTP/HTTPS URL | Persistent resolver URL (DOI or arXiv link preferred) |
| `accessed_at` | `string` | No | ISO 8601 UTC timestamp | Audit timestamp when metadata was harvested |

#### Real Export Record from `research_sources.json`:
```json
{
  "id": "source-vaswani-2017-attention",
  "title": "Attention Is All You Need",
  "authors": [
    "Ashish Vaswani",
    "Noam Shazeer",
    "Niki Parmar",
    "Jakob Uszkoreit",
    "Llion Jones",
    "Aidan N. Gomez",
    "Łukasz Kaiser",
    "Illia Polosukhin"
  ],
  "publication_date": "2017-06-12",
  "date_precision": "day",
  "publisher": "NeurIPS / arXiv",
  "source_type": "preprint",
  "url": "https://arxiv.org/abs/1706.03762",
  "accessed_at": "2024-10-24T04:30:00Z"
}
```

---

### E. MetricObservation (`analytics_metrics.json`, `analytics_metrics.csv`, `analytics_metrics.parquet`)
An empirical, quantitative measurement tracking trends across time.

| Field | Type | Nullable | Constraints / Enum Values | Description |
|---|---|:---:|---|---|
| `id` | `string` | No | `^[a-z0-9][a-z0-9\-]{1,98}[a-z0-9]$` | Deterministic observation slug |
| `metric_name` | `string` | No | Snake_case string | Standardized metric identifier |
| `period` | `string` | No | `YYYY`, `YYYY-QN`, or `YYYY-MM` | Period string (e.g. `"2021"`) |
| `period_precision` | `string` | No | `annual`, `quarterly`, `monthly`, `point_in_time`, `range`, `unknown` | Precision of the temporal period |
| `value` | `float` | No | Finite non-negative float | Real numeric value. Never use 0 for missing data. |
| `unit` | `string` | No | `constant_2021_USD_billions`, `USD_billions`, `systems`, `percent` | Explicit unit of measurement |
| `category` | `string` | No | `investment`, `model_development`, `industry_trends` | Domain grouping for dashboard filtering |
| `source_ids` | `list[string]` | No | Min 1 item; references `ResearchSource.id` | Bibliographic citation establishing methodology |
| `methodology_note` | `string` | Yes | Detailed string | Exact inclusion criteria and calculation context |
| `collection_method`| `string` | No | `api`, `manual_download`, `web_scrape`, `computed`, `survey` | Method utilized to ingest the data |

#### Real Export Record from `analytics_metrics.json`:
```json
{
  "id": "metric-private-investment-2021-constant-2021-usd",
  "metric_name": "global_private_ai_investment_annual_constant_2021_usd_billions",
  "period": "2021",
  "period_precision": "annual",
  "value": 145.403,
  "unit": "constant_2021_USD_billions",
  "category": "investment",
  "source_ids": [
    "source-stanford-ai-index-2024"
  ],
  "methodology_note": "NetBase Quid external funding for privately held AI companies raising >$1.5M. Excludes publicly traded companies and internal corporate R&D/CapEx. Reported in constant 2021 US$ billions.",
  "collection_method": "manual_download"
}
```

---

## 3. Date Precision Guidelines for Frontend Rendering

The `date_precision` field dictates how dates must be presented in the user interface:

| Precision Value | Format of `date_start` / `period` | Frontend UI Display Example | Guidance |
|---|---|---|---|
| `day` | `YYYY-MM-DD` | *"June 12, 2017"* | Render exact calendar date. |
| `month` | `YYYY-MM` | *"October 1950"* | Render month and year; do not render day "01". |
| `year` / `annual` | `YYYY` | *"1956"* or *"2021"* | Render year only. Never default to January 1. |
| `decade` | `YYYY` | *"1980s"* | Render decade span. |
| `unknown` | `YYYY` or null | *"Date Unknown"* | Fallback label; do not attempt date arithmetic. |

---

## 4. Multi-Format Parity & Compatibility

| Export Path | Format | Primary Frontend Target | Considerations |
|---|---|---|---|
| `orbit_timeline.json` | JSON | Orbit Timeline component | Direct browser `fetch()` |
| `orbit_timeline.csv` | CSV | Tabular exports & spreadsheets | List fields serialized as JSON strings |
| `concept_graph.json` | JSON | D3 / Canvas Family Tree | Encapsulates `nodes` and directed `edges` |
| `research_sources.json` | JSON | Provenance modal dialogs | Direct lookup by `source_id` |
| `research_sources.csv` | CSV | Literature review tabular export | Authors list serialized as JSON string |
| `analytics_metrics.json` | JSON | REAVIZ time-series line charts | Filter by `metric_name` across 2013–2023 |
| `analytics_metrics.csv` | CSV | Data download portal | Full 47-row tabular extract |
| `analytics_metrics.parquet` | Parquet | Python / DuckDB / backend query | Highly compressed column-typed store |
