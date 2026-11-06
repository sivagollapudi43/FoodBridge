import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically to every request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('foodbridge_token');
      localStorage.removeItem('foodbridge_user');
      if (window.location.pathname.startsWith('/dashboard')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const checkHealth = async () => {
  try {
    const res = await api.get('/health');
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.message,
      database: { status: 'Unreachable' },
    };
  }
};

export default api;
