import { useState, useEffect, useCallback } from 'react';
import payrollService from '../services/payrollService';

export function useNominas(empresaId) {
  const [procesos,     setProcesos]     = useState([]);
  const [cargando,     setCargando]     = useState(false);
  const [error,        setError]        = useState(null);

  const fetchProcesos = useCallback(async () => {
    if (!empresaId) return;
    setCargando(true);
    setError(null);
    try {
      const { data } = await payrollService.getProcesos(empresaId);
      setProcesos(data);
    } catch (err) {
      setError(err);
    } finally {
      setCargando(false);
    }
  }, [empresaId]);

  useEffect(() => {
    fetchProcesos();
  }, [fetchProcesos]);

  return { procesos, cargando, error, recargar: fetchProcesos };
}