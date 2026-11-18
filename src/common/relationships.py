"""
src/common/relationships.py
───────────────────────────
Utilities for semantic relationship parsing, rendering, and validation.

Consistent Grammar Convention:
    source_concept --[relationship_type]--> target_concept
    Subject        --[Verb]--------------> Object

Example:
    "Convolutional Neural Network (CNN) uses Backpropagation."
    Source: concept-convolutional-neural-network
    Type:   uses
    Target: concept-backpropagation
"""

from __future__ import annotations

from typing import Any, Optional
from src.common.schemas import Relationship, RelationshipType

# Active-verb mapping for controlled relationship types
RELATIONSHIP_VERBS: dict[RelationshipType, str] = {
    RelationshipType.INFLUENCED: "influenced",
    RelationshipType.INTRODUCED: "introduced",
    RelationshipType.EXTENDS: "extends",
    RelationshipType.USES: "uses",
    RelationshipType.SUCCESSOR_TO: "is a successor to",
}


def render_relationship_sentence(
    rel: Relationship | dict[str, Any],
    concept_names: Optional[dict[str, str]] = None,
) -> str:
    """
    Renders a directed relationship as a human-readable English sentence.

    Grammar:
        {Source Concept} {Verb} {Target Concept}.

    Parameters
    ----------
    rel : Relationship | dict
        The relationship model or dict containing source_concept_id,
        relationship_type, and target_concept_id.
    concept_names : dict[str, str] | None
        Optional mapping from concept_id to human-readable concept name.
        If omitted, concept IDs are used directly.

    Returns
    -------
    str
        Readable sentence reflecting the exact directed edge.
    """
    if isinstance(rel, dict):
        source_id = rel.get("source_concept_id", "")
        target_id = rel.get("target_concept_id", "")
        raw_type = rel.get("relationship_type", "")
        rel_type = RelationshipType(raw_type) if isinstance(raw_type, str) else raw_type
    else:
        source_id = rel.source_concept_id
        target_id = rel.target_concept_id
        rel_type = rel.relationship_type

    # Resolve display names
    names = concept_names or {}
    source_name = names.get(source_id, source_id)
    target_name = names.get(target_id, target_id)

    verb = RELATIONSHIP_VERBS.get(rel_type, str(rel_type))
    return f"{source_name} {verb} {target_name}."
