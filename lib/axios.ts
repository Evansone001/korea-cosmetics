import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

// Generate UUID for idempotency keys
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.FLASK_BACKEND_URL || 'http://localhost:5000'

// Create axios instance
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Enable cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add idempotency key for POST/PUT/PATCH requests
    const method = config.method?.toUpperCase();
    const needsIdempotency = ['POST', 'PUT', 'PATCH'].includes(method || '');

    console.log(`[Axios] ${method} request to: ${config.url}`);

    if (needsIdempotency) {
      config.headers = config.headers || {};
      config.headers['Idempotency-Key'] = generateUUID();
    }

    // Add auth token if present (from localStorage or cookies)
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('auth-token');

      // Also check cookies if not in localStorage
      if (!token) {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
        if (authCookie) {
          token = authCookie.split('=')[1];
        }
      }

      console.log(`[Axios] Token from localStorage: ${!!localStorage.getItem('auth-token')}`);
      console.log(`[Axios] Token from cookies: ${!!token}`);

      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('[Axios] Token added to request');
        console.log('[Axios] Authorization header:', config.headers['Authorization']?.substring(0, 50) + '...');
        console.log('[Axios] Token length:', token.length);
      } else {
        console.warn('[Axios] No auth token found for request:', config.url);
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 404 gracefully
    if (error.response?.status === 404) {
      console.warn(`API endpoint not found: ${error.config?.url}`);
      return Promise.reject(error);
    }

    // Handle 401 errors
    if (error.response?.status === 401) {
      console.warn(`Authentication required for: ${error.config?.url}`);
      // Could trigger logout or redirect to login here
      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage = (error.response?.data as any)?.error || 
                        (error.response?.data as any)?.message || 
                        `HTTP error! status: ${error.response?.status}`;
    
    console.error('API Request Error:', errorMessage);
    return Promise.reject(error);
  }
);

export default axiosInstance;
