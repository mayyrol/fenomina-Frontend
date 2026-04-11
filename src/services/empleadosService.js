// services/empleadosService.js
import masterAxios from '../api/masterAxiosInstance';

const empleadosService = {

  // GET /api/master/empleados?empresaId=&estado=&documento=
  getEmpleados: (empresaId, estado, documento) =>
    masterAxios.get('/api/master/empleados', {
      params: {
        ...(empresaId  && { empresaId }),
        ...(estado     && { estado }),
        ...(documento  && { documento }),
      },
    }),

  // GET /api/master/empleados/:id
  getEmpleadoById: (id) =>
    masterAxios.get(`/api/master/empleados/${id}`),

  // POST /api/master/empleados
  crearEmpleado: (empleadoDTO) =>
    masterAxios.post('/api/master/empleados', empleadoDTO),

  // PUT /api/master/empleados/:id
  actualizarEmpleado: (id, empleadoDTO) =>
    masterAxios.put(`/api/master/empleados/${id}`, empleadoDTO),

  // PATCH /api/master/empleados/:id/estado
  cambiarEstado: (id, nuevoEstado) =>
    masterAxios.patch(`/api/master/empleados/${id}/estado`, { nuevoEstado }),

  // DELETE /api/master/empleados/:id
  eliminarEmpleado: (id) =>
    masterAxios.delete(`/api/master/empleados/${id}`),

  // GET /api/master/empleados/:empleadoId/conceptos
  getConceptosEmpleado: (empleadoId) =>
    masterAxios.get(`/api/master/empleados/${empleadoId}/conceptos`),
};

export default empleadosService;