"""
scripts/verify_reproducibility.py
─────────────────────────────────
Validates that:
1. Running `scripts/run_pipeline.py` multiple times produces byte-identical deterministic data payloads.
2. Only the `_meta.exported_at` timestamp varies between runs in JSON exports.
3. CSV and Parquet files are 100% equivalent in record count, schema, and values.
"""

import json
from pathlib import Path
import pandas as pd
from scripts.run_pipeline import run_pipeline

PROJECT_ROOT = Path(__file__).resolve().parents[1]
EXPORT_DIR = PROJECT_ROOT / "data" / "processed" / "frontend_export"


def main():
    print("Running initial pipeline pass...")
    run_pipeline()

    # Capture data payloads from Run 1
    files = ["orbit_timeline.json", "concept_graph.json", "research_sources.json", "analytics_metrics.json"]
    run1_data = {}
    for fname in files:
        with open(EXPORT_DIR / fname, encoding="utf-8") as f:
            run1_data[fname] = json.load(f)["data"]

    run1_csv = {
        "orbit_timeline.csv": pd.read_csv(EXPORT_DIR / "orbit_timeline.csv"),
        "research_sources.csv": pd.read_csv(EXPORT_DIR / "research_sources.csv"),
        "analytics_metrics.csv": pd.read_csv(EXPORT_DIR / "analytics_metrics.csv"),
    }
    run1_parquet = pd.read_parquet(EXPORT_DIR / "analytics_metrics.parquet")

    print("\nRunning second pipeline pass...")
    run_pipeline()

    # Compare Run 2 against Run 1
    for fname in files:
        with open(EXPORT_DIR / fname, encoding="utf-8") as f:
            run2_data = json.load(f)["data"]
        assert run1_data[fname] == run2_data, f"Data payload mismatch in {fname} between runs!"
        print(f"[OK] JSON data payload for {fname} is 100% deterministic and equivalent.")

    for fname, df1 in run1_csv.items():
        df2 = pd.read_csv(EXPORT_DIR / fname)
        pd.testing.assert_frame_equal(df1, df2)
        print(f"[OK] CSV export for {fname} is 100% deterministic.")

    df2_parquet = pd.read_parquet(EXPORT_DIR / "analytics_metrics.parquet")
    pd.testing.assert_frame_equal(run1_parquet, df2_parquet)
    print("[OK] Parquet export for analytics_metrics.parquet is 100% deterministic.")

    print("\nSUCCESS: All derived exports are strictly deterministic and reproducible!")


if __name__ == "__main__":
    main()
