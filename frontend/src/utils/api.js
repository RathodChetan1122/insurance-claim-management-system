import axios from 'axios';

// Ensure the URL always ends with /api to match your Flask Blueprints
const BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://127.0.0.1:5000/api';

const api = axios.create({ 
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    // Standard 401 handling for expired or invalid tokens
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;