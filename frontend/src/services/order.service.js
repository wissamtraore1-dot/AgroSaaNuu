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

  // Vendeur ① — confirme avoir reçu la commande
  async confirmer(id) {
    const response = await api.post(`/orders/${id}/confirmer/`);
    return response.data;
  },

  // Vendeur ② — confirme que le produit est prêt
  async confirmerPreparation(id) {
    const response = await api.post(`/orders/${id}/confirmer-preparation/`);
    return response.data;
  },

  // Vendeur ③ — remet le colis au transporteur
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

  async mesProblemes() {
    const response = await api.get('/orders/mes-problemes/');
    return response.data;
  },

  async detailProbleme(id) {
    const response = await api.get(`/orders/problemes/${id}/`);
    return response.data;
  },

  async resoudreProbleme(id, { resolution, statut = 'RESOLU' }) {
    const response = await api.patch(`/orders/problemes/${id}/resoudre/`, { resolution, statut });
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

  // ===== NOUVELLES MÉTHODES =====

  async noterVendeur(commandeId, { note, commentaire = '' }) {
    const response = await api.post(`/orders/${commandeId}/noter-vendeur/`, { note, commentaire });
    return response.data;
  },

  async confirmerTripartite(commandeId) {
    const response = await api.post(`/orders/${commandeId}/confirmer-tripartite/`);
    return response.data;
  },

  async initierPaiementFedaPay({ commande_id, mode_paiement, telephone }) {
    const response = await api.post('/orders/payment/initiate/', { commande_id, mode_paiement, telephone });
    return response.data;
  },

  async simulerPaiement(commandeId, { telephone, reseau, montant }) {
    const response = await api.post(`/orders/${commandeId}/simuler-paiement/`, { telephone, reseau, montant });
    return response.data;
  },

  async simulerPaiementPanier(panierId, { telephone, reseau }) {
    const response = await api.post(`/orders/panier/${panierId}/simuler-paiement/`, { telephone, reseau });
    return response.data;
  },

  async simulerPaiementGroupeVendeur(groupeVendeurId, { telephone, reseau }) {
    const response = await api.post(`/orders/groupe/${groupeVendeurId}/simuler-paiement/`, { telephone, reseau });
    return response.data;
  },

  async initierPaiementGroupeVendeur(groupeVendeurId, { telephone, reseau }) {
    const response = await api.post(`/orders/groupe/${groupeVendeurId}/initier-paiement/`, { telephone, reseau });
    return response.data;
  },

  async initierPaiementPanier(panierId, { telephone, reseau }) {
    const response = await api.post(`/orders/panier/${panierId}/initier-paiement/`, { telephone, reseau });
    return response.data;
  },

  async renommerCommande(commandeId, nomCommande) {
    const response = await api.patch(`/orders/${commandeId}/renommer/`, { nom_commande: nomCommande });
    return response.data;
  },

};

export default OrderService;
