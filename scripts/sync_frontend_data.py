"""
scripts/sync_frontend_data.py
─────────────────────────────
Copies the validated frontend export artifacts from data/processed/frontend_export/
into frontend/public/data/ so they can be consumed natively by Vite in dev and production.
"""

import shutil
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = PROJECT_ROOT / "data" / "processed" / "frontend_export"
DEST_DIR = PROJECT_ROOT / "frontend" / "public" / "data"


def sync_frontend_data():
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    if not SRC_DIR.exists():
        print(f"Warning: Source directory not found: {SRC_DIR}")
        return

    synced_files = []
    for fpath in SRC_DIR.iterdir():
        if fpath.is_file():
            shutil.copy2(fpath, DEST_DIR / fpath.name)
            synced_files.append(fpath.name)

    print(f"Successfully synchronized {len(synced_files)} files from {SRC_DIR} to {DEST_DIR}:")
    for name in synced_files:
        print(f"  - {name}")


if __name__ == "__main__":
    sync_frontend_data()
