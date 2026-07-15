// ============================================================
// AgroSaaNuu — Protected Route
// src/components/common/ProtectedRoute.jsx
// ============================================================
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const ONBOARDING_ROUTES = ['/onboarding/profil', '/onboarding/activite'];
const GREEN = '#1a5c2a';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Fallback localStorage — évite la redirection pendant la mise à jour du state React
  const storedUser = user || (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();

  const token = localStorage.getItem('access_token');

  // Chargement initial (avant que le token soit vérifié)
  if (loading && !token) {
    return (
      <div style={styles.loader}>
        <div style={styles.spinner} />
        <p style={styles.loaderText}>Chargement...</p>
      </div>
    );
  }

  // Pas connecté
  if (!storedUser || !token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // ── Gate onboarding ──────────────────────────────────────────────────────
  if (!ONBOARDING_ROUTES.includes(location.pathname)) {

    // (pas de gate onboarding — tous les rôles accèdent directement au dashboard)
  }

  // Rôle non autorisé
  if (roles.length > 0 && !roles.includes(storedUser?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

const styles = {
  loader: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: '#f4f6f4',
    padding: '2rem',
  },
  spinner: {
    width: '48px', height: '48px',
    border: '4px solid #e5e7eb',
    borderTop: `4px solid ${GREEN}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loaderText: {
    marginTop: '1rem', color: '#6b7280',
    fontSize: '0.9rem', fontWeight: '500',
  },
  card: {
    background: 'white',
    borderRadius: '24px',
    padding: '2.5rem 2rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
  },
  iconWrap: {
    fontSize: '3.5rem',
    marginBottom: '1rem',
    lineHeight: 1,
  },
  title: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#1a2e10',
    margin: '0 0 0.7rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#6b7280',
    lineHeight: 1.7,
    margin: '0 0 1.5rem',
  },
  btn: {
    display: 'inline-block',
    background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`,
    color: 'white',
    borderRadius: '14px',
    padding: '0.9rem 2rem',
    fontWeight: '700',
    fontSize: '0.97rem',
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(26,92,42,0.28)',
  },
};