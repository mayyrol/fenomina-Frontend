import axiosInstance from '../api/axiosInstance';

const empresasService = {
  getEmpresas: (nombre = '') =>
    axiosInstance.get('/api/master/empresas', {
      params: nombre ? { nombre } : {},
    }),

  getEmpresaById: (id) =>
    axiosInstance.get(`/api/master/empresas/${id}`),

  crearEmpresa: (empresaDTO, logoFile) => {
    const formData = new FormData();
    formData.append(
      'empresa',
      new Blob([JSON.stringify(empresaDTO)], { type: 'application/json' })
    );
    if (logoFile) formData.append('logo', logoFile);
    return axiosInstance.post('/api/master/empresas', formData);
  },

  actualizarEmpresa: (id, empresaDTO, logoFile) => {
    const formData = new FormData();
    formData.append(
      'empresa',
      new Blob([JSON.stringify(empresaDTO)], { type: 'application/json' })
    );
    if (logoFile) formData.append('logo', logoFile);
    return axiosInstance.put(`/api/master/empresas/${id}`, formData);
  },

  eliminarEmpresa: (id) =>
    axiosInstance.delete(`/api/master/empresas/${id}`),
};

export default empresasService;