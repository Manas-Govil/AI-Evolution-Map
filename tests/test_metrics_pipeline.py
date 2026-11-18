"""
tests/test_metrics_pipeline.py
──────────────────────────────
Tests for the multi-year historical metrics pipeline.

Verifies:
1. Exact transformation of Stanford AI Index / Epoch AI datasets across 2013-2023.
2. Complete absence of duplicate metric IDs.
3. No invalid, negative, or fabricated values.
4. Proper unit consistency across observations.
5. Referential integrity (source_ids reference existing sources).
6. Deterministic export to JSON, CSV, and Parquet.
"""

from pathlib import Path
import pytest
import pandas as pd

from src.cleaning.metrics_transformer import transform_stanford_metrics
from src.common.schemas import MetricObservation
from src.export.exporters import export_to_json, export_to_csv, export_to_parquet


@pytest.fixture
def raw_stanford_dir():
    return Path(__file__).resolve().parents[1] / "data" / "raw" / "stanford_ai_index"


@pytest.fixture
def transformed_metrics(raw_stanford_dir):
    observations, coverage = transform_stanford_metrics(raw_stanford_dir)
    return observations, coverage


def test_metrics_coverage_2013_to_2023(transformed_metrics):
    """Verifies that all metrics have 100% complete coverage for all years 2013-2023."""
    observations, coverage = transformed_metrics
    expected_years = [str(y) for y in range(2013, 2024)]
    assert list(coverage.index) == expected_years
    # Verify every metric has exactly 1 observation per year
    for col in coverage.columns:
        assert (coverage[col] == 1).all(), f"Metric {col} has missing or duplicate years!"


def test_metrics_no_duplicate_ids(transformed_metrics):
    """Verifies that every generated metric ID is unique."""
    observations, _ = transformed_metrics
    ids = [o["id"] for o in observations]
    assert len(ids) == len(set(ids)), f"Duplicate metric IDs found: {len(ids)} vs {len(set(ids))}"


def test_metrics_pydantic_validation(transformed_metrics):
    """Verifies that every metric observation passes Pydantic MetricObservation validation."""
    observations, _ = transformed_metrics
    for obs in observations:
        validated = MetricObservation(**obs)
        assert validated.value >= 0.0
        assert validated.period in [str(y) for y in range(2013, 2024)]
        assert len(validated.source_ids) >= 1


def test_metrics_unit_consistency(transformed_metrics):
    """Verifies that each metric name is strictly associated with its designated unit."""
    observations, _ = transformed_metrics
    units_by_metric = {}
    for o in observations:
        mname = o["metric_name"]
        unit = o["unit"]
        if mname not in units_by_metric:
            units_by_metric[mname] = unit
        else:
            assert units_by_metric[mname] == unit, f"Inconsistent unit for {mname}: {unit} vs {units_by_metric[mname]}"


def test_metrics_export_integrity(transformed_metrics, tmp_path):
    """Verifies that multi-year observations export deterministically to JSON, CSV, and Parquet."""
    observations, _ = transformed_metrics
    json_path = tmp_path / "test_metrics.json"
    csv_path = tmp_path / "test_metrics.csv"
    parquet_path = tmp_path / "test_metrics.parquet"

    export_to_json(observations, json_path, "metric_observation")
    export_to_csv(observations, csv_path, "metric_observation")
    export_to_parquet(observations, parquet_path, "metric_observation")

    assert json_path.exists()
    assert csv_path.exists()
    assert parquet_path.exists()

    # Verify CSV and Parquet row counts match observations
    df_csv = pd.read_csv(csv_path)
    df_parquet = pd.read_parquet(parquet_path)

    assert len(df_csv) == len(observations)
    assert len(df_parquet) == len(observations)


def test_metrics_source_references(transformed_metrics):
    """Verifies that all source_ids referenced by metric observations exist in seed knowledge base."""
    import json
    observations, _ = transformed_metrics
    kb_path = Path(__file__).resolve().parents[1] / "data" / "reference" / "seed_knowledge_base.json"
    with open(kb_path, encoding="utf-8") as f:
        kb_data = json.load(f)
    known_source_ids = {s["id"] for s in kb_data["sources"]}

    for obs in observations:
        for sid in obs.get("source_ids", []):
            assert sid in known_source_ids, f"Observation {obs['id']} references unknown source_id: {sid}"


def test_metrics_no_duplicate_composite_keys(transformed_metrics):
    """Verifies that no two observations share the same (metric_name, period, category)."""
    observations, _ = transformed_metrics
    keys = [(o["metric_name"], o["period"], o.get("category")) for o in observations]
    assert len(keys) == len(set(keys)), f"Duplicate composite keys detected: {len(keys)} vs {len(set(keys))}"


def test_metrics_numeric_finite_and_non_negative(transformed_metrics):
    """Verifies that numeric values are finite numbers (not NaN, not Inf) and strictly non-negative."""
    import math
    observations, _ = transformed_metrics
    for obs in observations:
        val = obs["value"]
        assert isinstance(val, (int, float)), f"Value in {obs['id']} is not numeric: {type(val)}"
        assert math.isfinite(val), f"Value in {obs['id']} is non-finite (NaN or Inf): {val}"
        assert val >= 0.0, f"Value in {obs['id']} is negative: {val}"


