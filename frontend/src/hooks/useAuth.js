// ============================================================
// AgroConnect — useAuth Hook
// src/hooks/useAuth.js
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useNotificationContext } from '../context/NotificationContext';
import { getDashboard } from '../utils/roles';
export { useAuth } from '../context/AuthContext';
const useAuth = () => {
  const navigate = useNavigate();
  const {
    user, loading, isAuthenticated,
    login, register, logout, updateProfile, setError,
  } = useAuthContext();
  const { success, error: notifyError } = useNotificationContext();

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // ── Handle login ──────────────────────────────────────────
  const handleLogin = async ({ email, password }) => {
    try {
      setSubmitting(true);
      setFormErrors({});
      const me = await login({ email, password });
      success(`Bon retour, ${me.prenom || me.nom_complet || me.email}!`, 'Connexion');
      navigate(getDashboard(me), { replace: true });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password';
      notifyError(msg, 'Login Failed');
      setFormErrors({ general: msg });
      return { success: false };
    } finally {
      setSubmitting(false);
    }
  };

  // ── Handle register ───────────────────────────────────────
  const handleRegister = async (payload) => {
    try {
      setSubmitting(true);
      setFormErrors({});
      const me = await register(payload);
      success(`Bienvenue sur AgroConnect, ${me.prenom || me.nom_complet || me.email}!`, 'Compte cree');
      navigate(getDashboard(me), { replace: true });
      return { success: true };
    } catch (err) {
      const errors = err.response?.data || {};
      notifyError('Registration failed. Please check your details.', 'Error');
      setFormErrors(errors);
      return { success: false, errors };
    } finally {
      setSubmitting(false);
    }
  };

  // ── Handle logout ─────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    navigate('/auth/login', { replace: true });
  };

  // ── Handle profile update ─────────────────────────────────
  const handleUpdateProfile = async (payload) => {
    try {
      setSubmitting(true);
      const data = await updateProfile(payload);
      success('Profile updated successfully');
      return { success: true, data };
    } catch (err) {
      const errors = err.response?.data || {};
      notifyError('Failed to update profile');
      setFormErrors(errors);
      return { success: false };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    submitting,
    formErrors,
    setFormErrors,
    handleLogin,
    handleRegister,
    handleLogout,
    handleUpdateProfile,
  };
};

export default useAuth;
