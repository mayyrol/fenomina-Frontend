import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081', //URL de AuthService (¡TEMPORAL!) una vez que se implemente APIGateway (Backend) cambiar a 8080
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST: adjunta el access token a cada petición
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE: si el token expiró (401), intenta renovarlo automáticamente
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        const { data } = await axios.post('http://localhost:8081/auth/refresh', {
          refreshToken,
        });

        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;