def test_metrics_stable_ids_across_reruns(raw_stanford_dir):
    """Verifies that observation IDs generated by the transformation are strictly deterministic across runs."""
    obs_run1, _ = transform_stanford_metrics(raw_stanford_dir)
    obs_run2, _ = transform_stanford_metrics(raw_stanford_dir)
    ids1 = [o["id"] for o in obs_run1]
    ids2 = [o["id"] for o in obs_run2]
    assert ids1 == ids2, "Observation IDs changed between successive transformation runs!"


def test_metrics_category_consistency_across_years(transformed_metrics):
    """Verifies that each metric_name maintains an identical category across all periods."""
    observations, _ = transformed_metrics
    categories_by_metric = {}
    for o in observations:
        mname = o["metric_name"]
        cat = o.get("category")
        if mname not in categories_by_metric:
            categories_by_metric[mname] = cat
        else:
            assert categories_by_metric[mname] == cat, (
                f"Inconsistent category for {mname}: {cat} vs {categories_by_metric[mname]}"
            )


def test_metrics_genuine_zeros_vs_missing_years(transformed_metrics):
    """Verifies that zero values represent genuine observations, not omitted or missing periods."""
    observations, coverage = transformed_metrics
    # In coverage table, every cell must be exactly 1 (meaning the observation exists for that year)
    assert (coverage == 1).all().all(), "Coverage table has missing or duplicate cells!"
    # Verify that all 11 years (2013-2023) are explicitly recorded for all series
    for mname in coverage.columns:
        m_obs = [o for o in observations if o["metric_name"] == mname]
        assert len(m_obs) == 11, f"Expected 11 observations for {mname}, got {len(m_obs)}"


def test_observation_count_reconciliation_44_plus_3_equals_47():
    """
    Reconciles the exact observation count:
    - 44 multi-year annual observations (2013-2023) from Stanford AI Index & Epoch AI
    - 3 point-in-time benchmark metrics from seed_knowledge_base.json
    - Total: 47 observations exported in analytics_metrics.json
    """
    import json
    export_file = Path(__file__).resolve().parents[1] / "data" / "processed" / "frontend_export" / "analytics_metrics.json"
    assert export_file.exists()
    with open(export_file, encoding="utf-8") as f:
        data = json.load(f)["data"]

    assert len(data) == 47, f"Expected exactly 47 observations in export, found {len(data)}"

    # Breakdown by metric_name
    counts_by_metric = pd.Series([r["metric_name"] for r in data]).value_counts().to_dict()
    assert counts_by_metric["global_private_ai_investment_annual_constant_2021_usd_billions"] == 11
    assert counts_by_metric["notable_ai_systems_annual_count_total"] == 11
    assert counts_by_metric["notable_ai_systems_annual_count_industry"] == 11
    assert counts_by_metric["notable_ai_systems_annual_count_academia"] == 11
    assert counts_by_metric["notable_machine_learning_systems_annual_count"] == 1
    assert counts_by_metric["industry_produced_notable_ai_systems_percentage"] == 1
    assert counts_by_metric["global_private_ai_investment_usd_billions"] == 1


def test_export_formats_equivalence_json_csv_parquet(transformed_metrics, tmp_path):
    """Verifies that JSON, CSV, and Parquet exports represent equivalent underlying data after normalization."""
    import json
    observations, _ = transformed_metrics
    json_path = tmp_path / "equiv.json"
    csv_path = tmp_path / "equiv.csv"
    parquet_path = tmp_path / "equiv.parquet"

    export_to_json(observations, json_path, "metric_observation")
    export_to_csv(observations, csv_path, "metric_observation")
    export_to_parquet(observations, parquet_path, "metric_observation")

    # Load from all three formats
    with open(json_path, encoding="utf-8") as f:
        json_data = json.load(f)["data"]
    df_json = pd.DataFrame(json_data)
    df_csv = pd.read_csv(csv_path)
    df_parquet = pd.read_parquet(parquet_path)

    # Convert source_ids JSON string in CSV back to list for parity
    df_csv["source_ids"] = df_csv["source_ids"].apply(json.loads)
    df_parquet["source_ids"] = df_parquet["source_ids"].apply(json.loads)

    # Ensure period is string in all three
    df_json["period"] = df_json["period"].astype(str)
    df_csv["period"] = df_csv["period"].astype(str)
    df_parquet["period"] = df_parquet["period"].astype(str)

    # Check row counts
    assert len(df_json) == len(df_csv) == len(df_parquet) == len(observations)

    # Check identical IDs and values
    assert list(df_json["id"]) == list(df_csv["id"]) == list(df_parquet["id"])
    assert list(df_json["value"]) == list(df_csv["value"]) == list(df_parquet["value"])
    assert list(df_json["metric_name"]) == list(df_csv["metric_name"]) == list(df_parquet["metric_name"])


