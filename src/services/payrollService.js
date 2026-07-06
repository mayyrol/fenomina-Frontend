import axiosInstance from '../api/axiosInstance';

const BASE = '/api/payroll';

const payrollService = {
  getProcesos: (empresaId) =>
    axiosInstance.get(`${BASE}/procesos`, { params: { empresaId } })
      .then(res => ({
        ...res,
        data: res.data.filter(p =>
          p.tipoProceso === 'NOMINA_MENSUAL' || p.tipoProceso === 'NOMINA_QUINCENAL'
        )
      })),

  crearProceso: (payload) =>
    axiosInstance.post(`${BASE}/procesos`, payload),

  cambiarEstado: (procesoId, nuevoEstado, diasLaborados = null) =>
    axiosInstance.patch(`${BASE}/procesos/${procesoId}/estado`, {
      nuevoEstado,
      ...(diasLaborados && { diasLaborados }),
    }),

  eliminarProceso: (procesoId) =>
    axiosInstance.delete(`${BASE}/procesos/${procesoId}`),

  getEmpleadosActivos: (empresaId) =>
    axiosInstance.get('/api/master/empleados', {
      params: { empresaId, estado: 'ACTIVO' },
    }),

  liquidarNomina: (procesoId, payload) =>
    axiosInstance.post(`${BASE}/liquidacion/nomina/${procesoId}`, payload),

  getDesprendiblesNomina: (procesoId) =>
    axiosInstance.get(`${BASE}/desprendibles/nomina/${procesoId}`),

  getConceptosNomina: () =>
    axiosInstance.get('/api/master/conceptos-nomina/contrato'),

  getProcesosPrima: (empresaId) =>
    axiosInstance.get(`${BASE}/procesos`, {
      params: { empresaId, tipoProceso: 'PRIMA_SEMESTRAL' }
    }),

  liquidarPrima: (procesoId, payload) =>
    axiosInstance.post(`${BASE}/liquidacion/prima/${procesoId}`, payload),

  getDesprendiblesPrima: (procesoId) =>
    axiosInstance.get(`${BASE}/desprendibles/prima/${procesoId}`),

  getProcesosCesantias: (empresaId) =>
    axiosInstance.get(`${BASE}/procesos`, {
      params: { empresaId, tipoProceso: 'CESANTIAS_ANUAL' }
    }),

  getProcesosIntereses: (empresaId) =>
    axiosInstance.get(`${BASE}/procesos`, {
      params: { empresaId, tipoProceso: 'INTERESES_CESANTIAS_ANUAL' }
    }),

  liquidarCesantias: (procesoId, payload) =>
    axiosInstance.post(`${BASE}/liquidacion/cesantias/${procesoId}`, payload),

  liquidarIntereses: (procesoId, payload) =>
    axiosInstance.post(`${BASE}/liquidacion/intereses-cesantias/${procesoId}`, payload),

  getDesprendiblesCesantias: (procesoId) =>
    axiosInstance.get(`${BASE}/desprendibles/cesantias/${procesoId}`),

  getDesprendiblesIntereses: (procesoId) =>
    axiosInstance.get(`${BASE}/desprendibles/intereses-cesantias/${procesoId}`),

  getConceptosNovedades: () =>
    axiosInstance.get('/api/master/conceptos-nomina/novedades'),

  getPreviewPrimaEmpleado: (empresaId, empleadoId, semestre, anio) =>
    axiosInstance.get(`${BASE}/desprendibles/prima/preview/${empresaId}/empleado/${empleadoId}`, {
      params: { semestre, anio }
    }),
};

export default payrollService;