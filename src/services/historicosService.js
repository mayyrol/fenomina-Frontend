import axiosInstance from '../api/axiosInstance';

const BASE = '/api/historicos';

const historicosService = {
  getAuthLogs: (params) =>
    axiosInstance.get(`${BASE}/auditoria/auth`, { params }),

  getSystemLogs: (params) =>
    axiosInstance.get(`${BASE}/auditoria/sistema`, { params }),

  getDesprendibleNomina: (cabecNominaId) =>
    axiosInstance.get(`${BASE}/nominas/desprendible/${cabecNominaId}`),

  getReporteNominaEmpleados: (params) =>
    axiosInstance.get(`${BASE}/nominas/empleados`, { params }),

  getReporteNominaConsolidado: (params) =>
    axiosInstance.get(`${BASE}/nominas/consolidado`, { params }),

  getEstadosNominas: (params) =>
    axiosInstance.get(`${BASE}/nominas/estados`, { params }),

  getNominasLiquidacion: (params) =>
    axiosInstance.get(`${BASE}/nominas/liquidacion`, { params }),

  getReportePrimasEmpleados: (params) =>
    axiosInstance.get(`${BASE}/primas/empleados`, { params }),

  getReportePrimasConsolidado: (params) =>
    axiosInstance.get(`${BASE}/primas/consolidado`, { params }),

  getReporteCesantiasEmpleados: (params) =>
    axiosInstance.get(`${BASE}/cesantias/empleados`, { params }),

  getReporteCesantiasConsolidado: (params) =>
    axiosInstance.get(`${BASE}/cesantias/consolidado`, { params }),

  getSegSocialTotal: (params) =>
    axiosInstance.get(`${BASE}/seguridad-social/total`, { params }),

  getSegSocialXEmpleado: (params) =>
    axiosInstance.get(`${BASE}/seguridad-social/empleados`, { params }),

  getAportesParafTotal: (params) =>
    axiosInstance.get(`${BASE}/provisiones/parafiscales/total`, { params }),

  getAportesParafXEmpleado: (params) =>
    axiosInstance.get(`${BASE}/provisiones/parafiscales/empleados`, { params }),

  getCargasPrestacionales: (params) =>
    axiosInstance.get(`${BASE}/provisiones/cargas-prestacionales`, { params }),

  getConsolidadoEmpleador: (params) =>
    axiosInstance.get(`${BASE}/provisiones/consolidado`, { params }),

  getHorasRecargosPorEmpleado: (params) =>
    axiosInstance.get(`${BASE}/conceptos/horas-recargos/empleados`, { params }),

  getHorasRecargosConsolidado: (params) =>
    axiosInstance.get(`${BASE}/conceptos/horas-recargos/consolidado`, { params }),

  getIncapacidadesPorEmpleado: (params) =>
    axiosInstance.get(`${BASE}/conceptos/incapacidades/empleados`, { params }),

  getIncapacidadesConsolidado: (params) =>
    axiosInstance.get(`${BASE}/conceptos/incapacidades/consolidado`, { params }),

  getLicenciasPorEmpleado: (params) =>
    axiosInstance.get(`${BASE}/conceptos/licencias/empleados`, { params }),

  getLicenciasConsolidado: (params) =>
    axiosInstance.get(`${BASE}/conceptos/licencias/consolidado`, { params }),

  getRetefuente: (params) =>
    axiosInstance.get(`${BASE}/conceptos/retefuente`, { params }),

  getVacacionesPorEmpresa: (params) =>
    axiosInstance.get(`${BASE}/conceptos/vacaciones/empleados`, { params }),

  getVacacionesConsolidado: (params) =>
    axiosInstance.get(`${BASE}/conceptos/vacaciones/consolidado`, { params }),

  getProximasVacaciones: (params) =>
    axiosInstance.get(`${BASE}/conceptos/proximas-vacaciones`, { params }),

  evaluarNotificaciones: () =>
    axiosInstance.post(`${BASE}/notificaciones/evaluar`),

  getNotificaciones: (params) =>
    axiosInstance.get(`${BASE}/notificaciones`, { params }),

  contarNoLeidas: () =>
    axiosInstance.get(`${BASE}/notificaciones/no-leidas/count`),

  marcarLeida: (id) =>
    axiosInstance.patch(`${BASE}/notificaciones/${id}/leer`),

  marcarTodasLeidas: () =>
    axiosInstance.patch(`${BASE}/notificaciones/leer-todas`),
};

export default historicosService;