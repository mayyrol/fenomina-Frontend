import payrollAxios from '../api/payrollAxiosInstance';
import masterAxios from '../api/masterAxiosInstance';

const BASE = '/api/payroll';

const payrollService = {

  getProcesos: (empresaId) =>
    payrollAxios.get(`${BASE}/procesos`, { params: { empresaId } }),

  crearProceso: (payload) =>
    payrollAxios.post(`${BASE}/procesos`, payload),

  cambiarEstado: (procesoId, nuevoEstado, diasLaborados = null) =>
    payrollAxios.patch(`${BASE}/procesos/${procesoId}/estado`, {
      nuevoEstado,
      ...(diasLaborados && { diasLaborados }),
    }),
    
  eliminarProceso: (procesoId) =>
    payrollAxios.delete(`${BASE}/procesos/${procesoId}`),

  getEmpleadosActivos: (empresaId) =>
    masterAxios.get('/api/master/empleados', {
      params: { empresaId, estado: 'ACTIVO' },
    }),

  liquidarNomina: (procesoId, payload) =>
    payrollAxios.post(`${BASE}/liquidacion/nomina/${procesoId}`, payload),

  getDesprendiblesNomina: (procesoId) =>
    payrollAxios.get(`${BASE}/desprendibles/nomina/${procesoId}`),

  getConceptosNomina: () =>
  masterAxios.get('/api/master/conceptos-nomina/contrato'),

  getProcesosPrima: (empresaId) =>
    payrollAxios.get(`${BASE}/procesos`, {
      params: { empresaId, tipoProceso: 'PRIMA_SEMESTRAL' }
    }),

  liquidarPrima: (procesoId, payload) =>
    payrollAxios.post(`${BASE}/liquidacion/prima/${procesoId}`, payload),

  getDesprendiblesPrima: (procesoId) =>
    payrollAxios.get(`${BASE}/desprendibles/prima/${procesoId}`),

  getProcesosCesantias: (empresaId) =>
    payrollAxios.get(`${BASE}/procesos`, {
      params: { empresaId, tipoProceso: 'CESANTIAS_ANUAL' }
    }),

  getProcesosIntereses: (empresaId) =>
    payrollAxios.get(`${BASE}/procesos`, {
      params: { empresaId, tipoProceso: 'INTERESES_CESANTIAS_ANUAL' }
    }),

  liquidarCesantias: (procesoId, payload) =>
    payrollAxios.post(`${BASE}/liquidacion/cesantias/${procesoId}`, payload),

  liquidarIntereses: (procesoId, payload) =>
    payrollAxios.post(`${BASE}/liquidacion/intereses-cesantias/${procesoId}`, payload),

  getDesprendiblesCesantias: (procesoId) =>
    payrollAxios.get(`${BASE}/desprendibles/cesantias/${procesoId}`),

  getDesprendiblesIntereses: (procesoId) =>
    payrollAxios.get(`${BASE}/desprendibles/intereses-cesantias/${procesoId}`),

  getConceptosNovedades: () =>
  masterAxios.get('/api/master/internal/conceptos-nomina'),

  getPreviewPrimaEmpleado: (empresaId, empleadoId, semestre, anio) =>
  payrollAxios.get(`${BASE}/desprendibles/prima/preview/${empresaId}/empleado/${empleadoId}`, {
    params: { semestre, anio }
  }),
};

export default payrollService;