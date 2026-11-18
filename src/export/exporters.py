"""
src/export/exporters.py
────────────────────────
Utilities for exporting validated datasets to frontend-ready formats.

Export principles:
1. Only export VALIDATED records — never export raw or cleaning-stage data
   directly to the processed/ directory that the frontend will consume.
2. Always include export metadata (timestamp, schema version, record count).
3. Keep relationships separate from entity records in the JSON output.
4. IDs must be stable — the same record must have the same ID across exports.
5. Date precision must travel with dates so the frontend can display
   "circa 2017" instead of "2017-01-01" for year-precision dates.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)

SCHEMA_VERSION = "0.1.0"


def _export_metadata(record_count: int, entity_type: str, notes: str = "") -> dict[str, Any]:
    """Build a standard metadata block for every export file."""
    return {
        "schema_version": SCHEMA_VERSION,
        "entity_type": entity_type,
        "exported_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "record_count": record_count,
        "notes": notes,
    }


def export_to_json(
    records: list[dict[str, Any]],
    output_path: Path,
    entity_type: str,
    notes: str = "",
    indent: int = 2,
) -> Path:
    """
    Write records to a JSON file with metadata header.

    Output structure:
    {
        "_meta": { schema_version, entity_type, exported_at, record_count },
        "data": [ ... records ... ]
    }

    Parameters
    ----------
    records : list[dict]
        Validated, cleaned records ready for export.
    output_path : Path
        Destination file path (created or overwritten).
    entity_type : str
        Label for the _meta block, e.g. "milestones", "concepts".
    notes : str
        Optional notes about this export.
    indent : int
        JSON indentation for readability.

    Returns
    -------
    Path to the written file.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    payload = {
        "_meta": _export_metadata(len(records), entity_type, notes),
        "data": records,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=indent, ensure_ascii=False, default=str)

    logger.info("Exported %d %s records → %s", len(records), entity_type, output_path)
    return output_path


def export_to_csv(
    records: list[dict[str, Any]],
    output_path: Path,
    entity_type: str,
    flatten_lists: bool = True,
) -> Path:
    """
    Write records to a CSV file.

    List fields (like source_ids) are serialized as JSON strings in CSV cells
    because CSV does not support nested structures. The frontend should parse
    them back if needed, or better: use the JSON export for complex data.

    Parameters
    ----------
    flatten_lists : bool
        If True, list fields are JSON-encoded as strings in CSV cells.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if not records:
        logger.warning("No records to export for %s — writing empty CSV.", entity_type)
        pd.DataFrame().to_csv(output_path, index=False)
        return output_path

    if flatten_lists:
        flattened = []
        for rec in records:
            row = {}
            for k, v in rec.items():
                if isinstance(v, (list, dict)):
                    row[k] = json.dumps(v, ensure_ascii=False)
                else:
                    row[k] = v
            flattened.append(row)
        df = pd.DataFrame(flattened)
    else:
        df = pd.DataFrame(records)

    df.to_csv(output_path, index=False, encoding="utf-8-sig")  # utf-8-sig for Excel compat
    logger.info("Exported %d %s rows → %s", len(df), entity_type, output_path)
    return output_path


def export_to_parquet(
    records: list[dict[str, Any]],
    output_path: Path,
    entity_type: str,
) -> Path:
    """
    Write records to a Parquet file (requires pyarrow).

    Parquet is preferred over CSV for large metric datasets because it
    preserves column types and compresses well. It is NOT suitable as a
    direct browser format — use JSON or CSV for the React frontend.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    df = pd.DataFrame(records)

    # Parquet can't store Python lists natively in all engines — convert to JSON strings
    for col in df.columns:
        if df[col].dtype == object:
            if df[col].apply(lambda x: isinstance(x, (list, dict))).any():
                df[col] = df[col].apply(
                    lambda x: json.dumps(x, ensure_ascii=False) if isinstance(x, (list, dict)) else x
                )

    df.to_parquet(output_path, index=False, engine="pyarrow")
    logger.info("Exported %d %s rows → %s (Parquet)", len(df), entity_type, output_path)
    return output_path
