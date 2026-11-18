"""
src/validation/integrity.py
────────────────────────────
Referential integrity and schema validation checks.

These functions are used in Notebook 05 (Validation and Integration) to verify
that the cleaned data meets the data contract before it is exported to the
processed/ directory.

Design:
- Functions return ValidationResult objects rather than raising exceptions.
  This allows us to collect all issues in one pass and review them together
  rather than stopping at the first problem.
- Every rejected record gets an understandable message explaining why.
- Unverified records are KEPT in a review bucket, not silently dropped.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class RecordIssue:
    """A single validation finding for one record."""
    record_id: str
    field_name: str
    issue_type: str        # "error", "warning", "info"
    message: str


@dataclass
class ValidationResult:
    """
    Summary of a validation run over a collection of records.

    Records are bucketed into:
      accepted      : pass all checks, confidence may be any level
      review        : have warnings but are kept for human review
      rejected      : fail a hard constraint and must not be exported
    """
    accepted: list[dict[str, Any]] = field(default_factory=list)
    review: list[dict[str, Any]] = field(default_factory=list)
    rejected: list[dict[str, Any]] = field(default_factory=list)
    issues: list[RecordIssue] = field(default_factory=list)

    def add_issue(self, record_id: str, field_name: str, issue_type: str, message: str) -> None:
        self.issues.append(RecordIssue(record_id, field_name, issue_type, message))

    def summary(self) -> dict[str, int]:
        return {
            "accepted": len(self.accepted),
            "review": len(self.review),
            "rejected": len(self.rejected),
            "total_issues": len(self.issues),
            "errors": sum(1 for i in self.issues if i.issue_type == "error"),
            "warnings": sum(1 for i in self.issues if i.issue_type == "warning"),
        }


def check_unique_ids(records: list[dict[str, Any]], id_field: str = "id") -> list[RecordIssue]:
    """
    Detect duplicate values in the ID field.

    Returns a list of issues (one per duplicate occurrence, not per pair).
    """
    seen: dict[str, int] = {}
    issues: list[RecordIssue] = []
    for rec in records:
        rid = rec.get(id_field)
        if rid is None:
            issues.append(RecordIssue(
                record_id=str(rec.get(id_field, "MISSING")),
                field_name=id_field,
                issue_type="error",
                message=f"Record is missing required field '{id_field}'.",
            ))
            continue
        seen[rid] = seen.get(rid, 0) + 1

    for rid, count in seen.items():
        if count > 1:
            issues.append(RecordIssue(
                record_id=rid,
                field_name=id_field,
                issue_type="error",
                message=f"Duplicate ID '{rid}' appears {count} times.",
            ))
    return issues


def check_source_references(
    records: list[dict[str, Any]],
    known_source_ids: set[str],
    source_id_list_field: str = "source_ids",
) -> list[RecordIssue]:
    """
    Verify that every source_id cited in records actually exists in known_source_ids.

    An orphaned source reference means we have a claim without traceable evidence.
    """
    issues: list[RecordIssue] = []
    for rec in records:
        rid = rec.get("id", "UNKNOWN")
        source_ids = rec.get(source_id_list_field) or []
        for sid in source_ids:
            if sid not in known_source_ids:
                issues.append(RecordIssue(
                    record_id=str(rid),
                    field_name=source_id_list_field,
                    issue_type="error",
                    message=(
                        f"Source ID '{sid}' cited in record '{rid}' "
                        "does not exist in the ResearchSource collection."
                    ),
                ))
    return issues


def check_relationship_endpoints(
    relationships: list[dict[str, Any]],
    known_concept_ids: set[str],
) -> list[RecordIssue]:
    """
    Verify that both endpoints of every Relationship exist in known_concept_ids.

    A relationship pointing to a nonexistent concept is a dangling reference.
    """
    issues: list[RecordIssue] = []
    for rel in relationships:
        rid = rel.get("id", "UNKNOWN")
        src = rel.get("source_concept_id")
        tgt = rel.get("target_concept_id")

        if src and src not in known_concept_ids:
            issues.append(RecordIssue(
                record_id=str(rid),
                field_name="source_concept_id",
                issue_type="error",
                message=f"source_concept_id '{src}' does not exist in Concept collection.",
            ))
        if tgt and tgt not in known_concept_ids:
            issues.append(RecordIssue(
                record_id=str(rid),
                field_name="target_concept_id",
                issue_type="error",
                message=f"target_concept_id '{tgt}' does not exist in Concept collection.",
            ))
        if src and tgt and src == tgt:
            issues.append(RecordIssue(
                record_id=str(rid),
                field_name="source_concept_id",
                issue_type="error",
                message=f"Self-loop detected: source_concept_id == target_concept_id == '{src}'.",
            ))
    return issues


def check_required_fields(
    records: list[dict[str, Any]],
    required_fields: list[str],
    entity_type: str = "record",
) -> list[RecordIssue]:
    """
    Verify that all required fields are present and non-null in each record.
    """
    issues: list[RecordIssue] = []
    for rec in records:
        rid = rec.get("id", "UNKNOWN")
        for f in required_fields:
            val = rec.get(f)
            if val is None or val == "" or val == []:
                issues.append(RecordIssue(
                    record_id=str(rid),
                    field_name=f,
                    issue_type="error",
                    message=f"{entity_type} '{rid}' is missing required field '{f}'.",
                ))
    return issues


def validate_collection(
    records: list[dict[str, Any]],
    known_source_ids: set[str],
    required_fields: list[str],
    entity_type: str = "record",
) -> ValidationResult:
    """
    Run a full validation pass on a collection of records.

    Combines:
    - Unique ID check
    - Required field check
    - Source reference check (if source_ids field is present)

    Records with any "error" issue → rejected
    Records with only "warning" issues → review
    Records with no issues → accepted
    """
    result = ValidationResult()

    # Collect all issues per record_id
    all_issues: list[RecordIssue] = []
    all_issues.extend(check_unique_ids(records))
    all_issues.extend(check_required_fields(records, required_fields, entity_type))
    all_issues.extend(check_source_references(records, known_source_ids))
    result.issues = all_issues

    # Build a per-record issue map
    error_ids: set[str] = {i.record_id for i in all_issues if i.issue_type == "error"}
    warning_ids: set[str] = {i.record_id for i in all_issues if i.issue_type == "warning"}

    for rec in records:
        rid = str(rec.get("id", "UNKNOWN"))
        if rid in error_ids:
            result.rejected.append(rec)
        elif rid in warning_ids:
            result.review.append(rec)
        else:
            result.accepted.append(rec)

    logger.info(
        "Validation complete for %s: %d accepted, %d review, %d rejected.",
        entity_type,
        len(result.accepted),
        len(result.review),
        len(result.rejected),
    )
    return result
