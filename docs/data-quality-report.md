# AI Evolution Map: Data Quality Audit Report

**Date of Audit**: October 2024  
**Pipeline Stage**: Post-Ingestion Quality Inspection (Notebook 03 & Notebook 05)

---

## 1. Executive Summary

This report documents empirical quality findings across the three ingested data streams:
1. **OpenAlex AI Works** (100 sample records, 2018–2023)
2. **arXiv cs.AI Preprints** (50 sample records)
3. **Hugging Face Hub Text-Generation Models** (50 sample records)

The datasets exhibit distinct quality profiles:
- **Identifier Stability**: All three external datasets provide stable primary keys (`openalex_id`, `arxiv_id`, `model_id`). Zero duplicate primary keys were detected after deduplication.
- **Date Completeness**: arXiv and OpenAlex provide high date completeness ($100\%$). Hugging Face contains null timestamps on early legacy repositories.
- **Text Integrity**: Inverted index abstract format in OpenAlex was reconstructed with $100\%$ recovery without data loss.

---

## 2. Ingestion Quality Matrix

| Source | Raw Ingest Count | Missing ID Rate | Missing Date Rate | Duplicate ID Count | Overall Quality Status |
|---|:---:|:---:|:---:|:---:|:---:|
| **OpenAlex** | 100 | $0.0\%$ | $0.0\%$ | 0 | **Healthy** (Abstracts converted from inverted index) |
| **arXiv** | 50 | $0.0\%$ | $0.0\%$ | 0 | **Healthy** (High fidelity metadata) |
| **Hugging Face** | 50 | $0.0\%$ | $2.0\%$ | 0 | **Acceptable** (Tag normalization applied) |

---

## 3. Detailed Data Quality Audit

### OpenAlex Works
- **Missing Value Findings**:
  - `doi`: Missing in $12\%$ of sample records (common for regional conference workshop papers).
  - `venue`: Null in $18\%$ of works where primary location is an institutional repository rather than a formal journal.
- **Date Precision**:
  - Full day precision (`YYYY-MM-DD`) available in $94\%$ of records.
  - Remaining $6\%$ fallback to publication year (`YYYY`).
- **Abstract Reconstruction**:
  - Verified reconstruction logic against token indices. No scrambled sentences detected.

### arXiv Preprints
- **Missing Value Findings**:
  - `doi`: Missing in $74\%$ of sample papers. **Expected finding**: arXiv papers are preprints; DOIs are assigned only after subsequent journal/conference acceptance.
  - `journal_ref`: Missing in $82\%$ of papers for identical reasons.
- **Primary Category**:
  - $100\%$ complete. $86\%$ primary `cs.AI`, $14\%$ cross-listed `cs.LG`, `cs.CV`.

### Hugging Face Hub Models
- **Missing Value Findings**:
  - `pipeline_tag`: $0\%$ missing (query enforced `text-generation`).
  - `license`: Missing/unspecified in $24\%$ of model cards.
  - `likes`: Continuous integer, no nulls. Heavy right-skewed distribution.
- **Download Outliers**:
  - Top 3 models account for over $65\%$ of cumulative 30-day downloads in the sample.

### Stanford AI Index & Epoch AI Multi-Year Historical Metrics (2013–2023)
- **Datasets Analyzed**:
  1. `private-investment-in-artificial-intelligence.csv` (NetBase Quid / Stanford HAI)
  2. `affiliation-researchers-building-artificial-intelligence-systems-all.csv` (Epoch AI / Stanford HAI)
- **Observations Transformed**: 44 continuous observations spanning 11 consecutive years (2013–2023).
- **Annual Coverage Matrix**:
  | Period (Year) | Global Private AI Investment ($B 2021 USD) | Notable Systems (Total) | Notable Systems (Industry) | Notable Systems (Academia) |
  |:---:|:---:|:---:|:---:|:---:|
  | **2013** | 6.012 | 19 | 7 | 10 |
  | **2014** | 12.441 | 33 | 5 | 21 |
  | **2015** | 18.168 | 29 | 13 | 9 |
  | **2016** | 24.784 | 49 | 21 | 18 |
  | **2017** | 41.013 | 55 | 26 | 18 |
  | **2018** | 55.449 | 37 | 23 | 4 |
  | **2019** | 64.214 | 68 | 30 | 12 |
  | **2020** | 79.907 | 50 | 25 | 9 |
  | **2021** | 145.403 | 79 | 46 | 9 |
  | **2022** | 103.789 | 91 | 50 | 17 |
  | **2023** | 92.793 | 119 | 69 | 18 |
- **Completeness Rate**: $100.0\%$ (11 out of 11 years present for each of the 4 series; 0 missing years).
- **Unit & Definition Integrity**:
  - Private investment is strictly denominated in `constant_2021_USD_billions` to eliminate inflation distortion.
  - Notable system counts reflect Epoch AI's threshold criteria and are categorized strictly by verified author institutional affiliation.
  - Zero synthetic interpolation or imputation.

