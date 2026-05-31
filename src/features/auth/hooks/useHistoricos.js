import { useState, useEffect, useCallback } from 'react';

export function useHistoricos(serviceFn, params) {
  const [datos,      setDatos]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [cargando,   setCargando]   = useState(false);
  const [error,      setError]      = useState(null);

  const fetchDatos = useCallback(async () => {
    if (!params?.empresaId) return;
    setCargando(true);
    setError(null);
    try {
      const { data } = await serviceFn(params);
      setDatos(data.content ?? []);
      setTotal(data.totalElements ?? 0);
    } catch (err) {
      setError(err);
      setDatos([]);
      setTotal(0);
    } finally {
      setCargando(false);
    }
  }, [serviceFn, JSON.stringify(params)]);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  return { datos, total, cargando, error, recargar: fetchDatos };
}