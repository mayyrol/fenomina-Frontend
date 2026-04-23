// services/parametrosService.js
import masterAxios from '../api/masterAxiosInstance';

const parametrosService = {

  // GET /api/master/parametros
  getParametros: () =>
    masterAxios.get('/api/master/parametros'),

  // GET /api/master/parametros/:id
  getParametroById: (id) =>
    masterAxios.get(`/api/master/parametros/${id}`),

  crearParametro: (parametroDTO) =>
    masterAxios.post('/api/master/parametros', parametroDTO),
};

export default parametrosService;