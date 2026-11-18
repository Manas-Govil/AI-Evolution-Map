"""
src/ingestion/stanford_ai_index.py
──────────────────────────────────
Ingestion module for Stanford AI Index multi-year datasets.

Downloads and caches official annual indicators:
1. External private investment in AI (NetBase Quid / AI Index Economy Chapter).
2. Notable AI systems by researcher affiliation (Epoch AI / AI Index R&D Chapter).

Preserves original raw downloads in data/raw/stanford_ai_index/ with provenance sidecars.
"""

from pathlib import Path
import json
import logging
import httpx

from src.common.provenance import ProvenanceRecord, utcnow_iso

logger = logging.getLogger(__name__)

INVESTMENT_CSV_URL = (
    "https://ourworldindata.org/grapher/private-investment-in-artificial-intelligence.csv"
    "?v=1&csvType=full&useColumnShortNames=false"
)
INVESTMENT_META_URL = (
    "https://ourworldindata.org/grapher/private-investment-in-artificial-intelligence.metadata.json"
    "?v=1&csvType=full&useColumnShortNames=false"
)

AFFILIATION_CSV_URL = (
    "https://ourworldindata.org/grapher/affiliation-researchers-building-artificial-intelligence-systems-all.csv"
    "?v=1&csvType=full&useColumnShortNames=false"
)
AFFILIATION_META_URL = (
    "https://ourworldindata.org/grapher/affiliation-researchers-building-artificial-intelligence-systems-all.metadata.json"
    "?v=1&csvType=full&useColumnShortNames=false"
)


def fetch_stanford_ai_index_datasets(dest_dir: Path) -> dict[str, Path]:
    """
    Downloads raw multi-year CSVs and JSON metadata into dest_dir.
    Idempotent: skips network requests if files already exist.
    """
    dest_dir = Path(dest_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)

    downloads = {
        "investment_csv": (dest_dir / "private-investment-in-artificial-intelligence.csv", INVESTMENT_CSV_URL),
        "investment_meta": (dest_dir / "private-investment-in-artificial-intelligence.metadata.json", INVESTMENT_META_URL),
        "affiliation_csv": (dest_dir / "affiliation-researchers-building-artificial-intelligence-systems-all.csv", AFFILIATION_CSV_URL),
        "affiliation_meta": (dest_dir / "affiliation-researchers-building-artificial-intelligence-systems-all.metadata.json", AFFILIATION_META_URL),
    }

    result_paths = {}

    with httpx.Client(timeout=30.0, follow_redirects=True) as client:
        for key, (path, url) in downloads.items():
            if not path.exists():
                logger.info("Downloading %s from %s", path.name, url)
                resp = client.get(url)
                resp.raise_for_status()
                with open(path, "wb") as f:
                    f.write(resp.content)
                logger.info("Saved %s (%d bytes)", path.name, len(resp.content))
            else:
                logger.info("Cache hit: %s exists", path.name)
            result_paths[key] = path

    # Create provenance sidecar
    prov = ProvenanceRecord(
        source_name="stanford_ai_index",
        source_url="https://aiindex.stanford.edu/report/",
        retrieved_at=utcnow_iso(),
        query_params={
            "investment_url": INVESTMENT_CSV_URL,
            "affiliation_url": AFFILIATION_CSV_URL,
            "source_chapters": ["Chapter 1: Research & Development (Epoch AI)", "Chapter 4: Economy (NetBase Quid)"],
            "license": "CC-BY via Our World in Data / Stanford HAI academic fair use with mandatory citation"
        },
        collection_method="api_file_download",
        notes="Downloaded official raw CSV indicators for 2013-2023 historical multi-year tracking.",
    )
    with open(dest_dir / "provenance.json", "w", encoding="utf-8") as f:
        json.dump(prov.to_dict(), f, indent=2)

    return result_paths
