// ============================================================
// AgroConnect — Loyalty Context
// src/context/LoyaltyContext.jsx
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import LoyaltyService from '../services/loyalty.service';
import { getTier, getTierProgress, calcPointsValue } from '../utils/constants';
import { useAuth } from './AuthContext';

const LoyaltyContext = createContext(null);

export const LoyaltyProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [points, setPoints]     = useState({
    balance:         0,
    lifetime_points: 0,
    tier:            null,
    tier_progress:   0,
  });
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // ── Fetch points balance ──────────────────────────────────
  const fetchPoints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await LoyaltyService.getPoints();
      setPoints({
        ...data,
        tier:          getTier(data.lifetime_points),
        tier_progress: getTierProgress(data.lifetime_points),
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load points');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch history ─────────────────────────────────────────
  const fetchHistory = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const data = await LoyaltyService.getHistory(params);
      setHistory(data.results);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load points history');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Redeem points → wallet credit ─────────────────────────
  const redeemPoints = async (pointsAmount) => {
    const data = await LoyaltyService.redeemPoints(pointsAmount);
    await fetchPoints(); // refresh after redeem
    return data;
  };

  // ── Value of current balance in FCFA ─────────────────────
  const balanceInFcfa = calcPointsValue(points.balance);

  // Seulement si connecté
  useEffect(() => {
    if (isAuthenticated) fetchPoints();
  }, [fetchPoints, isAuthenticated]);

  return (
    <LoyaltyContext.Provider value={{
      points,
      history,
      loading,
      error,
      balanceInFcfa,
      fetchPoints,
      fetchHistory,
      redeemPoints,
    }}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyaltyContext = () => {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error('useLoyaltyContext must be used inside LoyaltyProvider');
  return ctx;
};