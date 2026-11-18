"""
src/common/ids.py
──────────────────
Stable identifier generation for AI Evolution Map entities.

Design constraints:
- IDs must be stable across pipeline re-runs so that references between
  entities (source_ids, concept_ids) don't break when data is refreshed.
- IDs must be human-readable so that a developer can reason about them in
  JSON files without looking up a separate mapping table.
- IDs must be unique within their entity type prefix.

Strategy:
- Human-defined entities (milestones, concepts) use slug-based IDs:
    "milestone-imagenet-2009", "concept-transformer"
- Ingested records use a deterministic hash of their natural key so
  the same paper/model always gets the same ID across runs:
    "source-arxiv-1706-03762"  (the Attention Is All You Need paper)
    "metric-ai-papers-2022-openalex"
- Never use auto-incrementing integers — they change when rows are reordered.
"""

from __future__ import annotations

import hashlib
import re
import unicodedata


def _slugify(text: str, max_len: int = 60) -> str:
    """
    Convert arbitrary text to a lowercase-hyphenated slug suitable for IDs.

    Steps:
    1. Normalize unicode to ASCII where possible.
    2. Lowercase.
    3. Replace non-alphanumeric characters with hyphens.
    4. Collapse consecutive hyphens.
    5. Strip leading/trailing hyphens.
    6. Truncate to max_len.
    """
    # Normalize unicode (e.g. é -> e)
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-{2,}", "-", text)
    text = text.strip("-")
    return text[:max_len].rstrip("-")


def make_milestone_id(title: str, year: str) -> str:
    """
    Create a stable milestone ID from its title and year.

    Example:
        make_milestone_id("ImageNet Large Scale Visual Recognition Challenge", "2009")
        → "milestone-imagenet-large-scale-visual-recognition-challenge-2009"
          (truncated to 80 chars total, so the slug part is limited)
    """
    slug = _slugify(title, max_len=55)
    return f"milestone-{slug}-{year}"


def make_concept_id(name: str) -> str:
    """
    Create a stable concept ID from the concept's canonical name.

    Example: make_concept_id("Transformer") → "concept-transformer"
    """
    slug = _slugify(name, max_len=70)
    return f"concept-{slug}"


def make_source_id_arxiv(arxiv_id: str) -> str:
    """
    Create a stable source ID for an arXiv paper.

    arXiv IDs look like "1706.03762" or "cs/0404023". We normalise dots and
    slashes to hyphens.

    Example: make_source_id_arxiv("1706.03762") → "source-arxiv-1706-03762"
    """
    normalised = re.sub(r"[./]", "-", arxiv_id.strip())
    return f"source-arxiv-{normalised}"


def make_source_id_openalex(openalex_id: str) -> str:
    """
    Create a stable source ID for an OpenAlex work.

    OpenAlex IDs look like "https://openalex.org/W2741809807". We extract the
    W-number.

    Example:
        make_source_id_openalex("https://openalex.org/W2741809807")
        → "source-openalex-w2741809807"
    """
    # Extract the last path component (e.g. "W2741809807")
    oa_short = openalex_id.rstrip("/").split("/")[-1].lower()
    return f"source-openalex-{oa_short}"


def make_source_id_hf(repo_id: str) -> str:
    """
    Create a stable source ID for a Hugging Face Hub model repo.

    repo_id looks like "meta-llama/Llama-2-7b-hf". We slugify it.

    Example:
        make_source_id_hf("meta-llama/Llama-2-7b-hf")
        → "source-hf-meta-llama-llama-2-7b-hf"
    """
    slug = _slugify(repo_id, max_len=60)
    return f"source-hf-{slug}"


def make_metric_id(metric_name: str, period: str, source_name: str) -> str:
    """
    Create a stable metric observation ID.

    Example:
        make_metric_id("ai_papers_published", "2022", "openalex")
        → "metric-ai-papers-published-2022-openalex"
    """
    slug_metric = _slugify(metric_name, max_len=40)
    slug_period = _slugify(period, max_len=15)
    slug_source = _slugify(source_name, max_len=15)
    return f"metric-{slug_metric}-{slug_period}-{slug_source}"


def deterministic_hash_id(prefix: str, *natural_key_parts: str) -> str:
    """
    Generate a stable ID from a prefix and one or more natural key parts using
    a short SHA-256 hash.

    Use this as a fallback when a proper slug would be too long or ambiguous.
    The result is stable as long as the natural key parts are identical.

    Example:
        deterministic_hash_id("source", "openalex", "W2741809807")
        → "source-a3f7c2b1"  (first 8 hex chars of SHA-256)
    """
    raw = "|".join(str(p) for p in natural_key_parts)
    digest = hashlib.sha256(raw.encode()).hexdigest()[:8]
    slug = _slugify(prefix, max_len=30)
    return f"{slug}-{digest}"
