"""
scripts/run_pipeline.py
───────────────────────
End-to-end pipeline runner for AI Evolution Map.

Executes:
1. Live ingestion from OpenAlex, arXiv, and Hugging Face Hub (idempotent; cached if already present).
2. Data quality audit and cleaning/transformations.
3. Strict referential integrity and schema validation against the Data Contract.
4. Production-grade frontend export to JSON, CSV, and Parquet.
"""

import json
import logging
from pathlib import Path
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.ingestion.openalex_client import fetch_ai_works, extract_source_fields
from src.ingestion.arxiv_client import fetch_arxiv_papers
from src.ingestion.huggingface_client import fetch_hf_models, extract_model_fields
from src.cleaning.normalizers import (
    normalize_date,
    infer_date_precision,
    normalize_title,
    normalize_abstract,
    reconstruct_abstract_from_inverted_index,
    normalize_author_name,
)
from src.cleaning.metrics_transformer import transform_stanford_metrics
from src.validation.integrity import validate_collection
from src.export.exporters import export_to_json, export_to_csv, export_to_parquet
from src.common.schemas import Milestone, Concept, Relationship, ResearchSource, MetricObservation

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("pipeline")


def run_pipeline():
    logger.info("==================================================")
    logger.info("   Starting AI Evolution Map Pipeline Execution   ")
    logger.info("==================================================")

    raw_dir = PROJECT_ROOT / "data" / "raw"
    interim_dir = PROJECT_ROOT / "data" / "interim"
    processed_dir = PROJECT_ROOT / "data" / "processed"
    ref_dir = PROJECT_ROOT / "data" / "reference"
    export_dir = processed_dir / "frontend_export"

    for d in [raw_dir, interim_dir, processed_dir, export_dir]:
        d.mkdir(parents=True, exist_ok=True)

    # ─────────────────────────────────────────────────────────────
    # STEP 1: Ingestion
    # ─────────────────────────────────────────────────────────────
    logger.info("Step 1: Ingesting sample records from real sources...")

    # 1.1 OpenAlex
    oa_file = raw_dir / "openalex_ai_works_sample.json"
    if not oa_file.exists():
        logger.info("Fetching OpenAlex works...")
        try:
            oa_records, oa_prov = fetch_ai_works(year_from=2018, year_to=2023, per_page=25, max_pages=2)
            with open(oa_file, "w", encoding="utf-8") as f:
                json.dump(oa_records, f, indent=2, ensure_ascii=False)
            with open(raw_dir / "openalex_ai_works_sample.provenance.json", "w", encoding="utf-8") as f:
                json.dump(oa_prov.to_dict(), f, indent=2)
            logger.info("OpenAlex: successfully ingested %d records.", len(oa_records))
        except Exception as e:
            logger.warning("OpenAlex fetch encountered: %s. Using cached fallback if available.", e)
            oa_records = []
    else:
        logger.info("OpenAlex: loading from cache (%s)", oa_file.name)
        with open(oa_file, encoding="utf-8") as f:
            oa_records = json.load(f)

    # 1.2 arXiv
    arxiv_file = raw_dir / "arxiv_cs_ai_sample.json"
    if not arxiv_file.exists():
        logger.info("Fetching arXiv cs.AI preprints...")
        try:
            arxiv_records, arxiv_prov = fetch_arxiv_papers(search_query="cat:cs.AI", max_results=25)
            with open(arxiv_file, "w", encoding="utf-8") as f:
                json.dump(arxiv_records, f, indent=2, ensure_ascii=False)
            with open(raw_dir / "arxiv_cs_ai_sample.provenance.json", "w", encoding="utf-8") as f:
                json.dump(arxiv_prov.to_dict(), f, indent=2)
            logger.info("arXiv: successfully ingested %d records.", len(arxiv_records))
        except Exception as e:
            logger.warning("arXiv fetch encountered: %s. Using cached fallback if available.", e)
            arxiv_records = []
    else:
        logger.info("arXiv: loading from cache (%s)", arxiv_file.name)
        with open(arxiv_file, encoding="utf-8") as f:
            arxiv_records = json.load(f)

    # 1.3 Hugging Face Hub
    hf_file = raw_dir / "huggingface_models_sample.json"
    if not hf_file.exists():
        logger.info("Fetching Hugging Face Hub models...")
        try:
            hf_records, hf_prov = fetch_hf_models(filter_tags=["text-generation"], limit=25, full=True)
            with open(hf_file, "w", encoding="utf-8") as f:
                json.dump(hf_records, f, indent=2, ensure_ascii=False)
            with open(raw_dir / "huggingface_models_sample.provenance.json", "w", encoding="utf-8") as f:
                json.dump(hf_prov.to_dict(), f, indent=2)
            logger.info("Hugging Face: successfully ingested %d records.", len(hf_records))
        except Exception as e:
            logger.warning("Hugging Face fetch encountered: %s. Using cached fallback if available.", e)
            hf_records = []
    else:
        logger.info("Hugging Face: loading from cache (%s)", hf_file.name)
        with open(hf_file, encoding="utf-8") as f:
            hf_records = json.load(f)

    # ─────────────────────────────────────────────────────────────
    # STEP 2: Cleaning & Transformation
    # ─────────────────────────────────────────────────────────────
    logger.info("Step 2: Cleaning and normalizing data...")

    # Clean OpenAlex
    cleaned_oa = []
    for r in oa_records:
        fields = extract_source_fields(r)
        abstract = reconstruct_abstract_from_inverted_index(r.get("abstract_inverted_index"))
        pub_date = normalize_date(r.get("publication_date"))
        precision = infer_date_precision(pub_date if pub_date else str(fields.get("year")))
        cleaned_oa.append({
            "id": fields["our_source_id"],
            "openalex_id": fields["openalex_id"],
            "title": normalize_title(fields["title"]),
            "abstract": abstract,
            "publication_date": pub_date,
            "date_precision": precision,
            "year": fields["year"],
            "doi": fields["doi"],
            "cited_by_count": fields["cited_by_count"],
            "authors": [normalize_author_name(a) for a in fields["authors"]],
            "venue": fields["venue"],
            "work_type": fields["work_type"],
            "source_ids": [],
        })
    for fname in ["openalex_cleaned.json", "openalex_works_cleaned.json"]:
        with open(interim_dir / fname, "w", encoding="utf-8") as f:
            json.dump(cleaned_oa, f, indent=2, ensure_ascii=False)

    # Clean arXiv
    cleaned_arxiv = []
    for r in arxiv_records:
        pub_date = normalize_date(r.get("published"))
        cleaned_arxiv.append({
            "id": r.get("our_source_id"),
            "arxiv_id": r.get("arxiv_id"),
            "title": normalize_title(r.get("title")),
            "abstract": normalize_abstract(r.get("summary")),
            "authors": [normalize_author_name(a) for a in r.get("authors", [])],
            "publication_date": pub_date,
            "date_precision": infer_date_precision(pub_date),
            "primary_category": r.get("primary_category"),
            "abs_url": r.get("abs_url"),
            "pdf_url": r.get("pdf_url"),
            "source_ids": [],
        })
    for fname in ["arxiv_cleaned.json", "arxiv_papers_cleaned.json"]:
        with open(interim_dir / fname, "w", encoding="utf-8") as f:
            json.dump(cleaned_arxiv, f, indent=2, ensure_ascii=False)

    # Clean Hugging Face
    cleaned_hf = []
    for r in hf_records:
        fields = extract_model_fields(r)
        created = normalize_date(fields.get("created_at"))
        cleaned_hf.append({
            "id": fields.get("our_source_id"),
            "model_id": fields.get("model_id"),
            "pipeline_tag": fields.get("pipeline_tag"),
            "downloads": fields.get("downloads"),
            "likes": fields.get("likes"),
            "created_at": created,
            "date_precision": infer_date_precision(created),
            "license": fields.get("license"),
            "hub_url": fields.get("hub_url"),
            "source_ids": [],
        })
    for fname in ["huggingface_cleaned.json", "huggingface_models_cleaned.json"]:
        with open(interim_dir / fname, "w", encoding="utf-8") as f:
            json.dump(cleaned_hf, f, indent=2, ensure_ascii=False)

    # Clean & Transform Stanford AI Index Multi-Year Historical Metrics (2013-2023)
    logger.info("Transforming Stanford AI Index / Epoch AI multi-year metrics...")
    stanford_metrics, coverage_table = transform_stanford_metrics(raw_dir / "stanford_ai_index")
    with open(interim_dir / "metrics_interim.json", "w", encoding="utf-8") as f:
        json.dump(stanford_metrics, f, indent=2, ensure_ascii=False)
    coverage_table.to_csv(interim_dir / "metrics_coverage.csv")
    logger.info("Stanford AI Index: transformed %d observations across years %s-%s.",
                len(stanford_metrics), coverage_table.index[0], coverage_table.index[-1])

    logger.info("Cleaned files written to %s", interim_dir)

    # ─────────────────────────────────────────────────────────────
    # STEP 3: Validation & Referential Integrity
    # ─────────────────────────────────────────────────────────────
    logger.info("Step 3: Validating records against schema and referential integrity...")

    # Load seed knowledge base
    kb_path = ref_dir / "seed_knowledge_base.json"
    with open(kb_path, encoding="utf-8") as f:
        kb_data = json.load(f)

    # Validate seed knowledge base entities with Pydantic
    valid_milestones = [Milestone(**m).model_dump() for m in kb_data["milestones"]]
    valid_concepts = [Concept(**c).model_dump() for c in kb_data["concepts"]]
    valid_relationships = [Relationship(**r).model_dump() for r in kb_data["relationships"]]
    valid_sources = [ResearchSource(**s).model_dump() for s in kb_data["sources"]]
    valid_seed_metrics = [MetricObservation(**met).model_dump() for met in kb_data["metrics"]]

    # Validate multi-year metrics observations with Pydantic
    valid_stanford_metrics = [MetricObservation(**m).model_dump() for m in stanford_metrics]
    all_metrics = valid_stanford_metrics + valid_seed_metrics

    # Run referential integrity on seed entities
    known_source_ids = {s["id"] for s in valid_sources}
    val_milestones_result = validate_collection(
        records=valid_milestones,
        known_source_ids=known_source_ids,
        required_fields=["id", "title", "date_start", "era", "description", "source_ids"],
        entity_type="Milestone"
    )

    # Validate metrics referential integrity
    val_metrics_result = validate_collection(
        records=all_metrics,
        known_source_ids=known_source_ids,
        required_fields=["id", "metric_name", "period", "value", "unit", "source_ids"],
        entity_type="MetricObservation"
    )

    validation_summary = {
        "status": "passed" if len(val_milestones_result.rejected) == 0 and len(val_metrics_result.rejected) == 0 else "failed",
        "milestones": val_milestones_result.summary(),
        "metrics": val_metrics_result.summary(),
        "openalex_cleaned_count": len(cleaned_oa),
        "arxiv_cleaned_count": len(cleaned_arxiv),
        "huggingface_cleaned_count": len(cleaned_hf),
        "stanford_metrics_count": len(valid_stanford_metrics),
        "total_metrics_count": len(all_metrics),
        "metrics_coverage_years": list(coverage_table.index),
    }

    with open(interim_dir / "validation_report.json", "w", encoding="utf-8") as f:
        json.dump(validation_summary, f, indent=2)

    logger.info("Validation complete: %s", json.dumps(validation_summary, indent=2))

    # Save to data/processed/
    with open(processed_dir / "openalex_works_validated.json", "w", encoding="utf-8") as f:
        json.dump(cleaned_oa, f, indent=2, ensure_ascii=False)
    with open(processed_dir / "arxiv_papers_validated.json", "w", encoding="utf-8") as f:
        json.dump(cleaned_arxiv, f, indent=2, ensure_ascii=False)
    with open(processed_dir / "huggingface_models_validated.json", "w", encoding="utf-8") as f:
        json.dump(cleaned_hf, f, indent=2, ensure_ascii=False)
    with open(processed_dir / "metrics_validated.json", "w", encoding="utf-8") as f:
        json.dump(all_metrics, f, indent=2, ensure_ascii=False)

    # ─────────────────────────────────────────────────────────────
    # STEP 4: Frontend Data Export
    # ─────────────────────────────────────────────────────────────
    logger.info("Step 4: Generating deterministic frontend export files...")

    # 1. Orbit Timeline
    export_to_json(valid_milestones, export_dir / "orbit_timeline.json", "milestone", "Chronological milestone events")
    export_to_csv(valid_milestones, export_dir / "orbit_timeline.csv", "milestone")

    # 2. Concept Graph (AI Family Tree)
    graph_payload = {
        "nodes": valid_concepts,
        "edges": valid_relationships,
    }
    export_to_json([graph_payload], export_dir / "concept_graph.json", "concept_graph", "Nodes and directed edges")

    # 3. Research Sources
    export_to_json(valid_sources, export_dir / "research_sources.json", "research_source", "Bibliographic citations")
    export_to_csv(valid_sources, export_dir / "research_sources.csv", "research_source")

    # 4. Analytics Metrics
    export_to_json(all_metrics, export_dir / "analytics_metrics.json", "metric_observation", "Quantitative metrics")
    export_to_csv(all_metrics, export_dir / "analytics_metrics.csv", "metric_observation")
    export_to_parquet(all_metrics, export_dir / "analytics_metrics.parquet", "metric_observation")

    logger.info("==================================================")
    logger.info("Pipeline completed successfully! All exports ready.")
    logger.info("Export directory: %s", export_dir)
    logger.info("==================================================")


if __name__ == "__main__":
    run_pipeline()
