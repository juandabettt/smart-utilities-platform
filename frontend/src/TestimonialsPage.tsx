import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

const INITIAL_REVIEWS: Review[] = [
  { id: 1, author: "Carlos M.", rating: 5, comment: "Excelente plataforma. Detectó una fuga de agua en mi casa antes de que me llegara un recibo impagable. Muy recomendada.", date: "15 Mar 2026" },
  { id: 2, author: "Laura G.", rating: 4, comment: "Muy buena interfaz y fácil de usar. Me gustaría que incluyeran más alertas personalizadas, pero el análisis es genial.", date: "10 Mar 2026" },
  { id: 3, author: "Empresa S.A.", rating: 5, comment: "Hemos reducido nuestros costos operativos usando la IA para predecir nuestros consumos de luz y gas. Increíble herramienta.", date: "02 Mar 2026" }
];

const TestimonialsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('predictaflow_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_REVIEWS;
      }
    }
    return INITIAL_REVIEWS;
  });
  const [newReview, setNewReview] = useState({ author: '', rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const saveReviews = (updatedReviews: Review[]) => {
    setReviews(updatedReviews);
    localStorage.setItem('predictaflow_reviews', JSON.stringify(updatedReviews));
  };

  const handleDeleteReview = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      const updated = reviews.filter(r => r.id !== id);
      saveReviews(updated);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author || !newReview.comment) return;
    
    const review: Review = {
      id: Date.now(),
      author: newReview.author,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())
    };
    
    saveReviews([review, ...reviews]);
    setNewReview({ author: '', rating: 5, comment: '' });
    setShowReviewForm(false);
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
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/analysis'); }}>Análisis con IA</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="nav-link-active">Testimonios</a>
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

      {/* Main Content */}
      <main className="main-content">
        <section className="testimonials-section" style={{ minHeight: '80vh' }}>
          <div className="dashboard-header text-center">
            <h2>Lo que dicen nuestros usuarios</h2>
            <p>Califica el servicio y lee las experiencias de nuestra comunidad</p>
          </div>

          <div className="testimonials-grid">
            {reviews.map((r) => (
              <div key={r.id} className="testimonial-card" style={{ position: 'relative' }}>
                <button 
                  onClick={() => handleDeleteReview(r.id)}
                  style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                  title="Eliminar Reseña"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
                <div className="t-header">
                  <div className="t-avatar">{r.author.charAt(0)}</div>
                  <div className="t-meta">
                    <span className="t-author">{r.author}</span>
                    <span className="t-date">{r.date}</span>
                  </div>
                </div>
                <div className="t-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" fill={i < r.rating ? "#fbbf24" : "none"} stroke={i < r.rating ? "#fbbf24" : "#cbd5e1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="star-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  ))}
                </div>
                <p className="t-comment">{r.comment}</p>
              </div>
            ))}
          </div>

          {/* Review Form Toggle */}
          <div className="review-action-container">
            {!showReviewForm ? (
              <button className="btn-primary" style={{backgroundColor: 'white', color: 'var(--primary)', border: '1px solid var(--primary)'}} onClick={() => setShowReviewForm(true)}>
                Dejar una reseña
              </button>
            ) : (
              <form onSubmit={handleReviewSubmit} className="review-form">
                <h3 className="r-form-title">Escribe tu reseña</h3>
                <div className="r-input-group">
                  <label>Nombre</label>
                  <input type="text" value={newReview.author} onChange={e => setNewReview({...newReview, author: e.target.value})} placeholder="Tu nombre..." required />
                </div>
                <div className="r-input-group">
                  <label>Calificación</label>
                  <div className="r-stars-select">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} onClick={() => setNewReview({...newReview, rating: star})} viewBox="0 0 24 24" fill={star <= newReview.rating ? "#fbbf24" : "none"} stroke={star <= newReview.rating ? "#fbbf24" : "#cbd5e1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="star-icon-selectable"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    ))}
                  </div>
                </div>
                <div className="r-input-group">
                  <label>Comentario</label>
                  <textarea rows={3} value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} placeholder="¿Qué te pareció nuestro servicio...?" required />
                </div>
                <div className="r-form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowReviewForm(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary">Publicar</button>
                </div>
              </form>
            )}
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

export default TestimonialsPage;
