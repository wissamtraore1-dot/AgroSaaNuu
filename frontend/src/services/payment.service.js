// ============================================================
// AgroConnect — Payment Service (Escrow + Mobile Money)
// src/services/payment.service.js
// ============================================================
import api from './api';

const PaymentService = {

  // Initiate a payment for an order
  // methodId: 'mtn_momo' | 'moov_money' | 'celtis_cash' | 'wallet'
  initiatePayment: async ({ orderId, methodId, phone, usePoints = 0 }) => {
    const { data } = await api.post('/orders/payment/initiate/', {
      commande_id: orderId,
      method: methodId,
      phone: phone?.replace(/\s/g, '') || null,
      points_used: usePoints,
    });
    return data;
    // returns { paiement_id, statut, montant, frais, total, reference }
  },

  // Check payment status (poll this after initiating)
  checkStatus: async (paymentId) => {
    const { data } = await api.get(`/orders/payment/${paymentId}/`);
    return data;
    // returns { statut: 'EN_ATTENTE' | 'EN_ESCROW' | 'PRET_VENDEUR' | 'TRANSFERE' | 'ECHOUE', ... }
  },

  // Confirm payment received (enter escrow)
  confirmPayment: async ({ paiement_id, transaction_id, reference_transaction }) => {
    const { data } = await api.post('/orders/payment/confirm/', {
      paiement_id,
      transaction_id,
      reference_transaction,
    });
    return data;
    // returns { paiement_id, statut: 'EN_ESCROW', ... }
  },

  // Confirm delivery — buyer triggers this to release escrow funds
  confirmDelivery: async (commandeId) => {
    const { data } = await api.post('/orders/payment/release/', {
      commande_id: commandeId,
    });
    return data;
    // returns { paiement_id, statut: 'TRANSFERE', ... }
  },

  // Open a dispute on an order
  openDispute: async (orderId, reason) => {
    const { data } = await api.post(`/orders/${orderId}/litige/`, { description: reason });
    return data;
  },

  // Get payment details
  getPayment: async (paymentId) => {
    const { data } = await api.get(`/orders/payment/${paymentId}/`);
    return data;
  },

  // Request seller withdrawal
  requestWithdrawal: async (data) => {
    const response = await api.post('/orders/withdrawal/request/', data);
    return response.data;
  },

  // Get seller withdrawal history
  getWithdrawalHistory: async () => {
    const response = await api.get('/orders/withdrawal/list/');
    return response.data;
  },

  // Get KYC status
  getKYCStatus: async () => {
    const response = await api.get('/auth/kyc/status/');
    return response.data;
  },

  // Upload KYC document
  uploadKYCDocument: async (data) => {
    const formData = new FormData();
    formData.append('document_type', data.document_type);
    formData.append('cip_photo', data.cip_photo);
    const response = await api.post('/auth/kyc/upload-document/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
};

export default PaymentService;