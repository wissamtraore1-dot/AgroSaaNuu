// ============================================================
// AgroConnect — Notification Service
// src/services/notification.service.js
// ============================================================
import api from './api';

const NotificationService = {

  async mesNotifications() {
    const response = await api.get('/notifications/');
    return response.data;
  },

  async nonLues() {
    const response = await api.get('/notifications/non-lues/');
    return response.data;
  },

  async marquerLue(id) {
    const response = await api.post(`/notifications/${id}/lue/`);
    return response.data;
  },

  async toutLire() {
    const response = await api.post('/notifications/tout-lire/');
    return response.data;
  },
};

export default NotificationService;