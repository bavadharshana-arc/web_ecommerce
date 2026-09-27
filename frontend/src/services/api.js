import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopnexus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      errors: error.response?.data?.errors || null,
      data: error.response?.data || null,
    };

    // If 401 Unauthorized on protected route, trigger event or clear local storage if expired
    if (error.response?.status === 401 && localStorage.getItem('shopnexus_token')) {
      if (error.response?.data?.message?.includes('expired') || error.response?.data?.message?.includes('Invalid')) {
        localStorage.removeItem('shopnexus_token');
        localStorage.removeItem('shopnexus_user');
        window.dispatchEvent(new Event('shopnexus_auth_expired'));
      }
    }

    return Promise.reject(customError);
  }
);

export default api;
