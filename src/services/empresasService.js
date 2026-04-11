import masterAxios from '../api/masterAxiosInstance';

const empresasService = {

  // GET /api/master/empresas?nombre=xxx
  getEmpresas: (nombre = '') =>
    masterAxios.get('/api/master/empresas', {
      params: nombre ? { nombre } : {},
    }),

  // GET /api/master/empresas/:id
  getEmpresaById: (id) =>
    masterAxios.get(`/api/master/empresas/${id}`),

  // POST /api/master/empresas  (multipart/form-data)
  crearEmpresa: (empresaDTO, logoFile) => {
    const formData = new FormData();
    formData.append(
      'empresa',
      new Blob([JSON.stringify(empresaDTO)], { type: 'application/json' })
    );
    if (logoFile) formData.append('logo', logoFile);
    return masterAxios.post('/api/master/empresas', formData);
  },

  // PUT /api/master/empresas/:id  (multipart/form-data)
  actualizarEmpresa: (id, empresaDTO, logoFile) => {
    const formData = new FormData();
    formData.append(
      'empresa',
      new Blob([JSON.stringify(empresaDTO)], { type: 'application/json' })
    );
    if (logoFile) formData.append('logo', logoFile);
    return masterAxios.put(`/api/master/empresas/${id}`, formData);
  },

  // DELETE /api/master/empresas/:id
  eliminarEmpresa: (id) =>
    masterAxios.delete(`/api/master/empresas/${id}`),
};

export default empresasService;