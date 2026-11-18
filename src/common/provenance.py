"""
src/common/provenance.py
─────────────────────────
Provenance tracking utilities.

Every record ingested from an external source should carry a ProvenanceRecord
that explains where it came from, when, and how. This is separate from the
data schemas themselves so it can be attached as metadata without polluting
the main entities.

Why provenance matters:
- Web content changes. An arXiv abstract today may differ from the one you
  read six months ago. Timestamps let you reason about data freshness.
- Different runs of the pipeline may produce different results if sources are
  not pinned. Provenance makes comparisons between runs possible.
- It makes the "accessed_at" field in ResearchSource meaningful.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional


def utcnow_iso() -> str:
    """Return the current UTC time as an ISO 8601 string with 'Z' suffix."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


@dataclass
class ProvenanceRecord:
    """
    Metadata about a single data retrieval event.

    Attach this to every raw file saved under data/raw/ so that future runs
    can determine whether a cached file is still fresh.

    Attributes
    ----------
    source_name : str
        Short label for the source, e.g. "openalex", "arxiv", "huggingface".
    source_url : str
        The URL that was called or downloaded.
    retrieved_at : str
        UTC ISO timestamp of retrieval (use utcnow_iso()).
    query_params : dict
        Any query parameters sent with the request. Redact secrets.
    collection_method : str
        "api", "manual_download", "web_scrape", etc.
    record_count : int | None
        Number of records returned, if known.
    notes : str | None
        Free-text notes (pagination state, warnings encountered, etc.).
    """

    source_name: str
    source_url: str
    retrieved_at: str = field(default_factory=utcnow_iso)
    query_params: dict[str, Any] = field(default_factory=dict)
    collection_method: str = "api"
    record_count: Optional[int] = None
    notes: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        """Serialise to a plain dict for embedding in JSON sidecar files."""
        return {
            "source_name": self.source_name,
            "source_url": self.source_url,
            "retrieved_at": self.retrieved_at,
            "query_params": self.query_params,
            "collection_method": self.collection_method,
            "record_count": self.record_count,
            "notes": self.notes,
        }
