// hooks/useEmpleados.js
import { useState, useEffect, useCallback } from 'react';
import empleadosService from '../../../services/empleadosService';

export function useEmpleados(empresaId) {
  const [empleados,    setEmpleados]    = useState([]);
  const [cargando,     setCargando]     = useState(false);
  const [error,        setError]        = useState(null);
  const [busqueda,     setBusqueda]     = useState('');
  const [tab,          setTab]          = useState('activos');
  const [pagina,       setPagina]       = useState(0);
  const SIZE = 10;

  // Mapeo tab → EstadoEmpleado del back
  const tabToEstado = { activos: 'ACTIVO', inactivos: 'INACTIVO', retirados: 'RETIRADO' };

  const fetchEmpleados = useCallback(async () => {
    if (!empresaId) return;
    setCargando(true);
    setError(null);
    try {
      const estado = tabToEstado[tab];
      const { data } = await empleadosService.getEmpleados(empresaId, estado, busqueda || undefined);
      setEmpleados(data);
      setPagina(0);
    } catch (err) {
      setError(err);
    } finally {
      setCargando(false);
    }
  }, [empresaId, tab, busqueda]);

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  const inicio       = pagina * SIZE;
  const empleadosPag = empleados.slice(inicio, inicio + SIZE);
  const total        = empleados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / SIZE));

  return {
    empleados: empleadosPag,
    total,
    totalPaginas,
    cargando,
    error,
    pagina,   setPagina,
    busqueda, setBusqueda,
    tab,      setTab,
    recargar: fetchEmpleados,
  };
}