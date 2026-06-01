// ============================================================
// AgroConnect — Order Service
// src/services/order.service.js
// ============================================================
import api from './api';

const OrderService = {

  async passerCommande(data) {
    const response = await api.post('/orders/passer/', data);
    return response.data;
  },

  async mesCommandes() {
    const response = await api.get('/orders/mes-commandes/');
    return response.data;
  },

  async getBuyerOrders(params = {}) {
    const response = await api.get('/orders/mes-commandes/', { params });
    return response.data;
  },

  async commandesRecues() {
    const response = await api.get('/orders/commandes-recues/');
    return response.data;
  },

  async getSellerOrders(params = {}) {
    const response = await api.get('/orders/commandes-recues/', { params });
    return response.data;
  },

  async detail(id) {
    const response = await api.get(`/orders/${id}/`);
    return response.data;
  },

  async confirmer(id) {
    const response = await api.post(`/orders/${id}/confirmer/`);
    return response.data;
  },

  async enLivraison(id) {
    const response = await api.post(`/orders/${id}/en-livraison/`);
    return response.data;
  },

  async confirmerReception(id, data) {
    const response = await api.post(`/orders/${id}/confirmer-reception/`, data);
    return response.data;
  },

  async annuler(id) {
    const response = await api.post(`/orders/${id}/annuler/`);
    return response.data;
  },

  async signalerLitige(id, description) {
    const response = await api.post(`/orders/${id}/litige/`, { description });
    return response.data;
  },

  // ===== NOUVELLES MÉTHODES PAIEMENT & ESCROW =====

  async initiatePaiement(data) {
    const response = await api.post('/orders/payment/initiate/', data);
    return response.data;
  },

  async confirmPaiement(data) {
    const response = await api.post('/orders/payment/confirm/', data);
    return response.data;
  },

  async releasePaiement(commande_id) {
    const response = await api.post('/orders/payment/release/', { commande_id });
    return response.data;
  },

  async getPaiement(paiement_id) {
    const response = await api.get(`/orders/payment/${paiement_id}/`);
    return response.data;
  },

  // ===== NOUVELLES MÉTHODES RETRAIT VENDEUR =====

  async demandedRetrait(data) {
    const response = await api.post('/orders/withdrawal/request/', data);
    return response.data;
  },

  async mesRetraits() {
    const response = await api.get('/orders/withdrawal/list/');
    return response.data;
  },

  async getRetrait(retrait_id) {
    const response = await api.get(`/orders/withdrawal/${retrait_id}/`);
    return response.data;
  },

  // ===== MÉTHODES ADMIN =====

  async adminApproveWithdrawal(retrait_id, data) {
    const response = await api.post(`/orders/withdrawal/admin-approve/`, {
      retrait_id,
      ...data
    });
    return response.data;
  },

  async adminVerifyKYC(user_id, data) {
    const response = await api.post(`/auth/kyc/admin-verify/`, {
      user_id,
      ...data
    });
    return response.data;
  },
};

export default OrderService;
