/**
 * src/types/timeline.ts
 * ─────────────────────
 * Unified TypeScript definitions strictly aligned with docs/data-contract.md.
 */

export type DatePrecision = 'day' | 'month' | 'year' | 'decade' | 'unknown';

export type Era =
  | 'foundations'
  | 'birth'
  | 'first_winter'
  | 'expert_systems'
  | 'second_winter'
  | 'revival'
  | 'deep_learning'
  | 'transformer_era'
  | 'generative_ai';

export type Confidence = 'verified' | 'partially_verified' | 'unverified';

export interface Milestone {
  id: string;
  title: string;
  date_start: string;
  date_precision: DatePrecision;
  era: Era;
  description: string;
  source_ids: string[];
  concept_ids?: string[];
  confidence: Confidence;
}

export interface ResearchSource {
  id: string;
  title: string;
  authors?: string[];
  publication_date?: string;
  date_precision: DatePrecision;
  publisher?: string;
  source_type: string;
  url?: string;
  accessed_at: string;
}

export type ConceptCategory = 'theory' | 'paradigm' | 'architecture' | 'algorithm' | 'model' | 'methodology';

export interface ConceptNode {
  id: string;
  name: string;
  category: ConceptCategory;
  summary: string;
  introduced_date?: string;
  introduced_date_precision?: DatePrecision;
  source_ids: string[];
}

export type RelationshipType = 'extends' | 'uses' | 'introduced' | 'influenced' | 'successor_to';

export interface ConceptEdge {
  id: string;
  source_concept_id: string;
  target_concept_id: string;
  relationship_type: RelationshipType;
  evidence_source_ids: string[];
  description: string;
}

export interface ConceptGraphData {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

export type MetricPeriodPrecision = 'annual' | 'quarterly' | 'monthly' | 'point_in_time';

export interface MetricObservation {
  id: string;
  metric_name: string;
  period: string;
  period_precision: MetricPeriodPrecision;
  value: number;
  unit: string;
  category: string;
  source_ids: string[];
  methodology_note?: string;
  collection_method: string;
}

export interface ExportMetadata {
  schema_version: string;
  entity_type: string;
  exported_at: string;
  record_count: number;
  notes?: string;
}

export interface ExportEnvelope<T> {
  _meta: ExportMetadata;
  data: T[];
}

export interface EraMetadata {
  id: Era;
  label: string;
  years: string;
  color: string;
  glowColor: string;
  bgBadge: string;
  description: string;
}
