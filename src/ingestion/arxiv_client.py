"""
src/ingestion/arxiv_client.py
──────────────────────────────
arXiv API ingestion helpers.

arXiv provides a free, unauthenticated REST API for searching preprints.
The base URL is: http://export.arxiv.org/api/query
Response format is Atom XML, which we parse into dicts.

Key parameters:
  search_query : Lucene-style query string. We use category filters like
                 cat:cs.AI or cat:cs.LG plus keyword searches.
  start        : Offset for pagination (0-based).
  max_results  : Records per page (≤2000; we keep it small).

Rate limit:
  arXiv recommends ≥3 seconds between requests.
  We set min_delay_seconds=3.5 to be polite.

Documentation: https://info.arxiv.org/help/api/user-manual.html

Note on data quality:
  arXiv is a preprint server — papers are NOT peer-reviewed by arXiv itself.
  Many eventually appear in journals, but some remain preprints only.
  We record source_type = "preprint" for all arXiv records unless cross-
  referenced with a known journal publication.
"""

from __future__ import annotations

import logging
import time
import xml.etree.ElementTree as ET
from typing import Any

import httpx

from src.common.ids import make_source_id_arxiv
from src.common.provenance import ProvenanceRecord, utcnow_iso

logger = logging.getLogger(__name__)

ARXIV_API_URL = "https://export.arxiv.org/api/query"

# XML namespaces used in arXiv Atom responses
_NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "arxiv": "http://arxiv.org/schemas/atom",
    "opensearch": "http://a9.com/-/spec/opensearch/1.1/",
}


def _parse_entry(entry: ET.Element) -> dict[str, Any]:
    """
    Parse a single <entry> element from arXiv Atom XML into a dict.

    We extract the minimum fields needed for our ResearchSource schema.
    Unused fields (e.g. category links) are dropped here but kept in the
    raw XML file saved under data/raw/.
    """
    def text(tag: str, ns: str = "atom") -> str:
        el = entry.find(f"{ns}:{tag}", _NS)
        return el.text.strip() if el is not None and el.text else ""

    # arXiv ID from the <id> element: looks like
    # "http://arxiv.org/abs/1706.03762v5"
    full_id = text("id")
    arxiv_id = full_id.split("/abs/")[-1].split("v")[0] if "/abs/" in full_id else full_id

    # Published and updated dates
    published = text("published")[:10] if text("published") else ""  # YYYY-MM-DD
    updated = text("updated")[:10] if text("updated") else ""

    # Authors — each is an <author><name>...</name></author>
    authors = [
        a.find("atom:name", _NS).text.strip()
        for a in entry.findall("atom:author", _NS)
        if a.find("atom:name", _NS) is not None
        and a.find("atom:name", _NS).text
    ]

    # Categories — primary category is in <arxiv:primary_category term="cs.AI"/>
    primary_cat_el = entry.find("arxiv:primary_category", _NS)
    primary_category = (
        primary_cat_el.get("term", "") if primary_cat_el is not None else ""
    )
    all_cats = [
        c.get("term", "")
        for c in entry.findall("atom:category", _NS)
    ]

    # Abstract
    summary = text("summary").replace("\n", " ").strip()

    # DOI — arXiv sometimes includes a doi element
    doi_el = entry.find("arxiv:doi", _NS)
    doi = doi_el.text.strip() if doi_el is not None and doi_el.text else None

    # Journal ref (for papers also published in a journal)
    journal_ref_el = entry.find("arxiv:journal_ref", _NS)
    journal_ref = (
        journal_ref_el.text.strip()
        if journal_ref_el is not None and journal_ref_el.text
        else None
    )

    return {
        "arxiv_id": arxiv_id,
        "our_source_id": make_source_id_arxiv(arxiv_id),
        "title": text("title").replace("\n", " ").strip(),
        "summary": summary,
        "authors": authors,
        "published": published,           # YYYY-MM-DD
        "updated": updated,               # YYYY-MM-DD
        "primary_category": primary_category,
        "all_categories": all_cats,
        "doi": doi,
        "journal_ref": journal_ref,
        "abs_url": f"https://arxiv.org/abs/{arxiv_id}",
        "pdf_url": f"https://arxiv.org/pdf/{arxiv_id}",
    }


def fetch_arxiv_papers(
    search_query: str,
    max_results: int = 50,
    start: int = 0,
    sort_by: str = "submittedDate",
    sort_order: str = "descending",
) -> tuple[list[dict[str, Any]], ProvenanceRecord]:
    """
    Search arXiv and return parsed paper records plus provenance.

    Parameters
    ----------
    search_query : str
        Lucene-style arXiv query. Examples:
          "cat:cs.AI AND ti:deep learning"
          "cat:cs.LG AND submittedDate:[20230101 TO 20231231]"
    max_results : int
        Number of results to return (≤2000). Start small.
    start : int
        Offset for pagination.
    sort_by : str
        "relevance", "lastUpdatedDate", or "submittedDate".
    sort_order : str
        "ascending" or "descending".

    Returns
    -------
    (records, provenance)
        records  : list of dicts from _parse_entry()
        provenance : ProvenanceRecord for this retrieval
    """
    params = {
        "search_query": search_query,
        "start": start,
        "max_results": max_results,
        "sortBy": sort_by,
        "sortOrder": sort_order,
    }

    retrieved_at = utcnow_iso()
    logger.info(
        "Fetching arXiv: query=%r, max_results=%d, start=%d",
        search_query, max_results, start,
    )

    # arXiv recommends ≥3 seconds between requests
    time.sleep(3.5)

    with httpx.Client(
        timeout=30.0,
        follow_redirects=True,
        headers={"User-Agent": "AI-Evolution-Map/0.1 (portfolio project)"},
    ) as client:
        response = client.get(ARXIV_API_URL, params=params)

    response.raise_for_status()

    # Parse the Atom XML
    root = ET.fromstring(response.content)

    entries = root.findall("atom:entry", _NS)
    records = [_parse_entry(e) for e in entries]

    # Total results available (for knowing if pagination is needed)
    total_el = root.find("opensearch:totalResults", _NS)
    total_available = int(total_el.text) if total_el is not None and total_el.text else 0

    provenance = ProvenanceRecord(
        source_name="arxiv",
        source_url=ARXIV_API_URL,
        retrieved_at=retrieved_at,
        query_params=params,
        collection_method="api",
        record_count=len(records),
        notes=f"total_available={total_available}",
    )

    logger.info(
        "arXiv: retrieved %d/%d records for query=%r",
        len(records), total_available, search_query,
    )
    return records, provenance
