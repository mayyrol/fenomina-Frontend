import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const masterAxios = axios.create({
  baseURL: import.meta.env.VITE_MASTER_API_URL,
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

masterAxios.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.url?.includes('/internal/')) {
      config.headers['X-Internal-Api-Key'] = import.meta.env.VITE_INTERNAL_API_KEY;
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

masterAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return masterAxios(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken }
        );
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken, data.expiresIn);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return masterAxios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default masterAxios;