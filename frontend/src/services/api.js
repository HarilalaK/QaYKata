/**
 * Service API pour communiquer avec le backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Création de l'instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Services
export const projectsService = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  uploadPlan: (id, formData) => 
    api.post(`/projects/${id}/upload-plan`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const quotesService = {
  getAll: (params) => api.get('/quotes', { params }),
  getById: (id) => api.get(`/quotes/${id}`),
  create: (data) => api.post('/quotes', data),
  update: (id, data) => api.put(`/quotes/${id}`, data),
  delete: (id) => api.delete(`/quotes/${id}`),
  addItem: (id, itemData) => api.post(`/quotes/${id}/items`, itemData),
  updateStatus: (id, status) => api.patch(`/quotes/${id}/status`, { status }),
  getPdfData: (id) => api.get(`/quotes/${id}/pdf-data`),
};

export const productsService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, quantity, operation = 'set') => 
    api.patch(`/products/${id}/stock`, { quantity, operation }),
};

export const calculationsService = {
  maconnerie: (data) => api.post('/calculations/maconnerie', data),
  beton: (data) => api.post('/calculations/beton', data),
  fers: (data) => api.post('/calculations/fers', data),
  toiture: (data) => api.post('/calculations/toiture', data),
  peinture: (data) => api.post('/calculations/peinture', data),
  carrelage: (data) => api.post('/calculations/carrelage', data),
  projetComplet: (data) => api.post('/calculations/projet-complet', data),
  getHistory: (projectId) => api.get(`/calculations/history/${projectId}`),
};

export const visionService = {
  analyze: (imageUrl, projectId, model) => 
    api.post('/vision/analyze', { imageUrl, projectId, model }),
  analyzeUpload: (imageBase64, projectId, model) => 
    api.post('/vision/analyze-upload', { imageBase64, projectId, model }),
  getPrompt: () => api.get('/vision/test-prompt'),
};

export default api;
