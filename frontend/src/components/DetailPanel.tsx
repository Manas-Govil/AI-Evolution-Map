import React from 'react';
import type { Milestone, ResearchSource } from '../types/timeline';
import { ERA_CONFIG } from '../data/eraConfig';
import { formatMilestoneDate } from '../data/timelineLoader';
import { X, Calendar, ShieldCheck, BookOpen, ExternalLink, Hash, Clock } from 'lucide-react';

interface DetailPanelProps {
  milestone: Milestone | null;
  sources: Record<string, ResearchSource>;
  onClose: () => void;
  onNavigateToConcept?: (conceptId: string) => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  milestone,
  sources,
  onClose,
  onNavigateToConcept,
}) => {
  if (!milestone) return null;

  const era = ERA_CONFIG[milestone.era] || {
    id: milestone.era,
    label: milestone.era,
    years: '',
    color: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    bgBadge: 'bg-slate-800 text-slate-300 border-slate-700',
    description: '',
  };

  const formattedDate = formatMilestoneDate(milestone.date_start, milestone.date_precision);

  return (
    <aside
      style={{
        width: '100%',
        maxWidth: 440,
        background: 'rgba(18, 19, 19, 0.98)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid #655334',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 40,
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.85)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #302B20',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          background: 'rgba(27, 28, 27, 0.5)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: '0.7rem',
                fontWeight: 600,
                border: `1px solid ${era.color}50`,
                backgroundColor: `${era.color}15`,
                color: era.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: era.color,
                }}
              />
              {era.label}
            </span>

            <span
              style={{
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: '0.7rem',
                fontWeight: 500,
                backgroundColor: 'rgba(214, 184, 117, 0.12)',
                color: '#D6B875',
                border: '1px solid rgba(214, 184, 117, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                textTransform: 'capitalize',
              }}
            >
              <ShieldCheck size={11} style={{ color: '#D6B875' }} />
              <span>{milestone.confidence.replace('_', ' ')}</span>
            </span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#E8E2D5', margin: 0, lineHeight: 1.3, fontFamily: "'Newsreader', Georgia, serif" }}>
            {milestone.title}
          </h2>
        </div>

        <button
          onClick={onClose}
          style={{
            padding: 6,
            borderRadius: 4,
            background: 'rgba(48, 43, 32, 0.3)',
            border: '1px solid #302B20',
            color: '#A6A197',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Close details"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#E8E2D5';
            e.currentTarget.style.borderColor = '#655334';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#A6A197';
            e.currentTarget.style.borderColor = '#302B20';
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* Date Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#E8E2D5', fontWeight: 600 }}>
            <Calendar size={13} style={{ color: '#D6B875' }} />
            <span>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#77736A', fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace" }}>
            <Clock size={11} />
            <span style={{ textTransform: 'capitalize' }}>{milestone.date_precision} precision</span>
          </div>
        </div>

        {/* Historical Context */}
        <div>
          <h3 style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#77736A', margin: '0 0 6px 0', fontFamily: "'JetBrains Mono', monospace" }}>
            Historiographical Context
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#A6A197', lineHeight: 1.65, margin: 0 }}>
            {milestone.description}
          </p>
        </div>

        {/* Related Concepts */}
        {milestone.concept_ids && milestone.concept_ids.length > 0 && (
          <div>
            <h3 style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#77736A', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'JetBrains Mono', monospace" }}>
              <Hash size={12} style={{ color: '#D6B875' }} />
              <span>Related Concepts in Family Tree</span>
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {milestone.concept_ids.map((cid) => (
                <button
                  key={cid}
                  onClick={() => onNavigateToConcept?.(cid)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    background: 'rgba(27, 28, 27, 0.8)',
                    color: '#D6B875',
                    border: '1px solid rgba(214, 184, 117, 0.35)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.15s ease',
                  }}
                  title="Explore concept in Family Tree graph"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#D6B875';
                    e.currentTarget.style.background = 'rgba(214, 184, 117, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(214, 184, 117, 0.35)';
                    e.currentTarget.style.background = 'rgba(27, 28, 27, 0.8)';
                  }}
                >
                  <span>{cid.replace(/^concept-/, '')}</span>
                  <ExternalLink size={10} style={{ opacity: 0.7 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Primary Sources */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#77736A', margin: 0, display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'JetBrains Mono', monospace" }}>
            <BookOpen size={12} style={{ color: '#D6B875' }} />
            <span>Primary Evidence ({milestone.source_ids.length})</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {milestone.source_ids.map((sid) => {
              const src = sources[sid];
              if (!src) return null;

              return (
                <div
                  key={src.id}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: 6,
                    background: 'rgba(27, 28, 27, 0.75)',
                    border: '1px solid #302B20',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#E8E2D5', margin: 0, lineHeight: 1.35, fontFamily: "'Newsreader', Georgia, serif" }}>
                      {src.title}
                    </h4>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#D6B875', flexShrink: 0, padding: 2 }}
                        title="Open canonical publication link"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>

                  {src.authors && (
                    <div style={{ fontSize: '0.72rem', color: '#77736A' }}>
                      <strong style={{ color: '#A6A197' }}>Authors:</strong> {src.authors.join(', ')}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: '#77736A', borderTop: '1px solid #302B20', paddingTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                    {src.publisher && <span>{src.publisher}</span>}
                    {src.publication_date && <span>• {src.publication_date}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
