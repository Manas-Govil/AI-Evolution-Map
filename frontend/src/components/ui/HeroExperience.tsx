import React from 'react';
import { motion } from 'framer-motion';
import { Compass, BookOpen, GitBranch, Activity, ArrowDown } from 'lucide-react';

interface HeroExperienceProps {
  stats: {
    milestonesCount: number;
    conceptsCount: number;
    metricsCount: number;
    yearSpan: string;
    totalPrivateInvestment: string;
  };
  onExploreTimeline: () => void;
  onExploreGraph: () => void;
  onExploreAnalytics: () => void;
  onSelectEra?: (era: string) => void;
  onExploreChronicles?: () => void;
}

export const HeroExperience: React.FC<HeroExperienceProps> = ({
  stats,
  onExploreTimeline,
  onExploreGraph,
  onExploreAnalytics,
  onSelectEra,
  onExploreChronicles,
}) => {
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'clamp(560px, 78vh, 800px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3.5rem 2rem 3rem',
        textAlign: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Background Archival Reticle / Astronomical Ring Geometry */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '920px',
          height: '920px',
          borderRadius: '50%',
          border: '1px solid rgba(48, 43, 32, 0.45)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 80,
            borderRadius: '50%',
            border: '1px dashed rgba(169, 140, 82, 0.22)',
            animation: 'orbitSpin 220s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 180,
            borderRadius: '50%',
            border: '1px solid rgba(214, 184, 117, 0.12)',
          }}
        />
        {/* Cardinal Axis Crosshairs */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: '1px',
            background: 'linear-gradient(to bottom, transparent, rgba(48, 43, 32, 0.5) 30%, rgba(48, 43, 32, 0.5) 70%, transparent)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(48, 43, 32, 0.5) 30%, rgba(48, 43, 32, 0.5) 70%, transparent)',
          }}
        />
      </div>

      {/* Archival Catalog Plate Notation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          marginBottom: '2rem',
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontSize: '0.68rem',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#D6B875',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ display: 'inline-block', width: 24, height: 1, background: '#D6B875' }} />
          AN INTERACTIVE HISTORY OF ARTIFICIAL INTELLIGENCE
          <span style={{ display: 'inline-block', width: 24, height: 1, background: '#D6B875' }} />
        </span>
      </motion.div>

      {/* Main Exhibition Headline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.15 }}
        style={{ zIndex: 2, maxWidth: '1060px', margin: '0 auto 1.75rem' }}
      >
        <h1
          style={{
            fontSize: 'clamp(3rem, 7.5vw, 5.8rem)',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            color: '#E8E2D5',
            fontFamily: "'Newsreader', Georgia, 'Times New Roman', serif",
            margin: 0,
          }}
        >
          THE EVOLUTION OF <br />
          <span
            style={{
              fontStyle: 'italic',
              fontWeight: 300,
              color: '#D6B875',
              display: 'inline-block',
              marginTop: '0.2rem',
            }}
          >
            INTELLIGENCE
          </span>
        </h1>
      </motion.div>

      {/* Curated Editorial Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.25 }}
        style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: '#A6A197',
          maxWidth: '720px',
          margin: '0 auto 2.75rem',
          lineHeight: 1.65,
          fontWeight: 400,
          fontFamily: "'Inter', system-ui, sans-serif",
          zIndex: 2,
        }}
      >
        A historical exploration of the ideas, research breakthroughs, architectures and systems that shaped artificial intelligence.
      </motion.p>

      {/* Primary Actions with generous spacing */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.35 }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          marginBottom: '3.5rem',
          zIndex: 2,
        }}
      >
        <button
          onClick={onExploreTimeline}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 32px',
            borderRadius: 4,
            background: '#D6B875',
            color: '#080909',
            fontWeight: 600,
            fontSize: '0.875rem',
            letterSpacing: '0.04em',
            border: '1px solid #D6B875',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            boxShadow: '0 4px 20px rgba(214, 184, 117, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F0CF8C';
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(214, 184, 117, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#D6B875';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(214, 184, 117, 0.2)';
          }}
        >
          <Compass size={17} />
          <span>Explore Orbital Timeline</span>
          <ArrowDown size={14} style={{ opacity: 0.8 }} />
        </button>

        {onExploreChronicles && (
          <button
            onClick={onExploreChronicles}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              padding: '14px 26px',
              borderRadius: 4,
              background: 'rgba(18, 19, 19, 0.85)',
              border: '1px solid #302B20',
              color: '#E8E2D5',
              fontWeight: 500,
              fontSize: '0.875rem',
              letterSpacing: '0.02em',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#655334';
              e.currentTarget.style.background = 'rgba(27, 28, 27, 0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#302B20';
              e.currentTarget.style.background = 'rgba(18, 19, 19, 0.85)';
            }}
          >
            <BookOpen size={16} style={{ color: '#D6B875' }} />
            <span>Read Historical Chronicles</span>
          </button>
        )}

        <button
          onClick={onExploreGraph}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            padding: '14px 24px',
            borderRadius: 4,
            background: 'transparent',
            border: '1px solid #302B20',
            color: '#A6A197',
            fontWeight: 500,
            fontSize: '0.875rem',
            letterSpacing: '0.02em',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#655334';
            e.currentTarget.style.color = '#E8E2D5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#302B20';
            e.currentTarget.style.color = '#A6A197';
          }}
        >
          <GitBranch size={16} style={{ color: '#A98C52' }} />
          <span>Family Tree</span>
        </button>

        <button
          onClick={onExploreAnalytics}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            padding: '14px 24px',
            borderRadius: 4,
            background: 'transparent',
            border: '1px solid #302B20',
            color: '#A6A197',
            fontWeight: 500,
            fontSize: '0.875rem',
            letterSpacing: '0.02em',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#655334';
            e.currentTarget.style.color = '#E8E2D5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#302B20';
            e.currentTarget.style.color = '#A6A197';
          }}
        >
          <Activity size={16} style={{ color: '#8F7044' }} />
          <span>Macro Analytics</span>
        </button>
      </motion.div>

      {/* Subtle Archival Baseline Bar (Replaces generic SaaS metric bento cards) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.45 }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2.5rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(48, 43, 32, 0.6)',
          maxWidth: '880px',
          width: '100%',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.72rem', color: '#77736A', fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: '#D6B875', fontWeight: 600 }}>EPOCH</span>
          <span>{stats.yearSpan}</span>
        </div>
        <div style={{ width: 1, height: 14, background: '#302B20' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.72rem', color: '#77736A', fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: '#A98C52', fontWeight: 600 }}>LANDMARKS</span>
          <span>{stats.milestonesCount} Peer-Reviewed Milestones</span>
        </div>
        <div style={{ width: 1, height: 14, background: '#302B20' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.72rem', color: '#77736A', fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: '#8F7044', fontWeight: 600 }}>LINEAGE</span>
          <span>{stats.conceptsCount} Directed Concepts</span>
        </div>
        <div style={{ width: 1, height: 14, background: '#302B20' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.72rem', color: '#77736A', fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: '#925B49', fontWeight: 600 }}>VERIFICATION</span>
          <span>Strict Provenance Enforced</span>
        </div>
      </motion.div>

      {/* Epoch Jump Anchor Quick-Access */}
      {onSelectEra && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.55 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            marginTop: '2rem',
            zIndex: 2,
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#77736A', marginRight: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Chronological Chapters:
          </span>
          {[
            { id: 'foundations', label: 'I. Foundations (1940s–50s)', color: '#D6B875' },
            { id: 'expert_systems', label: 'II. Early AI & Winters (1960s–80s)', color: '#A98C52' },
            { id: 'revival', label: 'III. Connectionism (1980s–90s)', color: '#8F7044' },
            { id: 'deep_learning', label: 'IV. Deep Learning (2010s)', color: '#718477' },
            { id: 'generative_ai', label: 'V. Frontier Reasoning (2020s–26)', color: '#D6B875' },
          ].map((era) => (
            <button
              key={era.id}
              onClick={() => onSelectEra(era.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 3,
                fontSize: '0.72rem',
                fontWeight: 500,
                background: 'rgba(18, 19, 19, 0.75)',
                color: era.color,
                border: '1px solid #302B20',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(27, 28, 27, 0.95)';
                e.currentTarget.style.borderColor = era.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(18, 19, 19, 0.75)';
                e.currentTarget.style.borderColor = '#302B20';
              }}
            >
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: era.color }} />
              <span>{era.label}</span>
            </button>
          ))}
        </motion.div>
      )}
    </section>
  );
};
