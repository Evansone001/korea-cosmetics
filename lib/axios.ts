import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

// Generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.FLASK_BACKEND_URL ||
  'http://localhost:5000';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased from 10s to 30s for bulk operations
  withCredentials: true,
});

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toUpperCase();

    if (['POST', 'PUT', 'PATCH'].includes(method || '')) {
      config.headers['Idempotency-Key'] = generateUUID();
    }

    // AUTH TOKEN
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');

      const authCookie = cookies.find((cookie) =>
        cookie.trim().startsWith('auth-token=')
      );

      const token = authCookie?.split('=')[1];

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,

  (error: AxiosError) => {
    // Don't log 404 errors - they can be handled gracefully by calling code
    if (error.response?.status === 404) {
      return Promise.reject(error);
    }

    const errorMessage =
      (error.response?.data as any)?.error ||
      (error.response?.data as any)?.message ||
      error.message ||
      'Request failed';

    console.error('API Request Error:', errorMessage);

    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;