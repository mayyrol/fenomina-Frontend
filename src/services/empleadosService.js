import axiosInstance from '../api/axiosInstance';

const empleadosService = {
  getEmpleados: (empresaId, estado, documento) =>
    axiosInstance.get('/api/master/empleados', {
      params: {
        ...(empresaId  && { empresaId }),
        ...(estado     && { estado }),
        ...(documento  && { documento }),
      },
    }),

  getEmpleadoById: (id) =>
    axiosInstance.get(`/api/master/empleados/${id}`),

  crearEmpleado: (empleadoDTO) =>
    axiosInstance.post('/api/master/empleados', empleadoDTO),

  actualizarEmpleado: (id, empleadoDTO) =>
    axiosInstance.put(`/api/master/empleados/${id}`, empleadoDTO),

  cambiarEstado: (id, nuevoEstado) =>
    axiosInstance.patch(`/api/master/empleados/${id}/estado`, { nuevoEstado }),

  eliminarEmpleado: (id) =>
    axiosInstance.delete(`/api/master/empleados/${id}`),

  getConceptosEmpleado: (empleadoId) =>
    axiosInstance.get(`/api/master/empleados/${empleadoId}/conceptos`),
};

export default empleadosService;