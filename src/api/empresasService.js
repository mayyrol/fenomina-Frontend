import axiosInstance from './axiosInstance';

const empresasService = {
  getEmpresas: (page = 0, size = 20, search = '') =>
    axiosInstance.get('/empresas', { params: { page, size, search } }),

  getEmpresaById: (id) =>
    axiosInstance.get(`/empresas/${id}`),

  crearEmpresa: (empresa) =>
    axiosInstance.post('/empresas', empresa),
};

export default empresasService;