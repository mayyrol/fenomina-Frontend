import axiosInstance from '../api/axiosInstance';

const parametrosService = {
  getParametros: () =>
    axiosInstance.get('/api/master/parametros'),

  getParametroById: (id) =>
    axiosInstance.get(`/api/master/parametros/${id}`),

  crearParametro: (parametroDTO) =>
    axiosInstance.post('/api/master/parametros', parametroDTO),
};

export default parametrosService;