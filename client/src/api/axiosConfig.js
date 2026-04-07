import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 60000, // 60 s — Gemini calls can take a few seconds
  headers: {
    Accept: 'application/json',
  },
});

// Interceptor to attach the JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
