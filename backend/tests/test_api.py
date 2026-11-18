"""
backend/tests/test_api.py
─────────────────────────
FastAPI endpoint tests verifying health, metadata, and data contract endpoints.
"""

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "0.1.0"


def test_schema_info_endpoint():
    response = client.get("/api/v1/schema-info")
    assert response.status_code == 200
    data = response.json()
    assert data["api_version"] == "v1"
    assert data["schema_version"] == "0.1.0"
    entity_names = [e["name"] for e in data["supported_entities"]]
    assert "milestone" in entity_names
    assert "concept" in entity_names
    assert "relationship" in entity_names
    assert "research_source" in entity_names
    assert "metric_observation" in entity_names


def test_timeline_endpoint():
    response = client.get("/api/v1/timeline")
    assert response.status_code == 200
    data = response.json()
    assert "_meta" in data
    assert data["_meta"]["entity_type"] == "milestone"
    assert len(data["data"]) == 20


def test_concept_graph_endpoint():
    response = client.get("/api/v1/concept-graph")
    assert response.status_code == 200
    data = response.json()
    assert "_meta" in data
    assert data["_meta"]["entity_type"] == "concept_graph"
    graph = data["data"][0]
    assert len(graph["nodes"]) == 10
    assert len(graph["edges"]) == 7


def test_analytics_metrics_endpoint():
    response = client.get("/api/v1/analytics-metrics")
    assert response.status_code == 200
    data = response.json()
    assert "_meta" in data
    assert data["_meta"]["entity_type"] == "metric_observation"
    assert len(data["data"]) == 47


def test_research_sources_endpoint():
    response = client.get("/api/v1/research-sources")
    assert response.status_code == 200
    data = response.json()
    assert "_meta" in data
    assert data["_meta"]["entity_type"] == "research_source"
    assert len(data["data"]) == 22