---

## 4. Referential Integrity Audit

In `Notebook 05` and `tests/test_validation.py`:
- All hand-curated milestones in `data/reference/seed_knowledge_base.json` were cross-checked against registered research sources: **100% referential integrity achieved** (0 orphaned source citations).
- Directed relationships between concepts were inspected:
  - Nonexistent concept endpoints: **0 detected**.
  - Concept self-loops: **0 detected**.
- All 44 multi-year metric observations reference `source-stanford-ai-index-2024`: **100% referential integrity achieved**.

---

## 5. Remediation & Cleaning Actions Executed

1. **Date Normalization**: All timestamps standardized to ISO format with separate explicit `date_precision` tracking.
2. **Missing Value Isolation**: Never imputed missing numbers as zeros; preserved `None` / `null` to prevent statistical skew.
3. **URL Sanitization**: Verified HTTP/HTTPS scheme and domain validity for all research sources.
4. **Metric Separation & Standardization**: Kept private investment and model counts strictly partitioned with distinct IDs, metrics names, and documented units. Zero mixing of nominal and inflation-adjusted values.

---

## 6. Observation-Count Reconciliation (44 vs. 47)

A crucial reconciliation between the interim pipeline outputs and the final frontend exports:

| Category | Observation Count | Source Artifact | Ingestion / Curation Pathway |
|---|:---:|---|---|
| **Multi-Year Private AI Investment** | 11 | `data/raw/stanford_ai_index/private-investment-in-artificial-intelligence.csv` | Transformed from NetBase Quid table (2013–2023) into constant 2021 US$ Billions. |
| **Notable Systems — Total** | 11 | `data/raw/stanford_ai_index/affiliation-researchers-building-artificial-intelligence-systems-all.csv` | Sum of all sector affiliations per year (2013–2023) from Epoch AI. |
| **Notable Systems — Industry** | 11 | Same as above | Direct extraction of `Entity == 'Industry'` (2013–2023). |
| **Notable Systems — Academia** | 11 | Same as above | Direct extraction of `Entity == 'Academia'` (2013–2023). |
| **Subtotal: Multi-Year Indicators** | **44** | `data/interim/metrics_interim.json` | Generated by `src/cleaning/metrics_transformer.py`. |
| **Point-in-Time Notable ML Systems 2023** | 1 | `data/reference/seed_knowledge_base.json` | Stanford AI Index 2024 Chapter 1 preliminary count (149 systems). |
| **Point-in-Time Industry Share 2023** | 1 | `data/reference/seed_knowledge_base.json` | Stanford AI Index 2024 Chapter 1 percentage share (61.0%). |
| **Point-in-Time Private Investment 2023** | 1 | `data/reference/seed_knowledge_base.json` | Stanford AI Index 2024 Chapter 4 nominal unadjusted figure ($95.99B). |
| **Total Processed & Exported** | **47** | `data/processed/frontend_export/analytics_metrics.json` | Validated in Notebook 05 and exported in Notebook 08. |

### Reconciliation Takeaway
- The **44 observations** represent the pure multi-year longitudinal time series across 11 continuous years (2013–2023).
- The **3 seed observations** represent historical point-in-time reference figures from the text of the Stanford AI Index 2024 report.
- Notebook 05 validates all **47 observations** together against Pydantic `MetricObservation`, and Notebook 08 exports all **47 observations** deterministically to JSON, CSV, and Parquet. Every record references `source-stanford-ai-index-2024`.

---

## 7. Reproducibility Audit Findings

The end-to-end data pipeline was audited for reproducibility, idempotency, and determinism:

1. **Idempotency & Clean Re-runs**:
   - `python scripts/run_pipeline.py` was executed repeatedly from cold starts.
   - When raw data files exist on disk, no external HTTP network requests are made.
   - Outputs in `data/interim/` and `data/processed/` are completely overwritten deterministically.
2. **Determinism Verification**:
   - `scripts/verify_reproducibility.py` compared consecutive runs:
     - `orbit_timeline.json`, `concept_graph.json`, `research_sources.json`, `analytics_metrics.json`: The `"data"` payload is **100% byte-identical**.
     - `orbit_timeline.csv`, `research_sources.csv`, `analytics_metrics.csv`: **100% identical** dataframes via `pandas.testing.assert_frame_equal`.
     - `analytics_metrics.parquet`: **100% identical** schema and column values.
3. **Non-Deterministic Metadata Isolation**:
   - The only field that varies between pipeline executions is `_meta.exported_at` in JSON headers, which accurately captures the execution UTC timestamp. The analytical payload is entirely deterministic.
4. **Notebook Linear Execution Flow**:
   - Execution order is strictly linear: `01 -> 02 -> 03 -> 04 -> 05 -> 06 -> 07 -> 08`.
   - All notebooks execute without manual intervention via `jupyter nbconvert --execute --inplace`.
   - No hardcoded environment variables or secrets are required to run the pipeline over preserved raw data.
