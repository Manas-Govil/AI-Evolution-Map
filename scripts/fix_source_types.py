import json
from pathlib import Path

kb_path = Path("data/reference/seed_knowledge_base.json")
with open(kb_path, "r", encoding="utf-8") as f:
    kb = json.load(f)

# Re-map any non-conforming source_types
for s in kb["sources"]:
    if s["source_type"] == "peer_reviewed_paper":
        s["source_type"] = "original_research"
    elif s["source_type"] == "model_release":
        s["source_type"] = "official_documentation"

with open(kb_path, "w", encoding="utf-8") as f:
    json.dump(kb, f, indent=2, ensure_ascii=False)

print("Updated source_type values in seed_knowledge_base.json")
