import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if it's invalid / expired
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const cookieOptions: Cookies.CookieAttributes = { path: '/' };
      if (hostname.endsWith('sinea.id')) {
        cookieOptions.domain = '.sinea.id';
      }
      Cookies.remove('token', cookieOptions);
      // If running on client, maybe redirect to login
      if (typeof window !== 'undefined') {
        // window.location.href = '/login'; 
        // We will leave redirection to the components/hooks for better UX
      }
    }
    return Promise.reject(error);
  }
);

export const getMediaUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('/') || url.startsWith('uploads/')) {
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${API_URL}${cleanUrl}`;
  }
  if (url.includes('localhost:3001')) {
    return url.replace('http://localhost:3001', API_URL);
  }
  return url;
};
