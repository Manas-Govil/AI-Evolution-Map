"""
src/ingestion/openalex_client.py
──────────────────────────────────
OpenAlex-specific ingestion helpers.

OpenAlex is a free, open scholarly database that catalogues papers, authors,
institutions, and more. For this project, we use it to gather AI/ML research
publication metadata — paper titles, abstracts, authors, publication years,
citation counts, and concept tags.

Official docs: https://docs.openalex.org/
Polite pool:   Use mailto= parameter for higher rate limits (100k req/day).

Key endpoint: GET https://api.openalex.org/works
  - Supports cursor pagination.
  - Filter by concept, publication year, open access status, etc.
  - Returns JSON with a "results" array and "meta" object.

Concept IDs for AI/ML (OpenAlex uses their own concept taxonomy):
  C154945302 = Artificial Intelligence
  C119857082 = Machine Learning
  C2522767166 = Deep Learning

We do NOT download entire OpenAlex — we query by concept + year range and
collect a representative sample.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from src.ingestion.api_client import RateLimitedClient, paginate_cursor
from src.common.provenance import ProvenanceRecord, utcnow_iso
from src.common.ids import make_source_id_openalex

logger = logging.getLogger(__name__)

OPENALEX_BASE_URL = "https://api.openalex.org"
OPENALEX_WORKS_URL = f"{OPENALEX_BASE_URL}/works"

# Polite contact: include your email so OpenAlex gives you better rate limits.
# We read it from an environment variable rather than hardcoding it.
_MAILTO_ENV_VAR = "OPENALEX_CONTACT_EMAIL"

# OpenAlex concept IDs for AI/ML subfields
AI_CONCEPT_ID = "C154945302"         # Artificial Intelligence
ML_CONCEPT_ID = "C119857082"         # Machine Learning
DL_CONCEPT_ID = "C2522767166"        # Deep Learning


def _get_mailto() -> Optional[str]:
    """Read the contact email from the environment, if set."""
    import os
    return os.getenv(_MAILTO_ENV_VAR)


def fetch_ai_works(
    concept_id: str = AI_CONCEPT_ID,
    year_from: int = 2010,
    year_to: int = 2023,
    per_page: int = 25,
    max_pages: int = 4,
    mailto: Optional[str] = None,
) -> tuple[list[dict[str, Any]], ProvenanceRecord]:
    """
    Fetch AI/ML research works from OpenAlex for a given concept and year range.

    This returns raw API records (dicts) unchanged. Cleaning and mapping to
    our schema happens in a separate notebook/module.

    Parameters
    ----------
    concept_id : str
        OpenAlex concept ID to filter by. Default is Artificial Intelligence.
    year_from, year_to : int
        Inclusive publication year range.
    per_page : int
        Records per API page (max 200 for OpenAlex).
    max_pages : int
        Maximum pages to fetch. Start small (4 pages × 25 = 100 records) and
        expand only after validating the pipeline end-to-end.
    mailto : str | None
        Contact email for OpenAlex polite pool. Reads from env var if None.

    Returns
    -------
    tuple[list[dict], ProvenanceRecord]
        Raw works records and a provenance record for the retrieval session.
    """
    contact = mailto or _get_mailto()

    # Build query params
    # OpenAlex filter syntax: concepts.id:C154945302,publication_year:2010-2023
    filter_str = f"concepts.id:{concept_id},publication_year:{year_from}-{year_to}"

    params: dict[str, Any] = {
        "filter": filter_str,
        "per-page": per_page,
        "select": (
            "id,doi,title,publication_year,publication_date,"
            "cited_by_count,concepts,authorships,primary_location,"
            "open_access,type,abstract_inverted_index"
        ),
        "sort": "publication_year:desc",
    }
    if contact:
        params["mailto"] = contact
        logger.info("Using OpenAlex polite pool with mailto=%s", contact)
    else:
        logger.warning(
            "No OPENALEX_CONTACT_EMAIL set. Add it to .env for higher rate limits."
        )

    retrieved_at = utcnow_iso()

    with RateLimitedClient(min_delay_seconds=1.2) as client:
        records = paginate_cursor(
            client=client,
            url=OPENALEX_WORKS_URL,
            params=params,
            cursor_key="cursor",
            results_key="results",
            next_cursor_path=("meta", "next_cursor"),
            max_pages=max_pages,
        )

    provenance = ProvenanceRecord(
        source_name="openalex",
        source_url=OPENALEX_WORKS_URL,
        retrieved_at=retrieved_at,
        query_params={k: v for k, v in params.items() if k != "mailto"},
        collection_method="api",
        record_count=len(records),
        notes=f"concept_id={concept_id}, year_from={year_from}, year_to={year_to}",
    )

    logger.info("OpenAlex ingestion complete: %d records.", len(records))
    return records, provenance


def extract_source_fields(raw_work: dict[str, Any]) -> dict[str, Any]:
    """
    Extract the fields we care about from a raw OpenAlex work dict.

    This is a read-only transformation — we do NOT modify the raw record.
    The output is an intermediate representation that the cleaning notebook
    will map to our ResearchSource schema.

    Fields extracted:
    - id          : OpenAlex work ID (used to generate our source ID)
    - title       : paper title
    - year        : publication year (integer or None)
    - doi         : DOI string (or None)
    - cited_by    : citation count
    - concepts    : list of {id, display_name, score} dicts
    - authors     : list of author display names
    - venue       : journal/conference name (from primary_location)
    - oa_url      : open-access PDF URL if available
    - work_type   : "article", "preprint", etc.
    """
    oa_id = raw_work.get("id", "")
    title = raw_work.get("title", "") or ""
    year = raw_work.get("publication_year")
    doi = raw_work.get("doi") or None

    # Citations
    cited_by = raw_work.get("cited_by_count", 0)

    # Concepts (OpenAlex's own taxonomy)
    concepts_raw = raw_work.get("concepts", []) or []
    concepts = [
        {
            "id": c.get("id", ""),
            "name": c.get("display_name", ""),
            "score": c.get("score", 0.0),
        }
        for c in concepts_raw
    ]

    # Authors
    authorships = raw_work.get("authorships", []) or []
    authors = [
        a.get("author", {}).get("display_name", "Unknown")
        for a in authorships
        if a.get("author")
    ]

    # Venue
    primary_loc = raw_work.get("primary_location") or {}
    source_info = primary_loc.get("source") or {}
    venue = source_info.get("display_name") or None

    # Open-access URL
    oa_info = raw_work.get("open_access") or {}
    oa_url = oa_info.get("oa_url") or None

    work_type = raw_work.get("type") or None

    return {
        "openalex_id": oa_id,
        "our_source_id": make_source_id_openalex(oa_id) if oa_id else None,
        "title": title.strip(),
        "year": year,
        "doi": doi,
        "cited_by_count": cited_by,
        "concepts": concepts,
        "authors": authors,
        "venue": venue,
        "oa_url": oa_url,
        "work_type": work_type,
    }
