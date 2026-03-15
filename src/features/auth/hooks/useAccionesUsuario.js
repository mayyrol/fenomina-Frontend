import { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';

export function useAccionesUsuario(onExito, onError) {
  const [cargando, setCargando] = useState(false);

  const ejecutar = async (accion, id) => {
    setCargando(true);
    try {
      await axiosInstance.patch(`/auth/usuarios/${id}/${accion}`);
      onExito?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Error al ejecutar la acción.');
    } finally {
      setCargando(false);
    }
  };

  return { ejecutar, cargando };
}