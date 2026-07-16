import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './i18n';
import AppRouter from './routes/AppRouter';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#f4f6f4', padding: '2rem', fontFamily: 'sans-serif',
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '2.5rem 2rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: '420px',
            width: '100%', textAlign: 'center', border: '1px solid #e5e7eb',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#d97706' }}>!</div>
            <h2 style={{ color: '#1a2e10', fontWeight: '800', marginBottom: '0.5rem' }}>
              Une erreur est survenue
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Veuillez recharger la page. Si le problème persiste, essayez de désactiver les extensions de votre navigateur (Google Translate, etc.).
            </p>
            {this.state.error && (
              <pre style={{ textAlign: 'left', background: '#f3f4f6', borderRadius: '8px', padding: '0.8rem', fontSize: '0.75rem', color: '#dc2626', marginBottom: '1rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {this.state.error.message}{'\n\n'}{this.state.error.stack}
              </pre>
            )}
            <button
              onClick={() => window.location.href = '/'}
              style={{
                background: 'linear-gradient(135deg, #1a5c2a, #2d8c47)',
                color: 'white', border: 'none', borderRadius: '12px',
                padding: '0.8rem 2rem', fontWeight: '700', fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AppRouter />
  </ErrorBoundary>
);
