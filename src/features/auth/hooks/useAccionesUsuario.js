import { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';

export function useAccionesUsuario(onExito) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const ejecutar = async (accion, id) => {
    setCargando(true);
    setError(null);
    try {
      await axiosInstance.patch(`/auth/usuarios/${id}/${accion}`);
      onExito();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al ejecutar la acción.');
    } finally {
      setCargando(false);
    }
  };

  return { ejecutar, cargando, error };
}