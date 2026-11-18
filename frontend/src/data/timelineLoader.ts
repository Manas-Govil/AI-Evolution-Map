import type {
  Milestone,
  ResearchSource,
  ConceptGraphData,
  MetricObservation,
  ExportEnvelope,
  DatePrecision,
} from '../types/timeline';

export interface TimelineDataResult {
  milestones: Milestone[];
  sources: Record<string, ResearchSource>;
  exportedAt: string;
  minYear: number;
  maxYear: number;
}

export interface ConceptGraphResult {
  graph: ConceptGraphData;
  sources: Record<string, ResearchSource>;
  exportedAt: string;
}

export interface AnalyticsMetricsResult {
  observations: MetricObservation[];
  sources: Record<string, ResearchSource>;
  exportedAt: string;
}

export interface UnifiedDataResult {
  milestones: Milestone[];
  graph: ConceptGraphData;
  metrics: MetricObservation[];
  sources: Record<string, ResearchSource>;
  exportedAt: string;
  minYear: number;
  maxYear: number;
}

/**
 * Format a raw date string based on its date_precision metadata.
 */
export function formatMilestoneDate(dateStr?: string, precision?: DatePrecision): string {
  if (!dateStr) return 'Date Unknown';

  const parts = dateStr.split('-');
  const year = parts[0];
  const monthNum = parts.length > 1 ? parseInt(parts[1], 10) : null;
  const dayNum = parts.length > 2 ? parseInt(parts[2], 10) : null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  switch (precision) {
    case 'day':
      if (monthNum && dayNum) {
        return `${monthNames[monthNum - 1]} ${dayNum}, ${year}`;
      }
      return dateStr;
    case 'month':
      if (monthNum) {
        return `${monthNames[monthNum - 1]} ${year}`;
      }
      return year;
    case 'year':
      return year;
    case 'decade':
      return `${year}s`;
    case 'unknown':
    default:
      return `${year} (circa)`;
  }
}

/**
 * Extract integer calendar year from ISO date string (YYYY, YYYY-MM, YYYY-MM-DD).
 */
export function extractYear(dateStr?: string): number {
  if (!dateStr) return 1950;
  const match = dateStr.match(/^(\d{4})/);
  return match ? parseInt(match[1], 10) : 1950;
}

/**
 * Loads all sources dictionary from research_sources.json
 */
export async function loadSourcesMap(): Promise<Record<string, ResearchSource>> {
  const sourcesMap: Record<string, ResearchSource> = {};
  try {
    const res = await fetch('/data/research_sources.json');
    if (res.ok) {
      const envelope: ExportEnvelope<ResearchSource> = await res.json();
      for (const s of envelope.data || []) {
        sourcesMap[s.id] = s;
      }
    }
  } catch (err) {
    console.warn('Could not load research_sources.json:', err);
  }
  return sourcesMap;
}

/**
 * Loads and reconciles milestones and bibliographic sources.
 */
export async function loadTimelineData(): Promise<TimelineDataResult> {
  const timelineRes = await fetch('/data/orbit_timeline.json');
  if (!timelineRes.ok) {
    throw new Error(`Failed to load orbit_timeline.json (HTTP ${timelineRes.status})`);
  }
  const timelineEnvelope: ExportEnvelope<Milestone> = await timelineRes.json();
  const rawMilestones = timelineEnvelope.data || [];
  const sourcesMap = await loadSourcesMap();

  const years = rawMilestones.map((m) => extractYear(m.date_start));
  const minYear = years.length ? Math.min(...years) : 1950;
  const maxYear = years.length ? Math.max(...years) : 2026;

  return {
    milestones: rawMilestones,
    sources: sourcesMap,
    exportedAt: timelineEnvelope._meta?.exported_at || '',
    minYear,
    maxYear,
  };
}

/**
 * Loads and reconciles concept graph (nodes, directed edges) and bibliographic sources.
 */
export async function loadConceptGraphData(): Promise<ConceptGraphResult> {
  const res = await fetch('/data/concept_graph.json');
  if (!res.ok) {
    throw new Error(`Failed to load concept_graph.json (HTTP ${res.status})`);
  }
  const envelope: ExportEnvelope<ConceptGraphData> = await res.json();
  const graph: ConceptGraphData = envelope.data?.[0] || { nodes: [], edges: [] };
  const sourcesMap = await loadSourcesMap();

  return {
    graph,
    sources: sourcesMap,
    exportedAt: envelope._meta?.exported_at || '',
  };
}

/**
 * Loads and reconciles analytics metrics observations.
 */
export async function loadAnalyticsMetricsData(): Promise<AnalyticsMetricsResult> {
  const res = await fetch('/data/analytics_metrics.json');
  if (!res.ok) {
    throw new Error(`Failed to load analytics_metrics.json (HTTP ${res.status})`);
  }
  const envelope: ExportEnvelope<MetricObservation> = await res.json();
  const observations = envelope.data || [];
  const sourcesMap = await loadSourcesMap();

  return {
    observations,
    sources: sourcesMap,
    exportedAt: envelope._meta?.exported_at || '',
  };
}

/**
 * Loads all unified datasets in parallel.
 */
export async function loadAllData(): Promise<UnifiedDataResult> {
  const [timelineRes, graphRes, metricsRes, sourcesRes] = await Promise.all([
    fetch('/data/orbit_timeline.json').then((r) => r.json() as Promise<ExportEnvelope<Milestone>>),
    fetch('/data/concept_graph.json').then((r) => r.json() as Promise<ExportEnvelope<ConceptGraphData>>),
    fetch('/data/analytics_metrics.json').then((r) => r.json() as Promise<ExportEnvelope<MetricObservation>>),
    fetch('/data/research_sources.json').then((r) => r.json() as Promise<ExportEnvelope<ResearchSource>>),
  ]);

  const sourcesMap: Record<string, ResearchSource> = {};
  for (const s of sourcesRes.data || []) {
    sourcesMap[s.id] = s;
  }

  const milestones = timelineRes.data || [];
  const graph = graphRes.data?.[0] || { nodes: [], edges: [] };
  const metrics = metricsRes.data || [];

  const years = milestones.map((m) => extractYear(m.date_start));
  const minYear = years.length ? Math.min(...years) : 1950;
  const maxYear = years.length ? Math.max(...years) : 2026;

  return {
    milestones,
    graph,
    metrics,
    sources: sourcesMap,
    exportedAt: timelineRes._meta?.exported_at || '',
    minYear,
    maxYear,
  };
}
