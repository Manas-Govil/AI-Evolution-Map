"""
src/common/schemas.py
─────────────────────
Pydantic v2 data-contract definitions for AI Evolution Map.

These schemas are the single source of truth for every entity type in the
pipeline. Validation runs here; notebooks and API routes import from here.

Design decisions:
- We use Pydantic v2 (model_validator, field_validator) for strict validation.
- Dates are stored as ISO strings rather than datetime objects because many
  historical records only have year or month precision — datetime would force
  a spurious day=01 that could imply false precision.
- Every entity carries a `source_ids` list so provenance is never lost.
- Confidence levels distinguish what has been cross-checked from what hasn't.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Annotated, Optional
from urllib.parse import urlparse

from pydantic import BaseModel, Field, HttpUrl, field_validator, model_validator


# ── Controlled Vocabulary Enums ──────────────────────────────────────────────

class DatePrecision(str, Enum):
    """How precisely a date is known. Never invent precision that isn't there."""
    DAY = "day"
    MONTH = "month"
    YEAR = "year"
    DECADE = "decade"
    UNKNOWN = "unknown"


class Confidence(str, Enum):
    """
    Epistemological status of a record.
    - VERIFIED: cross-checked against ≥2 independent primary sources.
    - PARTIALLY_VERIFIED: supported by one primary source or indirect evidence.
    - UNVERIFIED: claim found but not yet cross-checked. Must not appear in
      final visualizations as confirmed fact.
    """
    VERIFIED = "verified"
    PARTIALLY_VERIFIED = "partially_verified"
    UNVERIFIED = "unverified"


class Era(str, Enum):
    """Broad eras used for grouping milestones on the timeline."""
    FOUNDATIONS = "foundations"          # Pre-1956: logic, statistics, computation
    BIRTH = "birth"                      # 1956-1969: Dartmouth, early programs
    FIRST_WINTER = "first_winter"        # 1970-1979: funding cuts, disillusionment
    EXPERT_SYSTEMS = "expert_systems"    # 1980-1986: rule-based AI boom
    SECOND_WINTER = "second_winter"      # 1987-1992: AI winter II
    REVIVAL = "revival"                  # 1993-2010: SVMs, statistical ML, internet
    DEEP_LEARNING = "deep_learning"      # 2011-2016: ImageNet, AlexNet, deep nets
    TRANSFORMER_ERA = "transformer_era"  # 2017-2022: Attention, BERT, GPT, etc.
    GENERATIVE_AI = "generative_ai"      # 2023-present: LLMs, multimodal, agents


class RelationshipType(str, Enum):
    """
    Controlled vocabulary for concept relationships.
    Each type has a precise semantic — see docs/data-contract.md for definitions.
    """
    INFLUENCED = "influenced"
    INTRODUCED = "introduced"
    EXTENDS = "extends"
    USES = "uses"
    SUCCESSOR_TO = "successor_to"


class ConceptCategory(str, Enum):
    """High-level categories for AI concepts."""
    ALGORITHM = "algorithm"
    ARCHITECTURE = "architecture"
    DATASET = "dataset"
    FRAMEWORK = "framework"
    HARDWARE = "hardware"
    METHODOLOGY = "methodology"
    ORGANIZATION = "organization"
    PARADIGM = "paradigm"
    TASK = "task"
    THEORY = "theory"


class SourceType(str, Enum):
    """Classification of research / data sources."""
    ORIGINAL_RESEARCH = "original_research"   # peer-reviewed paper
    PREPRINT = "preprint"                      # arXiv, biorXiv, etc.
    OFFICIAL_DOCUMENTATION = "official_documentation"
    INSTITUTIONAL_REPORT = "institutional_report"  # Stanford AI Index, etc.
    DATASET = "dataset"
    SECONDARY_REPORTING = "secondary_reporting"    # news, blog, Wikipedia
    API_METADATA = "api_metadata"                  # Hugging Face Hub, etc.


