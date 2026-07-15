import api from './api';

const AuthService = {

  async inscription(data) {
    const response = await api.post('/auth/inscription/', data);
    return response.data;
  },

  async connexion(email, password) {
    const response = await api.post('/auth/connexion/', { email, password });
    const { tokens, user } = response.data;
    localStorage.setItem('access_token',  tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user',          JSON.stringify(user));
    return response.data;
  },

  async loginUnifie(identifiant, password) {
    const response = await api.post('/auth/login/', { identifiant, password });
    const { tokens, user } = response.data;
    localStorage.setItem('access_token',  tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user',          JSON.stringify(user));
    return response.data;
  },

  async deconnexion() {
    const refresh = localStorage.getItem('refresh_token');
    try {
      await api.post('/auth/deconnexion/', { refresh });
    } finally {
      localStorage.clear();
    }
  },

  async monProfil() {
    const response = await api.get('/auth/profil/');
    return response.data;
  },

  async modifierProfil(data) {
    const isFormData = data instanceof FormData;
    const response = await api.put('/auth/profil/', data, isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined
    );
    return response.data;
  },

  async changerMotDePasse(data) {
    const response = await api.post('/auth/changer-mot-de-passe/', data);
    return response.data;
  },

  async envoyerOTP(telephone, type) {
    const response = await api.post('/auth/otp/envoyer/', { telephone, type });
    return response.data;
  },

  async verifierOTP(telephone, code, type) {
    const response = await api.post('/auth/otp/verifier/', { telephone, code, type });
    return response.data;
  },

  async reinitialisationMDP(email) {
    const response = await api.post('/auth/reinitialisation-mdp/', { email });
    return response.data;
  },

  async confirmerReinit(data) {
    const response = await api.post('/auth/confirmer-reinitialisation/', data);
    return response.data;
  },

  // ===== NOUVELLES MÉTHODES SMS AUTH =====

  async requestOTP(phone) {
    const response = await api.post('/auth/sms/request-otp/', { phone });
    return response.data;
  },

  async registerPhone(data) {
    // data: { phone, role, nom_complet, password, ville?, email? }
    // Crée le compte directement, sans OTP (la vérification du numéro se fait à la connexion).
    const response = await api.post('/auth/sms/register/', data);
    const { tokens, user } = response.data;
    localStorage.setItem('access_token',  tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user',          JSON.stringify(user));
    return response.data;
  },

  async phoneLogin(phone, code) {
    const response = await api.post('/auth/sms/phone-login/', { phone, code });
    const { tokens, user } = response.data;
    localStorage.setItem('access_token',  tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user',          JSON.stringify(user));
    return response.data;
  },

  async resendOTP(phone) {
    const response = await api.post('/auth/sms/resend-otp/', { phone });
    return response.data;
  },

  async completeProfile(data) {
    const response = await api.put('/auth/complete-profile/', data);
    const { user } = response.data;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  async isProfileComplete() {
    const user = this.getUser();
    return !!(user?.prenom && user?.cip);
  },

  // ===== NOUVELLES MÉTHODES KYC =====

  async uploadKYCDocument(data) {
    const formData = new FormData();
    formData.append('document_type', data.document_type);
    formData.append('cip_photo', data.cip_photo);
    const response = await api.post('/auth/kyc/upload-document/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async getKYCStatus() {
    const response = await api.get('/auth/kyc/status/');
    return response.data;
  },

  async getSellerProfile() {
    const response = await api.get('/auth/seller-profile/');
    return response.data;
  },

  async updateSellerProfile(data) {
    const response = await api.put('/auth/seller-profile/', data);
    return response.data;
  },

  async getTransporterProfile() {
    const response = await api.get('/auth/transporter-profile/');
    return response.data;
  },

  async updateTransporterProfile(data) {
    const response = await api.put('/auth/transporter-profile/', data);
    return response.data;
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  getToken() {
    return localStorage.getItem('access_token');
  },

  logout() {
    localStorage.clear();
  },
};

export default AuthService;
