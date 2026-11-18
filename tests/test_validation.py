"""
tests/test_validation.py
────────────────────────
Tests for referential integrity, duplicate ID detection, and endpoint validation.
"""

from src.validation.integrity import (
    check_unique_ids,
    check_source_references,
    check_relationship_endpoints,
    check_required_fields,
    validate_collection,
)


def test_check_unique_ids():
    records = [
        {"id": "rec-1", "name": "Item 1"},
        {"id": "rec-2", "name": "Item 2"},
        {"id": "rec-1", "name": "Item 1 Duplicate"},
    ]
    issues = check_unique_ids(records)
    assert len(issues) == 1
    assert "Duplicate ID 'rec-1'" in issues[0].message


def test_check_source_references():
    known_sources = {"source-valid-1", "source-valid-2"}
    records = [
        {"id": "milestone-1", "source_ids": ["source-valid-1"]},
        {"id": "milestone-2", "source_ids": ["source-nonexistent-xyz"]},
    ]
    issues = check_source_references(records, known_sources)
    assert len(issues) == 1
    assert "source-nonexistent-xyz" in issues[0].message


def test_check_relationship_endpoints():
    known_concepts = {"concept-a", "concept-b"}
    relationships = [
        {
            "id": "rel-valid",
            "source_concept_id": "concept-a",
            "target_concept_id": "concept-b",
        },
        {
            "id": "rel-broken",
            "source_concept_id": "concept-a",
            "target_concept_id": "concept-ghost",
        },
        {
            "id": "rel-loop",
            "source_concept_id": "concept-a",
            "target_concept_id": "concept-a",
        },
    ]
    issues = check_relationship_endpoints(relationships, known_concepts)
    assert len(issues) == 2
    messages = [i.message for i in issues]
    assert any("concept-ghost" in m for m in messages)
    assert any("Self-loop" in m for m in messages)


def test_check_required_fields():
    records = [
        {"id": "rec-1", "title": "Good title"},
        {"id": "rec-2", "title": ""},  # empty string
        {"id": "rec-3"},               # missing
    ]
    issues = check_required_fields(records, ["id", "title"])
    assert len(issues) == 2
