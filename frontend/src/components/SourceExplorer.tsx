import React, { useState } from 'react';
import type { ResearchSource } from '../types/timeline';
import { BookOpen, ExternalLink, Search, Calendar } from 'lucide-react';

interface SourceExplorerProps {
  sources: Record<string, ResearchSource>;
}

export const SourceExplorer: React.FC<SourceExplorerProps> = ({ sources }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const sourceList = Object.values(sources);

  // Available source types
  const sourceTypes = Array.from(new Set(sourceList.map((s) => s.source_type)));

  // Filter sources
  const filteredSources = sourceList.filter((s) => {
    if (selectedType !== 'all' && s.source_type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const text = `${s.title} ${s.publisher || ''} ${s.authors?.join(' ') || ''} ${s.id}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        background: 'var(--bg-primary)',
        padding: '1.25rem 2rem',
        gap: '1.25rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: '#E8E2D5', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Newsreader', Georgia, serif" }}>
            <BookOpen size={20} style={{ color: '#D6B875' }} />
            <span>Research Sources &amp; Provenance Explorer</span>
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Primary papers, benchmark reports, and archives backing historical milestones and concepts.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sources by title, author..."
            style={{
              width: '100%',
              paddingLeft: 32,
              paddingRight: 24,
              paddingTop: 6,
              paddingBottom: 6,
              fontSize: '0.8rem',
              borderRadius: 6,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setSelectedType('all')}
          style={{
            padding: '4px 12px',
            borderRadius: 4,
            fontSize: '0.75rem',
            fontWeight: 600,
            background: selectedType === 'all' ? 'rgba(214, 184, 117, 0.15)' : 'var(--bg-secondary)',
            color: selectedType === 'all' ? '#D6B875' : 'var(--text-secondary)',
            border: `1px solid ${selectedType === 'all' ? 'rgba(214, 184, 117, 0.45)' : 'var(--border-primary)'}`,
            cursor: 'pointer',
          }}
        >
          All Sources ({sourceList.length})
        </button>
        {sourceTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 600,
              background: selectedType === type ? 'rgba(214, 184, 117, 0.15)' : 'var(--bg-secondary)',
              color: selectedType === type ? '#D6B875' : 'var(--text-secondary)',
              border: `1px solid ${selectedType === type ? 'rgba(214, 184, 117, 0.45)' : 'var(--border-primary)'}`,
              textTransform: 'capitalize',
              cursor: 'pointer',
            }}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Sources Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
        {filteredSources.map((source) => (
          <div
            key={source.id}
            style={{
              padding: '1.25rem',
              borderRadius: 6,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(214, 184, 117, 0.12)',
                    color: '#D6B875',
                    border: '1px solid rgba(214, 184, 117, 0.35)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {source.source_type.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  {source.id}
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 6px 0', color: '#E8E2D5', lineHeight: 1.35, fontFamily: "'Newsreader', Georgia, serif" }}>
                {source.title}
              </h3>
              {source.authors && (
                <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Authors:</strong> {source.authors.join(', ')}
                </p>
              )}
              {source.publisher && (
                <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <strong>Venue / Publisher:</strong> {source.publisher}
                </p>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <Calendar size={12} />
                <span>{source.publication_date || 'Undated'}</span>
              </div>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#D6B875',
                  }}
                >
                  <span>Read Publication</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
