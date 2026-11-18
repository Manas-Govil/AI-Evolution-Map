import React, { useState } from 'react';
import type { Milestone } from '../../types/timeline';
import { ERA_CONFIG } from '../../data/eraConfig';
import { extractYear, formatMilestoneDate } from '../../data/timelineLoader';
import { Compass, Calendar, ShieldCheck, ChevronRight } from 'lucide-react';

interface EditorialStorytellingProps {
  milestones: Milestone[];
  onSelectMilestone: (id: string) => void;
  onFocusTimeline: () => void;
}

interface ChapterDefinition {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  years: string;
  accentColor: string;
  eras: string[];
  introduction: string;
  significance: string;
}

const CHAPTERS: ChapterDefinition[] = [
  {
    id: 'ch-foundations',
    number: 'CHAPTER I',
    title: 'The Foundations of Machine Cognition',
    subtitle: 'Cybernetics, Computability & Early Artificial Neurons',
    years: '1940 – 1955',
    accentColor: '#D6B875', // Champagne Gold
    eras: ['foundations'],
    introduction:
      'Before machines could learn, mathematicians and neurophysiologists sought to formalize the boundary between mechanical computation and biological cognition. Alan Turing posed whether machines could think, establishing the philosophical touchstone of the discipline.',
    significance:
      'Established the theoretical limits of algorithmic decidability and the very first computational abstractions of biological neurons.',
  },
  {
    id: 'ch-early-winters',
    number: 'CHAPTER II',
    title: 'Symbolic Reason & The First Winter',
    subtitle: 'The Dartmouth Inception, Heuristics & Combinatorial Limits',
    years: '1956 – 1979',
    accentColor: '#A98C52', // Antique Horological Gold
    eras: ['birth', 'first_winter'],
    introduction:
      'The 1956 Dartmouth Summer Research Project formally coined "Artificial Intelligence." Early symbolic computing produced optimistic claims for general machine translation and automated theorem proving, before combinatorial explosion and the Lighthill Report caused severe funding retrenchment.',
    significance:
      'Demonstrated that pure symbolic logic without empirical learning suffered from brittleness and fatal scalability bottlenecks.',
  },
  {
    id: 'ch-connectionism',
    number: 'CHAPTER III',
    title: 'Connectionism & The Statistical Revival',
    subtitle: 'Backpropagation, Expert Systems & Probabilistic Learning',
    years: '1980 – 2011',
    accentColor: '#8F7044', // Burnished Bronze
    eras: ['expert_systems', 'second_winter', 'revival'],
    introduction:
      'The rediscovery of backpropagation by Rumelhart, Hinton, and Williams revived multi-layer neural networks. Following the commercial collapse of specialized Lisp machines, researchers pivoted toward rigorous statistical machine learning, support vector machines, and early convolutional networks.',
    significance:
      'Grounded the field in empirical optimization, statistical inference, and gradient descent across continuous loss surfaces.',
  },
  {
    id: 'ch-deep-learning',
    number: 'CHAPTER IV',
    title: 'The Deep Learning Revolution',
    subtitle: 'Large-Scale Datasets, Parallel GPU Compute & Representation Learning',
    years: '2012 – 2016',
    accentColor: '#718477', // Mineral Sage
    eras: ['deep_learning'],
    introduction:
      'In October 2012, AlexNet halved the top-5 error rate on ImageNet using GPU parallelism and convolutional depth. The empirical success shattered decades of skepticism, establishing deep hierarchical feature learning as the preeminent machine learning paradigm.',
    significance:
      'Proved that massive parameter scaling paired with abundant data and dedicated tensor hardware fundamentally outmatched hand-crafted feature engineering.',
  },
  {
    id: 'ch-generative-frontier',
    number: 'CHAPTER V',
    title: 'Generative AI & Frontier Reasoning',
    subtitle: 'Self-Attention, Foundation Scaling & Autonomous Inference',
    years: '2017 – Present',
    accentColor: '#D6B875', // Champagne Gold
    eras: ['transformer_era', 'generative_ai'],
    introduction:
      'The Transformer architecture replaced recurrent constraints with self-attention, unlocking massive pre-training on global web corpora. Scaling laws demonstrated predictable capability gains, culminating in conversational foundation models, diffusion generation, and deliberate chain-of-thought test-time reasoning.',
    significance:
      'Transitioned artificial intelligence from narrow perceptual classifiers into general-purpose generative reasoning engines across code, text, and multimodal reasoning.',
  },
];

