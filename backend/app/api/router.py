"""
backend/app/api/router.py
─────────────────────────
FastAPI routes for AI Evolution Map serving validated exports and schema metadata.
"""

import json
from pathlib import Path
from typing import Any, Dict
from fastapi import APIRouter, HTTPException
from backend.app.schemas.schema_info import HealthResponse, SchemaInfoResponse, EntityTypeInfo

router = APIRouter()

PROJECT_ROOT = Path(__file__).resolve().parents[3]
EXPORT_DIR = PROJECT_ROOT / "data" / "processed" / "frontend_export"


def _read_export_json(filename: str) -> Dict[str, Any]:
    file_path = EXPORT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Export artifact {filename} not found.")
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/health", response_model=HealthResponse, tags=["System"])
def get_health() -> HealthResponse:
    """Returns basic service health status."""
    return HealthResponse()


@router.get("/api/v1/schema-info", response_model=SchemaInfoResponse, tags=["Metadata"])
def get_schema_info() -> SchemaInfoResponse:
    """
    Reports API version and supported entity types in the AI Evolution Map data contract.
    Dynamically checks if export files currently exist on disk.
    """
    has_timeline = (EXPORT_DIR / "orbit_timeline.json").exists()
    has_graph = (EXPORT_DIR / "concept_graph.json").exists()
    has_sources = (EXPORT_DIR / "research_sources.json").exists()
    has_metrics = (EXPORT_DIR / "analytics_metrics.json").exists()

    entities = [
        EntityTypeInfo(
            name="milestone",
            description="Chronological landmark events with era classification, confidence score, and date precision.",
            supported_formats=["json", "csv"],
            has_exported_data=has_timeline,
        ),
        EntityTypeInfo(
            name="concept",
            description="AI architectural ideas, algorithms, and paradigms forming nodes in the family tree.",
            supported_formats=["json"],
            has_exported_data=has_graph,
        ),
        EntityTypeInfo(
            name="relationship",
            description="Evidence-backed directed relationships connecting concepts (extends, uses, introduced, etc.).",
            supported_formats=["json"],
            has_exported_data=has_graph,
        ),
        EntityTypeInfo(
            name="research_source",
            description="Bibliographic sources providing provenance for all historical and conceptual claims.",
            supported_formats=["json", "csv"],
            has_exported_data=has_sources,
        ),
        EntityTypeInfo(
            name="metric_observation",
            description="Empirical, quantitative trends in publications, compute, benchmarks, and model parameters.",
            supported_formats=["json", "csv", "parquet"],
            has_exported_data=has_metrics,
        ),
    ]

    return SchemaInfoResponse(
        api_version="v1",
        schema_version="0.1.0",
        supported_entities=entities,
        pipeline_role_note=(
            "Primary data ingestion, cleaning, validation, and EDA live in Jupyter Notebooks. "
            "FastAPI serves only pre-validated, exported datasets to the frontend."
        ),
    )


@router.get("/api/v1/timeline", tags=["Data"])
def get_timeline() -> Dict[str, Any]:
    """Returns the validated orbit timeline milestones envelope."""
    return _read_export_json("orbit_timeline.json")


@router.get("/api/v1/concept-graph", tags=["Data"])
def get_concept_graph() -> Dict[str, Any]:
    """Returns the validated concept graph nodes and directed edges envelope."""
    return _read_export_json("concept_graph.json")


@router.get("/api/v1/analytics-metrics", tags=["Data"])
def get_analytics_metrics() -> Dict[str, Any]:
    """Returns the validated quantitative metrics observations envelope."""
    return _read_export_json("analytics_metrics.json")


@router.get("/api/v1/research-sources", tags=["Data"])
def get_research_sources() -> Dict[str, Any]:
    """Returns the validated research sources and citations envelope."""
    return _read_export_json("research_sources.json")
