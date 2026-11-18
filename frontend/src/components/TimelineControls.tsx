import React from 'react';
import type { Era } from '../types/timeline';
import { ERA_CONFIG, ALL_ERAS } from '../data/eraConfig';
import { Search, RotateCcw, Orbit, AlignLeft } from 'lucide-react';

interface TimelineControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedEra: Era | 'all';
  onEraChange: (era: Era | 'all') => void;
  yearRange: [number, number];
  onYearRangeChange: (range: [number, number]) => void;
  minPossibleYear: number;
  maxPossibleYear: number;
  filteredCount: number;
  totalCount: number;
  onReset: () => void;
  viewMode: 'orbital' | 'linear';
  onViewModeToggle: () => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  searchQuery,
  onSearchChange,
  selectedEra,
  onEraChange,
  yearRange,
  onYearRangeChange,
  minPossibleYear,
  maxPossibleYear,
  filteredCount,
  totalCount,
  onReset,
  viewMode,
  onViewModeToggle,
}) => {
  return (
    <div
      style={{
        background: 'rgba(18, 19, 19, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #302B20',
        padding: '0.875rem 1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        zIndex: 25,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Bar: Search, Mode Switcher, Reset, Count */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', width: 320, maxWidth: '100%' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#77736A',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search milestones, concepts, descriptions..."
            style={{
              width: '100%',
              paddingLeft: 34,
              paddingRight: 28,
              paddingTop: 7,
              paddingBottom: 7,
              fontSize: '0.8rem',
              borderRadius: 6,
              background: 'rgba(27, 28, 27, 0.85)',
              border: '1px solid #302B20',
              color: '#E8E2D5',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#77736A',
                background: 'none',
                border: 'none',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* View Switcher, Reset, and Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Mode Switcher */}
          <button
            onClick={onViewModeToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              background: 'rgba(27, 28, 27, 0.75)',
              border: '1px solid #302B20',
              color: '#A6A197',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {viewMode === 'orbital' ? (
              <>
                <AlignLeft size={14} style={{ color: '#D6B875' }} />
                <span>Linear View</span>
              </>
            ) : (
              <>
                <Orbit size={14} style={{ color: '#D6B875' }} />
                <span>Orbital View</span>
              </>
            )}
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              background: 'rgba(27, 28, 27, 0.75)',
              border: '1px solid #302B20',
              color: '#77736A',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          {/* Record Count Badge */}
          <div
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              background: 'rgba(27, 28, 27, 0.9)',
              border: '1px solid #302B20',
              fontSize: '0.75rem',
              color: '#A6A197',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span style={{ fontWeight: 600, color: '#D6B875' }}>{filteredCount}</span> of {totalCount}
          </div>
        </div>
      </div>

      {/* Middle Bar: Era Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#77736A',
            marginRight: 4,
            flexShrink: 0,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Eras:
        </span>

        <button
          onClick={() => onEraChange('all')}
          style={{
            padding: '4px 12px',
            borderRadius: 4,
            fontSize: '0.72rem',
            fontWeight: 600,
            background: selectedEra === 'all' ? 'rgba(214, 184, 117, 0.15)' : 'rgba(27, 28, 27, 0.6)',
            color: selectedEra === 'all' ? '#D6B875' : '#77736A',
            border: `1px solid ${selectedEra === 'all' ? 'rgba(214, 184, 117, 0.45)' : '#302B20'}`,
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >
          All Eras ({totalCount})
        </button>

        {ALL_ERAS.map((eraKey) => {
          const era = ERA_CONFIG[eraKey];
          const isSelected = selectedEra === eraKey;
          return (
            <button
              key={eraKey}
              onClick={() => onEraChange(eraKey)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 12px',
                borderRadius: 4,
                fontSize: '0.72rem',
                fontWeight: 600,
                background: isSelected ? `${era.color}22` : 'rgba(27, 28, 27, 0.6)',
                color: isSelected ? era.color : '#77736A',
                border: `1px solid ${isSelected ? era.color : '#302B20'}`,
                boxShadow: isSelected ? `0 0 10px ${era.glowColor}` : 'none',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s',
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
              <span>{era.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Bar: Year Range Slider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingTop: 2,
        }}
      >
        <span style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: '#77736A' }}>
          {minPossibleYear}
        </span>
        <input
          type="range"
          min={minPossibleYear}
          max={maxPossibleYear}
          value={yearRange[0]}
          onChange={(e) => onYearRangeChange([parseInt(e.target.value, 10), yearRange[1]])}
          style={{ flex: 1, accentColor: '#D6B875', cursor: 'pointer' }}
        />
        <span
          style={{
            fontSize: '0.75rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            color: '#D6B875',
            padding: '2px 8px',
            borderRadius: 4,
            background: 'rgba(27, 28, 27, 0.9)',
            border: '1px solid #302B20',
            flexShrink: 0,
          }}
        >
          {yearRange[0]} — {yearRange[1]}
        </span>
        <input
          type="range"
          min={minPossibleYear}
          max={maxPossibleYear}
          value={yearRange[1]}
          onChange={(e) => onYearRangeChange([yearRange[0], parseInt(e.target.value, 10)])}
          style={{ flex: 1, accentColor: '#D6B875', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: '#77736A' }}>
          {maxPossibleYear}
        </span>
      </div>
    </div>
  );
};
