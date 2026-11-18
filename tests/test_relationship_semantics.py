"""
tests/test_relationship_semantics.py
────────────────────────────────────
Tests for verified semantic relationships in the AI Evolution Map knowledge base.

Verifies:
1. Exact source, target, and relationship_type for the four key conceptual relationships:
   - rel-perceptron-extended-by-backprop (perceptron -> backpropagation, influenced)
   - rel-backprop-used-by-cnn (CNN -> backpropagation, uses)
   - rel-transformer-extended-by-bert (BERT / bidirectional-transformers -> transformer, extends)
   - rel-transformer-successor-gpt (autoregressive-llm -> transformer, uses)
2. Directional sentence rendering helper: verifies that sentence outputs match
   the active grammar: Source Concept --[Verb]--> Target Concept.
"""

import json
from pathlib import Path
import pytest

from src.common.schemas import Relationship, RelationshipType
from src.common.relationships import render_relationship_sentence


@pytest.fixture
def seed_knowledge_base():
    kb_path = Path(__file__).resolve().parents[1] / "data" / "reference" / "seed_knowledge_base.json"
    with open(kb_path, encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def relationships_by_id(seed_knowledge_base):
    return {r["id"]: r for r in seed_knowledge_base.get("relationships", [])}


@pytest.fixture
def concept_names_map(seed_knowledge_base):
    return {c["id"]: c["name"] for c in seed_knowledge_base.get("concepts", [])}


def test_perceptron_influences_backprop(relationships_by_id):
    """
    Rosenblatt's single-layer perceptron limitations influenced Rumelhart et al.
    to develop and popularize multi-layer backpropagation training.
    """
    rel = relationships_by_id["rel-perceptron-extended-by-backprop"]
    assert rel["source_concept_id"] == "concept-perceptron"
    assert rel["target_concept_id"] == "concept-backpropagation"
    assert rel["relationship_type"] == RelationshipType.INFLUENCED
    assert "source-rumelhart-1986-backprop" in rel["evidence_source_ids"]


def test_cnn_uses_backprop(relationships_by_id):
    """
    Convolutional Neural Networks (LeNet) use backpropagation and gradient-based
    learning for parameter optimization.
    """
    rel = relationships_by_id["rel-backprop-used-by-cnn"]
    assert rel["source_concept_id"] == "concept-convolutional-neural-network"
    assert rel["target_concept_id"] == "concept-backpropagation"
    assert rel["relationship_type"] == RelationshipType.USES
    assert "source-lecun-1998-lenet" in rel["evidence_source_ids"]


def test_bert_extends_transformer(relationships_by_id):
    """
    Bidirectional models (BERT) extend the Transformer encoder architecture
    with masked language pre-training.
    """
    rel = relationships_by_id["rel-transformer-extended-by-bert"]
    assert rel["source_concept_id"] == "concept-bidirectional-transformers"
    assert rel["target_concept_id"] == "concept-transformer"
    assert rel["relationship_type"] == RelationshipType.EXTENDS
    assert "source-devlin-2018-bert" in rel["evidence_source_ids"]


def test_autoregressive_llm_uses_transformer(relationships_by_id):
    """
    GPT-style autoregressive models use Transformer-based architectures (causal decoders),
    rather than replacing or succeeding the Transformer architecture.
    """
    rel = relationships_by_id["rel-transformer-successor-gpt"]
    assert rel["source_concept_id"] == "concept-autoregressive-llm"
    assert rel["target_concept_id"] == "concept-transformer"
    assert rel["relationship_type"] == RelationshipType.USES
    assert "source-brown-2020-gpt3" in rel["evidence_source_ids"]


def test_render_relationship_sentence_raw_ids(relationships_by_id):
    """Verifies that the helper produces an exact source-verb-target sentence from raw IDs."""
    rel = relationships_by_id["rel-backprop-used-by-cnn"]
    sentence = render_relationship_sentence(rel)
    assert sentence == "concept-convolutional-neural-network uses concept-backpropagation."


def test_render_relationship_sentence_with_concept_names(relationships_by_id, concept_names_map):
    """Verifies that the helper produces grammatically coherent English sentences matching edge direction."""
    # 1. Perceptron -> Backprop
    s1 = render_relationship_sentence(
        relationships_by_id["rel-perceptron-extended-by-backprop"],
        concept_names_map,
    )
    assert s1 == "Perceptron influenced Backpropagation."

    # 2. CNN -> Backprop
    s2 = render_relationship_sentence(
        relationships_by_id["rel-backprop-used-by-cnn"],
        concept_names_map,
    )
    assert s2 == "Convolutional Neural Network (CNN) uses Backpropagation."

    # 3. BERT -> Transformer
    s3 = render_relationship_sentence(
        relationships_by_id["rel-transformer-extended-by-bert"],
        concept_names_map,
    )
    assert s3 == "Bidirectional Masked Language Modeling extends Transformer Architecture."

    # 4. GPT / Autoregressive LLM -> Transformer
    s4 = render_relationship_sentence(
        relationships_by_id["rel-transformer-successor-gpt"],
        concept_names_map,
    )
    assert s4 == "Autoregressive Large Language Models uses Transformer Architecture."
