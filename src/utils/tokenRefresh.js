import { useAuthStore } from '../store/authStore';
import axiosInstance from '../api/axiosInstance';

let refreshTimer = null;

export function iniciarRefreshAutomatico() {
  const { accessToken, refreshToken, expiresIn } = useAuthStore.getState();

  if (!accessToken || !expiresIn) return;

  if (refreshTimer) clearTimeout(refreshTimer);

  const tiempoHastaRefresh = (expiresIn - 60) * 1000;

  refreshTimer = setTimeout(async () => {
    try {
      const { data } = await axiosInstance.post('/auth/refresh', {
        refreshToken,
      });

      useAuthStore.getState().setTokens(
        data.accessToken,
        data.refreshToken,
        data.expiresIn
      );

      iniciarRefreshAutomatico();
    } catch (error) {
      console.error('Error al refrescar token:', error);
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
  }, tiempoHastaRefresh);
}

export function detenerRefreshAutomatico() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}