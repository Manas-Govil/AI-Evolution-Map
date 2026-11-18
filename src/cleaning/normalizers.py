"""
src/cleaning/normalizers.py
────────────────────────────
Date and text normalization utilities.

These functions are pure transformations — they take raw strings and return
cleaned ones. They never mutate the original data; callers apply them when
building the interim representation.

Why normalize here rather than in notebooks?
- The same logic applies to multiple sources (arXiv, OpenAlex, HF all have
  dates; all have text fields that need stripping).
- Putting it in a module makes it testable with pytest.
- Notebooks call these functions and stay readable.

All normalization must preserve uncertainty:
- A year-only date stays as "YYYY", not "YYYY-01-01".
- Missing values are returned as None, never as empty strings or zeros.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Optional


# ── Date Normalization ────────────────────────────────────────────────────────

# Patterns we accept as valid dates
_YEAR_ONLY = re.compile(r"^(\d{4})$")
_YEAR_MONTH = re.compile(r"^(\d{4})[/-](\d{1,2})$")
_YEAR_MONTH_DAY = re.compile(r"^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$")
# ISO 8601 datetime with optional time part — we just extract the date
_ISO_DATETIME = re.compile(r"^(\d{4}-\d{2}-\d{2})(T.*)?$")


def normalize_date(raw: Optional[str], *, field_name: str = "date") -> Optional[str]:
    """
    Parse a raw date string into a canonical ISO format while preserving precision.

    Accepted inputs:
      "2023"             → "2023"           (DatePrecision.YEAR)
      "2023-06"          → "2023-06"        (DatePrecision.MONTH)
      "2023-6"           → "2023-06"        (DatePrecision.MONTH)
      "2023-06-15"       → "2023-06-15"     (DatePrecision.DAY)
      "2023-06-15T..."   → "2023-06-15"     (DatePrecision.DAY, time stripped)
      ""                 → None
      None               → None

    Returns None (not an empty string) when the date is absent or unparseable.
    Logs a warning instead of raising for unparseable dates — we don't want
    one bad record to crash the whole pipeline.
    """
    import logging
    logger = logging.getLogger(__name__)

    if not raw or not isinstance(raw, str):
        return None

    s = raw.strip()
    if not s:
        return None

    # ISO datetime — strip the time component
    m = _ISO_DATETIME.match(s)
    if m:
        return m.group(1)  # "YYYY-MM-DD"

    # Full date with various separators
    m = _YEAR_MONTH_DAY.match(s)
    if m:
        y, mo, d = m.groups()
        return f"{int(y):04d}-{int(mo):02d}-{int(d):02d}"

    # Year-month
    m = _YEAR_MONTH.match(s)
    if m:
        y, mo = m.groups()
        return f"{int(y):04d}-{int(mo):02d}"

    # Year only
    m = _YEAR_ONLY.match(s)
    if m:
        return s.strip()

    logger.warning("Could not parse %s='%s' — will be set to None.", field_name, raw)
    return None


def infer_date_precision(normalized_date: Optional[str]) -> str:
    """
    Return the appropriate DatePrecision enum value for a normalized date string.

    Examples:
        infer_date_precision("2023")        → "year"
        infer_date_precision("2023-06")     → "month"
        infer_date_precision("2023-06-15")  → "day"
        infer_date_precision(None)          → "unknown"
    """
    if not normalized_date:
        return "unknown"
    parts = normalized_date.split("-")
    if len(parts) == 1:
        return "year"
    if len(parts) == 2:
        return "month"
    return "day"


# ── Text Normalization ─────────────────────────────────────────────────────────

def normalize_title(raw: Optional[str]) -> Optional[str]:
    """
    Clean a paper or milestone title.

    - Strip leading/trailing whitespace.
    - Collapse internal whitespace runs to a single space.
    - Normalize newlines (some APIs embed them in titles).
    - Do NOT change case — title casing is the author's choice.
    - Return None for empty/None input.
    """
    if not raw or not isinstance(raw, str):
        return None
    cleaned = raw.strip().replace("\n", " ").replace("\r", " ")
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    return cleaned if cleaned else None


def normalize_abstract(raw: Optional[str]) -> Optional[str]:
    """
    Clean a paper abstract.

    Same whitespace rules as normalize_title. Also strips the common arXiv
    LaTeX artifacts (e.g. trailing whitespace after formula tokens).
    """
    if not raw or not isinstance(raw, str):
        return None
    cleaned = raw.strip().replace("\n", " ").replace("\r", " ")
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    return cleaned if cleaned else None


def reconstruct_abstract_from_inverted_index(
    inverted_index: Optional[dict],
) -> Optional[str]:
    """
    Reconstruct a plain-text abstract from OpenAlex's inverted index format.

    OpenAlex stores abstracts as inverted indexes:
        {"word": [position1, position2, ...], ...}

    We rebuild them by placing each word at its positions and joining in order.

    Returns None if the index is absent or empty.
    """
    if not inverted_index:
        return None
    # Build a position → word mapping
    position_map: dict[int, str] = {}
    for word, positions in inverted_index.items():
        for pos in positions:
            position_map[pos] = word
    if not position_map:
        return None
    words = [position_map[i] for i in sorted(position_map.keys())]
    return " ".join(words)


def normalize_author_name(raw: Optional[str]) -> Optional[str]:
    """
    Normalize a single author name to a consistent form.

    - Strip whitespace.
    - Collapse internal spaces.
    - We do NOT normalize unicode characters in names (é, ü, etc.) —
      that would change the actual names. We only strip control characters.
    """
    if not raw or not isinstance(raw, str):
        return None
    # Remove control characters but keep unicode letters
    cleaned = "".join(
        c for c in raw.strip()
        if unicodedata.category(c) not in ("Cc", "Cf")
    )
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    return cleaned if cleaned else None


def normalize_category(raw: Optional[str], allowed: Optional[set[str]] = None) -> Optional[str]:
    """
    Normalize a category string to lowercase-hyphenated form.

    If `allowed` is given, return None if the normalized value is not in the set.
    This is used to map source-specific categories to our controlled vocabulary.
    """
    if not raw or not isinstance(raw, str):
        return None
    normalized = raw.strip().lower().replace(" ", "-").replace("_", "-")
    normalized = re.sub(r"-{2,}", "-", normalized)
    if allowed and normalized not in allowed:
        return None
    return normalized
