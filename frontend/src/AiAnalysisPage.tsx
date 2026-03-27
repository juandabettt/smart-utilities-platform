import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface MonthlyBillSummary {
  year: number;
  month: number;
  monthName: string;
  serviceType: 'WATER' | 'ENERGY' | 'GAS' | string;
  totalAmount: number;
  billCount: number;
  avgAmount: number;
  totalConsumption: number;
}

interface Trend {
  service: string;
  serviceType: string;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  lastAmount: number;
  billCount: number;
}

interface Recommendation {
  type: 'WARNING' | 'INFO' | 'ALERT';
  icon: string;
  priority: 'HIGH' | 'LOW';
  title: string;
  description: string;
}

interface Insights {
  status: string;
  summary: string;
  overallTrend: string;
  anomalyCount: number;
  totalBills?: number;
  trends: Trend[];
  recommendations: Recommendation[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SERVICE_COLORS: Record<string, string> = {
  WATER:  '#3b82f6',  // azul
  ENERGY: '#f59e0b',  // amarillo
  GAS:    '#f97316',  // naranja
};

const SERVICE_LABELS: Record<string, string> = {
  WATER:  'Agua',
  ENERGY: 'Luz',
  GAS:    'Gas',
};

const MONTH_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

// ─── Gráfico de barras SVG puro ───────────────────────────────────────────────

interface BarChartProps {
  data: MonthlyBillSummary[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string; color: string } | null>(null);

  const W = 900, H = 320, PAD = { top: 20, right: 20, bottom: 60, left: 80 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Todos los meses del año (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const serviceTypes = ['WATER', 'ENERGY', 'GAS'];

  // Calcular máximo
  const maxAmount = Math.max(...data.map(d => d.totalAmount), 1);
  const maxRounded = Math.ceil(maxAmount / 50000) * 50000;

  // Dimensiones de barras
  const groupW = chartW / 12;
  const barPad = groupW * 0.12;
  const barW = (groupW - barPad * 2) / 3;

  // Líneas horizontales de referencia
  const gridLines = 4;

  return (
    <div className="chart-wrapper">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="bar-chart-svg"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid lines */}
        {Array.from({ length: gridLines + 1 }, (_, i) => {
          const y = PAD.top + (chartH / gridLines) * i;
          const value = maxRounded - (maxRounded / gridLines) * i;
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y}
                stroke="#e2e8f0" strokeWidth="1" strokeDasharray={i === gridLines ? '0' : '4 4'} />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end"
                fontSize="10" fill="#94a3b8">
                {value >= 1000 ? `${Math.round(value / 1000)}k` : value}
              </text>
            </g>
          );
        })}

        {/* Barras */}
        {months.map((m, mi) => {
          const groupX = PAD.left + mi * groupW;
          return (
            <g key={m}>
              {serviceTypes.map((sType, si) => {
                const entry = data.find(d => d.month === m && d.serviceType === sType);
                const amount = entry?.totalAmount ?? 0;
                const barH = amount > 0 ? (amount / maxRounded) * chartH : 2;
                const x = groupX + barPad + si * barW;
                const y = PAD.top + chartH - barH;
                const color = SERVICE_COLORS[sType];
                return (
                  <g key={sType}>
                    <rect
                      x={x} y={y} width={barW - 2} height={barH}
                      fill={color} rx="3" opacity={amount > 0 ? 1 : 0.15}
                      className="chart-bar"
                      onMouseEnter={(_e) => {
                        if (amount > 0) {
                          setTooltip({
                            x: x + barW / 2,
                            y: y - 8,
                            text: `${SERVICE_LABELS[sType]}: ${formatCOP(amount)}`,
                            color,
                          });
                        }
                      }}
                    />
                  </g>
                );
              })}

              {/* Etiqueta del mes */}
              <text
                x={groupX + groupW / 2} y={PAD.top + chartH + 20}
                textAnchor="middle" fontSize="11" fill="#64748b"
              >
                {MONTH_SHORT[m - 1]}
              </text>
            </g>
          );
        })}

        {/* Eje Y */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + chartH}
          stroke="#e2e8f0" strokeWidth="1" />

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect
              x={tooltip.x - 70} y={tooltip.y - 28} width={140} height={24}
              fill="white" rx="6" filter="url(#shadow)"
              stroke={tooltip.color} strokeWidth="1.5"
            />
            <text x={tooltip.x} y={tooltip.y - 12} textAnchor="middle"
              fontSize="11" fontWeight="600" fill="#0f172a">
              {tooltip.text}
            </text>
          </g>
        )}

        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
          </filter>
        </defs>
      </svg>

