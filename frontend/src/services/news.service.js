import api from './api';

const NewsService = {
  getAll: async ({ page = 1, search = '', categorie = '', est_vedette = '' } = {}) => {
    const { data } = await api.get('/news/', {
      params: {
        page,
        search,
        categorie,
        est_vedette,
      },
    });
    return data;
  },

  getOne: async (id) => {
    const { data } = await api.get(`/news/${id}/`);
    return data;
  },

  getCategories: async () => {
    const { data } = await api.get('/news/categories/');
    return data;
  },
};

export default NewsService;
