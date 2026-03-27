import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import AiAnalysisPage from './AiAnalysisPage';
import TestimonialsPage from './TestimonialsPage';

export interface Bill {
  id: number | string;
  referenceNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'BLOCKED_BY_AI' | string;
  registeredConsumption: number;
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/bills');
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      } else {
        console.error('Failed to fetch bills');
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8081/api/bills/upload', {
        method: 'POST',
        body: formData,
      });

      const resultMessage = await response.text();

      if (response.ok) {
        alert(`Respuesta del Sistema:\n${resultMessage}`);
        await fetchBills();
        setSelectedFile(null);

        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        alert(`Error: ${resultMessage}`);
        console.error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Hubo un error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'BLOCKED_BY_AI':
        return (
          <span className="badge badge-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="badge-icon"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Bloqueado
          </span>
        );
      case 'PAID':
        return <span className="badge badge-success">Pagado</span>;
      case 'PENDING':
        return <span className="badge badge-warning">Pendiente</span>;
      default:
        return <span className="badge badge-default">{status}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(amount);
  };

  return (
    <div className="landing-layout">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <div className="brand-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M2 15h10"></path><path d="m9 18 3-3-3-3"></path></svg>
            </div>
            <span className="brand-name">PredictaFlow System</span>
          </div>

          <div className="navbar-links">
            <a href="#auto">Pago de facturas automático</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/analysis'); }}>
              Análisis con IA
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/testimonials'); }}>
              Testimonios
            </a>
          </div>

          <div className="navbar-actions">
            <a href="#login" className="link-login">Iniciar Sesión</a>
            <button className="btn-start">Empezar ahora</button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="ai-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ai-icon"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                <span>Análisis con IA de nueva generación</span>
              </div>

              <h1 className="hero-title">
                Toma una foto, detecta fugas y paga tus servicios al instante.
              </h1>

              <p className="hero-description">
                Controla tu consumo sin mover un dedo. Sube la imagen de tu recibo y deja que nuestra IA analice cada detalle por ti. Identifica anomalías de inmediato y gestiona tu historial.
              </p>

              <div className="hero-action-box">
                <form onSubmit={handleUpload} className="upload-form">
                  <div className="upload-input-group">
                    <label htmlFor="file-upload" className={`file-label ${selectedFile ? 'has-file' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      {selectedFile ? selectedFile.name : 'Subir foto del recibo (.jpg, .pdf)'}
                    </label>
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="hidden-input"
                    />
                  </div>
                  <button
                    type="submit"
                    className={`btn-primary btn-analyze ${loading ? 'loading' : ''}`}
                    disabled={!selectedFile || loading}
                  >
                    {loading ? 'Procesando...' : 'Analizar Recibo'}
                  </button>
                </form>
              </div>

              {/* CTA secundario para ver análisis */}
              <div className="hero-analysis-cta">
                <button className="btn-analysis-cta" onClick={() => navigate('/analysis')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  </svg>
                  Ver Análisis con IA →
                </button>
              </div>
            </div>

            {/* Decorative Visuals */}
            <div className="hero-visuals">
              <div className="decorative-glow"></div>

              <div className="mockup-card card-electric">
                <div className="mc-header">
                  <div className="mc-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
                  </div>
                  <span className="mc-title">Recibo Eléctrico</span>
                </div>
                <div className="mc-skeleton-lines">
                  <div className="s-line long"></div>
                  <div className="s-line short"></div>
                </div>
                <div className="mc-footer">
                  <div className="mc-amount-container">
                    <span className="mc-label">Total a pagar</span>
                    <span className="mc-amount">$124.50</span>
                  </div>
                  <div className="mc-status-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                </div>
              </div>

              <div className="mockup-card card-ai-analysis">
                <div className="mc-header">
                  <div className="ai-icon-small">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
                  </div>
                  <span className="mc-title">Análisis IA</span>
                </div>
                <p className="mc-text">
                  Lectura extraída: 120 kWh.<br />
                  Sin anomalías detectadas este mes.
                </p>
              </div>

              <div className="mockup-card card-alert">
                <div className="mc-icon-alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <div>
                  <span className="mc-title-alert">Bloqueo activo</span>
                  <p className="mc-text-alert">Pago duplicado frenado</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard / History Section */}
        <section className="dashboard-section" id="auto">
          <div className="dashboard-header">
            <h2>Historial de Facturas</h2>
            <p>Registros analizados y procesados por PredictaFlow</p>
          </div>

          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Fecha Emisión</th>
                  <th>Vencimiento</th>
                  <th>Consumo</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      <div className="empty-content">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                        <p>No hay facturas registradas. Sube tu primer recibo arriba.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="font-medium text-dark">{bill.referenceNumber}</td>
                      <td>{new Date(bill.issueDate).toLocaleDateString('es-ES')}</td>
                      <td>{new Date(bill.dueDate).toLocaleDateString('es-ES')}</td>
                      <td>{bill.registeredConsumption} <span className="text-light">unidades</span></td>
                      <td className="font-bold text-dark">{formatCurrency(bill.amount)}</td>
                      <td>{getStatusBadge(bill.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 PredictaFlow System. Inspirado en diseño SaaS Moderno.</p>
        <p className="attribution-note">Design conceptualized from Figma Make / Shadcn ui vibes.</p>
      </footer>
    </div>
  );
};

// ─── App Root con React Router ────────────────────────────────────────────────

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analysis" element={<AiAnalysisPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
