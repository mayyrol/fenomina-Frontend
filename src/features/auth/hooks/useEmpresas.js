import { useState, useEffect, useCallback } from 'react';
import empresasService from '../../../services/empresasService';

export function useEmpresas() {
  const [empresas,     setEmpresas]     = useState([]);
  const [cargando,     setCargando]     = useState(false);
  const [error,        setError]        = useState(null);
  const [busqueda,     setBusqueda]     = useState('');
  const [pagina,       setPagina]       = useState(0);
  const [size,         setSize]         = useState(10);

  const fetchEmpresas = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const { data } = await empresasService.getEmpresas(busqueda);
      setEmpresas(data);
    } catch (err) {
      setError(err);
    } finally {
      setCargando(false);
    }
  }, [busqueda]);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  // Paginación local sobre los datos ya filtrados por el back
  const inicio       = pagina * size;
  const empresasPag  = empresas.slice(inicio, inicio + size);
  const total        = empresas.length;
  const totalPaginas = Math.max(1, Math.ceil(total / size));

  return {
    empresas: empresasPag,
    total,
    totalPaginas,
    cargando,
    error,
    pagina,       setPagina,
    busqueda,     setBusqueda,
    size,         setSize,
    recargar:     fetchEmpresas,
  };
}