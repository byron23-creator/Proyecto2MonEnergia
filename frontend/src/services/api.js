import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// create axios instance - we attach the token before each request
const api = axios.create({
  baseURL: BASE_URL,
});

// inject auth token from auth0 into every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// nodos
export const getNodos = () => api.get('/nodos');

// metricas
export const postMetrica = (data) => api.post('/metricas', data);
export const getMetricasRecientes = (nodoId) => api.get(`/metricas/recientes?nodoId=${nodoId}`);
export const getMetricas = (params) => api.get('/metricas', { params });
export const getGeneracion = (agrupacion = 'dia') => api.get(`/metricas/generacion?agrupacion=${agrupacion}`);
export const getEstadoNodos = () => api.get('/metricas/estado');
