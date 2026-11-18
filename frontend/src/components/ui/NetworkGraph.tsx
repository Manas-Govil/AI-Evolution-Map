import React, { useState, useMemo, useRef, useCallback } from 'react';
import type { ConceptGraphData, ConceptNode, ResearchSource } from '../../types/timeline';
import { CATEGORY_STYLES, RELATIONSHIP_LABELS, formatRelationshipSentence } from '../../data/graphConfig';
import { formatMilestoneDate } from '../../data/timelineLoader';
import {
  Search,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  BookOpen,
  ArrowRight,
  X,
  Layers,
  Calendar,
  Clock,
  Sparkles,
  Network,
} from 'lucide-react';

interface NetworkGraphProps {
  graph: ConceptGraphData;
  sources: Record<string, ResearchSource>;
  selectedConceptId: string | null;
  onSelectConcept: (conceptId: string | null) => void;
  onNavigateToTimelineMilestone?: (milestoneId: string) => void;
}

// Organic constellation coordinates creating natural clustering
const CONSTELLATION_COORDINATES: Record<string, { x: number; y: number }> = {
  'concept-turing-test': { x: 140, y: 130 },
  'concept-artificial-intelligence': { x: 170, y: 310 },
  'concept-perceptron': { x: 360, y: 310 },
  'concept-backpropagation': { x: 570, y: 310 },
  'concept-convolutional-neural-network': { x: 560, y: 150 },
  'concept-deep-learning': { x: 780, y: 150 },
  'concept-self-attention': { x: 570, y: 470 },
  'concept-transformer': { x: 790, y: 380 },
  'concept-bidirectional-transformers': { x: 990, y: 280 },
  'concept-autoregressive-llm': { x: 990, y: 480 },
};

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  graph,
  sources,
  selectedConceptId,
  onSelectConcept,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  const containerRef = useRef<HTMLDivElement>(null);

  // Map of nodes by ID for fast lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, ConceptNode>();
    for (const node of graph.nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [graph.nodes]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const n of graph.nodes) {
      cats.add(n.category);
    }
    return Array.from(cats);
  }, [graph.nodes]);

  const filteredNodes = useMemo(() => {
    return graph.nodes.filter((node) => {
      if (selectedCategory !== 'all' && node.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${node.name} ${node.category} ${node.summary}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [graph.nodes, selectedCategory, searchQuery]);

  const filteredNodeIds = useMemo(() => {
    return new Set(filteredNodes.map((n) => n.id));
  }, [filteredNodes]);

  const selectedConcept = useMemo(() => {
    if (!selectedConceptId) return null;
    return nodeMap.get(selectedConceptId) || null;
  }, [selectedConceptId, nodeMap]);

  const selectedNodeRelations = useMemo(() => {
    if (!selectedConceptId) return { incoming: [], outgoing: [] };
    const incoming = graph.edges.filter((e) => e.target_concept_id === selectedConceptId);
    const outgoing = graph.edges.filter((e) => e.source_concept_id === selectedConceptId);
    return { incoming, outgoing };
  }, [selectedConceptId, graph.edges]);

  const connectedNodeIds = useMemo(() => {
    const set = new Set<string>();
    const activeId = selectedConceptId || hoveredNodeId;
    if (!activeId) return set;
    set.add(activeId);
    for (const e of graph.edges) {
      if (e.source_concept_id === activeId) set.add(e.target_concept_id);
      if (e.target_concept_id === activeId) set.add(e.source_concept_id);
    }
    return set;
  }, [selectedConceptId, hoveredNodeId, graph.edges]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleResetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedCategory('all');
    setSearchQuery('');
    onSelectConcept(null);
  }, [onSelectConcept]);

  const handleZoom = useCallback((delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.5, prev + delta), 2.2));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Editorial Control Ribbon */}
      <div
        style={{
          background: 'rgba(18, 19, 19, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #302B20',
          padding: '0.875rem 1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Network size={18} style={{ color: '#D6B875' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#E8E2D5', letterSpacing: '-0.01em', fontFamily: "'Newsreader', Georgia, serif" }}>
              Concept Constellation
            </span>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', width: 260, maxWidth: '100%' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#77736A' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts or architecture..."
              style={{
                width: '100%',
                paddingLeft: 30,
                paddingRight: 24,
                paddingTop: 5,
                paddingBottom: 5,
                fontSize: '0.78rem',
                borderRadius: 4,
                background: 'rgba(27, 28, 27, 0.9)',
                border: '1px solid #302B20',
                color: '#E8E2D5',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              fontSize: '0.72rem',
              fontWeight: 600,
              background: selectedCategory === 'all' ? 'rgba(214, 184, 117, 0.15)' : 'rgba(27, 28, 27, 0.6)',
              color: selectedCategory === 'all' ? '#D6B875' : '#77736A',
              border: `1px solid ${selectedCategory === 'all' ? 'rgba(214, 184, 117, 0.45)' : '#302B20'}`,
              cursor: 'pointer',
            }}
          >
            All Concepts ({graph.nodes.length})
          </button>
          {availableCategories.map((cat) => {
            const style = CATEGORY_STYLES[cat] || { color: '#77736A', label: cat };
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  background: isSelected ? `${style.color}25` : 'rgba(27, 28, 27, 0.6)',
                  color: isSelected ? style.color : '#77736A',
                  border: `1px solid ${isSelected ? style.color : '#302B20'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: style.color }} />
                <span>{style.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setViewMode((m) => (m === 'graph' ? 'list' : 'graph'))}
            style={{
              padding: '5px 10px',
              borderRadius: 4,
              background: 'rgba(27, 28, 27, 0.8)',
              border: '1px solid #302B20',
              color: '#A6A197',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            <Layers size={13} />
            <span>{viewMode === 'graph' ? 'List View' : 'Graph Canvas'}</span>
          </button>

          <button
            onClick={() => handleZoom(0.15)}
            title="Zoom In"
            style={{
              padding: 5,
              borderRadius: 4,
              background: 'rgba(27, 28, 27, 0.8)',
              border: '1px solid #302B20',
              color: '#A6A197',
              display: 'flex',
              cursor: 'pointer',
            }}
          >
            <ZoomIn size={14} />
          </button>

          <button
            onClick={() => handleZoom(-0.15)}
            title="Zoom Out"
            style={{
              padding: 5,
              borderRadius: 4,
              background: 'rgba(27, 28, 27, 0.8)',
              border: '1px solid #302B20',
              color: '#A6A197',
              display: 'flex',
              cursor: 'pointer',
            }}
          >
            <ZoomOut size={14} />
          </button>

          <button
            onClick={handleResetView}
            title="Reset View"
            style={{
              padding: '5px 8px',
              borderRadius: 4,
              background: 'rgba(27, 28, 27, 0.8)',
              border: '1px solid #302B20',
              color: '#77736A',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Graph Canvas Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div
          ref={containerRef}
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            cursor: isPanning ? 'grabbing' : 'grab',
            background: 'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(27, 28, 27, 0.4) 0%, rgba(8, 9, 9, 0.98) 100%)',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {viewMode === 'graph' ? (
            <svg
              style={{ width: '100%', height: '100%', userSelect: 'none' }}
              viewBox="0 0 1160 620"
            >
              <defs>
                {Object.entries(RELATIONSHIP_LABELS).map(([relType, config]) => (
                  <marker
                    key={relType}
                    id={`const-arrow-${relType}`}
                    viewBox="0 0 10 10"
                    refX="28"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={config.color} opacity={0.85} />
                  </marker>
                ))}
              </defs>

              <g
                transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
                style={{ transformOrigin: '580px 310px', transition: isPanning ? 'none' : 'transform 0.15s ease-out' }}
              >
                {/* Decorative Faint Star Geometry Field */}
                <g opacity="0.1" stroke="rgba(36, 51, 43, 0.8)" strokeWidth="0.5">
                  {Array.from({ length: 13 }).map((_, i) => (
                    <line key={`vl-${i}`} x1={i * 90} y1="0" x2={i * 90} y2="620" />
                  ))}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line key={`hl-${i}`} x1="0" y1={i * 85} x2="1160" y2={i * 85} />
                  ))}
                </g>

                {/* Directed Edges */}
                {graph.edges.map((edge) => {
                  const sourcePos = CONSTELLATION_COORDINATES[edge.source_concept_id] || { x: 200, y: 200 };
                  const targetPos = CONSTELLATION_COORDINATES[edge.target_concept_id] || { x: 400, y: 200 };
                  const isVisible = filteredNodeIds.has(edge.source_concept_id) && filteredNodeIds.has(edge.target_concept_id);
                  const isHighlighted = connectedNodeIds.has(edge.source_concept_id) && connectedNodeIds.has(edge.target_concept_id);
                  const isHovered = hoveredEdgeId === edge.id;
                  const relConfig = RELATIONSHIP_LABELS[edge.relationship_type] || { color: '#687A6E', arrowText: edge.relationship_type };

                  const midX = (sourcePos.x + targetPos.x) / 2;
                  const midY = (sourcePos.y + targetPos.y) / 2;

                  const dx = targetPos.x - sourcePos.x;
                  const dy = targetPos.y - sourcePos.y;
                  const curvature = 0.16;
                  const cx1 = sourcePos.x + dx * 0.5 - dy * curvature;
                  const cy1 = sourcePos.y + dy * 0.5 + dx * curvature;
                  const pathD = `M ${sourcePos.x} ${sourcePos.y} Q ${cx1} ${cy1} ${targetPos.x} ${targetPos.y}`;

                  return (
                    <g
                      key={edge.id}
                      opacity={isVisible ? (connectedNodeIds.size > 0 && !isHighlighted ? 0.15 : 0.85) : 0.08}
                      style={{ transition: 'opacity 0.2s ease' }}
                      onMouseEnter={() => setHoveredEdgeId(edge.id)}
                      onMouseLeave={() => setHoveredEdgeId(null)}
                    >
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isHighlighted || isHovered ? relConfig.color : 'rgba(36, 51, 43, 0.8)'}
                        strokeWidth={isHighlighted || isHovered ? 2.5 : 1.5}
                        strokeDasharray={edge.relationship_type === 'uses' ? '4 3' : undefined}
                        markerEnd={`url(#const-arrow-${edge.relationship_type in RELATIONSHIP_LABELS ? edge.relationship_type : 'extends'})`}
                        style={{ cursor: 'pointer' }}
                      />

                      {/* Edge Label Pill */}
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x={-34}
                          y={-9}
                          width={68}
                          height={18}
                          rx={4}
                          fill="rgba(16, 23, 19, 0.95)"
                          stroke={isHighlighted || isHovered ? relConfig.color : '#24332B'}
                          strokeWidth={0.8}
                        />
                        <text
                          textAnchor="middle"
                          y={3}
                          fill={isHighlighted || isHovered ? relConfig.color : '#687A6E'}
                          fontSize={8.5}
                          fontWeight={600}
                          fontFamily="sans-serif"
                        >
                          {relConfig.arrowText}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Concept Nodes */}
                {graph.nodes.map((node) => {
                  const pos = CONSTELLATION_COORDINATES[node.id] || { x: 300, y: 300 };
                  const isVisible = filteredNodeIds.has(node.id);
                  const isSelected = selectedConceptId === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const isConnected = connectedNodeIds.has(node.id);
                  const catStyle = CATEGORY_STYLES[node.category] || {
                    color: '#687A6E',
                    glowColor: 'rgba(104, 122, 110, 0.4)',
                    borderColor: 'rgba(104, 122, 110, 0.5)',
                  };

                  const opacity = isVisible
                    ? connectedNodeIds.size > 0 && !isConnected
                      ? 0.25
                      : 1
                    : 0.12;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      opacity={opacity}
                      style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectConcept(isSelected ? null : node.id);
                      }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    >
                      {/* Selection Indicator */}
                      {(isSelected || isHovered) && (
                        <circle
                          r={30}
                          fill="none"
                          stroke={catStyle.color}
                          strokeWidth={1.5}
                          strokeDasharray="4 2"
                          opacity={0.7}
                        />
                      )}

                      {/* Node Circle */}
                      <circle
                        r={22}
                        fill="#080909"
                        stroke={isSelected ? catStyle.color : catStyle.borderColor}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />

                      {/* Center Core Dot */}
                      <circle r={8} fill={catStyle.color} />

                      {/* Node Label Below */}
                      <text
                        y={38}
                        textAnchor="middle"
                        fill={isSelected ? '#E8E2D5' : '#A6A197'}
                        fontSize={10.5}
                        fontWeight={isSelected ? 600 : 500}
                        fontFamily="'Inter', sans-serif"
                        style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)' }}
                      >
                        {node.name.length > 24 ? `${node.name.slice(0, 22)}…` : node.name}
                      </text>

                      {/* Category Label */}
                      <text
                        y={50}
                        textAnchor="middle"
                        fill={catStyle.color}
                        fontSize={8.5}
                        fontWeight={500}
                        fontFamily="sans-serif"
                        opacity={0.85}
                      >
                        {node.category}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          ) : (
            /* Accessible List View */
            <div style={{ padding: '2rem', overflowY: 'auto', height: '100%' }}>
              <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#A6A197', margin: '0 0 0.5rem 0', fontFamily: "'Newsreader', Georgia, serif" }}>
                  Concepts Directory ({filteredNodes.length} items)
                </h3>
                {filteredNodes.map((node) => {
                  const catStyle = CATEGORY_STYLES[node.category] || { color: '#77736A' };
                  const isSelected = selectedConceptId === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => onSelectConcept(isSelected ? null : node.id)}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 6,
                        background: isSelected ? 'rgba(214, 184, 117, 0.12)' : 'rgba(18, 19, 19, 0.85)',
                        border: `1px solid ${isSelected ? 'var(--accent-gold)' : '#302B20'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#E8E2D5', fontFamily: "'Newsreader', Georgia, serif" }}>{node.name}</h4>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: `${catStyle.color}20`,
                            color: catStyle.color,
                            border: `1px solid ${catStyle.color}40`,
                          }}
                        >
                          {node.category}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#A6A197', lineHeight: 1.5 }}>
                        {node.summary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hovered Edge Tooltip */}
          {hoveredEdgeId && (() => {
            const edge = graph.edges.find((e) => e.id === hoveredEdgeId);
            if (!edge) return null;
            const src = nodeMap.get(edge.source_concept_id)?.name || edge.source_concept_id;
            const tgt = nodeMap.get(edge.target_concept_id)?.name || edge.target_concept_id;
            const sentence = formatRelationshipSentence(src, edge.relationship_type, tgt);
            return (
              <div
                style={{
                  position: 'absolute',
                  bottom: 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(18, 19, 19, 0.95)',
                  border: '1px solid #302B20',
                  borderRadius: 6,
                  padding: '8px 16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
                  pointerEvents: 'none',
                  zIndex: 30,
                  maxWidth: 520,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#D6B875' }}>
                  {sentence}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#A6A197', marginTop: 2 }}>
                  {edge.description}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Selected Concept Detail Drawer */}
        {selectedConcept && (
          <aside
            style={{
              width: 380,
              background: 'rgba(18, 19, 19, 0.98)',
              borderLeft: '1px solid #655334',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              zIndex: 30,
              overflowY: 'auto',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #302B20', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: `${CATEGORY_STYLES[selectedConcept.category]?.color || '#77736A'}20`,
                    color: CATEGORY_STYLES[selectedConcept.category]?.color || '#77736A',
                    border: `1px solid ${CATEGORY_STYLES[selectedConcept.category]?.color || '#77736A'}40`,
                    display: 'inline-block',
                    marginBottom: 6,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {selectedConcept.category.toUpperCase()}
                </span>
                <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#E8E2D5', fontWeight: 600, lineHeight: 1.25, fontFamily: "'Newsreader', Georgia, serif" }}>
                  {selectedConcept.name}
                </h2>
              </div>
              <button
                onClick={() => onSelectConcept(null)}
                style={{ color: '#77736A', padding: 4, borderRadius: 4, cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {selectedConcept.introduced_date && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 6,
                    background: 'rgba(27, 28, 27, 0.75)',
                    border: '1px solid #302B20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#E8E2D5' }}>
                    <Calendar size={13} style={{ color: '#D6B875' }} />
                    <span style={{ fontWeight: 600 }}>
                      {formatMilestoneDate(selectedConcept.introduced_date, selectedConcept.introduced_date_precision)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#77736A', fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace" }}>
                    <Clock size={11} />
                    <span>{selectedConcept.introduced_date_precision || 'circa'}</span>
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#77736A', margin: '0 0 6px 0', letterSpacing: '0.08em', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                  Epistemological Definition
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#A6A197', lineHeight: 1.6, margin: 0 }}>
                  {selectedConcept.summary}
                </p>
              </div>

              {/* Outgoing Relationships */}
              <div>
                <h4 style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#77736A', margin: '0 0 8px 0', letterSpacing: '0.08em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  <ArrowRight size={12} style={{ color: '#D6B875' }} />
                  <span>Outgoing Lineage ({selectedNodeRelations.outgoing.length})</span>
                </h4>
                {selectedNodeRelations.outgoing.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: '#77736A', margin: 0, fontStyle: 'italic' }}>
                    Terminal concept in current branch.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedNodeRelations.outgoing.map((edge) => {
                      const tgt = nodeMap.get(edge.target_concept_id);
                      const relConfig = RELATIONSHIP_LABELS[edge.relationship_type] || { color: '#77736A', label: edge.relationship_type };
                      return (
                        <div
                          key={edge.id}
                          style={{
                            padding: '0.75rem',
                            borderRadius: 6,
                            background: 'rgba(27, 28, 27, 0.75)',
                            border: `1px solid ${relConfig.color}40`,
                            cursor: 'pointer',
                          }}
                          onClick={() => onSelectConcept(edge.target_concept_id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', marginBottom: 3 }}>
                            <span style={{ fontWeight: 600, color: relConfig.color, fontFamily: "'JetBrains Mono', monospace" }}>
                              --{edge.relationship_type}--&gt;
                            </span>
                            <span style={{ fontWeight: 600, color: '#E8E2D5' }}>{tgt?.name || edge.target_concept_id}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: '#A6A197', lineHeight: 1.4 }}>
                            {edge.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Incoming Foundations */}
              <div>
                <h4 style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#77736A', margin: '0 0 8px 0', letterSpacing: '0.08em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  <Sparkles size={12} style={{ color: '#D6B875' }} />
                  <span>Incoming Foundations ({selectedNodeRelations.incoming.length})</span>
                </h4>
                {selectedNodeRelations.incoming.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: '#77736A', margin: 0, fontStyle: 'italic' }}>
                    Primary root concept in the family tree.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedNodeRelations.incoming.map((edge) => {
                      const src = nodeMap.get(edge.source_concept_id);
                      const relConfig = RELATIONSHIP_LABELS[edge.relationship_type] || { color: '#77736A', label: edge.relationship_type };
                      return (
                        <div
                          key={edge.id}
                          style={{
                            padding: '0.75rem',
                            borderRadius: 6,
                            background: 'rgba(27, 28, 27, 0.75)',
                            border: `1px solid ${relConfig.color}40`,
                            cursor: 'pointer',
                          }}
                          onClick={() => onSelectConcept(edge.source_concept_id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', marginBottom: 3 }}>
                            <span style={{ fontWeight: 600, color: '#EDE6D8' }}>{src?.name || edge.source_concept_id}</span>
                            <span style={{ fontWeight: 600, color: relConfig.color }}>
                              --{edge.relationship_type}--&gt;
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: '#A8B5AA', lineHeight: 1.4 }}>
                            {edge.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Primary Sources */}
              {selectedConcept.source_ids.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#687A6E', margin: '0 0 8px 0', letterSpacing: '0.05em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <BookOpen size={12} style={{ color: '#C9A86A' }} />
                    <span>Evidence Citations ({selectedConcept.source_ids.length})</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedConcept.source_ids.map((sid) => {
                      const src = sources[sid];
                      if (!src) return null;
                      return (
                        <div
                          key={sid}
                          style={{
                            padding: '0.75rem',
                            borderRadius: 6,
                            background: 'rgba(22, 32, 27, 0.75)',
                            border: '1px solid #24332B',
                            fontSize: '0.75rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                            <span style={{ fontWeight: 600, color: '#EDE6D8', lineHeight: 1.3, fontFamily: "'Newsreader', Georgia, serif" }}>{src.title}</span>
                            {src.url && (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#C9A86A', flexShrink: 0 }}
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                          {src.authors && (
                            <div style={{ fontSize: '0.7rem', color: '#687A6E', marginTop: 3 }}>
                              {src.authors.join(', ')} ({src.publication_date?.slice(0, 4) || 'n.d.'})
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
