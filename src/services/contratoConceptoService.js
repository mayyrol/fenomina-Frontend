import axiosInstance from '../api/axiosInstance';

const contratoConceptoService = {
  crearConcepto: (dto) =>
    axiosInstance.post('/api/master/contratos-concepto', dto),

  getConceptosByEmpleado: (empleadoId) =>
    axiosInstance.get(`/api/master/empleados/${empleadoId}/conceptos`),

  eliminarConcepto: (id) =>
    axiosInstance.delete(`/api/master/contratos-concepto/${id}`),

  actualizarConcepto: (id, dto) =>
    axiosInstance.patch(`/api/master/contratos-concepto/${id}`, dto),
};

export default contratoConceptoService;