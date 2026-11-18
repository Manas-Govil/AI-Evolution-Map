"""
backend/app/schemas/schema_info.py
──────────────────────────────────
Pydantic schemas for API info and metadata reporting.
"""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(default="ok", json_schema_extra={"example": "ok"})
    version: str = Field(default="0.1.0", json_schema_extra={"example": "0.1.0"})
    service: str = Field(default="ai-evolution-map-backend")


class EntityTypeInfo(BaseModel):
    name: str
    description: str
    supported_formats: list[str]
    has_exported_data: bool


class SchemaInfoResponse(BaseModel):
    api_version: str
    schema_version: str
    supported_entities: list[EntityTypeInfo]
    pipeline_role_note: str
