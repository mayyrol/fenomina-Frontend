import { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = () => {
    setCargando(true);
    axiosInstance
      .get('/auth/usuarios')
      .then(({ data }) => setUsuarios(data))
      .catch((err) => setError(err))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  return { usuarios, cargando, error, recargar: cargar };
}