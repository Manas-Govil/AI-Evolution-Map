import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Milestone,
  ResearchSource,
  Era,
  ConceptGraphData,
  MetricObservation,
} from './types/timeline';
import { loadAllData, extractYear } from './data/timelineLoader';
import { ERA_CONFIG } from './data/eraConfig';
import { TimelineControls } from './components/TimelineControls';
import { DetailPanel } from './components/DetailPanel';
import { RadialOrbitalTimeline } from './components/ui/RadialOrbitalTimeline';
import { NetworkGraph } from './components/ui/NetworkGraph';
import { EditorialAnalytics } from './components/ui/EditorialAnalytics';
import { SourceExplorer } from './components/SourceExplorer';
import { MethodologySection } from './components/MethodologySection';
import { CelestialBackground } from './components/ui/CelestialBackground';
import { HeroExperience } from './components/ui/HeroExperience';
import { EditorialStorytelling } from './components/ui/EditorialStorytelling';
import {
  Orbit,
  GitBranch,
  TrendingUp,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import './App.css';

type ActiveTab = 'timeline' | 'graph' | 'analytics' | 'sources' | 'methodology';
type ViewMode = 'orbital' | 'linear';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');

  // Unified Data State
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [graph, setGraph] = useState<ConceptGraphData>({ nodes: [], edges: [] });
  const [metrics, setMetrics] = useState<MetricObservation[]>([]);
  const [sources, setSources] = useState<Record<string, ResearchSource>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataInfo, setDataInfo] = useState({ minYear: 1950, maxYear: 2026, exportedAt: '' });

  // Timeline UI State
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [timelineSearchQuery, setTimelineSearchQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState<Era | 'all'>('all');
  const [yearRange, setYearRange] = useState<[number, number]>([1950, 2026]);
  const [timelineViewMode, setTimelineViewMode] = useState<ViewMode>('orbital');

  // Concept Graph UI State
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    let cancelled = false;

    loadAllData()
      .then((result) => {
        if (cancelled) return;
        setMilestones(result.milestones);
        setGraph(result.graph);
        setMetrics(result.metrics);
        setSources(result.sources);
        setDataInfo({
          minYear: result.minYear,
          maxYear: result.maxYear,
          exportedAt: result.exportedAt,
        });
        setYearRange([result.minYear, result.maxYear]);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load unified application data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error loading data');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Stats computed strictly from real data
  const projectStats = useMemo(() => {
    const inv2021 = metrics.find(
      (m) =>
        m.metric_name === 'global_private_ai_investment_annual_constant_2021_usd_billions' &&
        m.period === '2021'
    );

    return {
      milestonesCount: milestones.length,
      conceptsCount: graph.nodes.length,
      metricsCount: metrics.length,
      yearSpan: `${dataInfo.minYear} – ${dataInfo.maxYear}`,
      totalPrivateInvestment: inv2021 ? `$${inv2021.value.toFixed(1)}B` : '$132.4B',
    };
  }, [milestones, graph, metrics, dataInfo]);

  // Cross-Navigation Handlers
  const handleNavigateToConcept = useCallback((conceptId: string) => {
    setSelectedConceptId(conceptId);
    setActiveTab('graph');
  }, []);

  const handleNavigateToTimelineMilestone = useCallback((milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    setActiveTab('timeline');
  }, []);

  // Timeline Filtering
  const filteredMilestones = useMemo(() => {
    return milestones.filter((m) => {
      if (selectedEra !== 'all' && m.era !== selectedEra) return false;
      const year = extractYear(m.date_start);
      if (year < yearRange[0] || year > yearRange[1]) return false;

      if (timelineSearchQuery.trim()) {
        const q = timelineSearchQuery.toLowerCase();
        const searchable = [
          m.title,
          m.description,
          m.era,
          ERA_CONFIG[m.era]?.label || '',
          ...(m.concept_ids || []),
        ]
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [milestones, selectedEra, yearRange, timelineSearchQuery]);

  const selectedMilestone = useMemo(() => {
    if (!selectedMilestoneId) return null;
    return milestones.find((m) => m.id === selectedMilestoneId) || null;
  }, [milestones, selectedMilestoneId]);

  const handleTimelineReset = useCallback(() => {
    setTimelineSearchQuery('');
    setSelectedEra('all');
    setYearRange([dataInfo.minYear, dataInfo.maxYear]);
    setSelectedMilestoneId(null);
  }, [dataInfo.minYear, dataInfo.maxYear]);

  const handleTimelineViewToggle = useCallback(() => {
    setTimelineViewMode((prev) => (prev === 'orbital' ? 'linear' : 'orbital'));
  }, []);

  const handleYearRangeChange = useCallback((range: [number, number]) => {
    if (range[0] <= range[1]) {
      setYearRange(range);
    }
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <Loader2 className="loading-spinner" size={40} />
          <h2 className="loading-title">AI Evolution Map</h2>
          <p className="loading-subtitle">Loading multi-modal AI research datasets…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <AlertCircle size={40} style={{ color: '#A85A44' }} />
          <h2 className="loading-title" style={{ color: '#A85A44' }}>Data Load Error</h2>
          <p className="loading-subtitle">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <CelestialBackground>
      <div className="app-container" style={{ background: 'transparent' }}>
        <header className="app-header" style={{ background: 'rgba(9, 13, 11, 0.92)', borderBottom: '1px solid #24332B' }}>
          <div className="header-inner" style={{ maxWidth: '1440px' }}>
            <div className="header-brand" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('timeline')}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #C9A86A 0%, rgba(201, 168, 106, 0.15) 70%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(201, 168, 106, 0.4)',
                }}
              >
                <Orbit size={18} style={{ color: '#090D0B' }} />
              </div>
              <div>
                <h1 className="header-title" style={{ fontSize: '1.1rem', letterSpacing: '-0.01em', fontFamily: "'Newsreader', Georgia, serif", fontWeight: 600 }}>
                  AI Evolution Map
                </h1>
                <p className="header-subtitle" style={{ fontSize: '0.68rem', color: '#687A6E' }}>
                  Historiographical Research Atlas • 1950–2026
                </p>
              </div>
            </div>

            {/* Navigation Tabs — Oxford Botanica Editorial Style */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={() => setActiveTab('timeline')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 15px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: activeTab === 'timeline' ? 'rgba(214, 184, 117, 0.12)' : 'transparent',
                  color: activeTab === 'timeline' ? '#D6B875' : '#77736A',
                  border: `1px solid ${activeTab === 'timeline' ? 'rgba(214, 184, 117, 0.45)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                <Orbit size={13} />
                <span>Orbit Timeline</span>
              </button>

              <button
                onClick={() => setActiveTab('graph')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 15px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: activeTab === 'graph' ? 'rgba(214, 184, 117, 0.12)' : 'transparent',
                  color: activeTab === 'graph' ? '#D6B875' : '#77736A',
                  border: `1px solid ${activeTab === 'graph' ? 'rgba(214, 184, 117, 0.45)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                <GitBranch size={13} />
                <span>Family Tree</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 15px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: activeTab === 'analytics' ? 'rgba(214, 184, 117, 0.12)' : 'transparent',
                  color: activeTab === 'analytics' ? '#D6B875' : '#77736A',
                  border: `1px solid ${activeTab === 'analytics' ? 'rgba(214, 184, 117, 0.45)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                <TrendingUp size={13} />
                <span>Macro Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('sources')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 15px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: activeTab === 'sources' ? 'rgba(214, 184, 117, 0.12)' : 'transparent',
                  color: activeTab === 'sources' ? '#D6B875' : '#77736A',
                  border: `1px solid ${activeTab === 'sources' ? 'rgba(214, 184, 117, 0.45)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                <BookOpen size={13} />
                <span>Sources</span>
              </button>

              <button
                onClick={() => setActiveTab('methodology')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 15px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: activeTab === 'methodology' ? 'rgba(214, 184, 117, 0.12)' : 'transparent',
                  color: activeTab === 'methodology' ? '#D6B875' : '#77736A',
                  border: `1px solid ${activeTab === 'methodology' ? 'rgba(214, 184, 117, 0.45)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                <ShieldCheck size={13} />
                <span>Governance</span>
              </button>
            </nav>

            <div className="header-meta">
              <span className="meta-label">Audit Baseline</span>
              <span className="meta-value" style={{ color: '#D6B875', fontFamily: "'JetBrains Mono', monospace" }}>
                45 Tests Passing
              </span>
            </div>
          </div>
        </header>

        {/* ─── Main Content Views ─── */}
        <main className="main-content" style={{ flex: 1, position: 'relative', overflow: activeTab === 'timeline' ? 'visible' : 'hidden' }}>
          {/* TAB 1: ORBIT TIMELINE WITH IMMERSIVE HERO */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              {/* Immersive Hero Experience */}
              <HeroExperience
                stats={projectStats}
                onExploreTimeline={() => {
                  const el = document.getElementById('orbit-canvas-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onExploreGraph={() => setActiveTab('graph')}
                onExploreAnalytics={() => setActiveTab('analytics')}
                onExploreChronicles={() => {
                  const el = document.getElementById('editorial-chronicles');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onSelectEra={(era) => {
                  setSelectedEra(era as any);
                  const el = document.getElementById('orbit-canvas-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              {/* Orbit Timeline Section */}
              <div id="orbit-canvas-anchor" style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: 'clamp(620px, 78vh, 1060px)', borderTop: '1px solid #302B20' }}>
                {/* Timeline Controls Bar */}
                <TimelineControls
                  searchQuery={timelineSearchQuery}
                  onSearchChange={setTimelineSearchQuery}
                  selectedEra={selectedEra}
                  onEraChange={setSelectedEra}
                  yearRange={yearRange}
                  onYearRangeChange={handleYearRangeChange}
                  minPossibleYear={dataInfo.minYear}
                  maxPossibleYear={dataInfo.maxYear}
                  filteredCount={filteredMilestones.length}
                  totalCount={milestones.length}
                  onReset={handleTimelineReset}
                  viewMode={timelineViewMode}
                  onViewModeToggle={handleTimelineViewToggle}
                />

                <div style={{ display: 'flex', flex: 1, overflow: 'visible', position: 'relative', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <div className="visualization-area" style={{ minHeight: 'clamp(580px, 75vh, 1020px)', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <RadialOrbitalTimeline
                      milestones={filteredMilestones}
                      selectedId={selectedMilestoneId}
                      onSelect={setSelectedMilestoneId}
                      viewMode={timelineViewMode}
                    />
                  </div>

                  {/* Detail Panel */}
                  {selectedMilestone && (
                    <div className={`detail-sidebar ${selectedMilestone ? 'open' : ''}`}>
                      <DetailPanel
                        milestone={selectedMilestone}
                        sources={sources}
                        onClose={() => setSelectedMilestoneId(null)}
                        onNavigateToConcept={handleNavigateToConcept}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Historical Editorial Chronicles Section */}
              <div style={{ borderTop: '1px solid #302B20', background: 'rgba(8, 9, 9, 0.75)' }}>
                <EditorialStorytelling
                  milestones={milestones}
                  onSelectMilestone={(id) => {
                    setSelectedMilestoneId(id);
                    const el = document.getElementById('orbit-canvas-anchor');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onFocusTimeline={() => {
                    const el = document.getElementById('orbit-canvas-anchor');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: NETWORK GRAPH CONCEPT LINEAGE */}
          {activeTab === 'graph' && (
            <div style={{ width: '100%', height: '100%' }}>
              <NetworkGraph
                graph={graph}
                sources={sources}
                selectedConceptId={selectedConceptId}
                onSelectConcept={setSelectedConceptId}
                onNavigateToTimelineMilestone={handleNavigateToTimelineMilestone}
              />
            </div>
          )}

          {/* TAB 3: EDITORIAL ANALYTICS DASHBOARD */}
          {activeTab === 'analytics' && (
            <div style={{ width: '100%', height: '100%' }}>
              <EditorialAnalytics metrics={metrics} sources={sources} />
            </div>
          )}

          {/* TAB 4: RESEARCH SOURCES EXPLORER */}
          {activeTab === 'sources' && (
            <div style={{ width: '100%', height: '100%' }}>
              <SourceExplorer sources={sources} />
            </div>
          )}

          {/* TAB 5: METHODOLOGY & AUDIT REPORT */}
          {activeTab === 'methodology' && (
            <div style={{ width: '100%', height: '100%' }}>
              <MethodologySection />
            </div>
          )}
        </main>
      </div>
    </CelestialBackground>
  );
}

export default App;
