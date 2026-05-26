// ============================================================
// AgroConnect — Transport Service
// src/services/transport.service.js
// ============================================================
import api from './api';

const TransportService = {

  // Public — list available transporters
  getTransporters: async ({ page = 1, region = '', vehicle_type = '' } = {}) => {
    const { data } = await api.get('/transport/transporters/', {
      params: { page, region, vehicle_type },
    });
    return data;
  },

  getTransporter: async (id) => {
    const { data } = await api.get(`/transport/transporters/${id}/`);
    return data;
  },

  // Transporter: manage vehicles
  getMyVehicles: async () => {
    const { data } = await api.get('/transport/mes-vehicules/');
    return data;
  },

  addVehicle: async (payload) => {
    const { data } = await api.post('/transport/vehicules/ajouter/', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  updateVehicle: async (id, payload) => {
    const { data } = await api.put(`/transport/vehicules/${id}/modifier/`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteVehicle: async (id) => {
    await api.delete(`/transport/vehicules/${id}/supprimer/`);
  },

  // Availability
  getAvailability: async () => {
    const { data } = await api.get('/transport/disponibilite/');
    return data;
  },

  setAvailability: async (payload) => {
    const { data } = await api.post('/transport/disponibilite/', payload);
    return data;
  },

  // Missions
  getMyMissions: async ({ page = 1, status = '' } = {}) => {
    const { data } = await api.get('/transport/mes-missions/', {
      params: { page, status },
    });
    return data;
  },

  updateMissionStatus: async (id, status) => {
    const { data } = await api.post(`/transport/mes-missions/${id}/update-status/`, { status });
    return data;
  },

  // Deliveries (alias for missions)
  getMyDeliveries: async ({ page = 1, status = '' } = {}) => {
    const { data } = await api.get('/transport/mes-missions/', { params: { page, status } });
    return data;
  },

  // Accept mission
  acceptMission: async (id) => {
    const { data } = await api.post(`/transport/mes-missions/${id}/accepter/`);
    return data;
  },

  // Decline mission  
  declineMission: async (id) => {
    const { data } = await api.post(`/transport/mes-missions/${id}/refuser/`);
    return data;
  },
};

export default TransportService;
