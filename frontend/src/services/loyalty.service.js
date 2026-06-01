// ============================================================
// AgroConnect — Loyalty / Points Service
// src/services/loyalty.service.js
// ============================================================
import api from './api';

const LoyaltyService = {

  // Get current points balance + tier info
  getPoints: async () => {
    const { data } = await api.get('/loyalty/mes-points/');
    return data;
    // returns { balance, tier, tier_progress, lifetime_points }
  },

  // Get points history (paginated)
  getHistory: async ({ page = 1, limit = 10 } = {}) => {
    const { data } = await api.get('/loyalty/historique/', {
      params: { page, limit },
    });
    return data;
    // returns { results: [{ type, points, order_id, date }], count }
  },

  // Redeem points → convert to wallet credit
  redeemPoints: async (points) => {
    const { data } = await api.post('/loyalty/utiliser/', { points });
    return data;
    // returns { points_echanges, fcfa_credite, nouveau_solde }
  },

  // Calculate max points usable for a given order amount
  calcUsablePoints: async (orderAmount) => {
    const { data } = await api.get('/loyalty/calculer/', {
      params: { amount: orderAmount },
    });
    return data;
    // returns { points_dispo, max_points, max_remise_fcfa, fcfa_par_point }
  },
};

export default LoyaltyService;
