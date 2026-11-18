"""
scripts/patch_notebooks.py
──────────────────────────
Updates Jupyter notebooks 04, 05, 06, 07, and 08 to seamlessly incorporate
the Stanford AI Index / Epoch AI multi-year historical metrics pipeline (2013-2023).
"""

import json
from pathlib import Path

NOTEBOOKS_DIR = Path(__file__).resolve().parents[1] / "notebooks"


def patch_notebook_04():
    nb_path = NOTEBOOKS_DIR / "04_cleaning_and_transformation.ipynb"
    with open(nb_path, encoding="utf-8") as f:
        nb = json.load(f)

    # Check if Transformation 4 is already added
    sources = ["".join(c.get("source", [])) for c in nb["cells"]]
    if any("Transformation 4: Stanford AI Index" in s for s in sources):
        print("Notebook 04 already has Transformation 4. Skipping append.")
        return

    md_cell = {
        "cell_type": "markdown",
        "id": "trans-4-stanford-metrics-md",
        "metadata": {},
        "source": [
            "## Transformation 4: Stanford AI Index & Epoch AI Multi-Year Historical Metrics (2013–2023)\n",
            "\n",
            "### Transformation Rules & Methodology Integrity\n",
            "1. **Strict Separation of Incompatible Metrics**: Global private AI investment is measured in constant 2021 US$ Billions (from NetBase Quid external funding tracking companies raising >$1.5M). It is never conflated with nominal figures or unadjusted series.\n",
            "2. **Sector Affiliation Categorization**: Notable AI systems tracked by Epoch AI are segmented into Industry, Academia, Collaborations, and Total.\n",
            "3. **Zero Interpolation**: All 11 annual observations (2013–2023) are grounded directly in official source publications. No years are fabricated or artificially smoothed.\n",
            "4. **Data Contract Compliance**: Every record generates a deterministic ID, standardized metric name, annual period precision, unit, category, and source reference.\n"
        ]
    }

    code_cell = {
        "cell_type": "code",
        "execution_count": None,
        "id": "trans-4-stanford-metrics-code",
        "metadata": {},
        "outputs": [],
        "source": [
            "from src.cleaning.metrics_transformer import transform_stanford_metrics\n",
            "\n",
            "stanford_raw_dir = RAW_DIR / 'stanford_ai_index'\n",
            "if not stanford_raw_dir.exists():\n",
            "    print(f'ERROR: Raw directory not found at {stanford_raw_dir}')\n",
            "else:\n",
            "    metrics_records, coverage_table = transform_stanford_metrics(stanford_raw_dir)\n",
            "    print(f'Transformed {len(metrics_records)} multi-year metric observations across {len(coverage_table)} years.')\n",
            "\n",
            "    interim_metrics_path = INTERIM_DIR / 'metrics_interim.json'\n",
            "    with open(interim_metrics_path, 'w', encoding='utf-8') as f:\n",
            "        json.dump(metrics_records, f, indent=2, ensure_ascii=False)\n",
            "    print(f'Saved interim metrics \u2192 {interim_metrics_path}')\n",
            "\n",
            "    coverage_csv_path = INTERIM_DIR / 'metrics_coverage.csv'\n",
            "    coverage_table.to_csv(coverage_csv_path)\n",
            "    print(f'Saved annual coverage table \u2192 {coverage_csv_path}')\n",
            "\n",
            "    print('\\n--- Annual Metric Coverage Matrix (2013-2023) ---')\n",
            "    display(coverage_table)\n"
        ]
    }

    nb["cells"].extend([md_cell, code_cell])
    with open(nb_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print("Patched Notebook 04.")


def patch_notebook_05():
    nb_path = NOTEBOOKS_DIR / "05_validation_and_integration.ipynb"
    with open(nb_path, encoding="utf-8") as f:
        nb = json.load(f)

    # Re-build or update Validation Step 4 to validate both 44 multi-year metrics and 3 seed metrics
    # Filter out existing Step 4 if present
    filtered_cells = []
    for c in nb["cells"]:
        src = "".join(c.get("source", []))
        if "Validation Step 4: Stanford AI Index" in src or "interim_metrics_path = INTERIM_DIR / 'metrics_interim.json'" in src:
            continue
        filtered_cells.append(c)
    nb["cells"] = filtered_cells

    md_cell = {
        "cell_type": "markdown",
        "id": "val-4-stanford-metrics-md",
        "metadata": {},
        "source": [
            "## Validation Step 4: Stanford AI Index & Seed Metrics Reconciliation\n",
            "\n",
            "We validate that:\n",
            "- All **44 multi-year annual observations** (2013–2023) from the Stanford AI Index / Epoch AI datasets conform to `MetricObservation`.\n",
            "- All **3 point-in-time reference metrics** (2023) from `seed_knowledge_base.json` conform to `MetricObservation`.\n",
            "- Unique IDs are enforced across all **47 total observations** with zero collisions.\n",
            "- All values are non-negative and periods span 2013 to 2023 without gaps.\n",
            "- Metric units are strictly homogeneous within each metric name.\n",
            "- All `source_ids` reference known bibliographic sources in `seed_knowledge_base.json`.\n",
            "- All 47 validated records are saved to `data/processed/metrics_validated.json` for frontend export.\n"
        ]
    }

    code_cell = {
        "cell_type": "code",
        "execution_count": None,
        "id": "val-4-stanford-metrics-code",
        "metadata": {},
        "outputs": [],
        "source": [
            "from src.common.schemas import MetricObservation\n",
            "\n",
            "interim_metrics_path = INTERIM_DIR / 'metrics_interim.json'\n",
            "if not interim_metrics_path.exists():\n",
            "    print('WARNING: metrics_interim.json not found. Run Notebook 04 first.')\n",
            "    raw_metrics = []\n",
            "else:\n",
            "    with open(interim_metrics_path, encoding='utf-8') as f:\n",
            "        raw_metrics = json.load(f)\n",
            "\n",
            "# Load seed knowledge base metrics and sources\n",
            "kb_path = project_root / 'data' / 'reference' / 'seed_knowledge_base.json'\n",
            "with open(kb_path, encoding='utf-8') as f:\n",
            "    kb_data = json.load(f)\n",
            "known_source_ids = {s['id'] for s in kb_data.get('sources', [])}\n",
            "seed_metrics = kb_data.get('metrics', [])\n",
            "\n",
            "print(f'Raw inputs: {len(raw_metrics)} multi-year observations + {len(seed_metrics)} seed metrics = {len(raw_metrics) + len(seed_metrics)} total.')\n",
            "\n",
            "# Pydantic schema validation for all 47 observations\n",
            "all_raw_metrics = raw_metrics + seed_metrics\n",
            "validated_metrics = []\n",
            "metric_errors = []\n",
            "for m in all_raw_metrics:\n",
            "    try:\n",
            "        validated_metrics.append(MetricObservation(**m).model_dump())\n",
            "    except Exception as e:\n",
            "        metric_errors.append((m.get('id'), str(e)))\n",
            "\n",
            "print(f'Pydantic validation: {len(validated_metrics)} valid, {len(metric_errors)} errors.')\n",
            "\n",
            "# Referential integrity check across all 47 records\n",
            "metrics_val_result = validate_collection(\n",
            "    records=validated_metrics,\n",
            "    known_source_ids=known_source_ids,\n",
            "    required_fields=['id', 'metric_name', 'period', 'value', 'unit', 'source_ids'],\n",
            "    entity_type='MetricObservation'\n",
            ")\n",
            "print('=== Comprehensive Metrics Validation Summary ===')\n",
            "print(json.dumps(metrics_val_result.summary(), indent=2))\n",
            "\n",
            "# Save all 47 validated metrics to data/processed/\n",
            "save_processed(validated_metrics, 'metrics_validated.json')\n"
        ]
    }

    nb["cells"].extend([md_cell, code_cell])
    with open(nb_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print("Patched Notebook 05 (47 records unified).")



def patch_notebook_06():
    nb_path = NOTEBOOKS_DIR / "06_exploratory_data_analysis.ipynb"
    with open(nb_path, encoding="utf-8") as f:
        nb = json.load(f)

    sources = ["".join(c.get("source", [])) for c in nb["cells"]]
    if any("Multi-Year Historical AI Metrics Analysis" in s for s in sources):
        print("Notebook 06 already has historical metrics analysis. Skipping append.")
        return

    md_cell = {
        "cell_type": "markdown",
        "id": "eda-metrics-md",
        "metadata": {},
        "source": [
            "## 6. Multi-Year Historical AI Metrics Analysis (Stanford AI Index & Epoch AI 2013–2023)\n",
            "\n",
            "We inspect continuous empirical trends across 2013–2023:\n",
            "1. **Private AI Investment**: Constant 2021 US$ Billions tracked by NetBase Quid.\n",
            "2. **Notable AI Systems**: Annual counts categorized by institutional affiliation (Industry vs. Academia).\n",
            "\n",
            "> **Integrity Rule**: All years from 2013 to 2023 have complete coverage (11 observations per metric). No values are interpolated.\n"
        ]
    }

    code_cell = {
        "cell_type": "code",
        "execution_count": None,
        "id": "eda-metrics-code",
        "metadata": {},
        "outputs": [],
        "source": [
            "metrics_path = PROCESSED_DIR / 'metrics_validated.json'\n",
            "if not metrics_path.exists():\n",
            "    print('WARNING: metrics_validated.json not found.')\n",
            "else:\n",
            "    df_metrics = pd.DataFrame(json.load(open(metrics_path, encoding='utf-8')))\n",
            "    print(f'Loaded {len(df_metrics)} validated metric observations across metrics:')\n",
            "    print(df_metrics['metric_name'].value_counts())\n",
            "\n",
            "    # 1. Private AI Investment (2013-2023)\n",
            "    df_inv = df_metrics[df_metrics['metric_name'] == 'global_private_ai_investment_annual_constant_2021_usd_billions'].copy()\n",
            "    df_inv['year'] = df_inv['period'].astype(int)\n",
            "    df_inv = df_inv.sort_values('year')\n",
            "\n",
            "    fig, ax = plt.subplots(figsize=(10, 4.5))\n",
            "    ax.plot(df_inv['year'], df_inv['value'], marker='o', color='#1f77b4', linewidth=2.5, markersize=6)\n",
            "    ax.set_title('Global Private AI Investment (2013–2023)\\nSource: NetBase Quid / Stanford AI Index 2024 Chapter 4', fontsize=12, pad=10)\n",
            "    ax.set_xlabel('Year')\n",
            "    ax.set_ylabel('Constant 2021 US$ (Billions)')\n",
            "    ax.set_xticks(df_inv['year'])\n",
            "    ax.grid(True, linestyle='--', alpha=0.6)\n",
            "    for _, r in df_inv.iterrows():\n",
            "        ax.annotate(f\"${r['value']:.1f}B\", (r['year'], r['value']), textcoords='offset points', xytext=(0, 7), ha='center', fontsize=8)\n",
            "    plt.tight_layout()\n",
            "    plt.show()\n",
            "\n",
            "    # 2. Notable AI Systems by Affiliation (2013-2023)\n",
            "    aff_metrics = df_metrics[df_metrics['metric_name'].isin([\n",
            "        'notable_ai_systems_annual_count_industry',\n",
            "        'notable_ai_systems_annual_count_academia',\n",
            "        'notable_ai_systems_annual_count_total'\n",
            "    ])].copy()\n",
            "    aff_metrics['year'] = aff_metrics['period'].astype(int)\n",
            "    piv_aff = aff_metrics.pivot(index='year', columns='metric_name', values='value').sort_index()\n",
            "\n",
            "    fig, ax = plt.subplots(figsize=(10, 4.5))\n",
            "    ax.plot(piv_aff.index, piv_aff['notable_ai_systems_annual_count_total'], marker='s', label='Total Systems', color='#333333', linewidth=2)\n",
            "    ax.plot(piv_aff.index, piv_aff['notable_ai_systems_annual_count_industry'], marker='o', label='Industry Affiliation', color='#d62728', linewidth=2)\n",
            "    ax.plot(piv_aff.index, piv_aff['notable_ai_systems_annual_count_academia'], marker='^', label='Academia Affiliation', color='#2ca02c', linewidth=2)\n",
            "    ax.set_title('Notable AI Systems by Sector (2013–2023)\\nSource: Epoch AI / Stanford AI Index 2024 Chapter 1', fontsize=12, pad=10)\n",
            "    ax.set_xlabel('Year')\n",
            "    ax.set_ylabel('Annual Count of Notable Systems')\n",
            "    ax.set_xticks(piv_aff.index)\n",
            "    ax.legend(frameon=True)\n",
            "    ax.grid(True, linestyle='--', alpha=0.6)\n",
            "    plt.tight_layout()\n",
            "    plt.show()\n"
        ]
    }

    nb["cells"].extend([md_cell, code_cell])
    with open(nb_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print("Patched Notebook 06.")


def patch_notebook_07():
    nb_path = NOTEBOOKS_DIR / "07_ai_research_trends.ipynb"
    with open(nb_path, encoding="utf-8") as f:
        nb = json.load(f)

    sources = ["".join(c.get("source", [])) for c in nb["cells"]]
    if any("Research Question 5: Multi-Year Longitudinal Trends" in s for s in sources):
        print("Notebook 07 already has Research Question 5. Skipping append.")
        return

    md_cell = {
        "cell_type": "markdown",
        "id": "trends-rq5-md",
        "metadata": {},
        "source": [
            "## 5. Research Question 5: Multi-Year Longitudinal Trends in AI Investment & Notable Systems (2013–2023)\n",
            "\n",
            "How do macro trends in capital allocation and model production correlate over the 2013–2023 decade?\n",
            "\n",
            "**Key Observations Grounded in Evidence:**\n",
            "1. **Investment Super-Cycle**: Global private AI investment expanded from $6.01B in 2013 to a peak of $145.40B in 2021, before settling at $92.79B in 2023 (in constant 2021 US$).\n",
            "2. **The Industry Hegemony Shift**: In 2013, academia produced more notable systems than industry (10 vs. 7). By 2023, industry accounted for 69 notable systems compared to 18 from academia, driven by massive compute and data capital requirements.\n"
        ]
    }

    code_cell = {
        "cell_type": "code",
        "execution_count": None,
        "id": "trends-rq5-code",
        "metadata": {},
        "outputs": [],
        "source": [
            "metrics_path = PROCESSED_DIR / 'metrics_validated.json'\n",
            "if not metrics_path.exists():\n",
            "    print('WARNING: metrics_validated.json not found.')\n",
            "else:\n",
            "    df_m = pd.DataFrame(json.load(open(metrics_path, encoding='utf-8')))\n",
            "    \n",
            "    # Extract private investment & industry share\n",
            "    df_inv = df_m[df_m['metric_name'] == 'global_private_ai_investment_annual_constant_2021_usd_billions'].copy()\n",
            "    df_ind = df_m[df_m['metric_name'] == 'notable_ai_systems_annual_count_industry'].copy()\n",
            "    df_tot = df_m[df_m['metric_name'] == 'notable_ai_systems_annual_count_total'].copy()\n",
            "\n",
            "    df_inv['year'] = df_inv['period'].astype(int)\n",
            "    df_ind['year'] = df_ind['period'].astype(int)\n",
            "    df_tot['year'] = df_tot['period'].astype(int)\n",
            "\n",
            "    merged = pd.merge(df_inv[['year', 'value']].rename(columns={'value': 'investment_b'}),\n",
            "                      df_ind[['year', 'value']].rename(columns={'value': 'industry_systems'}), on='year')\n",
            "    merged = pd.merge(merged, df_tot[['year', 'value']].rename(columns={'value': 'total_systems'}), on='year')\n",
            "    merged['industry_pct'] = (merged['industry_systems'] / merged['total_systems']) * 100\n",
            "\n",
            "    fig, ax1 = plt.subplots(figsize=(11, 5))\n",
            "    color_inv = '#1f77b4'\n",
            "    ax1.set_xlabel('Year', fontsize=11)\n",
            "    ax1.set_ylabel('Private AI Investment (Constant 2021 US$ Billions)', color=color_inv, fontsize=11)\n",
            "    line1 = ax1.plot(merged['year'], merged['investment_b'], color=color_inv, marker='o', linewidth=2.5, label='Private Investment ($B)')\n",
            "    ax1.tick_params(axis='y', labelcolor=color_inv)\n",
            "    ax1.set_xticks(merged['year'])\n",
            "\n",
            "    ax2 = ax1.twinx()\n",
            "    color_pct = '#d62728'\n",
            "    ax2.set_ylabel('Industry Share of Notable Systems (%)', color=color_pct, fontsize=11)\n",
            "    line2 = ax2.plot(merged['year'], merged['industry_pct'], color=color_pct, marker='s', linewidth=2.5, linestyle='--', label='Industry Share (%)')\n",
            "    ax2.tick_params(axis='y', labelcolor=color_pct)\n",
            "    ax2.set_ylim(0, 100)\n",
            "\n",
            "    lines = line1 + line2\n",
            "    labels = [l.get_label() for l in lines]\n",
            "    ax1.legend(lines, labels, loc='upper left', frameon=True)\n",
            "\n",
            "    plt.title('AI Evolution Map — Investment Super-Cycle vs. Industry Dominance (2013–2023)\\nData Sources: Stanford AI Index 2024 / NetBase Quid & Epoch AI', fontsize=12, pad=12)\n",
            "    plt.tight_layout()\n",
            "    plt.show()\n"
        ]
    }

    nb["cells"].extend([md_cell, code_cell])
    with open(nb_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print("Patched Notebook 07.")


def patch_notebook_08():
    nb_path = NOTEBOOKS_DIR / "08_frontend_data_export.ipynb"
    with open(nb_path, encoding="utf-8") as f:
        nb = json.load(f)

    # In notebook 08, cell 3 validates seed entities and cell 4 exports them.
    # We update cell 3 to also load validated_metrics from metrics_validated.json
    for cell in nb["cells"]:
        source = "".join(cell.get("source", []))
        if "validated_metrics = []" in source and "seed_data.get('metrics'" in source:
            new_source = [
                "# Validate seed knowledge base entities with Pydantic\n",
                "validated_milestones = [Milestone(**m).model_dump() for m in seed_data.get('milestones', [])]\n",
                "validated_concepts = [Concept(**c).model_dump() for c in seed_data.get('concepts', [])]\n",
                "validated_relationships = [Relationship(**r).model_dump() for r in seed_data.get('relationships', [])]\n",
                "validated_sources = [ResearchSource(**s).model_dump() for s in seed_data.get('sources', [])]\n",
                "validated_seed_metrics = [MetricObservation(**met).model_dump() for met in seed_data.get('metrics', [])]\n",
                "\n",
                "# Load multi-year Stanford AI Index validated metrics\n",
                "metrics_val_path = PROCESSED_DIR / 'metrics_validated.json'\n",
                "if metrics_val_path.exists():\n",
                "    with open(metrics_val_path, encoding='utf-8') as f:\n",
                "        all_validated_metrics = [MetricObservation(**m).model_dump() for m in json.load(f)]\n",
                "    print(f'Loaded {len(all_validated_metrics)} validated metric records from data/processed/.')\n",
                "else:\n",
                "    all_validated_metrics = validated_seed_metrics\n",
                "print(f'Total validated metrics to export: {len(all_validated_metrics)}')\n",
                "print('All entities validated successfully against Pydantic contract!')\n"
            ]
            cell["source"] = new_source
            cell["execution_count"] = None
            cell["outputs"] = []

        if "export_to_json(validated_metrics, EXPORT_DIR / 'analytics_metrics.json'" in source:
            new_export_source = [
                "# 1. Orbit Timeline Export\n",
                "export_to_json(validated_milestones, EXPORT_DIR / 'orbit_timeline.json', 'milestone', 'Timeline chronological events')\n",
                "export_to_csv(validated_milestones, EXPORT_DIR / 'orbit_timeline.csv', 'milestone')\n",
                "\n",
                "# 2. Concept Graph (Family Tree) Export\n",
                "graph_payload = {\n",
                "    'nodes': validated_concepts,\n",
                "    'edges': validated_relationships\n",
                "}\n",
                "export_to_json([graph_payload], EXPORT_DIR / 'concept_graph.json', 'concept_graph', 'Nodes and directed edges')\n",
                "\n",
                "# 3. Sources Export\n",
                "export_to_json(validated_sources, EXPORT_DIR / 'research_sources.json', 'research_source', 'Bibliographic citations')\n",
                "export_to_csv(validated_sources, EXPORT_DIR / 'research_sources.csv', 'research_source')\n",
                "\n",
                "# 4. Analytics Metrics Export (Multi-Year Series)\n",
                "export_to_json(all_validated_metrics, EXPORT_DIR / 'analytics_metrics.json', 'metric_observation', 'Quantitative observations')\n",
                "export_to_csv(all_validated_metrics, EXPORT_DIR / 'analytics_metrics.csv', 'metric_observation')\n",
                "export_to_parquet(all_validated_metrics, EXPORT_DIR / 'analytics_metrics.parquet', 'metric_observation')\n",
                "\n",
                "print('Frontend exports successfully written to:', EXPORT_DIR)\n"
            ]
            cell["source"] = new_export_source
            cell["execution_count"] = None
            cell["outputs"] = []

    with open(nb_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print("Patched Notebook 08.")


if __name__ == "__main__":
    patch_notebook_04()
    patch_notebook_05()
    patch_notebook_06()
    patch_notebook_07()
    patch_notebook_08()
    print("All notebooks successfully patched!")
