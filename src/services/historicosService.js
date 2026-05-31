import historicosAxios from '../api/historicosAxiosInstance';

const BASE = '/api/historicos';

const historicosService = {

  getAuthLogs: (params) =>
    historicosAxios.get(`${BASE}/auditoria/auth`, { params }),

  getSystemLogs: (params) =>
    historicosAxios.get(`${BASE}/auditoria/sistema`, { params }),

  getDesprendibleNomina: (cabecNominaId) =>
    historicosAxios.get(`${BASE}/nominas/desprendible/${cabecNominaId}`),

  getReporteNominaEmpleados: (params) =>
    historicosAxios.get(`${BASE}/nominas/empleados`, { params }),

  getReporteNominaConsolidado: (params) =>
    historicosAxios.get(`${BASE}/nominas/consolidado`, { params }),

  getEstadosNominas: (params) =>
    historicosAxios.get(`${BASE}/nominas/estados`, { params }),

  getNominasLiquidacion: (params) =>
    historicosAxios.get(`${BASE}/nominas/liquidacion`, { params }),

  getReportePrimasEmpleados: (params) =>
    historicosAxios.get(`${BASE}/primas/empleados`, { params }),

  getReportePrimasConsolidado: (params) =>
    historicosAxios.get(`${BASE}/primas/consolidado`, { params }),

  getReporteCesantiasEmpleados: (params) =>
    historicosAxios.get(`${BASE}/cesantias/empleados`, { params }),

  getReporteCesantiasConsolidado: (params) =>
    historicosAxios.get(`${BASE}/cesantias/consolidado`, { params }),

  getSegSocialTotal: (params) =>
    historicosAxios.get(`${BASE}/seguridad-social/total`, { params }),

  getSegSocialXEmpleado: (params) =>
    historicosAxios.get(`${BASE}/seguridad-social/empleados`, { params }),

  getAportesParafTotal: (params) =>
    historicosAxios.get(`${BASE}/provisiones/parafiscales/total`, { params }),

  getAportesParafXEmpleado: (params) =>
    historicosAxios.get(`${BASE}/provisiones/parafiscales/empleados`, { params }),

  getCargasPrestacionales: (params) =>
    historicosAxios.get(`${BASE}/provisiones/cargas-prestacionales`, { params }),

  getConsolidadoEmpleador: (params) =>
    historicosAxios.get(`${BASE}/provisiones/consolidado`, { params }),

  getHorasRecargosPorEmpleado: (params) =>
    historicosAxios.get(`${BASE}/conceptos/horas-recargos/empleados`, { params }),

  getHorasRecargosConsolidado: (params) =>
    historicosAxios.get(`${BASE}/conceptos/horas-recargos/consolidado`, { params }),

  getIncapacidadesPorEmpleado: (params) =>
    historicosAxios.get(`${BASE}/conceptos/incapacidades/empleados`, { params }),

  getIncapacidadesConsolidado: (params) =>
    historicosAxios.get(`${BASE}/conceptos/incapacidades/consolidado`, { params }),

  getLicenciasPorEmpleado: (params) =>
    historicosAxios.get(`${BASE}/conceptos/licencias/empleados`, { params }),

  getLicenciasConsolidado: (params) =>
    historicosAxios.get(`${BASE}/conceptos/licencias/consolidado`, { params }),

  getRetefuente: (params) =>
    historicosAxios.get(`${BASE}/conceptos/retefuente`, { params }),

  getVacacionesPorEmpresa: (params) =>
    historicosAxios.get(`${BASE}/conceptos/vacaciones/empleados`, { params }),

  getVacacionesConsolidado: (params) =>
    historicosAxios.get(`${BASE}/conceptos/vacaciones/consolidado`, { params }),
};

export default historicosService;