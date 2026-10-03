import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authService = {
  async login(email, password) {
    try {
      console.log('Login attempt to:', `${API_URL}/auth/login`);
      const { data } = await api.post('/auth/login', { email, password });
      console.log('Login response:', data);
      if (data.error) {
        throw new Error(data.error);
      }
      return data.data;
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.status) {
        throw new Error(`Request failed with status code ${error.response.status}`);
      }
      throw new Error(error.message || 'Network Error');
    }
  },

  async register(userData) {
    try {
      const { data } = await api.post('/auth/register', userData);
      if (data.error) {
        throw new Error(data.error);
      }
      return data.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || 'Network Error');
    }
  },

  async logout() {
    try {
      const { data } = await api.post('/auth/logout');
      if (data.error) {
        throw new Error(data.error);
      }
      return data.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || 'Network Error');
    }
  },

  async getMe() {
    try {
      const { data } = await api.get('/auth/me');
      if (data.error) {
        throw new Error(data.error);
      }
      return data.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || 'Network Error');
    }
  }
};

export default api;
