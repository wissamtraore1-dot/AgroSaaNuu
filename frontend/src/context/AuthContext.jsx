// ============================================================
// AgroSaaNuu — Auth Context
// src/context/AuthContext.jsx
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ===== CHARGEMENT INITIAL =====
  const chargerUtilisateur = useCallback(async () => {
    try {
      if (AuthService.isAuthenticated()) {
        const data = await AuthService.monProfil();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        // Token expiré ou invalide → déconnexion
        localStorage.clear();
        setUser(null);
      } else {
        // Erreur réseau / serveur → garder l'utilisateur du localStorage
        const stored = localStorage.getItem('user');
        if (stored) {
          try { setUser(JSON.parse(stored)); } catch { /* malformed */ }
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerUtilisateur();
  }, [chargerUtilisateur]);

  // ===== CONNEXION =====
  const login = async (email, password) => {
    setError(null);
    try {
      const data = await AuthService.connexion(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.errors?.non_field_errors?.[0]
        || err.response?.data?.message
        || 'Erreur de connexion.';
      setError(message);
      throw new Error(message, { cause: err });
    }
  };

  // ===== DÉCONNEXION =====
  const logout = async () => {
    try {
      await AuthService.deconnexion();
    } finally {
      setUser(null);
      localStorage.clear();
    }
  };

  // ===== MISE À JOUR PROFIL =====
  const updateUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // ===== GETTERS RÔLE =====
  const isBuyer       = user?.role === 'BUYER';
  const isSeller      = user?.role === 'SELLER';
  const isTransporter = user?.role === 'TRANSPORTER';
  const isAdmin       = user?.role === 'ADMIN';
  const isVerified    = user?.is_verified === true;

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    chargerUtilisateur,
    isBuyer,
    isSeller,
    isTransporter,
    isAdmin,
    isVerified,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
}

export default AuthContext;
