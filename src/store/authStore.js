import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { detenerRefreshAutomatico } from '../utils/tokenRefresh';

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      usuario: null,

      setTokens: (accessToken, refreshToken, expiresIn) =>
        set({ accessToken, refreshToken, expiresIn }),

      setUsuario: (usuario) => set({ usuario }),

      logout: () => {
        detenerRefreshAutomatico();  
        set({ accessToken: null, refreshToken: null, usuario: null });
      }}),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        usuario: state.usuario,
        accessToken: state.accessToken,
      }),
    }
  )
);