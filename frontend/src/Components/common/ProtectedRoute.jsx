// ============================================================
// AgroConnect — Protected Route
// src/components/common/ProtectedRoute.jsx
// ============================================================
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={styles.loader}>
        <div style={styles.spinner} />
        <p style={styles.loaderText}>Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

const styles = {
  loader: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: '#f8f9f4',
  },
  spinner: {
    width: '48px', height: '48px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #1a5c2a',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loaderText: {
    marginTop: '1rem', color: '#6b7280',
    fontSize: '0.9rem', fontWeight: '500',
  },
};