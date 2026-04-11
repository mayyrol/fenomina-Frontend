import { useState, useEffect } from 'react';
import masterAxios from '../../../api/masterAxiosInstance';

export function useEmpresasLista() {
  const [empresas,  setEmpresas]  = useState([]);
  const [cargando,  setCargando]  = useState(true);

  useEffect(() => {
    masterAxios.get('/api/master/empresas')
      .then(({ data }) => setEmpresas(data))
      .catch(() => setEmpresas([]))
      .finally(() => setCargando(false));
  }, []);

  return { empresas, cargando };
}