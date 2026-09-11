import axios from "axios";

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    const isLocalIp = /^192\.168\./.test(host) || /^10\./.test(host) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);

    if (isLocalHost || isLocalIp) {
      return isLocalHost ? 'http://localhost:5000/api' : `http://${host}:5000/api`;
    }
  }

  // If VITE_API_URL is explicitly set in environment variables
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim().length > 0) {
    return import.meta.env.VITE_API_URL.trim();
  }

  // Deployed site (Vercel / Production HTTPS)
  return 'https://backend-thundersafe.onrender.com/api';
};

export const API_BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds to support Render free tier cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menyematkan token JWT secara otomatis ke setiap request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor response untuk menangani 401 (token kadaluwarsa / tidak valid)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/dashboard')) {
          window.location.href = '/login?expired=1';
        }
      }
    }
    return Promise.reject(error);
  }
);
