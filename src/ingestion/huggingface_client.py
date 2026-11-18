"""
src/ingestion/huggingface_client.py
─────────────────────────────────────
Hugging Face Hub API ingestion helpers.

The Hub API is public for reading model and dataset metadata — no authentication
required for basic queries. An HF token (read-only) is needed for some
gated content, but all the models we fetch here are public.

Relevant endpoints:
  GET https://huggingface.co/api/models
    - Query params: search, filter (tag), sort, direction, limit, full
    - Returns JSON array of model metadata objects.

  GET https://huggingface.co/api/models/{model_id}
    - Detailed metadata for a single model.

Fields of interest:
  modelId, pipeline_tag, tags, downloads, likes, lastModified,
  createdAt, library_name, cardData (model card metadata)

Rate limits:
  No published hard limit for unauthenticated reads on public models.
  We stay polite with a ≥1.5 s delay and reasonable page sizes.

Documentation: https://huggingface.co/docs/hub/api
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from src.ingestion.api_client import RateLimitedClient, APIError
from src.common.ids import make_source_id_hf
from src.common.provenance import ProvenanceRecord, utcnow_iso

logger = logging.getLogger(__name__)

HF_API_BASE = "https://huggingface.co/api"
HF_MODELS_URL = f"{HF_API_BASE}/models"


def fetch_hf_models(
    search: Optional[str] = None,
    filter_tags: Optional[list[str]] = None,
    sort: str = "downloads",
    direction: int = -1,
    limit: int = 50,
    full: bool = False,
) -> tuple[list[dict[str, Any]], ProvenanceRecord]:
    """
    Fetch model metadata from Hugging Face Hub.

    Parameters
    ----------
    search : str | None
        Text search across model IDs and tags.
    filter_tags : list[str] | None
        Filter by tags, e.g. ["text-generation", "llm"]. Each tag is passed
        as a separate `filter` param (HF supports repeating params).
    sort : str
        Sort field: "downloads", "likes", "lastModified", "createdAt".
    direction : int
        -1 for descending, 1 for ascending.
    limit : int
        Maximum records to return (up to ~500 for HF API).
    full : bool
        If True, include full model card data (larger responses).

    Returns
    -------
    (records, provenance)
    """
    params: dict[str, Any] = {
        "sort": sort,
        "direction": direction,
        "limit": limit,
        "full": str(full).lower(),
    }
    if search:
        params["search"] = search

    # HF API accepts repeated `filter` params. httpx handles lists correctly.
    if filter_tags:
        params["filter"] = filter_tags

    retrieved_at = utcnow_iso()
    logger.info("Fetching HF models: params=%s", {k: v for k, v in params.items()})

    with RateLimitedClient(min_delay_seconds=1.5) as client:
        raw = client.get(HF_MODELS_URL, params=params)

    records = raw if isinstance(raw, list) else []

    provenance = ProvenanceRecord(
        source_name="huggingface",
        source_url=HF_MODELS_URL,
        retrieved_at=retrieved_at,
        query_params=params,
        collection_method="api",
        record_count=len(records),
        notes=f"sort={sort}, filter_tags={filter_tags}",
    )

    logger.info("HF Hub: retrieved %d model records.", len(records))
    return records, provenance


def extract_model_fields(raw_model: dict[str, Any]) -> dict[str, Any]:
    """
    Extract the fields we care about from a raw HF API model dict.

    The raw model object from HF contains many fields we don't need. This
    function selects and renames only the relevant ones without modifying
    the raw record stored in data/raw/.

    Returns an intermediate dict that the cleaning notebook will map
    to our ResearchSource schema.
    """
    model_id = raw_model.get("modelId") or raw_model.get("id") or ""
    tags = raw_model.get("tags") or []
    pipeline_tag = raw_model.get("pipeline_tag") or None
    downloads = raw_model.get("downloads") or 0
    likes = raw_model.get("likes") or 0
    last_modified = raw_model.get("lastModified") or None
    created_at = raw_model.get("createdAt") or None
    library_name = raw_model.get("library_name") or None
    private = raw_model.get("private", False)

    # The model card (README metadata, if full=True was requested)
    card_data = raw_model.get("cardData") or {}
    license_ = card_data.get("license") or None
    language = card_data.get("language") or []
    datasets_used = card_data.get("datasets") or []

    return {
        "model_id": model_id,
        "our_source_id": make_source_id_hf(model_id) if model_id else None,
        "hub_url": f"https://huggingface.co/{model_id}" if model_id else None,
        "pipeline_tag": pipeline_tag,
        "tags": tags,
        "downloads": downloads,
        "likes": likes,
        "last_modified": last_modified,  # ISO string from HF
        "created_at": created_at,
        "library_name": library_name,
        "private": private,
        "license": license_,
        "languages": language if isinstance(language, list) else [language],
        "datasets_used": datasets_used,
    }
