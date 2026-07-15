// ============================================================
// AgroSaaNuu — Wallet Service
// src/services/wallet.service.js
// ============================================================
import api from './api';

const WalletService = {

  async monWallet() {
    const response = await api.get('/wallet/');
    return response.data;
  },

  async deposer(data) {
    const response = await api.post('/wallet/deposer/', data);
    return response.data;
  },

  async retirer(data) {
    const response = await api.post('/wallet/retirer/', data);
    return response.data;
  },

  async transactions() {
    const response = await api.get('/wallet/transactions/');
    return response.data;
  },
};

export default WalletService;