"""
tests/test_schemas.py
─────────────────────
Unit tests for Pydantic data contract schemas.
Verifies validation rules, date precision, confidence levels, and constraints.
All fixtures here are synthetic, labelled explicitly as such.
"""

import pytest
from pydantic import ValidationError

from src.common.schemas import (
    Milestone,
    Concept,
    Relationship,
    ResearchSource,
    MetricObservation,
    DatePrecision,
    Confidence,
    Era,
    ConceptCategory,
    RelationshipType,
    SourceType,
    PeriodPrecision,
    CollectionMethod,
)


def test_valid_milestone():
    m = Milestone(
        id="milestone-test-event-2023",
        title="Test Event For Landmark AI",
        date_start="2023-05-15",
        date_precision=DatePrecision.DAY,
        era=Era.GENERATIVE_AI,
        description="A completely valid verified test milestone description.",
        source_ids=["source-test-paper-1"],
        concept_ids=["concept-transformer"],
        confidence=Confidence.VERIFIED,
    )
    assert m.id == "milestone-test-event-2023"
    assert m.confidence == Confidence.VERIFIED


def test_milestone_year_only_date_valid():
    m = Milestone(
        id="milestone-test-year-1956",
        title="Dartmouth Conference",
        date_start="1956",
        date_precision=DatePrecision.YEAR,
        era=Era.BIRTH,
        description="Historical workshop founding AI.",
        source_ids=["source-mccarthy-1955"],
        concept_ids=[],
        confidence=Confidence.VERIFIED,
    )
    assert m.date_start == "1956"
    assert m.date_precision == DatePrecision.YEAR


def test_invalid_milestone_date_format():
    with pytest.raises(ValidationError):
        Milestone(
            id="milestone-invalid-date-2020",
            title="Invalid Date Milestone",
            date_start="May 15th, 2020",  # Invalid! Not ISO
            date_precision=DatePrecision.DAY,
            era=Era.GENERATIVE_AI,
            description="Should fail validation because date is not ISO format.",
            source_ids=["source-1"],
        )


def test_invalid_milestone_missing_source():
    with pytest.raises(ValidationError):
        Milestone(
            id="milestone-no-source-2020",
            title="Milestone With Zero Sources",
            date_start="2020",
            date_precision=DatePrecision.YEAR,
            era=Era.GENERATIVE_AI,
            description="Should fail because source_ids must have min_length >= 1.",
            source_ids=[],  # Violates min_length=1
        )


def test_valid_relationship():
    r = Relationship(
        id="rel-transformer-to-bert",
        source_concept_id="concept-transformer",
        target_concept_id="concept-bert",
        relationship_type=RelationshipType.EXTENDS,
        evidence_source_ids=["source-devlin-2018"],
        description="BERT extends the Transformer architecture using masked language modeling.",
    )
    assert r.relationship_type == RelationshipType.EXTENDS


def test_relationship_self_loop_forbidden():
    with pytest.raises(ValidationError, match="A concept cannot have a relationship with itself"):
        Relationship(
            id="rel-self-loop",
            source_concept_id="concept-transformer",
            target_concept_id="concept-transformer",
            relationship_type=RelationshipType.EXTENDS,
            evidence_source_ids=["source-1"],
            description="Self loops are strictly forbidden.",
        )


def test_research_source_url_validation():
    # Valid URL
    s = ResearchSource(
        id="source-valid-paper",
        title="Valid Paper Title",
        authors=["Alice", "Bob"],
        publication_date="2023-01",
        date_precision=DatePrecision.MONTH,
        source_type=SourceType.ORIGINAL_RESEARCH,
        url="https://arxiv.org/abs/2301.00000",
        accessed_at="2024-10-24T00:00:00Z",
    )
    assert str(s.url) == "https://arxiv.org/abs/2301.00000"

    # Malformed URL without scheme
    with pytest.raises(ValidationError):
        ResearchSource(
            id="source-invalid-url",
            title="Invalid URL Paper",
            source_type=SourceType.PREPRINT,
            url="not-a-valid-http-url",
            accessed_at="2024-10-24T00:00:00Z",
        )


def test_metric_observation_valid():
    met = MetricObservation(
        id="metric-test-papers-2023",
        metric_name="annual_ai_papers_sample",
        period="2023",
        period_precision=PeriodPrecision.ANNUAL,
        value=150.0,
        unit="papers",
        category="publications",
        source_ids=["source-1"],
        methodology_note="Count of papers matching topic filter in sample.",
        collection_method=CollectionMethod.API,
    )
    assert met.value == 150.0
