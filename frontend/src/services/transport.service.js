// ============================================================
// AgroConnect — Transport Service
// src/services/transport.service.js
// ============================================================
import api from './api';

const TransportService = {

  // Public — list available transporters
  getTransporters: async ({ page = 1, region = '', vehicle_type = '' } = {}) => {
    const { data } = await api.get('/transport/transporteurs/', {
      params: { page, region, vehicle_type },
    });
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

  setAvailability: async (estDisponible) => {
    const { data } = await api.post('/transport/disponibilite/', { est_disponible: estDisponible });
    return data;
  },

  // Missions
  getMyMissions: async ({ page = 1, status = '' } = {}) => {
    const { data } = await api.get('/transport/mes-missions/', {
      params: { page, status },
    });
    return data;
  },

  updateMissionStatus: async (id, newStatus) => {
    const endpoint = newStatus === 'ACCEPTEE'
      ? `/transport/missions/${id}/accepter/`
      : `/transport/missions/${id}/refuser/`;
    const { data } = await api.post(endpoint);
    return data;
  },

  // Deliveries (alias for missions)
  getMyDeliveries: async ({ page = 1, status = '' } = {}) => {
    const { data } = await api.get('/transport/mes-missions/', { params: { page, status } });
    return data;
  },

  // Accept mission
  acceptMission: async (id) => {
    const { data } = await api.post(`/transport/missions/${id}/accepter/`);
    return data;
  },

  // Decline mission
  declineMission: async (id) => {
    const { data } = await api.post(`/transport/missions/${id}/refuser/`);
    return data;
  },
};

export default TransportService;
