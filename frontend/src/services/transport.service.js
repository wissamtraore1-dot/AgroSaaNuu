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
  acceptMission: async (id, delaiValeur, delaiUnite = 'JOURS') => {
    const body = delaiValeur != null
      ? { delai_livraison_jours: delaiValeur, delai_livraison_unite: delaiUnite }
      : {};
    const { data } = await api.post(`/transport/missions/${id}/accepter/`, body);
    return data;
  },

  // Decline mission
  declineMission: async (id) => {
    const { data } = await api.post(`/transport/missions/${id}/refuser/`);
    return data;
  },

  // ─── NOUVELLES MÉTHODES ───────────────────────────────────────────────────

  // Transporteurs disponibles filtrés par trajet + capacité
  getTransporteursDisponibles: async ({ ville_depart = '', ville_arrivee = '', tonnes = 1 } = {}) => {
    const { data } = await api.get('/transport/disponibles/', {
      params: { ville_depart, ville_arrivee, tonnes },
    });
    return data;
  },

  // Estimation de coût
  estimerCout: async ({ ville_depart, ville_arrivee, tonnes }) => {
    const { data } = await api.get('/transport/estimation/', {
      params: { ville_depart, ville_arrivee, tonnes },
    });
    return data;
  },

  // Assigner un transporteur à une commande
  assignerTransporteur: async (payload) => {
    // payload: { commande_id, transporteur_id, vehicule_id?, ville_depart, ville_arrivee, date_depart? }
    const { data } = await api.post('/transport/assigner/', payload);
    return data;
  },

  // Mission d'une commande spécifique
  getMissionDeCommande: async (commandeId) => {
    const { data } = await api.get(`/transport/commande/${commandeId}/mission/`);
    return data;
  },

  // Détail mission
  getMission: async (id) => {
    const { data } = await api.get(`/transport/missions/${id}/`);
    return data;
  },

  // Démarrer une mission (transporteur)
  demarrerMission: async (id) => {
    const { data } = await api.post(`/transport/missions/${id}/demarrer/`);
    return data;
  },

  // Terminer une mission (transporteur)
  terminerMission: async (id) => {
    const { data } = await api.post(`/transport/missions/${id}/terminer/`);
    return data;
  },

  // Noter le transporteur (acheteur/vendeur)
  noterTransporteur: async (missionId, { note, commentaire = '' }) => {
    const { data } = await api.post(`/transport/missions/${missionId}/noter/`, { note, commentaire });
    return data;
  },

  // ─── Tarifs livraison ─────────────────────────────────────────────────────

  mesTarifs: async () => {
    const { data } = await api.get('/transport/mes-tarifs/');
    return data;
  },

  ajouterTarif: async (payload) => {
    const { data } = await api.post('/transport/tarifs/ajouter/', payload);
    return data;
  },

  modifierTarif: async (id, payload) => {
    const { data } = await api.put(`/transport/tarifs/${id}/`, payload);
    return data;
  },

  supprimerTarif: async (id) => {
    await api.delete(`/transport/tarifs/${id}/`);
  },

  getTarifsParTrajet: async ({ ville_depart, ville_arrivee }) => {
    const { data } = await api.get('/transport/tarifs/trajet/', {
      params: { ville_depart, ville_arrivee },
    });
    return data;
  },

  // Profil public complet d'un transporteur (zones + tarifs, sans auth)
  getTransporteurProfil: async (id) => {
    const { data } = await api.get(`/transport/transporteurs/${id}/`);
    return data;
  },
};

export default TransportService;
