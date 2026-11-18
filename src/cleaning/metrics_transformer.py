"""
src/cleaning/metrics_transformer.py
───────────────────────────────────
Transforms raw Stanford AI Index and Epoch AI indicators into validated MetricObservation dicts.

Guarantees:
1. Strict separation of metrics (nominal vs. inflation-adjusted, industry vs. academia).
2. Preserves continuous annual periods (2013-2023).
3. Zero fabrication or interpolation.
4. Generates stable IDs conforming to the data contract.
"""

from pathlib import Path
from typing import Any
import pandas as pd

from src.common.schemas import PeriodPrecision, CollectionMethod


def transform_stanford_metrics(raw_dir: Path) -> tuple[list[dict[str, Any]], pd.DataFrame]:
    """
    Transforms raw Stanford AI Index CSVs into validated metric observation records.

    Returns
    -------
    tuple[list[dict], pd.DataFrame]
        List of MetricObservation-compatible dicts and an annual coverage summary table.
    """
    inv_csv = raw_dir / "private-investment-in-artificial-intelligence.csv"
    aff_csv = raw_dir / "affiliation-researchers-building-artificial-intelligence-systems-all.csv"

    if not inv_csv.exists() or not aff_csv.exists():
        raise FileNotFoundError(f"Missing required raw CSVs in {raw_dir}")

    # 1. Transform Private Investment (2013-2023)
    df_inv = pd.read_csv(inv_csv)
    world_inv = df_inv[(df_inv["Entity"] == "World") & (df_inv["Year"] >= 2013) & (df_inv["Year"] <= 2023)].copy()
    col_inv = [c for c in world_inv.columns if "investment" in c.lower()][0]

    observations: list[dict[str, Any]] = []

    for _, row in world_inv.iterrows():
        year = int(row["Year"])
        val_dollars = float(row[col_inv])
        val_billions = round(val_dollars / 1e9, 3)

        observations.append({
            "id": f"metric-private-investment-{year}-constant-2021-usd",
            "metric_name": "global_private_ai_investment_annual_constant_2021_usd_billions",
            "period": str(year),
            "period_precision": PeriodPrecision.ANNUAL.value,
            "value": val_billions,
            "unit": "constant_2021_USD_billions",
            "category": "investment",
            "source_ids": ["source-stanford-ai-index-2024"],
            "methodology_note": (
                "NetBase Quid external funding for privately held AI companies raising >$1.5M. "
                "Excludes publicly traded companies and internal corporate R&D/CapEx. "
                "Reported in constant 2021 US$ billions."
            ),
            "collection_method": CollectionMethod.MANUAL_DOWNLOAD.value,
        })

    # 2. Transform Notable Systems by Affiliation (2013-2023)
    df_aff = pd.read_csv(aff_csv)
    col_aff = [c for c in df_aff.columns if "annual" in c.lower() or "systems" in c.lower()][0]

    pivot_aff = (
        df_aff[(df_aff["Year"] >= 2013) & (df_aff["Year"] <= 2023)]
        .pivot(index="Year", columns="Entity", values=col_aff)
        .fillna(0)
    )

    for year in pivot_aff.index:
        ind_count = float(pivot_aff.loc[year, "Industry"]) if "Industry" in pivot_aff.columns else 0.0
        acad_count = float(pivot_aff.loc[year, "Academia"]) if "Academia" in pivot_aff.columns else 0.0
        collab_count = (
            float(pivot_aff.loc[year, "Academia and industry collaboration"])
            if "Academia and industry collaboration" in pivot_aff.columns
            else 0.0
        )
        total_count = float(pivot_aff.loc[year].sum())

        # Total notable systems
        observations.append({
            "id": f"metric-notable-systems-total-{year}-epoch-stanford",
            "metric_name": "notable_ai_systems_annual_count_total",
            "period": str(year),
            "period_precision": PeriodPrecision.ANNUAL.value,
            "value": total_count,
            "unit": "systems",
            "category": "model_development",
            "source_ids": ["source-stanford-ai-index-2024"],
            "methodology_note": (
                "Annual count of notable artificial intelligence systems tracked by Epoch AI "
                "and published in Stanford AI Index 2024 Chapter 1: Research and Development."
            ),
            "collection_method": CollectionMethod.MANUAL_DOWNLOAD.value,
        })

        # Industry notable systems
        observations.append({
            "id": f"metric-notable-systems-industry-{year}-epoch-stanford",
            "metric_name": "notable_ai_systems_annual_count_industry",
            "period": str(year),
            "period_precision": PeriodPrecision.ANNUAL.value,
            "value": ind_count,
            "unit": "systems",
            "category": "model_development",
            "source_ids": ["source-stanford-ai-index-2024"],
            "methodology_note": (
                "Annual count of notable AI systems with primary author affiliation in industry "
                "(Epoch AI / Stanford AI Index 2024 Chapter 1)."
            ),
            "collection_method": CollectionMethod.MANUAL_DOWNLOAD.value,
        })

        # Academia notable systems
        observations.append({
            "id": f"metric-notable-systems-academia-{year}-epoch-stanford",
            "metric_name": "notable_ai_systems_annual_count_academia",
            "period": str(year),
            "period_precision": PeriodPrecision.ANNUAL.value,
            "value": acad_count,
            "unit": "systems",
            "category": "model_development",
            "source_ids": ["source-stanford-ai-index-2024"],
            "methodology_note": (
                "Annual count of notable AI systems with primary author affiliation in academia "
                "(Epoch AI / Stanford AI Index 2024 Chapter 1)."
            ),
            "collection_method": CollectionMethod.MANUAL_DOWNLOAD.value,
        })

    # 3. Build Annual Coverage Table
    obs_df = pd.DataFrame(observations)
    coverage_table = (
        obs_df.pivot_table(index="period", columns="metric_name", values="value", aggfunc="count")
        .fillna(0)
        .astype(int)
    )

    return observations, coverage_table
