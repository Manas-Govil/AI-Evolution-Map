import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Milestone, Era } from '../../types/timeline';
import { ERA_CONFIG } from '../../data/eraConfig';
import { extractYear, formatMilestoneDate } from '../../data/timelineLoader';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ShieldCheck,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { Timeline, TimelineItem, TimelineDot, TimelineHeading, TimelineContent, TimelineLine } from './TimelineTree';

interface RadialOrbitalTimelineProps {
  milestones: Milestone[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  viewMode: 'orbital' | 'linear';
}

// Logical rings per historical era
const ringForEra = (era: Era): number => {
  switch (era) {
    case 'foundations':
    case 'birth':
      return 1;
    case 'first_winter':
    case 'expert_systems':
    case 'second_winter':
    case 'revival':
      return 2;
    case 'deep_learning':
    case 'transformer_era':
    case 'generative_ai':
      return 3;
    default:
      return 2;
  }
};

// Orbital mechanics configuration per concentric ring (Expanded scale)
interface RingConfig {
  ring: number;
  radius: number;
  label: string;
  speedDegPerSec: number;
  direction: 'cw' | 'ccw';
  description: string;
}

const RING_CONFIGS: Record<number, RingConfig> = {
  1: {
    ring: 1,
    radius: 260, // Inner Orbit (Foundations & Cybernetics)
    label: 'I. FOUNDATIONS & SYMBOLIC BIRTH (1950s)',
    speedDegPerSec: 1.5, // Clockwise (~240s period)
    direction: 'cw',
    description: 'Pioneering symbolic AI, cybernetics, and perceptrons',
  },
  2: {
    ring: 2,
    radius: 430, // Middle Orbit (Connectionism & Statistical Revival)
    label: 'II. CONNECTIONISM, EXPERT SYSTEMS & STATISTICAL REVIVAL (1980s–1990s)',
    speedDegPerSec: -1.0, // Counter-clockwise (~360s period)
    direction: 'ccw',
    description: 'Backpropagation, expert systems, and probabilistic models',
  },
  3: {
    ring: 3,
    radius: 600, // Outer Orbit (Deep Learning, Transformers & Frontier AI)
    label: 'III. DEEP LEARNING, GENERATIVE AI & FRONTIER REASONING (2010s–2026)',
    speedDegPerSec: 0.75, // Clockwise (~480s period)
    direction: 'cw',
    description: 'Transformers, diffusion, multimodal models & frontier reasoning',
  },
};

const ringRadii: Record<number, number> = {
  1: RING_CONFIGS[1].radius,
  2: RING_CONFIGS[2].radius,
  3: RING_CONFIGS[3].radius,
};

// Concentric astronomical framing tracks
const decorativeRings = [140, 260, 345, 430, 515, 600, 670];

const degToRad = (deg: number) => (deg * Math.PI) / 180;

function getFractionalYear(dateStart: string): number {
  const parts = dateStart.split('-');
  const year = parseInt(parts[0], 10);
  const month = parts.length > 1 ? parseInt(parts[1], 10) : 6;
  const day = parts.length > 2 ? parseInt(parts[2], 10) : 15;
  return year + (month - 1) / 12 + (day - 1) / 365;
}

interface MilestoneElementRefs {
  spokeLine: SVGLineElement | null;
  selectionCircle: SVGCircleElement | null;
  nodeOuterCircle: SVGCircleElement | null;
  nodeInnerCore: SVGCircleElement | null;
  labelGroup: SVGGElement | null;
  labelLeaderLine: SVGLineElement | null;
}

export const RadialOrbitalTimeline: React.FC<RadialOrbitalTimelineProps> = ({
  milestones,
  selectedId,
  onSelect,
  viewMode,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const systemPrefersReducedMotion = useMemo(() => {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  }, []);

  const [isPlaying, setIsPlaying] = useState<boolean>(!systemPrefersReducedMotion);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.0);

  // 60fps direct DOM manipulation refs
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const elapsedTimeRef = useRef<number>(0);
  const elementsMapRef = useRef<Record<string, MilestoneElementRefs>>({});

  const isPlayingRef = useRef<boolean>(isPlaying);
  const speedMultiplierRef = useRef<number>(speedMultiplier);
  const hoveredIdRef = useRef<string | null>(hoveredId);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    hoveredIdRef.current = hoveredId;
  }, [hoveredId]);

  const sorted = useMemo(() => {
    return [...milestones].sort((a, b) => a.date_start.localeCompare(b.date_start));
  }, [milestones]);

  const { minYear, maxYear } = useMemo(() => {
    const years = sorted.map((m) => extractYear(m.date_start));
    return {
      minYear: years.length ? Math.min(...years) : 1950,
      maxYear: years.length ? Math.max(...years) : 2026,
    };
  }, [sorted]);

  // Compute initial base angles with collision avoidance along each expanded ring
  const baseAngles = useMemo(() => {
    const span = maxYear - minYear || 1;
    const angles: Record<string, number> = {};

    const ringGroups: Record<number, Milestone[]> = { 1: [], 2: [], 3: [] };
    for (const m of sorted) {
      const ring = ringForEra(m.era);
      ringGroups[ring].push(m);
    }

    for (const [ringStr, group] of Object.entries(ringGroups)) {
      const ringNum = Number(ringStr);
      let lastAngle = -999;
      // Generous angular separation on expanded tracks
      const minSpacing = ringNum === 3 ? 18 : ringNum === 2 ? 24 : 30;

      for (let i = 0; i < group.length; i++) {
        const m = group[i];
        const fYear = getFractionalYear(m.date_start);
        const t = Math.max(0, Math.min(1, (fYear - minYear) / span));
        let computedAngle = -90 + t * 325;

        if (computedAngle - lastAngle < minSpacing) {
          computedAngle = lastAngle + minSpacing;
        }

        angles[m.id] = computedAngle;
        lastAngle = computedAngle;
      }
    }

    return angles;
  }, [sorted, minYear, maxYear]);

  // Staggered radial label distances to guarantee NO label collisions
  const labelDistances = useMemo(() => {
    const distances: Record<string, number> = {};
    const ringGroups: Record<number, Milestone[]> = { 1: [], 2: [], 3: [] };
    for (const m of sorted) {
      const ring = ringForEra(m.era);
      ringGroups[ring].push(m);
    }

    for (const [ringStr, group] of Object.entries(ringGroups)) {
      const ringNum = Number(ringStr);
      const R = ringRadii[ringNum];

      // Sort by angle
      const sortedGroup = [...group].sort((a, b) => (baseAngles[a.id] ?? 0) - (baseAngles[b.id] ?? 0));

      for (let i = 0; i < sortedGroup.length; i++) {
        const m = sortedGroup[i];
        const prev = sortedGroup[i - 1];
        const next = sortedGroup[i + 1];

        const currAngle = baseAngles[m.id] ?? 0;
        const prevAngle = prev ? (baseAngles[prev.id] ?? 0) : -999;
        const nextAngle = next ? (baseAngles[next.id] ?? 0) : 999;

        const isCloseToPrev = Math.abs(currAngle - prevAngle) < 28;
        const isCloseToNext = Math.abs(nextAngle - currAngle) < 28;

        if (isCloseToPrev && isCloseToNext) {
          // Triplet cluster: outer tier
          distances[m.id] = R + 88;
        } else if (i % 2 === 1 || isCloseToPrev) {
          // Inner offset
          distances[m.id] = R - 58;
        } else {
          // Outer offset
          distances[m.id] = R + 58;
        }
      }
    }

    return distances;
  }, [sorted, baseAngles]);

  const activeMilestone = useMemo(() => {
    const id = hoveredId || selectedId;
    return id ? sorted.find((m) => m.id === id) || null : null;
  }, [hoveredId, selectedId, sorted]);

  // Constellation stardust field sized for 1400x1400 canvas
  const cosmicStars = useMemo(() => {
    const stars: Array<{ id: number; x: number; y: number; r: number; opacity: number }> = [];
    for (let i = 0; i < 72; i++) {
      const angle = i * 137.5 * (Math.PI / 180);
      const radius = 120 + ((i * 47) % 560);
      const x = 700 + radius * Math.cos(angle);
      const y = 700 + radius * Math.sin(angle);
      const r = 0.7 + ((i * 7) % 10) * 0.1;
      const opacity = 0.12 + ((i * 13) % 10) * 0.04;
      stars.push({ id: i, x, y, r, opacity });
    }
    return stars;
  }, []);

  /* ─── EXPANDED VIEWBOX DIMENSIONS (Large-Scale 1400x1400 Canvas) ─── */
  const VB = 1400;
  const cx = VB / 2; // 700
  const cy = VB / 2; // 700

  // Calculate viewBox based on current zoom level
  const currentVBSize = VB / zoom;
  const vbX = (VB - currentVBSize) / 2;
  const vbY = (VB - currentVBSize) / 2;

  const calculatePosition = useCallback(
    (m: Milestone, elapsed: number) => {
      const ring = ringForEra(m.era);
      const ringConfig = RING_CONFIGS[ring];
      const R = ringConfig.radius;
      const baseAngle = baseAngles[m.id] ?? -90;

      const currentAngle = baseAngle + ringConfig.speedDegPerSec * elapsed;
      const rad = degToRad(currentAngle);

      const mx = cx + R * Math.cos(rad);
      const my = cy + R * Math.sin(rad);

      const labelDist = labelDistances[m.id] ?? (R + 62);
      const lx = cx + labelDist * Math.cos(rad);
      const ly = cy + labelDist * Math.sin(rad);

      return { mx, my, lx, ly, currentAngle };
    },
    [baseAngles, labelDistances, cx, cy]
  );

  useEffect(() => {
    if (viewMode !== 'orbital' || sorted.length === 0) return;

    const renderFrame = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (isPlayingRef.current && !hoveredIdRef.current) {
        elapsedTimeRef.current += dt * speedMultiplierRef.current;
      }

      const elapsed = elapsedTimeRef.current;

      sorted.forEach((m) => {
        const refs = elementsMapRef.current[m.id];
        if (!refs) return;

        const { mx, my, lx, ly } = calculatePosition(m, elapsed);

        if (refs.spokeLine) {
          refs.spokeLine.setAttribute('x2', mx.toFixed(1));
          refs.spokeLine.setAttribute('y2', my.toFixed(1));
        }

        if (refs.selectionCircle) {
          refs.selectionCircle.setAttribute('cx', mx.toFixed(1));
          refs.selectionCircle.setAttribute('cy', my.toFixed(1));
        }

        if (refs.nodeOuterCircle) {
          refs.nodeOuterCircle.setAttribute('cx', mx.toFixed(1));
          refs.nodeOuterCircle.setAttribute('cy', my.toFixed(1));
        }

        if (refs.nodeInnerCore) {
          refs.nodeInnerCore.setAttribute('cx', mx.toFixed(1));
          refs.nodeInnerCore.setAttribute('cy', my.toFixed(1));
        }

        if (refs.labelLeaderLine) {
          refs.labelLeaderLine.setAttribute('x1', mx.toFixed(1));
          refs.labelLeaderLine.setAttribute('y1', my.toFixed(1));
          refs.labelLeaderLine.setAttribute('x2', lx.toFixed(1));
          refs.labelLeaderLine.setAttribute('y2', ly.toFixed(1));
        }

        if (refs.labelGroup) {
          refs.labelGroup.setAttribute('transform', `translate(${lx.toFixed(1)}, ${ly.toFixed(1)})`);
        }
      });

      animFrameIdRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [viewMode, sorted, calculatePosition]);

  const handleResetAnimation = useCallback(() => {
    elapsedTimeRef.current = 0;
    sorted.forEach((m) => {
      const refs = elementsMapRef.current[m.id];
      if (!refs) return;
      const { mx, my, lx, ly } = calculatePosition(m, 0);
      if (refs.spokeLine) {
        refs.spokeLine.setAttribute('x2', mx.toFixed(1));
        refs.spokeLine.setAttribute('y2', my.toFixed(1));
      }
      if (refs.selectionCircle) {
        refs.selectionCircle.setAttribute('cx', mx.toFixed(1));
        refs.selectionCircle.setAttribute('cy', my.toFixed(1));
      }
      if (refs.nodeOuterCircle) {
        refs.nodeOuterCircle.setAttribute('cx', mx.toFixed(1));
        refs.nodeOuterCircle.setAttribute('cy', my.toFixed(1));
      }
      if (refs.nodeInnerCore) {
        refs.nodeInnerCore.setAttribute('cx', mx.toFixed(1));
        refs.nodeInnerCore.setAttribute('cy', my.toFixed(1));
      }
      if (refs.labelLeaderLine) {
        refs.labelLeaderLine.setAttribute('x1', mx.toFixed(1));
        refs.labelLeaderLine.setAttribute('y1', my.toFixed(1));
        refs.labelLeaderLine.setAttribute('x2', lx.toFixed(1));
        refs.labelLeaderLine.setAttribute('y2', ly.toFixed(1));
      }
      if (refs.labelGroup) {
        refs.labelGroup.setAttribute('transform', `translate(${lx.toFixed(1)}, ${ly.toFixed(1)})`);
      }
    });
  }, [sorted, calculatePosition]);

  const handleToggleSpeed = useCallback(() => {
    setSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : prev === 4 ? 0.5 : 1));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(2.2, +(z + 0.15).toFixed(2)));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.65, +(z - 0.15).toFixed(2)));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1.0);
  }, []);

  /* ─── LINEAR TIMELINE VIEW ─── */
  if (viewMode === 'linear') {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '1040px',
          margin: '0 auto',
          padding: '3rem 1.5rem',
          position: 'relative',
        }}
      >
        <Timeline>
          {sorted.map((m, idx) => {
            const era = ERA_CONFIG[m.era];
            const isSelected = selectedId === m.id;
            const isHovered = hoveredId === m.id;
            const year = extractYear(m.date_start);
            const isLast = idx === sorted.length - 1;

            return (
              <TimelineItem
                key={m.id}
                status={isSelected ? 'current' : 'default'}
                onClick={() => onSelect(m.id)}
                onMouseEnter={() => setHoveredId(m.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {!isLast && <TimelineLine color={isSelected ? era?.color : 'rgba(48, 43, 32, 0.6)'} />}
                <TimelineDot
                  color={era?.color || '#D6B875'}
                  glowColor={era?.glowColor}
                  status={isSelected || isHovered ? 'current' : 'default'}
                />
                <TimelineContent>
                  <div
                    style={{
                      background: isSelected ? 'rgba(27, 28, 27, 0.95)' : 'rgba(18, 19, 19, 0.85)',
                      border: `1px solid ${isSelected ? era?.color : '#302B20'}`,
                      borderLeft: `3px solid ${era?.color}`,
                      borderRadius: 6,
                      padding: '1.25rem 1.5rem',
                      backdropFilter: 'blur(10px)',
                      boxShadow: isSelected
                        ? `0 0 24px rgba(0,0,0,0.6), 0 0 12px ${era?.glowColor}`
                        : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D6B875', fontFamily: "'JetBrains Mono', monospace" }}>
                        {year}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: `${era?.color}15`,
                          color: era?.color,
                          border: `1px solid ${era?.color}35`,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {era?.label}
                      </span>
                    </div>

                    <TimelineHeading className="text-base text-stone-100 font-serif font-semibold mb-1" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                      {m.title}
                    </TimelineHeading>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#A6A197', lineHeight: 1.6 }}>
                      {m.description}
                    </p>
                  </div>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </div>
    );
  }

  /* ─── IMMERSIVE EXPANDED ORBITAL CANVAS (Primary Centerpiece) ─── */
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'clamp(580px, 75vh, 1020px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem 3rem',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Archival Astronomical Controls Dock (Zoom, Reset, Speed, Playback) */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(18, 19, 19, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid #302B20',
          borderRadius: 6,
          padding: '6px 12px',
          zIndex: 20,
          boxShadow: '0 8px 28px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Play/Pause Orbit Motion */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause orbital motion' : 'Resume orbital motion'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: isPlaying ? 'rgba(214, 184, 117, 0.15)' : 'rgba(146, 91, 73, 0.18)',
            border: `1px solid ${isPlaying ? 'rgba(214, 184, 117, 0.45)' : 'rgba(146, 91, 73, 0.45)'}`,
            borderRadius: 4,
            padding: '5px 12px',
            color: isPlaying ? '#D6B875' : '#925B49',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          <span>{isPlaying ? 'Continuous Orbit' : 'Paused'}</span>
        </button>

        {/* Speed Multiplier */}
        <button
          onClick={handleToggleSpeed}
          title={`Cycle orbital speed (Current: ${speedMultiplier}x)`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(27, 28, 27, 0.6)',
            border: '1px solid #302B20',
            borderRadius: 4,
            padding: '5px 10px',
            color: '#A6A197',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <FastForward size={12} style={{ color: '#D6B875' }} />
          <span>{speedMultiplier}x</span>
        </button>

        <div style={{ width: 1, height: 16, background: '#302B20' }} />

        {/* Zoom Controls */}
        <button
          onClick={handleZoomIn}
          title="Zoom In (+15%)"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(27, 28, 27, 0.6)',
            border: '1px solid #302B20',
            borderRadius: 4,
            padding: 6,
            color: '#E8E2D5',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <ZoomIn size={14} />
        </button>

        <button
          onClick={handleZoomOut}
          title="Zoom Out (-15%)"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(27, 28, 27, 0.6)',
            border: '1px solid #302B20',
            borderRadius: 4,
            padding: 6,
            color: '#E8E2D5',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <ZoomOut size={14} />
        </button>

        <button
          onClick={handleResetZoom}
          title="Fit to Screen (100%)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(27, 28, 27, 0.6)',
            border: '1px solid #302B20',
            borderRadius: 4,
            padding: '5px 9px',
            color: zoom === 1.0 ? '#D6B875' : '#A6A197',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <Maximize2 size={12} />
          <span>{Math.round(zoom * 100)}%</span>
        </button>

        {/* Reset Animation & Coordinates */}
        <button
          onClick={() => {
            handleResetAnimation();
            handleResetZoom();
          }}
          title="Reset orbits and view to initial epoch"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'transparent',
            border: '1px solid #302B20',
            borderRadius: 4,
            padding: '5px 10px',
            color: '#77736A',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>

        {systemPrefersReducedMotion && (
          <span
            style={{
              fontSize: '0.68rem',
              color: '#D6B875',
              padding: '3px 8px',
              borderRadius: 3,
              background: 'rgba(214, 184, 117, 0.12)',
              border: '1px solid rgba(214, 184, 117, 0.35)',
            }}
          >
            Reduced Motion
          </span>
        )}
      </div>

      {/* Balanced Medium-Large SVG Visualization Canvas (~70–75% content width, max 980px) */}
      <svg
        viewBox={`${vbX} ${vbY} ${currentVBSize} ${currentVBSize}`}
        style={{
          width: 'min(72vw, 980px)',
          height: 'min(72vw, 980px)',
          maxWidth: '980px',
          maxHeight: '980px',
          aspectRatio: '1 / 1',
          margin: '0 auto',
          display: 'block',
          userSelect: 'none',
          overflow: 'visible',
          transition: 'viewBox 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <defs>
          {/* Subtle Breathing Core Glow — Antique Horological Gilt */}
          <radialGradient id="celestial-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(214, 184, 117, 0.45)" />
            <stop offset="35%" stopColor="rgba(214, 184, 117, 0.15)" />
            <stop offset="100%" stopColor="rgba(8, 9, 9, 0)" />
          </radialGradient>

          {/* Faint Orbital Path Glow */}
          <radialGradient id="orbital-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(143, 112, 68, 0.08)" />
            <stop offset="70%" stopColor="rgba(214, 184, 117, 0.04)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {sorted.map((m) => {
            const era = ERA_CONFIG[m.era];
            return (
              <filter key={`glow-${m.id}`} id={`glow-${m.id}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feFlood floodColor={era?.color || '#D6B875'} floodOpacity="0.4" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            );
          })}
        </defs>

        {/* Ambient Orbital Disc Halo */}
        <circle cx={cx} cy={cy} r={670} fill="url(#orbital-halo)" />

        {/* Constellation Stardust Field */}
        <g opacity={0.65}>
          {cosmicStars.map((star) => (
            <circle
              key={star.id}
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill="#77736A"
              opacity={star.opacity}
            />
          ))}
        </g>

        {/* Concentric Astronomical Tracks */}
        {decorativeRings.map((r, i) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={i % 2 === 1 ? 'rgba(214, 184, 117, 0.28)' : 'rgba(48, 43, 32, 0.65)'}
            strokeWidth={i % 2 === 1 ? 1.4 : 0.9}
            strokeDasharray={i % 2 === 1 ? '6 8' : undefined}
          />
        ))}

        {/* Cardinal Crosshair Coordinates */}
        <line x1={cx - 670} y1={cy} x2={cx + 670} y2={cy} stroke="rgba(48, 43, 32, 0.35)" strokeWidth={0.8} />
        <line x1={cx} y1={cy - 670} x2={cx} y2={cy + 670} stroke="rgba(48, 43, 32, 0.35)" strokeWidth={0.8} />

        {/* Dynamic Directional Rotation Cues on Active Era Tracks */}
        <g opacity={0.45}>
          <circle
            cx={cx}
            cy={cy}
            r={ringRadii[1]}
            fill="none"
            stroke="rgba(214, 184, 117, 0.4)"
            strokeWidth={1.5}
            strokeDasharray="12 60"
            style={{
              animation: isPlaying ? 'orbitSpinCW 160s linear infinite' : 'none',
              transformOrigin: `${cx}px ${cy}px`,
            }}
          />
          <circle
            cx={cx}
            cy={cy}
            r={ringRadii[2]}
            fill="none"
            stroke="rgba(143, 112, 68, 0.4)"
            strokeWidth={1.5}
            strokeDasharray="14 80"
            style={{
              animation: isPlaying ? 'orbitSpinCCW 240s linear infinite' : 'none',
              transformOrigin: `${cx}px ${cy}px`,
            }}
          />
          <circle
            cx={cx}
            cy={cy}
            r={ringRadii[3]}
            fill="none"
            stroke="rgba(214, 184, 117, 0.45)"
            strokeWidth={1.5}
            strokeDasharray="16 100"
            style={{
              animation: isPlaying ? 'orbitSpinCW 340s linear infinite' : 'none',
              transformOrigin: `${cx}px ${cy}px`,
            }}
          />
        </g>

        {/* ─── MASTER HOROLOGY ASTRONOMICAL ORIGIN (Centerpiece Instrument) ─── */}
        <g style={{ cursor: 'pointer' }} onClick={handleResetAnimation}>
          {/* Outer Breathing Radial Halo */}
          <circle
            cx={cx}
            cy={cy}
            r={110}
            fill="url(#celestial-core)"
            style={{ animation: 'coreBreathe 7s ease-in-out infinite' }}
          />

          {/* Outer Engraved Astrolabe Bezel */}
          <circle
            cx={cx}
            cy={cy}
            r={72}
            fill="none"
            stroke="rgba(214, 184, 117, 0.4)"
            strokeWidth={1.2}
            strokeDasharray="4 6"
            style={{
              animation: isPlaying ? 'orbitSpinCW 180s linear infinite' : 'none',
              transformOrigin: `${cx}px ${cy}px`,
            }}
          />

          {/* Cardinal Compass Tick Marks */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
            const rad = degToRad(deg);
            const isCardinal = deg % 90 === 0;
            const r1 = isCardinal ? 52 : 55;
            const r2 = 60;
            return (
              <line
                key={`tick-${deg}`}
                x1={cx + r1 * Math.cos(rad)}
                y1={cy + r1 * Math.sin(rad)}
                x2={cx + r2 * Math.cos(rad)}
                y2={cy + r2 * Math.sin(rad)}
                stroke={isCardinal ? '#D6B875' : 'rgba(101, 83, 52, 0.6)'}
                strokeWidth={isCardinal ? 1.6 : 0.9}
              />
            );
          })}

          {/* Inner Instrument Bezel */}
          <circle
            cx={cx}
            cy={cy}
            r={52}
            fill="#121313"
            stroke="#D6B875"
            strokeWidth={2}
          />

          {/* Secondary Gold Inset Ring */}
          <circle
            cx={cx}
            cy={cy}
            r={45}
            fill="none"
            stroke="rgba(214, 184, 117, 0.35)"
            strokeWidth={1}
          />

          {/* Central Compass Crosshairs */}
          <line x1={cx - 16} y1={cy} x2={cx + 16} y2={cy} stroke="#D6B875" strokeWidth={1.2} />
          <line x1={cx} y1={cy - 16} x2={cx} y2={cy + 16} stroke="#D6B875" strokeWidth={1.2} />
          <circle cx={cx} cy={cy} r={3.5} fill="#D6B875" />

          {/* Center Instrument Typography */}
          <text
            x={cx}
            y={cy + 22}
            textAnchor="middle"
            fill="#E8E2D5"
            fontSize={13.5}
            fontWeight={600}
            letterSpacing={3.0}
            fontFamily="'Newsreader', Georgia, serif"
          >
            ORIGIN
          </text>
          <text
            x={cx}
            y={cy + 35}
            textAnchor="middle"
            fill="#D6B875"
            fontSize={11}
            fontWeight={600}
            fontFamily="'JetBrains Mono', monospace"
          >
            1950
          </text>
        </g>

        {/* Ring Era Header Labels (Clean Typography & Monospace) */}
        <text
          x={cx}
          y={cy - ringRadii[1] + 24}
          textAnchor="middle"
          fill="rgba(166, 161, 151, 0.85)"
          fontSize={13.5}
          letterSpacing={2.2}
          fontWeight={600}
          fontFamily="'JetBrains Mono', monospace"
        >
          I. FOUNDATIONS &amp; CYBERNETICS (1940s–1950s)
        </text>
        <text
          x={cx}
          y={cy - ringRadii[2] + 24}
          textAnchor="middle"
          fill="rgba(166, 161, 151, 0.85)"
          fontSize={13.5}
          letterSpacing={2.2}
          fontWeight={600}
          fontFamily="'JetBrains Mono', monospace"
        >
          II. CONNECTIONISM, EXPERT SYSTEMS &amp; REVIVAL (1980s–1990s)
        </text>
        <text
          x={cx}
          y={cy - ringRadii[3] + 24}
          textAnchor="middle"
          fill="rgba(166, 161, 151, 0.85)"
          fontSize={13.5}
          letterSpacing={2.2}
          fontWeight={600}
          fontFamily="'JetBrains Mono', monospace"
        >
          III. DEEP LEARNING, GENERATIVE AI &amp; REASONING (2010s–2026)
        </text>

        {/* Milestones on Animated Orbital Paths */}
        {sorted.map((m) => {
          const year = extractYear(m.date_start);
          const initialPos = calculatePosition(m, 0);
          const era = ERA_CONFIG[m.era];
          const isSelected = selectedId === m.id;
          const isHovered = hoveredId === m.id;

          // Full readable title up to 28 characters
          const displayTitle = m.title.length > 28 ? `${m.title.slice(0, 26)}…` : m.title;

          return (
            <g
              key={m.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(m.id)}
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Radial Spoke to Center Origin */}
              <line
                ref={(el) => {
                  if (!elementsMapRef.current[m.id]) {
                    elementsMapRef.current[m.id] = {
                      spokeLine: null,
                      selectionCircle: null,
                      nodeOuterCircle: null,
                      nodeInnerCore: null,
                      labelGroup: null,
                      labelLeaderLine: null,
                    };
                  }
                  elementsMapRef.current[m.id].spokeLine = el;
                }}
                x1={cx}
                y1={cy}
                x2={initialPos.mx}
                y2={initialPos.my}
                stroke={isSelected || isHovered ? '#D6B875' : 'rgba(48, 43, 32, 0.55)'}
                strokeWidth={isSelected || isHovered ? 2.0 : 1.0}
                strokeDasharray="4 4"
                style={{ transition: 'stroke 0.2s ease, stroke-width 0.2s ease' }}
              />

              {/* Dynamic Leader Line Connecting Node to Label Tag */}
              <line
                ref={(el) => {
                  if (elementsMapRef.current[m.id]) {
                    elementsMapRef.current[m.id].labelLeaderLine = el;
                  }
                }}
                x1={initialPos.mx}
                y1={initialPos.my}
                x2={initialPos.lx}
                y2={initialPos.ly}
                stroke={isSelected || isHovered ? '#D6B875' : 'rgba(101, 83, 52, 0.75)'}
                strokeWidth={isSelected || isHovered ? 1.8 : 1.2}
                strokeDasharray={isSelected || isHovered ? undefined : '3 3'}
              />

              {/* Selection Astronomical Reticle */}
              {(isSelected || isHovered) && (
                <circle
                  ref={(el) => {
                    if (elementsMapRef.current[m.id]) {
                      elementsMapRef.current[m.id].selectionCircle = el;
                    }
                  }}
                  cx={initialPos.mx}
                  cy={initialPos.my}
                  r={40}
                  fill="none"
                  stroke="#D6B875"
                  strokeWidth={2.2}
                  strokeDasharray="6 4"
                  opacity={0.9}
                  style={{
                    animation: 'orbitSpinCW 12s linear infinite',
                    transformOrigin: `${initialPos.mx}px ${initialPos.my}px`,
                  }}
                />
              )}

              {/* Milestone Node Outer Housing (Comfortably Interactive 20–26px scale) */}
              <circle
                ref={(el) => {
                  if (elementsMapRef.current[m.id]) {
                    elementsMapRef.current[m.id].nodeOuterCircle = el;
                  }
                }}
                cx={initialPos.mx}
                cy={initialPos.my}
                r={isSelected ? 26 : isHovered ? 24 : 20}
                fill="#121313"
                stroke={isSelected || isHovered ? '#D6B875' : era?.color}
                strokeWidth={isSelected ? 3.8 : isHovered ? 3.2 : 2.6}
                filter={isSelected || isHovered ? `url(#glow-${m.id})` : undefined}
                style={{
                  transition: 'r 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.2s ease',
                }}
              />

              {/* Milestone Node Inner Core (Warm Ivory / Gold) */}
              <circle
                ref={(el) => {
                  if (elementsMapRef.current[m.id]) {
                    elementsMapRef.current[m.id].nodeInnerCore = el;
                  }
                }}
                cx={initialPos.mx}
                cy={initialPos.my}
                r={isSelected ? 10 : isHovered ? 9 : 8}
                fill={isSelected || isHovered ? '#E8E2D5' : era?.color}
                style={{
                  transition: 'r 0.2s ease, fill 0.2s ease',
                  opacity: 0.95,
                }}
              />

              {/* Readable Horizontal Milestone Label Tag on Orbit (Clear Typography & Sizing) */}
              <g
                ref={(el) => {
                  if (elementsMapRef.current[m.id]) {
                    elementsMapRef.current[m.id].labelGroup = el;
                  }
                }}
                transform={`translate(${initialPos.lx}, ${initialPos.ly})`}
              >
                <rect
                  x={isSelected || isHovered ? -155 : -140}
                  y={isSelected || isHovered ? -22 : -20}
                  width={isSelected || isHovered ? 310 : 280}
                  height={isSelected || isHovered ? 44 : 40}
                  rx={6}
                  fill={isSelected ? 'rgba(27, 28, 27, 0.98)' : isHovered ? 'rgba(27, 28, 27, 0.96)' : 'rgba(18, 19, 19, 0.94)'}
                  stroke={isSelected || isHovered ? '#D6B875' : '#302B20'}
                  strokeWidth={isSelected || isHovered ? 1.6 : 1.0}
                  style={{
                    filter: isSelected || isHovered ? 'drop-shadow(0 4px 16px rgba(0,0,0,0.8))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))',
                    transition: 'all 0.15s ease',
                  }}
                />
                <text
                  textAnchor="middle"
                  y={6}
                  fill={isSelected || isHovered ? '#E8E2D5' : '#A6A197'}
                  fontSize={20}
                  fontWeight={isSelected || isHovered ? 600 : 500}
                  fontFamily="'Inter', sans-serif"
                >
                  <tspan fill="#D6B875" fontWeight={600} fontFamily="'JetBrains Mono', monospace" fontSize={19.5}>
                    {year}
                  </tspan>
                  <tspan fill="#77736A"> • </tspan>
                  {displayTitle}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Floating Center Inspection Card (Active Milestone Overview) */}
      <AnimatePresence>
        {activeMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: 640,
              width: '92%',
              background: 'rgba(18, 19, 19, 0.98)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${ERA_CONFIG[activeMilestone.era]?.color || '#302B20'}`,
              borderRadius: 6,
              padding: '1.4rem 1.75rem',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.85), 0 0 18px rgba(214, 184, 117, 0.12)',
              zIndex: 30,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '3px 9px',
                  borderRadius: 3,
                  background: `${ERA_CONFIG[activeMilestone.era]?.color}15`,
                  color: ERA_CONFIG[activeMilestone.era]?.color,
                  border: `1px solid ${ERA_CONFIG[activeMilestone.era]?.color}40`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {ERA_CONFIG[activeMilestone.era]?.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#A6A197' }}>
                <Calendar size={13} style={{ color: '#D6B875' }} />
                <span>{formatMilestoneDate(activeMilestone.date_start, activeMilestone.date_precision)}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#E8E2D5', margin: '0 0 8px 0', lineHeight: 1.3, fontFamily: "'Newsreader', Georgia, serif" }}>
              {activeMilestone.title}
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#A6A197', lineHeight: 1.6, margin: '0 0 12px 0' }}>
              {activeMilestone.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #302B20' }}>
              <div style={{ fontSize: '0.72rem', color: '#77736A', display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShieldCheck size={13} style={{ color: '#D6B875' }} />
                <span>Verified Historical Landmark ({activeMilestone.confidence})</span>
              </div>
              <button
                onClick={() => onSelect(activeMilestone.id)}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#D6B875',
                  background: 'rgba(214, 184, 117, 0.12)',
                  border: '1px solid rgba(214, 184, 117, 0.35)',
                  padding: '5px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(214, 184, 117, 0.22)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(214, 184, 117, 0.12)';
                }}
              >
                <span>Inspect Archive Dossier</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
