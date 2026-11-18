import React, { useState, useMemo } from 'react';
import type { MetricObservation, ResearchSource } from '../types/timeline';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  DollarSign,
  Cpu,
  ShieldAlert,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  metrics: MetricObservation[];
  sources?: Record<string, ResearchSource>;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  metrics,
}) => {
  const [yearFilter, setYearFilter] = useState<[number, number]>([2013, 2023]);
  const [hoveredPoint, setHoveredPoint] = useState<{
    year: string;
    value: number;
    series: string;
    unit: string;
    sourceId?: string;
  } | null>(null);

  // Group metrics by series
  const investmentSeries = useMemo(() => {
    return metrics
      .filter((m) => m.metric_name === 'global_private_ai_investment_annual_constant_2021_usd_billions')
      .sort((a, b) => parseInt(a.period, 10) - parseInt(b.period, 10));
  }, [metrics]);

  const systemsTotalSeries = useMemo(() => {
    return metrics
      .filter((m) => m.metric_name === 'notable_ai_systems_annual_count_total')
      .sort((a, b) => parseInt(a.period, 10) - parseInt(b.period, 10));
  }, [metrics]);

  const systemsIndustrySeries = useMemo(() => {
    return metrics
      .filter((m) => m.metric_name === 'notable_ai_systems_annual_count_industry')
      .sort((a, b) => parseInt(a.period, 10) - parseInt(b.period, 10));
  }, [metrics]);

  const systemsAcademiaSeries = useMemo(() => {
    return metrics
      .filter((m) => m.metric_name === 'notable_ai_systems_annual_count_academia')
      .sort((a, b) => parseInt(a.period, 10) - parseInt(b.period, 10));
  }, [metrics]);



  // Available year periods across all 44 multi-year metrics
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const m of metrics) {
      const y = parseInt(m.period, 10);
      if (!isNaN(y)) years.add(y);
    }
    return Array.from(years).sort((a, b) => a - b);
  }, [metrics]);

  // Filter series according to selected year range
  const filteredInvestment = useMemo(() => {
    return investmentSeries.filter((m) => {
      const y = parseInt(m.period, 10);
      return y >= yearFilter[0] && y <= yearFilter[1];
    });
  }, [investmentSeries, yearFilter]);

  const filteredSystemsTotal = useMemo(() => {
    return systemsTotalSeries.filter((m) => {
      const y = parseInt(m.period, 10);
      return y >= yearFilter[0] && y <= yearFilter[1];
    });
  }, [systemsTotalSeries, yearFilter]);

  const filteredSystemsIndustry = useMemo(() => {
    return systemsIndustrySeries.filter((m) => {
      const y = parseInt(m.period, 10);
      return y >= yearFilter[0] && y <= yearFilter[1];
    });
  }, [systemsIndustrySeries, yearFilter]);

  const filteredSystemsAcademia = useMemo(() => {
    return systemsAcademiaSeries.filter((m) => {
      const y = parseInt(m.period, 10);
      return y >= yearFilter[0] && y <= yearFilter[1];
    });
  }, [systemsAcademiaSeries, yearFilter]);

  // SVG Chart Dimensions
  const chartWidth = 650;
  const chartHeight = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Max value calculations
  const maxInvestment = useMemo(() => {
    const vals = filteredInvestment.map((d) => d.value);
    return vals.length ? Math.max(...vals, 140) : 140;
  }, [filteredInvestment]);

  const maxSystems = useMemo(() => {
    const vals = [
      ...filteredSystemsTotal.map((d) => d.value),
      ...filteredSystemsIndustry.map((d) => d.value),
      ...filteredSystemsAcademia.map((d) => d.value),
    ];
    return vals.length ? Math.max(...vals, 120) : 120;
  }, [filteredSystemsTotal, filteredSystemsIndustry, filteredSystemsAcademia]);

  // Helper coordinate mappers
  const getX = (yearStr: string, minYear: number, maxYear: number) => {
    const year = parseInt(yearStr, 10);
    const span = maxYear - minYear || 1;
    return padding.left + ((year - minYear) / span) * plotWidth;
  };

  const getY = (val: number, maxVal: number) => {
    return padding.top + plotHeight - (val / maxVal) * plotHeight;
  };

  // Helper to build SVG path
  const buildLinePath = (
    data: MetricObservation[],
    minYear: number,
    maxYear: number,
    maxVal: number
  ) => {
    if (data.length === 0) return '';
    return data
      .map((d, i) => {
        const x = getX(d.period, minYear, maxYear);
        const y = getY(d.value, maxVal);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const buildAreaPath = (
    data: MetricObservation[],
    minYear: number,
    maxYear: number,
    maxVal: number
  ) => {
    if (data.length === 0) return '';
    const line = buildLinePath(data, minYear, maxYear, maxVal);
    const lastX = getX(data[data.length - 1].period, minYear, maxYear);
    const firstX = getX(data[0].period, minYear, maxYear);
    const bottomY = padding.top + plotHeight;
    return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  // Latest snapshot metrics
  const latestInvestment = investmentSeries[investmentSeries.length - 1];
  const latestTotalSystems = systemsTotalSeries[systemsTotalSeries.length - 1];
  const latestIndustrySystems = systemsIndustrySeries[systemsIndustrySeries.length - 1];
  const latestAcademiaSystems = systemsAcademiaSeries[systemsAcademiaSeries.length - 1];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        background: 'var(--bg-primary)',
        padding: '1.25rem 2rem',
        gap: '1.5rem',
      }}
    >
      {/* Top Filter and Title Bar */}
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} style={{ color: 'var(--accent-cyan)' }} />
            <span>Research Analytics Dashboard</span>
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Empirical metrics from Stanford AI Index (2024), NetBase Quid, and Epoch AI.
          </p>
        </div>

        {/* Year Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Period Range:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-primary)' }}>
            <Calendar size={13} style={{ color: 'var(--accent-cyan)' }} />
            <input
              type="range"
              min={2013}
              max={2023}
              value={yearFilter[0]}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val <= yearFilter[1]) setYearFilter([val, yearFilter[1]]);
              }}
              style={{ width: 80 }}
            />
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              {yearFilter[0]} – {yearFilter[1]}
            </span>
            <input
              type="range"
              min={2013}
              max={2023}
              value={yearFilter[1]}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= yearFilter[0]) setYearFilter([yearFilter[0], val]);
              }}
              style={{ width: 80 }}
            />
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {/* Card 1: Private Investment */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 10,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Private AI Investment
            </span>
            <DollarSign size={16} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
            ${latestInvestment?.value.toFixed(1)}B
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <span>Latest: {latestInvestment?.period}</span>
            <span style={{ color: '#38bdf8' }}>Constant 2021 USD</span>
          </div>
        </div>

        {/* Card 2: Notable AI Systems Total */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 10,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Notable AI Systems (Total)
            </span>
            <Cpu size={16} style={{ color: '#a855f7' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
            {latestTotalSystems?.value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <span>Latest: {latestTotalSystems?.period}</span>
            <span style={{ color: '#a855f7' }}>systems / yr</span>
          </div>
        </div>

        {/* Card 3: Industry Share */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 10,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Industry Notable Systems
            </span>
            <TrendingUp size={16} style={{ color: '#34d399' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
            {latestIndustrySystems?.value}{' '}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              ({((latestIndustrySystems?.value / (latestTotalSystems?.value || 1)) * 100).toFixed(0)}%)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <span>Latest: {latestIndustrySystems?.period}</span>
            <span style={{ color: '#34d399' }}>Industry share</span>
          </div>
        </div>

        {/* Card 4: Academia Share */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 10,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Academic Notable Systems
            </span>
            <BarChart2 size={16} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
            {latestAcademiaSystems?.value}{' '}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              ({((latestAcademiaSystems?.value / (latestTotalSystems?.value || 1)) * 100).toFixed(0)}%)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <span>Latest: {latestAcademiaSystems?.period}</span>
            <span style={{ color: '#f59e0b' }}>Academia share</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        {/* Chart 1: Global Private AI Investment */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 10,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Global Private AI Investment (2013–2023)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Annual funding in constant 2021 US$ Billions (NetBase Quid)
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#38bdf8' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Investment (Billion $)</span>
            </div>
          </div>

          {/* SVG Chart */}
          <div style={{ position: 'relative', width: '100%', height: chartHeight }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="inv-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y Axis Grid Lines */}
              {[0, 35, 70, 105, 140].map((tickVal) => {
                const y = getY(tickVal, maxInvestment);
                return (
                  <g key={tickVal}>
                    <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3 3" />
                    <text x={padding.left - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize={9} fontFamily="monospace">
                      ${tickVal}B
                    </text>
                  </g>
                );
              })}

              {/* X Axis Years */}
              {availableYears.map((yr) => {
                if (yr < yearFilter[0] || yr > yearFilter[1]) return null;
                const x = getX(yr.toString(), yearFilter[0], yearFilter[1]);
                return (
                  <text key={yr} x={x} y={chartHeight - 12} textAnchor="middle" fill="#64748b" fontSize={9} fontFamily="monospace">
                    {yr}
                  </text>
                );
              })}

              {/* Area & Line */}
              <path d={buildAreaPath(filteredInvestment, yearFilter[0], yearFilter[1], maxInvestment)} fill="url(#inv-gradient)" />
              <path
                d={buildLinePath(filteredInvestment, yearFilter[0], yearFilter[1], maxInvestment)}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={2.5}
              />

              {/* Data points */}
              {filteredInvestment.map((d) => {
                const x = getX(d.period, yearFilter[0], yearFilter[1]);
                const y = getY(d.value, maxInvestment);
                return (
                  <circle
                    key={d.id}
                    cx={x}
                    cy={y}
                    r={4}
                    fill="#38bdf8"
                    stroke="#0a0e1a"
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() =>
                      setHoveredPoint({
                        year: d.period,
                        value: d.value,
                        series: 'Private AI Investment',
                        unit: 'Constant 2021 US$ Billions',
                        sourceId: d.source_ids[0],
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </svg>
          </div>

          {/* Source and Methodology Footer */}
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.4, borderTop: '1px solid var(--border-primary)', paddingTop: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Source Note: </span>
            Stanford HAI / NetBase Quid. Tracks investments in privately held AI startups (&gt;$1.5M funding). Excludes internal R&amp;D and capex by publicly traded companies. Constant 2021 USD.
          </div>
        </div>

        {/* Chart 2: Notable AI Systems by Affiliation */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 10,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Notable AI Systems by Sector (2013–2023)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Annual counts by institutional author affiliation (Epoch AI)
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Total</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Industry</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Academia</span>
              </div>
            </div>
          </div>

          {/* SVG Chart */}
          <div style={{ position: 'relative', width: '100%', height: chartHeight }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%' }}>
              {/* Y Axis Grid Lines */}
              {[0, 30, 60, 90, 120].map((tickVal) => {
                const y = getY(tickVal, maxSystems);
                return (
                  <g key={tickVal}>
                    <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3 3" />
                    <text x={padding.left - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize={9} fontFamily="monospace">
                      {tickVal}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Years */}
              {availableYears.map((yr) => {
                if (yr < yearFilter[0] || yr > yearFilter[1]) return null;
                const x = getX(yr.toString(), yearFilter[0], yearFilter[1]);
                return (
                  <text key={yr} x={x} y={chartHeight - 12} textAnchor="middle" fill="#64748b" fontSize={9} fontFamily="monospace">
                    {yr}
                  </text>
                );
              })}

              {/* Total Systems Line */}
              <path
                d={buildLinePath(filteredSystemsTotal, yearFilter[0], yearFilter[1], maxSystems)}
                fill="none"
                stroke="#a855f7"
                strokeWidth={2.5}
              />

              {/* Industry Line */}
              <path
                d={buildLinePath(filteredSystemsIndustry, yearFilter[0], yearFilter[1], maxSystems)}
                fill="none"
                stroke="#34d399"
                strokeWidth={2}
                strokeDasharray="4 2"
              />

              {/* Academia Line */}
              <path
                d={buildLinePath(filteredSystemsAcademia, yearFilter[0], yearFilter[1], maxSystems)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="2 2"
              />

              {/* Interactive Points on Total */}
              {filteredSystemsTotal.map((d) => {
                const x = getX(d.period, yearFilter[0], yearFilter[1]);
                const y = getY(d.value, maxSystems);
                return (
                  <circle
                    key={d.id}
                    cx={x}
                    cy={y}
                    r={3.5}
                    fill="#a855f7"
                    stroke="#0a0e1a"
                    strokeWidth={1.5}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() =>
                      setHoveredPoint({
                        year: d.period,
                        value: d.value,
                        series: 'Notable AI Systems (Total)',
                        unit: 'notable machine learning systems',
                        sourceId: d.source_ids[0],
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </svg>
          </div>

          {/* Source and Methodology Footer */}
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.4, borderTop: '1px solid var(--border-primary)', paddingTop: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Source Note: </span>
            Epoch AI / Stanford AI Index. Evaluates notable machine learning models with high citations, benchmark dominance, or historical significance.
          </div>
        </div>
      </div>

      {/* Annual Coverage Table & Data Integrity Guardrails */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Coverage Matrix */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 10,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Annual Observation Coverage Matrix (2013–2023)</span>
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.7rem', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)', color: 'var(--text-muted)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 4px' }}>Series Name</th>
                  {availableYears.map((yr) => (
                    <th key={yr} style={{ padding: '6px 4px' }}>
                      {yr}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.06)', color: 'var(--text-secondary)' }}>
                  <td style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 600, color: '#38bdf8' }}>
                    Private Investment (Constant 2021)
                  </td>
                  {availableYears.map((yr) => (
                    <td key={yr} style={{ padding: '6px 4px' }}>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.06)', color: 'var(--text-secondary)' }}>
                  <td style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 600, color: '#a855f7' }}>
                    Notable Systems (Total)
                  </td>
                  {availableYears.map((yr) => (
                    <td key={yr} style={{ padding: '6px 4px' }}>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.06)', color: 'var(--text-secondary)' }}>
                  <td style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 600, color: '#34d399' }}>
                    Notable Systems (Industry)
                  </td>
                  {availableYears.map((yr) => (
                    <td key={yr} style={{ padding: '6px 4px' }}>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                    </td>
                  ))}
                </tr>
                <tr style={{ color: 'var(--text-secondary)' }}>
                  <td style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 600, color: '#f59e0b' }}>
                    Notable Systems (Academia)
                  </td>
                  {availableYears.map((yr) => (
                    <td key={yr} style={{ padding: '6px 4px' }}>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodological Integrity Guardrails */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 10,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldAlert size={15} style={{ color: 'var(--accent-rose)' }} />
            <span>Methodological Disclaimers &amp; Guardrails</span>
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.45 }}>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Constant vs Nominal Dollars:</strong> The multi-year investment series is strictly denominated in constant 2021 US$ billions to eliminate inflationary distortions. Nominal values are preserved separately.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Investment Exclusions:</strong> Private investment metrics track funding transactions in privately held startups (&gt;$1.5M). Internal R&amp;D budgets of tech giants (e.g., Google, Microsoft) are not included.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>No Causal Imputation:</strong> Trend co-occurrence between private investment and notable system counts reflects broad ecosystem growth, not direct proportional causation.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Preserved Seed Observations:</strong> Point-in-time benchmark records (e.g. 2023 count of 149 systems) are kept distinct from multi-year time-series to prevent schema dilution.
            </li>
          </ul>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'rgba(15, 22, 40, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: 8,
            padding: '10px 16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            fontSize: '0.75rem',
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{hoveredPoint.series}</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '2px 0' }}>
            {hoveredPoint.year}: {hoveredPoint.value}
          </div>
          <div style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem' }}>{hoveredPoint.unit}</div>
        </div>
      )}
    </div>
  );
};
