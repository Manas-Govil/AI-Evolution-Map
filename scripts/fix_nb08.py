import json
from pathlib import Path

nb_path = Path("notebooks/08_frontend_data_export.ipynb")
with open(nb_path, encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb["cells"]:
    src = "".join(cell.get("source", []))
    if "stanford_val_metrics + validated_seed_metrics" in src or "all_validated_metrics" in src:
        cell["source"] = [
            "# Validate seed knowledge base entities with Pydantic\n",
            "validated_milestones = [Milestone(**m).model_dump() for m in seed_data.get('milestones', [])]\n",
            "validated_concepts = [Concept(**c).model_dump() for c in seed_data.get('concepts', [])]\n",
            "validated_relationships = [Relationship(**r).model_dump() for r in seed_data.get('relationships', [])]\n",
            "validated_sources = [ResearchSource(**s).model_dump() for s in seed_data.get('sources', [])]\n",
            "validated_seed_metrics = [MetricObservation(**met).model_dump() for met in seed_data.get('metrics', [])]\n",
            "\n",
            "# Load pre-validated metrics from data/processed/ (44 multi-year + 3 seed = 47 total)\n",
            "metrics_val_path = PROCESSED_DIR / 'metrics_validated.json'\n",
            "if metrics_val_path.exists():\n",
            "    with open(metrics_val_path, encoding='utf-8') as f:\n",
            "        all_validated_metrics = [MetricObservation(**m).model_dump() for m in json.load(f)]\n",
            "    print(f'Loaded {len(all_validated_metrics)} validated metric records from data/processed/.')\n",
            "else:\n",
            "    all_validated_metrics = validated_seed_metrics\n",
            "\n",
            "print(f'Total validated metrics to export: {len(all_validated_metrics)}')\n",
            "print('All entities validated successfully against Pydantic contract!')\n"
        ]
        cell["execution_count"] = None
        cell["outputs"] = []
        break

with open(nb_path, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
print("Notebook 08 updated successfully.")
