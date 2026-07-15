// ============================================================
// AgroSaaNuu — Role Guard
// src/components/common/RoleGuard.jsx
// ============================================================
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleGuard({ children, roles = [] }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}