class PeriodPrecision(str, Enum):
    """Precision of a metric observation period."""
    ANNUAL = "annual"
    QUARTERLY = "quarterly"
    MONTHLY = "monthly"
    POINT_IN_TIME = "point_in_time"
    RANGE = "range"
    UNKNOWN = "unknown"


class CollectionMethod(str, Enum):
    """How the metric value was collected."""
    API = "api"
    MANUAL_DOWNLOAD = "manual_download"
    WEB_SCRAPE = "web_scrape"
    COMPUTED = "computed"
    SURVEY = "survey"
    UNKNOWN = "unknown"


# ── Identifier Convention ─────────────────────────────────────────────────────
# IDs are lowercase-hyphenated strings, e.g. "milestone-imagenet-2009".
# They must be stable across pipeline runs and unique within their entity type.

_ID_PATTERN = r"^[a-z0-9][a-z0-9\-]{1,98}[a-z0-9]$"


# ── Entity Schemas ────────────────────────────────────────────────────────────

class Milestone(BaseModel):
    """
    A discrete, historically significant event in the development of AI.

    Examples: publication of a landmark paper, release of a model, founding
    of a lab, a competition result. NOT a vague "AI improved over a decade".
    """

    id: str = Field(
        pattern=_ID_PATTERN,
        description="Stable unique identifier, e.g. 'milestone-imagenet-2009'.",
    )
    title: str = Field(min_length=3, max_length=300)
    date_start: str = Field(
        description=(
            "ISO 8601 date string. Use 'YYYY' for year-only, 'YYYY-MM' for "
            "month-only, 'YYYY-MM-DD' for full date. Never invent precision."
        )
    )
    date_precision: DatePrecision
    era: Era
    description: str = Field(
        min_length=10,
        description="Factual explanation sourced from cited references.",
    )
    source_ids: list[str] = Field(
        min_length=1,
        description="At least one ResearchSource.id must be cited.",
    )
    concept_ids: list[str] = Field(
        default_factory=list,
        description="Concept.id values that this milestone relates to.",
    )
    confidence: Confidence = Confidence.UNVERIFIED

    @field_validator("date_start")
    @classmethod
    def validate_date_format(cls, v: str, info) -> str:
        """Accept YYYY, YYYY-MM, or YYYY-MM-DD; reject anything else."""
        import re
        patterns = [
            r"^\d{4}$",           # YYYY
            r"^\d{4}-\d{2}$",     # YYYY-MM
            r"^\d{4}-\d{2}-\d{2}$",  # YYYY-MM-DD
        ]
        if not any(re.match(p, v) for p in patterns):
            raise ValueError(
                f"date_start '{v}' must be YYYY, YYYY-MM, or YYYY-MM-DD. "
                "Do not invent precision."
            )
        return v


