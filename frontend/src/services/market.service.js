import api from './api';

const MarketService = {

  async listePrix(params = {}) {
    const response = await api.get('/market-prices/', { params });
    return response.data;
  },

  async historique(produit, ville) {
    const response = await api.get('/market-prices/historique/', {
      params: { produit, ville }
    });
    return response.data;
  },

  async statistiques() {
    const response = await api.get('/market-prices/statistiques/');
    return response.data;
  },

  async mesAlertes() {
    const response = await api.get('/market-prices/alertes/');
    return response.data;
  },

  async creerAlerte(data) {
    const response = await api.post('/market-prices/alertes/creer/', data);
    return response.data;
  },

  async supprimerAlerte(id) {
    const response = await api.delete(`/market-prices/alertes/${id}/supprimer/`);
    return response.data;
  },
};

export default MarketService;