// ============================================================
// AgroSaaNuu — Product Service
// src/services/product.service.js
// ============================================================
import api from './api';

const ProductService = {

  async liste(params = {}) {
    const response = await api.get('/products/', { params });
    return response.data;
  },

  async getAll(params = {}) {
    return this.liste(params);
  },

  async detail(id) {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },

  async categories() {
    const response = await api.get('/products/categories/');
    return response.data;
  },

  async getCategories() {
    return this.categories();
  },

  async mesProduits() {
    const response = await api.get('/products/mes-produits/');
    return response.data;
  },

  async creer(data) {
    const response = await api.post('/products/creer/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async modifier(id, data) {
    const response = await api.put(`/products/${id}/modifier/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async supprimer(id) {
    const response = await api.delete(`/products/${id}/supprimer/`);
    return response.data;
  },

  async ajouterAvis(id, data) {
    const response = await api.post(`/products/${id}/avis/`, data);
    return response.data;
  },

  async toggleFavori(id) {
    const response = await api.post(`/products/${id}/favori/`);
    return response.data;
  },

  async mesFavoris() {
    const response = await api.get('/products/favoris/');
    return response.data;
  },
};

export default ProductService;
