import json
import re
from pathlib import Path

nb_dir = Path(__file__).resolve().parents[1] / "notebooks"
for nb in sorted(nb_dir.glob("*.ipynb")):
    with open(nb, encoding="utf-8") as f:
        content = f.read()
    json_refs = re.findall(r"['\"]([a-zA-Z0-9_\-]+\.(?:json|csv|parquet))['\"]", content)
    print(f"{nb.name}: {set(json_refs)}")
