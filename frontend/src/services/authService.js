import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.error) {
      throw new Error(data.error);
    }
    return data.data;
  },

  async register(userData) {
    const { data } = await api.post('/auth/register', userData);
    if (data.error) {
      throw new Error(data.error);
    }
    return data.data;
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    if (data.error) {
      throw new Error(data.error);
    }
    return data.data;
  }
};

export default api;