class Concept(BaseModel):
    """
    An AI concept, technique, architecture, or idea with lasting significance.

    Concepts are the nodes in the AI family tree / knowledge graph. Milestones
    introduce or use concepts; Relationships connect concepts to each other.
    """

    id: str = Field(pattern=_ID_PATTERN)
    name: str = Field(min_length=2, max_length=200)
    category: ConceptCategory
    summary: str = Field(min_length=10)
    introduced_date: Optional[str] = Field(
        default=None,
        description="ISO date, same precision rules as Milestone.date_start.",
    )
    introduced_date_precision: Optional[DatePrecision] = None
    source_ids: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def precision_requires_date(self) -> "Concept":
        """If introduced_date_precision is set, introduced_date must also be set."""
        if self.introduced_date_precision and not self.introduced_date:
            raise ValueError(
                "introduced_date_precision is set but introduced_date is missing."
            )
        return self

    @field_validator("introduced_date")
    @classmethod
    def validate_introduced_date(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        import re
        patterns = [r"^\d{4}$", r"^\d{4}-\d{2}$", r"^\d{4}-\d{2}-\d{2}$"]
        if not any(re.match(p, v) for p in patterns):
            raise ValueError(f"introduced_date '{v}' must be YYYY, YYYY-MM, or YYYY-MM-DD.")
        return v


class Relationship(BaseModel):
    """
    A directed, typed relationship between two Concept nodes.

    Relationships must be supported by evidence — do not create one simply
    because two concepts are temporally close or thematically similar.
    """

    id: str = Field(pattern=_ID_PATTERN)
    source_concept_id: str
    target_concept_id: str
    relationship_type: RelationshipType
    evidence_source_ids: list[str] = Field(
        min_length=1,
        description="At least one ResearchSource.id is required as evidence.",
    )
    description: str = Field(
        min_length=10,
        description="Human-readable explanation of why this relationship holds.",
    )

    @model_validator(mode="after")
    def no_self_loop(self) -> "Relationship":
        if self.source_concept_id == self.target_concept_id:
            raise ValueError(
                "A concept cannot have a relationship with itself. "
                f"source_concept_id == target_concept_id == '{self.source_concept_id}'."
            )
        return self


class ResearchSource(BaseModel):
    """
    A source of evidence: paper, report, dataset, documentation, or API.

    Every claim in a Milestone or Relationship must be traceable to at least
    one ResearchSource. The `accessed_at` field records when we retrieved it —
    web content can change, so provenance timestamps matter.
    """

    id: str = Field(pattern=_ID_PATTERN)
    title: str = Field(min_length=3)
    authors: list[str] = Field(default_factory=list)
    publication_date: Optional[str] = None
    date_precision: DatePrecision = DatePrecision.UNKNOWN
    publisher: Optional[str] = None
    source_type: SourceType
    url: Optional[str] = Field(
        default=None,
        description="Direct, stable URL. Avoid JavaScript-rendered or login-walled pages.",
    )
    accessed_at: str = Field(
        description="ISO 8601 UTC datetime when this source was retrieved, e.g. '2024-10-24T04:30:00Z'."
    )

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        parsed = urlparse(v)
        if parsed.scheme not in ("http", "https"):
            raise ValueError(f"URL must use http or https scheme, got: '{v}'")
        if not parsed.netloc:
            raise ValueError(f"URL has no domain: '{v}'")
        return v

    @field_validator("publication_date")
    @classmethod
    def validate_pub_date(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        import re
        patterns = [r"^\d{4}$", r"^\d{4}-\d{2}$", r"^\d{4}-\d{2}-\d{2}$"]
        if not any(re.match(p, v) for p in patterns):
            raise ValueError(f"publication_date '{v}' must be YYYY, YYYY-MM, or YYYY-MM-DD.")
        return v


class MetricObservation(BaseModel):
    """
    A quantitative observation of a measurable AI-related trend.

    Examples: number of AI papers published in a year, compute used to train
    a model (PetaFLOP-days), benchmark accuracy on a test set, investment totals.

    Critical: Do NOT combine metrics from different sources unless their
    definitions are verified to be equivalent. Record the methodology.
    """

    id: str = Field(pattern=_ID_PATTERN)
    metric_name: str = Field(
        min_length=3,
        description=(
            "Precise name including units and scope, e.g. "
            "'ai_papers_published_openalex_annual_global'."
        ),
    )
    period: str = Field(
        description=(
            "The time period this observation covers. "
            "Use YYYY for annual, YYYY-QN for quarterly, YYYY-MM for monthly, "
            "or 'YYYY/YYYY' for a range."
        )
    )
    period_precision: PeriodPrecision
    value: float = Field(
        description=(
            "The numeric value. Missing values must NOT be substituted with 0 — "
            "omit the record or use a separate null indicator."
        )
    )
    unit: str = Field(
        min_length=1,
        description="Unit of measurement, e.g. 'papers', 'USD_millions', 'PetaFLOP-days'.",
    )
    category: str = Field(
        description="Thematic category, e.g. 'publications', 'investment', 'compute', 'benchmarks'."
    )
    source_ids: list[str] = Field(min_length=1)
    methodology_note: Optional[str] = Field(
        default=None,
        description=(
            "How the metric was defined and measured. Required when the metric "
            "definition is non-obvious or source-specific."
        ),
    )
    collection_method: CollectionMethod = CollectionMethod.UNKNOWN
