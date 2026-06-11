import api from './api';

const CartService = {
  async monPanier() {
    const { data } = await api.get('/cart/');
    return data;
  },

  async ajouter(produit_id, quantite = 1) {
    const { data } = await api.post('/cart/ajouter/', { produit_id, quantite });
    return data;
  },

  async modifier(ligneId, quantite) {
    const { data } = await api.put(`/cart/modifier/${ligneId}/`, { quantite });
    return data;
  },

  async supprimer(ligneId) {
    const { data } = await api.delete(`/cart/supprimer/${ligneId}/`);
    return data;
  },

  async vider() {
    const { data } = await api.post('/cart/vider/');
    return data;
  },
};

export default CartService;
