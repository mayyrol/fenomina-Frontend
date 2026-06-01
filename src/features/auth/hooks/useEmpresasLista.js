import { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';   

export function useEmpresasLista() {
  const [empresas,  setEmpresas]  = useState([]);
  const [cargando,  setCargando]  = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/master/empresas')
      .then(({ data }) => setEmpresas(data))
      .catch(() => setEmpresas([]))
      .finally(() => setCargando(false));
  }, []);

  return { empresas, cargando };
}