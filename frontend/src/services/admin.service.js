import api from './api';

const AdminService = {

  // ── Utilisateurs ─────────────────────────────────────────
  getUsers: (params = {}) =>
    api.get('/auth/admin/users/', { params }).then(r => r.data),

  getUserDetail: (id) =>
    api.get(`/auth/admin/users/${id}/`).then(r => r.data),

  suspendreUtilisateur: (id, raison) =>
    api.post(`/auth/admin/users/${id}/suspendre/`, { raison }).then(r => r.data),

  bannirUtilisateur: (id, raison) =>
    api.post(`/auth/admin/users/${id}/bannir/`, { raison }).then(r => r.data),

  reactiversUtilisateur: (id) =>
    api.post(`/auth/admin/users/${id}/reactiver/`).then(r => r.data),

  // ── KYC ──────────────────────────────────────────────────
  getKYCPending: () =>
    api.get('/auth/kyc/admin-list/').then(r => r.data),

  verifierKYC: (userId, decision, commentaire = '') =>
    api.post('/auth/kyc/admin-verify/', { user_id: userId, decision, commentaire }).then(r => r.data),

  // ── Produits ─────────────────────────────────────────────
  getAllProducts: (params = {}) =>
    api.get('/products/admin/', { params }).then(r => r.data),

  modererProduit: (id, action) =>
    api.post(`/products/${id}/moderer/`, { action }).then(r => r.data),

  // ── Prix de marché ────────────────────────────────────────
  getPrixMarche: (params = {}) =>
    api.get('/market-prices/', { params }).then(r => r.data),

  createPrixMarche: (data) =>
    api.post('/market-prices/admin/', data).then(r => r.data),

  updatePrixMarche: (id, data) =>
    api.put(`/market-prices/${id}/`, data).then(r => r.data),

  deletePrixMarche: (id) =>
    api.delete(`/market-prices/${id}/`).then(r => r.data),

  // ── Actualités ────────────────────────────────────────────
  getAllNews: (params = {}) =>
    api.get('/news/', { params }).then(r => r.data),

  createNews: (data) =>
    api.post('/news/admin/', data).then(r => r.data),

  deleteNews: (id) =>
    api.delete(`/news/${id}/`).then(r => r.data),

  // ── Retraits ─────────────────────────────────────────────
  getWithdrawals: (params = {}) =>
    api.get('/orders/withdrawal/list/', { params }).then(r => r.data),

  approuverRetrait: (id) =>
    api.post('/orders/withdrawal/admin-approve/', { withdrawal_id: id, action: 'approve' }).then(r => r.data),

  rejeterRetrait: (id, raison) =>
    api.post('/orders/withdrawal/admin-approve/', { withdrawal_id: id, action: 'reject', raison }).then(r => r.data),

  // ── Transactions ─────────────────────────────────────────
  getTransactions: (params = {}) =>
    api.get('/wallet/plateforme/transactions/', { params }).then(r => r.data),

  getPlatformWallet: () =>
    api.get('/wallet/plateforme/').then(r => r.data),

  // ── Litiges ───────────────────────────────────────────────
  getLitiges: (params = {}) =>
    api.get('/orders/problemes/', { params }).then(r => r.data),

  getLitigeDetail: (id) =>
    api.get(`/orders/problemes/${id}/`).then(r => r.data),

  resoudreLitige: (id, decision, commentaire) =>
    api.post(`/orders/problemes/${id}/resoudre/`, { decision, commentaire }).then(r => r.data),

  // ── Notifications ─────────────────────────────────────────
  getNotifications: (params = {}) =>
    api.get('/notifications/', { params }).then(r => r.data),

  envoyerNotificationMasse: (data) =>
    api.post('/notifications/admin/envoyer/', data).then(r => r.data),

  // ── Vérifications avant 1ère publication / mission ───────
  getVerificationsVendeurs: () =>
    api.get('/auth/admin/verifications/vendeurs/').then(r => r.data),

  getVerificationsTransporteurs: () =>
    api.get('/auth/admin/verifications/transporteurs/').then(r => r.data),

  traiterVerification: (userId, type, action, motif = '') =>
    api.post('/auth/admin/verifications/traiter/', { user_id: userId, type, action, motif }).then(r => r.data),

  // ── Statistiques ─────────────────────────────────────────
  getStats: () =>
    api.get('/auth/admin/stats/').then(r => r.data),

  // ── Logs ─────────────────────────────────────────────────
  getLogs: (params = {}) =>
    api.get('/auth/admin/logs/', { params }).then(r => r.data),
};

export default AdminService;
