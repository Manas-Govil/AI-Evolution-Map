import React from 'react';
import { ShieldCheck, Database, GitBranch, CheckCircle2, FileCode2 } from 'lucide-react';

export const MethodologySection: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        background: 'var(--bg-primary)',
        padding: '1.5rem 2rem',
        gap: '1.5rem',
        maxWidth: 1000,
        margin: '0 auto',
      }}
    >
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 600, margin: 0, color: '#E8E2D5', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Newsreader', Georgia, serif" }}>
          <ShieldCheck size={22} style={{ color: '#D6B875' }} />
          <span>Methodology &amp; Data Quality Governance</span>
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Detailed architectural audit, reproducibility standards, and epistemological constraints governing the AI Evolution Map.
        </p>
      </div>

      {/* Grid of Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        {/* Section 1: Data Provenance & Pipeline */}
        <div style={{ padding: '1.25rem', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#E8E2D5', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Newsreader', Georgia, serif" }}>
            <Database size={15} style={{ color: '#D6B875' }} />
            <span>Deterministic 4-Step Pipeline</span>
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
            All derived artifacts are generated from raw, unedited source files via deterministic pipeline orchestration (<code>scripts/run_pipeline.py</code>):
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li><strong>Raw Ingestion:</strong> Preserves raw data sidecars (OpenAlex, arXiv, Hugging Face, Stanford HAI, Epoch AI).</li>
            <li><strong>Cleaning &amp; Normalization:</strong> Dates normalized with explicit precision; numerical metrics separated by inflation status.</li>
            <li><strong>Validation Suite:</strong> Schema constraints checked with Pydantic; referential integrity verified for all edge concepts and sources.</li>
            <li><strong>Frontend Export:</strong> Enveloped JSON, CSV, and Parquet exports generated with stable sorting and UTC ISO-8601 timestamps.</li>
          </ul>
        </div>

        {/* Section 2: Relationship Semantics */}
        <div style={{ padding: '1.25rem', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#E8E2D5', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Newsreader', Georgia, serif" }}>
            <GitBranch size={15} style={{ color: '#A98C52' }} />
            <span>Relationship Direction &amp; Epistemology</span>
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
            Relationships adhere to a strict directed grammar: <code>source_concept --relationship_type--&gt; target_concept</code>:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li><strong>Extends:</strong> Architectural evolution (e.g., <em>BERT extends Transformer</em>).</li>
            <li><strong>Uses:</strong> Algorithmic dependency (e.g., <em>CNN uses Backpropagation</em>, <em>GPT-3 uses Transformer</em>).</li>
            <li><strong>Influenced:</strong> Historical motivation (e.g., <em>Perceptron limitations influenced Backpropagation</em>).</li>
            <li><strong>Introduced:</strong> Direct foundational breakthrough (e.g., <em>Self-Attention introduced Transformer</em>).</li>
          </ul>
        </div>

        {/* Section 3: Empirical Metric Safeguards */}
        <div style={{ padding: '1.25rem', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#E8E2D5', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Newsreader', Georgia, serif" }}>
            <CheckCircle2 size={15} style={{ color: '#8F7044' }} />
            <span>Empirical Metric Guardrails</span>
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li><strong>No Inflation Mixing:</strong> Multi-year private investment is strictly constant 2021 US$ billions. Nominal values are isolated.</li>
            <li><strong>Sector Separation:</strong> Total systems, industry systems, and academia systems are reported as separate series without aggregation contamination.</li>
            <li><strong>Non-Zero Missingness:</strong> Missing data points are never defaulted to zero.</li>
            <li><strong>Non-Causal Representation:</strong> Metric trends and historical milestones are presented without fabricated causality.</li>
          </ul>
        </div>

        {/* Section 4: Audit & Verification Suite */}
        <div style={{ padding: '1.25rem', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#EDE6D8', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Newsreader', Georgia, serif" }}>
            <FileCode2 size={15} style={{ color: '#C9A86A' }} />
            <span>Verification Test Suite</span>
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
            The pipeline and dataset integrity are validated on every run:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li><strong>41 Backend Pytest Tests:</strong> Validating schemas, relationship semantics, determinism, and data contracts.</li>
            <li><strong>TypeScript Compilation:</strong> Zero-tolerance strict types across all React components.</li>
            <li><strong>Oxlint:</strong> Zero warnings and zero errors across the complete frontend codebase.</li>
            <li><strong>Reproducibility Script:</strong> Bit-for-bit equivalence checked over repeated execution passes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