export const EditorialStorytelling: React.FC<EditorialStorytellingProps> = ({
  milestones,
  onSelectMilestone,
  onFocusTimeline,
}) => {
  const [activeChapterId, setActiveChapterId] = useState<string>('ch-foundations');

  const activeChapter = CHAPTERS.find((c) => c.id === activeChapterId) || CHAPTERS[0];

  // Milestones belonging to active chapter
  const chapterMilestones = milestones
    .filter((m) => activeChapter.eras.includes(m.era))
    .sort((a, b) => a.date_start.localeCompare(b.date_start));

  return (
    <section
      id="editorial-chronicles"
      style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '5rem 2rem 6rem',
        boxSizing: 'border-box',
      }}
    >
      {/* Editorial Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span
          style={{
            fontSize: '0.68rem',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#D6B875',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: '0.75rem',
          }}
        >
          <span style={{ width: 16, height: 1, background: '#D6B875' }} />
          CURATED HISTORIOGRAPHICAL CHRONICLES
          <span style={{ width: 16, height: 1, background: '#D6B875' }} />
        </span>
        <h2
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            fontWeight: 400,
            color: '#E8E2D5',
            fontFamily: "'Newsreader', Georgia, serif",
            margin: '0 0 1rem 0',
            letterSpacing: '-0.02em',
          }}
        >
          Five Epochs of Artificial Cognition
        </h2>
        <p
          style={{
            fontSize: '0.95rem',
            color: '#A6A197',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Follow the intellectual and empirical trajectory of artificial intelligence across seventy years of peer-reviewed breakthroughs, institutional crises, and paradigm transformations.
        </p>
      </div>

      {/* Chapter Selection Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '0.75rem',
          marginBottom: '2.5rem',
          borderBottom: '1px solid #302B20',
          paddingBottom: '1.5rem',
        }}
      >
        {CHAPTERS.map((ch) => {
          const isActive = ch.id === activeChapterId;
          return (
            <button
              key={ch.id}
              onClick={() => setActiveChapterId(ch.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                padding: '1rem 1.15rem',
                borderRadius: 4,
                background: isActive ? 'rgba(27, 28, 27, 0.95)' : 'rgba(18, 19, 19, 0.65)',
                border: `1px solid ${isActive ? ch.accentColor : '#302B20'}`,
                borderLeft: `3px solid ${isActive ? ch.accentColor : '#302B20'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = '#655334';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = '#302B20';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isActive ? ch.accentColor : '#77736A',
                    fontWeight: 600,
                  }}
                >
                  {ch.number}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#77736A', fontFamily: "'JetBrains Mono', monospace" }}>
                  {ch.years}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: isActive ? '#E8E2D5' : '#A6A197',
                  fontFamily: "'Newsreader', Georgia, serif",
                  lineHeight: 1.25,
                }}
              >
                {ch.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Chapter Presentation Stage */}
      <div
        style={{
          background: 'rgba(18, 19, 19, 0.85)',
          border: '1px solid #302B20',
          borderRadius: 6,
          padding: '2.5rem 2.25rem',
          marginBottom: '3rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', marginBottom: '2.25rem', borderBottom: '1px solid #302B20', paddingBottom: '2rem' }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: 3,
                  background: `${activeChapter.accentColor}18`,
                  color: activeChapter.accentColor,
                  border: `1px solid ${activeChapter.accentColor}40`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {activeChapter.number} • {activeChapter.years}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#77736A', fontStyle: 'italic' }}>
                {chapterMilestones.length} landmark records
              </span>
            </div>

            <h3
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                fontWeight: 500,
                color: '#E8E2D5',
                fontFamily: "'Newsreader', Georgia, serif",
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.015em',
              }}
            >
              {activeChapter.title}
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#D6B875', margin: '0 0 1.25rem 0', fontStyle: 'italic', fontFamily: "'Newsreader', Georgia, serif" }}>
              {activeChapter.subtitle}
            </p>

            <p style={{ fontSize: '0.9rem', color: '#E8E2D5', lineHeight: 1.7, margin: '0 0 1rem 0' }}>
              {activeChapter.introduction}
            </p>

            <div style={{ padding: '0.85rem 1.25rem', borderRadius: 4, background: 'rgba(27, 28, 27, 0.75)', borderLeft: `3px solid ${activeChapter.accentColor}`, fontSize: '0.82rem', color: '#A6A197', lineHeight: 1.6 }}>
              <strong style={{ color: '#E8E2D5' }}>Historical Significance: </strong>
              {activeChapter.significance}
            </div>
          </div>

          <button
            onClick={() => {
              onFocusTimeline();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              borderRadius: 4,
              background: 'rgba(214, 184, 117, 0.12)',
              border: '1px solid rgba(214, 184, 117, 0.4)',
              color: '#D6B875',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(214, 184, 117, 0.22)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(214, 184, 117, 0.12)';
            }}
          >
            <Compass size={15} />
            <span>Calibrate Orbit to Era</span>
          </button>
        </div>

        {/* Landmarks Showcase Grid */}
        <div>
          <h4
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#77736A',
              margin: '0 0 1.25rem 0',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
            }}
          >
            Peer-Reviewed Milestones in this Chapter
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {chapterMilestones.map((m) => {
              const year = extractYear(m.date_start);
              const era = ERA_CONFIG[m.era];
              return (
                <div
                  key={m.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 4,
                    background: 'rgba(27, 28, 27, 0.7)',
                    border: '1px solid #302B20',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = era?.color || '#D6B875';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#302B20';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: era?.color, fontFamily: "'JetBrains Mono', monospace" }}>
                        {year}
                      </span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 500,
                          padding: '2px 6px',
                          borderRadius: 3,
                          background: 'rgba(214, 184, 117, 0.12)',
                          color: '#D6B875',
                          border: '1px solid rgba(214, 184, 117, 0.35)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <ShieldCheck size={10} />
                        <span>{m.confidence}</span>
                      </span>
                    </div>

                    <h5
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        color: '#E8E2D5',
                        margin: '0 0 6px 0',
                        lineHeight: 1.3,
                        fontFamily: "'Newsreader', Georgia, serif",
                      }}
                    >
                      {m.title}
                    </h5>
                    <p style={{ fontSize: '0.8rem', color: '#A6A197', lineHeight: 1.55, margin: 0 }}>
                      {m.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #302B20' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: '#77736A' }}>
                      <Calendar size={11} />
                      <span>{formatMilestoneDate(m.date_start, m.date_precision)}</span>
                    </div>
                    <button
                      onClick={() => {
                        onSelectMilestone(m.id);
                        onFocusTimeline();
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#D6B875',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px 6px',
                      }}
                    >
                      <span>Locate in Orbit</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
