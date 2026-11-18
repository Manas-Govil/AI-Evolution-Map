import React, { useState, useMemo } from 'react';
import type { MetricObservation, ResearchSource } from '../../types/timeline';
import { SlidersHorizontal } from 'lucide-react';

interface EditorialAnalyticsProps {
  metrics: MetricObservation[];
  sources?: Record<string, ResearchSource>;
}

export const EditorialAnalytics: React.FC<EditorialAnalyticsProps> = ({ metrics }) => {
  const [yearFilter, setYearFilter] = useState<[number, number]>([2013, 2023]);
  const [activeChartTab, setActiveChartTab] = useState<'investment' | 'systems'>('investment');
  const [hoveredPoint, setHoveredPoint] = useState<{
    year: string;
    value: number;
    series: string;
    unit: string;
  } | null>(null);

  // Group metrics
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

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const m of metrics) {
      const y = parseInt(m.period, 10);
      if (!isNaN(y)) years.add(y);
    }
    return Array.from(years).sort((a, b) => a - b);
  }, [metrics]);

  // Filters
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

  // Dimensions
  const chartWidth = 840;
  const chartHeight = 340;
  const padding = { top: 30, right: 35, bottom: 45, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

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

  const getX = (yearStr: string, minYear: number, maxYear: number) => {
    const year = parseInt(yearStr, 10);
    const span = maxYear - minYear || 1;
    return padding.left + ((year - minYear) / span) * plotWidth;
  };

  const getY = (val: number, maxVal: number) => {
    return padding.top + plotHeight - (val / maxVal) * plotHeight;
  };

  const buildLinePath = (data: MetricObservation[], minYear: number, maxYear: number, maxVal: number) => {
    if (data.length === 0) return '';
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.period, minYear, maxYear)} ${getY(d.value, maxVal)}`)
      .join(' ');
  };

  const buildAreaPath = (data: MetricObservation[], minYear: number, maxYear: number, maxVal: number) => {
    if (data.length === 0) return '';
    const line = buildLinePath(data, minYear, maxYear, maxVal);
    const lastX = getX(data[data.length - 1].period, minYear, maxYear);
    const firstX = getX(data[0].period, minYear, maxYear);
    const bottomY = padding.top + plotHeight;
    return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

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
        padding: '2.5rem 2rem',
        maxWidth: '1180px',
        margin: '0 auto',
        width: '100%',
        gap: '2.5rem',
      }}
    >
      {/* Editorial Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', borderBottom: '1px solid #302B20', paddingBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D6B875', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
            Empirical Investigations
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 600, margin: '6px 0 0', color: '#E8E2D5', letterSpacing: '-0.02em', fontFamily: "'Newsreader', Georgia, serif" }}>
            Macro AI Trends &amp; Capital Flows
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#A6A197', maxWidth: '640px', lineHeight: 1.55 }}>
            Synthesizing annual corporate financing metrics from NetBase Quid and notable machine learning systems from Epoch AI across 2013–2023.
          </p>
        </div>

        {/* Period Filter Ribbon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(18, 19, 19, 0.85)', padding: '8px 16px', borderRadius: 6, border: '1px solid #302B20' }}>
          <SlidersHorizontal size={14} style={{ color: '#D6B875' }} />
          <span style={{ fontSize: '0.75rem', color: '#77736A', fontWeight: 600 }}>Period Span:</span>
          <input
            type="range"
            min={2013}
            max={2023}
            value={yearFilter[0]}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (val <= yearFilter[1]) setYearFilter([val, yearFilter[1]]);
            }}
            style={{ width: 70, accentColor: '#D6B875' }}
          />
          <span style={{ fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace", color: '#D6B875', fontWeight: 600 }}>
            {yearFilter[0]} — {yearFilter[1]}
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
            style={{ width: 70, accentColor: '#D6B875' }}
          />
        </div>
      </div>

      {/* Featured Metric Cards Bento-Style */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div style={{ padding: '1.5rem', borderRadius: 8, background: 'rgba(18, 19, 19, 0.8)', border: '1px solid #302B20', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#77736A', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            2023 Global Private Investment
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 600, color: '#D6B875', fontFamily: "'JetBrains Mono', monospace", margin: '4px 0' }}>
            ${latestInvestment?.value.toFixed(1)}B
          </div>
          <div style={{ fontSize: '0.75rem', color: '#A6A197' }}>Constant 2021 US$ Billions</div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 8, background: 'rgba(18, 19, 19, 0.8)', border: '1px solid #302B20', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#77736A', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            2023 Notable AI Systems
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 600, color: '#E8E2D5', fontFamily: "'JetBrains Mono', monospace", margin: '4px 0' }}>
            {latestTotalSystems?.value}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#A6A197' }}>Notable models recorded (Epoch AI)</div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 8, background: 'rgba(18, 19, 19, 0.8)', border: '1px solid #302B20', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#77736A', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            Industry Production Share
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 600, color: '#8F7044', fontFamily: "'JetBrains Mono', monospace", margin: '4px 0' }}>
            {((latestIndustrySystems?.value / (latestTotalSystems?.value || 1)) * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#A6A197' }}>{latestIndustrySystems?.value} systems from private industry</div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 8, background: 'rgba(18, 19, 19, 0.8)', border: '1px solid #302B20', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#77736A', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            Academic Share
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 600, color: '#718477', fontFamily: "'JetBrains Mono', monospace", margin: '4px 0' }}>
            {((latestAcademiaSystems?.value / (latestTotalSystems?.value || 1)) * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#A6A197' }}>{latestAcademiaSystems?.value} systems from university research</div>
        </div>
      </div>

      {/* Main Feature Chart Studio with Tabs */}
      <div style={{ borderRadius: 8, background: 'rgba(18, 19, 19, 0.9)', border: '1px solid #302B20', padding: '1.75rem', backdropFilter: 'blur(16px)' }}>
        {/* Chart Selector Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #302B20', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveChartTab('investment')}
              style={{
                padding: '8px 18px',
                borderRadius: 4,
                fontSize: '0.82rem',
                fontWeight: 600,
                background: activeChartTab === 'investment' ? 'rgba(214, 184, 117, 0.15)' : 'transparent',
                color: activeChartTab === 'investment' ? '#D6B875' : '#77736A',
                border: `1px solid ${activeChartTab === 'investment' ? 'rgba(214, 184, 117, 0.45)' : 'transparent'}`,
                cursor: 'pointer',
              }}
            >
              Private AI Investment Trend
            </button>
            <button
              onClick={() => setActiveChartTab('systems')}
              style={{
                padding: '8px 18px',
                borderRadius: 4,
                fontSize: '0.82rem',
                fontWeight: 600,
                background: activeChartTab === 'systems' ? 'rgba(143, 112, 68, 0.15)' : 'transparent',
                color: activeChartTab === 'systems' ? '#8F7044' : '#77736A',
                border: `1px solid ${activeChartTab === 'systems' ? 'rgba(143, 112, 68, 0.45)' : 'transparent'}`,
                cursor: 'pointer',
              }}
            >
              Notable Systems by Affiliation
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#77736A', fontStyle: 'italic' }}>
            Hover data points for exact verified values
          </div>
        </div>

        {/* SVG Visualization Canvas */}
        <div style={{ width: '100%', height: chartHeight, position: 'relative' }}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="inv-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D6B875" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#D6B875" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {activeChartTab === 'investment' ? (
              [0, 35, 70, 105, 140].map((tick) => {
                const y = getY(tick, maxInvestment);
                return (
                  <g key={tick}>
                    <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="rgba(48, 43, 32, 0.5)" strokeDasharray="3 3" />
                    <text x={padding.left - 10} y={y + 4} textAnchor="end" fill="#77736A" fontSize={10} fontFamily="'JetBrains Mono', monospace">
                      ${tick}B
                    </text>
                  </g>
                );
              })
            ) : (
              [0, 30, 60, 90, 120].map((tick) => {
                const y = getY(tick, maxSystems);
                return (
                  <g key={tick}>
                    <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="rgba(48, 43, 32, 0.5)" strokeDasharray="3 3" />
                    <text x={padding.left - 10} y={y + 4} textAnchor="end" fill="#77736A" fontSize={10} fontFamily="'JetBrains Mono', monospace">
                      {tick}
                    </text>
                  </g>
                );
              })
            )}

            {/* X Axis Year Labels */}
            {availableYears.map((yr) => {
              if (yr < yearFilter[0] || yr > yearFilter[1]) return null;
              const x = getX(yr.toString(), yearFilter[0], yearFilter[1]);
              return (
                <text key={yr} x={x} y={chartHeight - 12} textAnchor="middle" fill="#77736A" fontSize={10} fontFamily="'JetBrains Mono', monospace">
                  {yr}
                </text>
              );
            })}

            {/* TAB 1: Investment Chart */}
            {activeChartTab === 'investment' && (
              <>
                <path d={buildAreaPath(filteredInvestment, yearFilter[0], yearFilter[1], maxInvestment)} fill="url(#inv-glow)" />
                <path d={buildLinePath(filteredInvestment, yearFilter[0], yearFilter[1], maxInvestment)} fill="none" stroke="#D6B875" strokeWidth={2.4} />
                {filteredInvestment.map((d) => {
                  const x = getX(d.period, yearFilter[0], yearFilter[1]);
                  const y = getY(d.value, maxInvestment);
                  return (
                    <circle
                      key={d.id}
                      cx={x}
                      cy={y}
                      r={4.5}
                      fill="#D6B875"
                      stroke="#080909"
                      strokeWidth={2}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() =>
                        setHoveredPoint({
                          year: d.period,
                          value: d.value,
                          series: 'Global Private AI Investment',
                          unit: 'Constant 2021 US$ Billions',
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </>
            )}

            {/* TAB 2: Notable Systems Chart */}
            {activeChartTab === 'systems' && (
              <>
                <path d={buildLinePath(filteredSystemsTotal, yearFilter[0], yearFilter[1], maxSystems)} fill="none" stroke="#E8E2D5" strokeWidth={2.4} />
                <path d={buildLinePath(filteredSystemsIndustry, yearFilter[0], yearFilter[1], maxSystems)} fill="none" stroke="#8F7044" strokeWidth={2} strokeDasharray="4 3" />
                <path d={buildLinePath(filteredSystemsAcademia, yearFilter[0], yearFilter[1], maxSystems)} fill="none" stroke="#718477" strokeWidth={2} strokeDasharray="2 3" />
                {filteredSystemsTotal.map((d) => {
                  const x = getX(d.period, yearFilter[0], yearFilter[1]);
                  const y = getY(d.value, maxSystems);
                  return (
                    <circle
                      key={d.id}
                      cx={x}
                      cy={y}
                      r={4.5}
                      fill="#E8E2D5"
                      stroke="#080909"
                      strokeWidth={2}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() =>
                        setHoveredPoint({
                          year: d.period,
                          value: d.value,
                          series: 'Notable Systems (Total)',
                          unit: 'machine learning systems',
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </>
            )}
          </svg>
        </div>

        {/* Legend & Context Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '1.25rem', borderTop: '1px solid #302B20', paddingTop: '1rem', fontSize: '0.75rem', color: '#A6A197' }}>
          <div>
            {activeChartTab === 'investment' ? (
              <span><strong>Methodology:</strong> Tracks external venture and private equity transactions (&gt;$1.5M funding) via NetBase Quid.</span>
            ) : (
              <span><strong>Methodology:</strong> Notable ML systems meeting benchmark performance or citation thresholds (Epoch AI).</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {activeChartTab === 'investment' ? (
              <span style={{ color: '#D6B875', fontWeight: 600 }}>● Constant 2021 USD</span>
            ) : (
              <>
                <span style={{ color: '#E8E2D5', fontWeight: 600 }}>● Total Systems</span>
                <span style={{ color: '#8F7044', fontWeight: 600 }}>--- Industry</span>
                <span style={{ color: '#718477', fontWeight: 600 }}>··· Academia</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'rgba(18, 19, 19, 0.98)',
            border: '1px solid #302B20',
            borderRadius: 6,
            padding: '10px 16px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.75)',
            zIndex: 40,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#77736A' }}>{hoveredPoint.series}</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#E8E2D5', margin: '2px 0', fontFamily: "'JetBrains Mono', monospace" }}>
            {hoveredPoint.year}: {hoveredPoint.value}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#D6B875' }}>{hoveredPoint.unit}</div>
        </div>
      )}
    </div>
  );
};