      {/* Leyenda */}
      <div className="chart-legend">
        {serviceTypes.map(sType => (
          <div key={sType} className="legend-item">
            <span className="legend-dot" style={{ background: SERVICE_COLORS[sType] }} />
            <span>{SERVICE_LABELS[sType]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Icono de tendencia ───────────────────────────────────────────────────────

const TrendIcon: React.FC<{ trend: string }> = ({ trend }) => {
  if (trend === 'INCREASING') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );
  if (trend === 'DECREASING') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
};

// ─── Icono de recomendación ───────────────────────────────────────────────────

const RecIcon: React.FC<{ icon: string; type: string }> = ({ icon, type }) => {
  const color = type === 'WARNING' || type === 'ALERT' ? '#f97316' : '#10b981';
  if (icon === 'trending-up') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );
  if (icon === 'warning') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────

const AiAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [monthlyData, setMonthlyData] = useState<MonthlyBillSummary[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [monthlyRes, insightsRes] = await Promise.all([
          fetch('http://localhost:8081/api/analysis/monthly'),
          fetch('http://localhost:8081/api/analysis/insights'),
        ]);
        if (!monthlyRes.ok || !insightsRes.ok) throw new Error('Error al obtener datos del servidor');
        const monthly: MonthlyBillSummary[] = await monthlyRes.json();
        const ins: Insights = await insightsRes.json();
        setMonthlyData(monthly);
        setInsights(ins);
      } catch (err) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en el puerto 8081.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const trendLabel = (t: string) => {
    if (t === 'INCREASING') return { text: 'En aumento', cls: 'trend-up' };
    if (t === 'DECREASING') return { text: 'Disminuyendo', cls: 'trend-down' };
    return { text: 'Estable', cls: 'trend-stable' };
  };

  return (
    <div className="landing-layout">

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <div className="brand-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M2 15h10" /><path d="m9 18 3-3-3-3" />
              </svg>
            </div>
            <span className="brand-name">PredictaFlow System</span>
          </div>

          <div className="navbar-links">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Inicio</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Pago de facturas automático</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="nav-link-active">Análisis con IA</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/testimonials'); }}>Testimonios</a>
          </div>

          <div className="navbar-actions">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="link-login">
              Iniciar Sesión
            </a>
            <button className="btn-start" onClick={() => navigate('/')}>
              ← Volver al inicio
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="main-content">
        <section className="analysis-section">

          {/* Header */}
          <div className="analysis-header">
            <div className="ai-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ai-icon">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
              </svg>
              <span>Motor de análisis con IA — Weka KNN</span>
            </div>
            <h1 className="analysis-title">Análisis Inteligente de Servicios</h1>
            <p className="analysis-subtitle">
              Visualiza el comportamiento mensual de tus facturas de Agua, Luz y Gas.
              La IA detecta tendencias de aumento y entrega recomendaciones de ahorro personalizadas.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="analysis-loading">
              <div className="loading-spinner" />
              <p>La IA está procesando tus datos...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="analysis-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          {/* Contenido del análisis */}
          {!loading && !error && insights && (
            <>
              {/* Banner resumen IA */}
              <div className={`analysis-summary-banner ${insights.overallTrend === 'INCREASING' ? 'banner-warning' : insights.overallTrend === 'DECREASING' ? 'banner-success' : 'banner-info'}`}>
                <div className="banner-icon">
                  <TrendIcon trend={insights.overallTrend} />
                </div>
                <div className="banner-content">
                  <span className="banner-label">
                    {insights.status === 'DEMO' ? '📊 Datos de ejemplo' : '🤖 Análisis con IA'}
                    {' · '}
                    Tendencia general:{' '}
                    <strong>{insights.overallTrend === 'INCREASING' ? 'En aumento ↑' : insights.overallTrend === 'DECREASING' ? 'Disminuyendo ↓' : 'Estable →'}</strong>
                  </span>
                  <p className="banner-summary">{insights.summary}</p>
                </div>
                {insights.anomalyCount > 0 && (
                  <div className="banner-anomaly-badge">
                    <span>{insights.anomalyCount} anomalía(s)</span>
                  </div>
                )}
              </div>

              {/* Tarjetas de tendencia por servicio */}
              <div className="trend-cards-grid">
                {insights.trends.map((t, i) => {
                  const tLabel = trendLabel(t.trend);
                  const sColor = SERVICE_COLORS[t.serviceType] ?? '#64748b';
                  return (
                    <div key={i} className="trend-card">
                      <div className="trend-card-header">
                        <span className="trend-service-dot" style={{ background: sColor }} />
                        <span className="trend-service-name">{t.service}</span>
                      </div>
                      <div className={`trend-badge ${tLabel.cls}`}>
                        <TrendIcon trend={t.trend} />
                        <span>{tLabel.text}</span>
                      </div>
                      <div className="trend-amount">{formatCOP(t.lastAmount)}</div>
                      <div className="trend-meta">{t.billCount} factura(s) analizadas</div>
                    </div>
                  );
                })}
              </div>

              {/* Gráfico de barras */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <h2 className="chart-title">Costos Mensuales por Servicio</h2>
                    <p className="chart-subtitle">Comparativa de facturas de Agua, Luz y Gas durante el año</p>
                  </div>
                </div>
                <BarChart data={monthlyData} />
              </div>

              {/* Panel de Recomendaciones */}
              <div className="recommendations-section">
                <div className="recommendations-header">
                  <h2 className="recs-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                    Recomendaciones de la IA
                  </h2>
                  <p className="recs-subtitle">
                    Acciones concretas sugeridas por el análisis inteligente para reducir tus costos.
                  </p>
                </div>
                <div className="recommendations-grid">
                  {insights.recommendations.map((rec, i) => (
                    <div key={i} className={`rec-card ${rec.type === 'WARNING' || rec.type === 'ALERT' ? 'rec-card-warning' : 'rec-card-info'}`}>
                      <div className="rec-card-header">
                        <div className={`rec-icon-wrap ${rec.type === 'WARNING' || rec.type === 'ALERT' ? 'rec-icon-warn' : 'rec-icon-ok'}`}>
                          <RecIcon icon={rec.icon} type={rec.type} />
                        </div>
                        <div className="rec-header-text">
                          <span className="rec-title">{rec.title}</span>
                          {rec.priority === 'HIGH' && <span className="rec-priority-badge">Prioridad alta</span>}
                        </div>
                      </div>
                      <p className="rec-description">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 PredictaFlow System. Análisis con IA impulsado por Weka KNN.</p>
      </footer>
    </div>
  );
};

export default AiAnalysisPage;
