"""
tests/test_exporters.py
───────────────────────
Tests for deterministic export utilities (JSON, CSV, Parquet).
"""

import json
from pathlib import Path
import pandas as pd
from src.export.exporters import export_to_json, export_to_csv, export_to_parquet


def test_export_to_json(tmp_path: Path):
    records = [
        {"id": "rec-1", "title": "First Record", "source_ids": ["src-1"]},
        {"id": "rec-2", "title": "Second Record", "source_ids": ["src-2"]},
    ]
    out_file = tmp_path / "test_export.json"
    result_path = export_to_json(records, out_file, entity_type="test_entity")

    assert result_path.exists()
    with open(result_path, encoding="utf-8") as f:
        data = json.load(f)

    assert "_meta" in data
    assert data["_meta"]["entity_type"] == "test_entity"
    assert data["_meta"]["record_count"] == 2
    assert len(data["data"]) == 2
    assert data["data"][0]["id"] == "rec-1"


def test_export_to_csv(tmp_path: Path):
    records = [
        {"id": "rec-1", "title": "First Record", "tags": ["nlp", "transformers"]},
        {"id": "rec-2", "title": "Second Record", "tags": ["cv"]},
    ]
    out_file = tmp_path / "test_export.csv"
    result_path = export_to_csv(records, out_file, entity_type="test_entity")

    assert result_path.exists()
    df = pd.read_csv(result_path)
    assert len(df) == 2
    assert "id" in df.columns
    assert "tags" in df.columns
    # Check that nested list was serialized as valid JSON string
    tags_0 = json.loads(df.loc[0, "tags"])
    assert tags_0 == ["nlp", "transformers"]


def test_export_to_parquet(tmp_path: Path):
    records = [
        {"id": "metric-1", "value": 42.5, "unit": "count"},
        {"id": "metric-2", "value": 99.0, "unit": "percent"},
    ]
    out_file = tmp_path / "test_export.parquet"
    result_path = export_to_parquet(records, out_file, entity_type="test_metrics")

    assert result_path.exists()
    df = pd.read_parquet(result_path)
    assert len(df) == 2
    assert df.loc[0, "value"] == 42.5
