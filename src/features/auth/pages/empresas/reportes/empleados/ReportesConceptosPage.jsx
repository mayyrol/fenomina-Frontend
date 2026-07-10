import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../../store/authStore';
import { Layers, ChevronLeft, UserRound, Search } from 'lucide-react';
import { useHistoricos } from "../../../../hooks/useHistoricos";
import historicosService from '../../../../../../services/historicosService';
import { exportarExcel } from '../../../../../../utils/exportExcel';

function BarraAcciones({ children }) {
  return (
    <div
      style={{
        position: 'sticky',
        bottom: '-24px', 
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        padding: '60px 32px 24px 32px',
        background: 'linear-gradient(to top, #F0F2F5 30%, transparent 100%)',
        zIndex: 100,
        flexWrap: 'wrap',
        marginTop: '-40px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', gap: '16px', pointerEvents: 'all' }}>
        {children}
      </div>
    </div>
  );
}
const btnSecundario = {
  color: '#272525',
  border: '1px solid #D0D0D0',
  borderRadius: '8px',
  padding: '14px 40px',
  fontSize: '14px',
  fontWeight: '700',
  fontFamily: 'Nunito, sans-serif',
  cursor: 'pointer',
  backgroundColor: '#fff',
};

const fmt = (v) => v == null ? '-' : '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const fmt2 = (v) => v == null ? '-' : '' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const TABS_PRINCIPAL = [
  { id: 'horasExtra',      label: 'Horas extra y recargos'       },
  { id: 'totalHoras',      label: 'Total horas extra y recargos' },
  { id: 'incapacidades',   label: 'Incapacidades'                },
  { id: 'totalIncap',      label: 'Total incapacidades'          },
  { id: 'licencias',       label: 'Licencias'                    },
  { id: 'totalLicencias',  label: 'Total licencias'              },
  { id: 'vacaciones',      label: 'Vacaciones'                   },
  { id: 'totalVacaciones', label: 'Total vacaciones'             },
  { id: 'proximasVac', label: 'Próximas vacaciones' },
];

const TABS_EMPLEADO = new Set(['horasExtra', 'incapacidades', 'licencias', 'vacaciones', 'proximasVac']);

const OPCIONES_PAGINA = [10, 25, 50];

const TITULOS = {
  horasExtra:      'Histórico Detalles Horas Extra y Recargos por Empleado',
  totalHoras:      'Histórico Total de Horas Extra y Recargos por Periodo',
  incapacidades:   'Histórico Detalles Incapacidades por Empleado',
  totalIncap:      'Histórico Total de Incapacidades por Periodo',
  licencias:       'Histórico Detalles Licencias por Empleado',
  totalLicencias:  'Histórico Total de Licencias por Periodo',
  vacaciones:      'Histórico Detalles Vacaciones por Empleado',
  totalVacaciones: 'Histórico Total de Vacaciones por Periodo',
  proximasVac: 'Próximas Vacaciones por Empleado',
};

const EXCEL_HEADERS = {
  horasExtra: ['#','Nombre(s)','Apellidos','Año','Periodo','Doc.','Rec. noc. lun-sáb','Val. rec. noc. lun-sáb','Rec. diur. dom/fest','Val. rec. diur. dom/fest','Rec. noct. dom/fest','Val. rec. noct. dom/fest','Hrs ex. diur. lun-sáb','Val. hrs ex. diur. lun-sáb','Hrs ex. noct. lun-sáb','Val. hrs ex. noct. lun-sáb','Hrs ex. diur. dom/fest','Val. hrs ex. diur. dom/fest','Hrs ex. noct. dom/fest','Val. hrs ex. noct. dom/fest','Total'],
  totalHoras: ['Año','Periodo','Total horas extra y recargos empresa'],
  incapacidades: ['#','Nombre(s)','Apellidos','Doc.','Año','Periodo','Días incap. común','Días incap. laboral','Total incap. común','Total incap. laboral'],
  totalIncap: ['Año','Periodo','Total incap. común','Total incap. laboral'],
  licencias: ['#','Nombre(s)','Apellidos','Doc.','Año','Periodo','Días mat/pat','Val. mat/pat','Días calamidad','Val. calamidad','Días matrimonio','Val. matrimonio','Días Isaac','Val. Isaac','Días sufragio','Val. sufragio','Días cargos trans.','Val. cargos trans.','Días cit. jud.','Val. cit. jud.','Días otros remun.','Val. otros remun.','Días no remun.','Val. no remun.'],
  totalLicencias: ['Año','Periodo','Total licencias remuneradas','Total licencias no remuneradas'],
  vacaciones: ['#','Nombre(s)','Apellidos','Doc.','Año','Periodo','Fecha inicio','Fecha fin','Tipo','Días','Valor'],
  totalVacaciones: ['Año','Periodo','Total vacaciones compensadas en dinero','Total vacaciones disfrutadas'],
  proximasVac: ['#','Nombre(s)','Apellidos','Documento','Fecha de ingreso',
                'Año últ. vac.','Fecha inicio últ. vac.','Fecha fin últ. vac.',
                'Próximas vacaciones disp. desde','Fuente'],
};

export default function ReportesConceptosPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [tabPrincipal, setTabPrincipal] = useState('horasExtra');
  const [busqueda,     setBusqueda]     = useState('');
  const [anioFiltro,   setAnioFiltro]   = useState('');
  const [fecha,        setFecha]         = useState('');
  const [pagina,       setPagina]       = useState(0);
  const [porPagina,    setPorPagina]    = useState(10);
  const [datosProxVac,  setDatosProxVac]  = useState([]);
  const [cProxVac,      setCProxVac]      = useState(false);

  const [hoverDescargar, setHoverDescargar] = useState(false);

  useEffect(() => {
      if (!id) return;
      setCProxVac(true);
      historicosService.getProximasVacaciones({ empresaId: id })
          .then(res => setDatosProxVac(res.data))
          .catch(() => setDatosProxVac([]))
          .finally(() => setCProxVac(false));
  }, [id]);

  const handleTabPrincipal = (t) => {
    setTabPrincipal(t); setBusqueda(''); setAnioFiltro('');
    setFecha(''); setPagina(0);
  };
  const handlePorPagina    = (v) => { setPorPagina(v); setPagina(0); };

  const paramsBase = { empresaId: id, page: 0, size: 500 };

  const { datos: datosHoras,    cargando: cHoras }    = useHistoricos(historicosService.getHorasRecargosPorEmpleado, paramsBase);
  const { datos: datosTotHoras, cargando: cTotHoras } = useHistoricos(historicosService.getHorasRecargosConsolidado,  paramsBase);
  const { datos: datosIncap,    cargando: cIncap }    = useHistoricos(historicosService.getIncapacidadesPorEmpleado,   paramsBase);
  const { datos: datosTotIncap, cargando: cTotIncap } = useHistoricos(historicosService.getIncapacidadesConsolidado,   paramsBase);
  const { datos: datosLic,      cargando: cLic }      = useHistoricos(historicosService.getLicenciasPorEmpleado,       paramsBase);
  const { datos: datosTotLic,   cargando: cTotLic }   = useHistoricos(historicosService.getLicenciasConsolidado,       paramsBase);
  const { datos: datosVac,      cargando: cVac }      = useHistoricos(historicosService.getVacacionesPorEmpresa,       paramsBase);
  const { datos: datosTotVac,   cargando: cTotVac }   = useHistoricos(historicosService.getVacacionesConsolidado,      paramsBase);

  const esTabEmpleado = TABS_EMPLEADO.has(tabPrincipal);

  const filtrarDatos = (datos) => datos.filter(r => {
    if (tabPrincipal === 'proximasVac') {
        if (busqueda) {
            if (/^\d+$/.test(busqueda.trim())) {
                if (!String(r.documentoEmp ?? '').startsWith(busqueda)) return false;
            } else {
                const nm = `${r.nombresEmp ?? ''} ${r.apellidosEmp ?? ''}`.toLowerCase();
                if (!nm.includes(busqueda.toLowerCase())) return false;
            }
        }
        if (fecha && r.proximaFechaVac > fecha) return false;
        return true;
    }
    if (tabPrincipal === 'vacaciones') {
      if (fecha && (r.fechaInicioVac ?? '') !== fecha && (r.fechaFinVac ?? '') !== fecha) return false;
      if (busqueda) {
        if (/^\d+$/.test(busqueda.trim())) {
          if (!String(r.documentoEmp ?? '').startsWith(busqueda)) return false;
        } else {
          const nm = `${r.nombresEmp ?? ''} ${r.apellidosEmp ?? ''}`.toLowerCase();
          if (!nm.includes(busqueda.toLowerCase())) return false;
        }
      }
    } else {
      if (anioFiltro && !String(r.anio ?? '').startsWith(anioFiltro)) return false;
      if (esTabEmpleado && busqueda) {
        if (/^\d+$/.test(busqueda.trim())) {
          if (!String(r.documentoEmp ?? '').startsWith(busqueda)) return false;
        } else {
          const nm = `${r.nombresEmp ?? ''} ${r.apellidosEmp ?? ''}`.toLowerCase();
          if (!nm.includes(busqueda.toLowerCase())) return false;
        }
      }
    }
    return true;
  });

  const mapaData = {
    horasExtra:      { rawDatos: datosHoras,    cargando: cHoras    },
    totalHoras:      { rawDatos: datosTotHoras, cargando: cTotHoras },
    incapacidades:   { rawDatos: datosIncap,    cargando: cIncap    },
    totalIncap:      { rawDatos: datosTotIncap, cargando: cTotIncap },
    licencias:       { rawDatos: datosLic,      cargando: cLic      },
    totalLicencias:  { rawDatos: datosTotLic,   cargando: cTotLic   },
    vacaciones:      { rawDatos: datosVac,      cargando: cVac      },
    totalVacaciones: { rawDatos: datosTotVac,   cargando: cTotVac   },
    proximasVac: { rawDatos: datosProxVac, cargando: cProxVac },
  };

  const { rawDatos, cargando } = mapaData[tabPrincipal];
  const datosActivos  = filtrarDatos(rawDatos);
  const totalFiltrado = datosActivos.length;
  const totalPaginas  = Math.max(1, Math.ceil(totalFiltrado / porPagina));
  const datosPagina   = datosActivos.slice(pagina * porPagina, (pagina + 1) * porPagina);

  const renderCabecera = () => {
    switch (tabPrincipal) {
      case 'horasExtra': return (
        <tr>
          {['#','Nombre(s)','Apellidos','Año','Periodo','Doc.',
            'Rec. noc. lun-sáb','Val. rec. noc. lun-sáb',
            'Rec. diur. dom/fest','Val. rec. diur. dom/fest',
            'Rec. noct. dom/fest','Val. rec. noct. dom/fest',
            'Hrs ex. diur. lun-sáb','Val. hrs ex. diur. lun-sáb',
            'Hrs ex. noct. lun-sáb','Val. hrs ex. noct. lun-sáb',
            'Hrs ex. diur. dom/fest','Val. hrs ex. diur. dom/fest',
            'Hrs ex. noct. dom/fest','Val. hrs ex. noct. dom/fest',
            'Total'].map(h => <th key={h} style={styles.th}>{h}</th>)}
        </tr>
      );
      case 'totalHoras': return (
        <tr>
          <th style={styles.th}>Año</th>
          <th style={styles.th}>Periodo</th>
          <th style={styles.th}>Total horas extra y recargos empresa</th>
        </tr>
      );
      case 'incapacidades': return (
        <tr>
          {['#','Nombre(s)','Apellidos','Doc.','Año','Periodo',
            'Días incap. común','Días incap. laboral',
            'Total incap. común','Total incap. laboral'].map(h => <th key={h} style={styles.th}>{h}</th>)}
        </tr>
      );
      case 'totalIncap': return (
        <tr>
          <th style={styles.th}>Año</th>
          <th style={styles.th}>Periodo</th>
          <th style={styles.th}>Total incap. común</th>
          <th style={styles.th}>Total incap. laboral</th>
        </tr>
      );
      case 'licencias': return (
        <tr>
          {['#','Nombre(s)','Apellidos','Doc.','Año','Periodo',
            'Días mat/pat','Val. mat/pat','Días calamidad','Val. calamidad',
            'Días matrimonio','Val. matrimonio','Días Isaac','Val. Isaac',
            'Días sufragio','Val. sufragio','Días cargos trans.','Val. cargos trans.',
            'Días cit. jud.','Val. cit. jud.',
            'Días otros remun.','Val. otros remun.',
            'Días no remun.','Val. no remun.'].map(h => <th key={h} style={styles.th}>{h}</th>)}
        </tr>
      );
      case 'totalLicencias': return (
        <tr>
          <th style={styles.th}>Año</th>
          <th style={styles.th}>Periodo</th>
          <th style={styles.th}>Total licencias remuneradas</th>
          <th style={styles.th}>Total licencias no remuneradas</th>
        </tr>
      );
      case 'vacaciones': return (
        <tr>
          {['#','Nombre(s)','Apellidos','Doc.','Año','Periodo',
            'Fecha inicio','Fecha fin','Tipo','Días','Valor'].map(h => <th key={h} style={styles.th}>{h}</th>)}
        </tr>
      );
      case 'totalVacaciones': return (
        <tr>
          <th style={styles.th}>Año</th>
          <th style={styles.th}>Periodo</th>
          <th style={styles.th}>Total vacaciones compensadas en dinero</th>
          <th style={styles.th}>Total vacaciones disfrutadas</th>
        </tr>
      );
      case 'proximasVac': return (
          <tr>
              {['#','Nombre(s)','Apellidos','Documento','Fecha de ingreso',
                'Año últ. vac.','Fecha inicio últ. vac.','Fecha fin últ. vac.',
                'Próximas vacaciones disp. desde','Fuente']
                .map(h => <th key={h} style={styles.th}>{h}</th>)}
          </tr>
      );
      default: return null;
    }
  };

  const renderFila = (r, index) => {
    const bg  = index % 2 === 0 ? styles.trPar : styles.trImpar;
    const num = String(index + 1 + pagina * porPagina).padStart(2, '0');
    switch (tabPrincipal) {
      case 'horasExtra': return (
        <tr key={index} style={bg}>
          <td style={styles.td}>{num}</td>
          <td style={styles.td}>{r.nombresEmp}</td>
          <td style={styles.td}>{r.apellidosEmp}</td>
          <td style={styles.td}>{r.anio}</td>
          <td style={styles.td}>{r.periodo}</td>
          <td style={styles.td}>{r.documentoEmp}</td>
          <td style={styles.td}>{fmt2(r.horasRecargoNocturnoLunSab)}</td>
          <td style={styles.td}>{fmt(r.valorRecargoNocturnoLunSab)}</td>
          <td style={styles.td}>{fmt2(r.horasRecargoDiurnoDomFest)}</td>
          <td style={styles.td}>{fmt(r.valorRecargoDiurnoDomFest)}</td>
          <td style={styles.td}>{fmt2(r.horasRecargoNocturnoDomFest)}</td>
          <td style={styles.td}>{fmt(r.valorRecargoNocturnoDomFest)}</td>
          <td style={styles.td}>{fmt2(r.horasExtraDiurnaLunSab)}</td>
          <td style={styles.td}>{fmt(r.valorExtraDiurnaLunSab)}</td>
          <td style={styles.td}>{fmt2(r.horasExtraNocturnaLunSab)}</td>
          <td style={styles.td}>{fmt(r.valorExtraNocturnaLunSab)}</td>
          <td style={styles.td}>{fmt2(r.horasExtraDiurnaDomFest)}</td>
          <td style={styles.td}>{fmt(r.valorExtraDiurnaDomFest)}</td>
          <td style={styles.td}>{fmt2(r.horasExtraNocturnaDomFest)}</td>
          <td style={styles.td}>{fmt(r.valorExtraNocturnaDomFest)}</td>
          <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalHorasExtraYRecargos)}</td>
        </tr>
      );
      case 'totalHoras': return (
        <tr key={index} style={bg}>
          <td style={styles.td}>{r.anio}</td>
          <td style={styles.td}>{r.periodo}</td>
          <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalHorasExtraYRecargosEmpresa)}</td>
        </tr>
      );
      case 'incapacidades': return (
        <tr key={index} style={bg}>
          <td style={styles.td}>{num}</td>
          <td style={styles.td}>{r.nombresEmp}</td>
          <td style={styles.td}>{r.apellidosEmp}</td>
          <td style={styles.td}>{r.documentoEmp}</td>
          <td style={styles.td}>{r.anio}</td>
          <td style={styles.td}>{r.periodo}</td>
          <td style={styles.td}>{r.diasIncapacidadComun}</td>
          <td style={styles.td}>{r.diasIncapacidadLaboral}</td>
          <td style={styles.td}>{fmt(r.totalIncapacidadComun)}</td>
          <td style={styles.td}>{fmt(r.totalIncapacidadLaboral)}</td>
        </tr>
      );
      case 'totalIncap': return (
        <tr key={index} style={bg}>
          <td style={styles.td}>{r.anio}</td>
          <td style={styles.td}>{r.periodo}</td>
          <td style={styles.td}>{fmt(r.totalIncapacidadComun)}</td>
          <td style={styles.td}>{fmt(r.totalIncapacidadLaboral)}</td>
        </tr>
      );
      case 'licencias': return (
        <tr key={index} style={bg}>
          <td style={styles.td}>{num}</td>
          <td style={styles.td}>{r.nombresEmp}</td>
          <td style={styles.td}>{r.apellidosEmp}</td>
          <td style={styles.td}>{r.documentoEmp}</td>
          <td style={styles.td}>{r.anio}</td>
          <td style={styles.td}>{r.periodo}</td>
          <td style={styles.td}>{r.diasLicenciaMaternidadPaternidad}</td>
          <td style={styles.td}>{fmt(r.valorLicenciaMaternidadPaternidad)}</td>
          <td style={styles.td}>{r.diasLicenciaCalamidad}</td>
          <td style={styles.td}>{fmt(r.valorLicenciaCalamidad)}</td>
          <td style={styles.td}>{r.diasLicenciaMatrimonio}</td>
          <td style={styles.td}>{fmt(r.valorLicenciaMatrimonio)}</td>
          <td style={styles.td}>{r.diasLicenciaIsaac}</td>
          <td style={styles.td}>{fmt(r.valorLicenciaIsaac)}</td>
          <td style={styles.td}>{r.diasLicenciaSufragio}</td>
          <td style={styles.td}>{fmt(r.valorLicenciaSufragio)}</td>
          <td style={styles.td}>{r.diasCargosTransitorios}</td>
          <td style={styles.td}>{fmt(r.valorCargosTransitorios)}</td>
          <td style={styles.td}>{r.diasCitacionesJudiciales}</td>
          <td style={styles.td}>{fmt(r.valorCitacionesJudiciales)}</td>
          <td style={styles.td}>{r.diasOtrosPermisosRemunerados}</td>
          <td style={styles.td}>{fmt(r.valorOtrosPermisosRemunerados)}</td>
          <td style={styles.td}>{r.diasLicenciasNoRemuneradas}</td>
          <td style={styles.td}>{fmt(r.valorLicenciasNoRemuneradas)}</td>
        </tr>
      );
      case 'totalLicencias': return (
        <tr key={index} style={bg}>
          <td style={styles.td}>{r.anio}</td>
          <td style={styles.td}>{r.periodo}</td>
          <td style={styles.td}>{fmt(r.totalOtrosPermisosRemunerados)}</td>
          <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalLicenciasNoRemuneradas)}</td>
        </tr>
      );
      case 'vacaciones': return (
        <tr key={index} style={bg}>
          <td style={styles.td}>{num}</td>
          <td style={styles.td}>{r.nombresEmp}</td>
          <td style={styles.td}>{r.apellidosEmp}</td>
          <td style={styles.td}>{r.documentoEmp}</td>
          <td style={styles.td}>{r.anio}</td>
          <td style={styles.td}>{r.periodo}</td>
          <td style={styles.td}>{r.fechaInicioVac ?? '-'}</td>
          <td style={styles.td}>{r.fechaFinVac ?? '-'}</td>
          <td style={styles.td}>{r.tipoVacaciones ?? '-'}</td>
          <td style={styles.td}>{r.diasTomados ?? '-'}</td>
          <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.valorPagoVac)}</td>
        </tr>
      );
      case 'totalVacaciones': return (
        <tr key={index} style={bg}>
          <td style={styles.td}>{r.anio}</td>
          <td style={styles.td}>{r.periodo}</td>
          <td style={styles.td}>{fmt(r.totalVacacionesCompensadas)}</td>
          <td style={styles.td}>{fmt(r.totalVacacionesDisfrutadas)}</td>
        </tr>
      );
      case 'proximasVac': return (
          <tr key={index} style={bg}>
              <td style={styles.td}>{num}</td>
              <td style={styles.td}>{r.nombresEmp}</td>
              <td style={styles.td}>{r.apellidosEmp}</td>
              <td style={styles.td}>{r.documentoEmp}</td>
              <td style={styles.td}>{r.fechaIngresoEmp ?? '-'}</td>
              <td style={styles.td}>{r.anioUltimasVac ?? '-'}</td>
              <td style={styles.td}>{r.fechaInicioUltimasVac ?? '-'}</td>
              <td style={styles.td}>{r.fechaFinUltimasVac ?? '-'}</td>
              <td style={{ ...styles.td, fontWeight: '700', color: '#0B662A' }}>
                  {r.proximaFechaVac ?? '-'}
              </td>
              <td style={styles.td}>{r.fuente ?? '-'}</td>
          </tr>
      );
      default: return null;
    }
  };

  const filaExcel = (r, index) => {
    switch (tabPrincipal) {
      case 'horasExtra':
        return [index + 1, r.nombresEmp, r.apellidosEmp, r.anio, r.periodo, r.documentoEmp,
          r.horasRecargoNocturnoLunSab ?? 0, r.valorRecargoNocturnoLunSab ?? 0,
          r.horasRecargoDiurnoDomFest ?? 0, r.valorRecargoDiurnoDomFest ?? 0,
          r.horasRecargoNocturnoDomFest ?? 0, r.valorRecargoNocturnoDomFest ?? 0,
          r.horasExtraDiurnaLunSab ?? 0, r.valorExtraDiurnaLunSab ?? 0,
          r.horasExtraNocturnaLunSab ?? 0, r.valorExtraNocturnaLunSab ?? 0,
          r.horasExtraDiurnaDomFest ?? 0, r.valorExtraDiurnaDomFest ?? 0,
          r.horasExtraNocturnaDomFest ?? 0, r.valorExtraNocturnaDomFest ?? 0,
          r.totalHorasExtraYRecargos ?? 0];
      case 'totalHoras':
        return [r.anio, r.periodo, r.totalHorasExtraYRecargosEmpresa ?? 0];
      case 'incapacidades':
        return [index + 1, r.nombresEmp, r.apellidosEmp, r.documentoEmp, r.anio, r.periodo, r.diasIncapacidadComun, r.diasIncapacidadLaboral, r.totalIncapacidadComun ?? 0, r.totalIncapacidadLaboral ?? 0];
      case 'totalIncap':
        return [r.anio, r.periodo, r.totalIncapacidadComun ?? 0, r.totalIncapacidadLaboral ?? 0];
      case 'licencias':
        return [index + 1, r.nombresEmp, r.apellidosEmp, r.documentoEmp, r.anio, r.periodo,
          r.diasLicenciaMaternidadPaternidad, r.valorLicenciaMaternidadPaternidad ?? 0,
          r.diasLicenciaCalamidad, r.valorLicenciaCalamidad ?? 0,
          r.diasLicenciaMatrimonio, r.valorLicenciaMatrimonio ?? 0,
          r.diasLicenciaIsaac, r.valorLicenciaIsaac ?? 0,
          r.diasLicenciaSufragio, r.valorLicenciaSufragio ?? 0,
          r.diasCargosTransitorios, r.valorCargosTransitorios ?? 0,
          r.diasCitacionesJudiciales, r.valorCitacionesJudiciales ?? 0,
          r.diasOtrosPermisosRemunerados, r.valorOtrosPermisosRemunerados ?? 0,
          r.diasLicenciasNoRemuneradas, r.valorLicenciasNoRemuneradas ?? 0];
      case 'totalLicencias':
        return [r.anio, r.periodo, r.totalOtrosPermisosRemunerados ?? 0, r.totalLicenciasNoRemuneradas ?? 0];
      case 'vacaciones':
        return [index + 1, r.nombresEmp, r.apellidosEmp, r.documentoEmp, r.anio, r.periodo, r.fechaInicioVac ?? '-', r.fechaFinVac ?? '-', r.tipoVacaciones ?? '-', r.diasTomados ?? '-', r.valorPagoVac ?? 0];
      case 'totalVacaciones':
        return [r.anio, r.periodo, r.totalVacacionesCompensadas ?? 0, r.totalVacacionesDisfrutadas ?? 0];
      case 'proximasVac':
          return [index + 1, r.nombresEmp, r.apellidosEmp, r.documentoEmp,
                  r.fechaIngresoEmp ?? '-', r.anioUltimasVac ?? '-',
                  r.fechaInicioUltimasVac ?? '-', r.fechaFinUltimasVac ?? '-',
                  r.proximaFechaVac ?? '-', r.fuente ?? '-'];
      default:
        return [];
    }
  };

  const handleDescargarExcel = () => {
    const filas = datosActivos.map((r, i) => filaExcel(r, i));
    exportarExcel(EXCEL_HEADERS[tabPrincipal], filas, TITULOS[tabPrincipal]);
  };

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Reportes Conceptos Varios de Empleados</h2>
            <p style={styles.subtitulo}>Gestiona los reportes de conceptos varios de los empleados asociados a la empresa</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}><UserRound size={22} color="#A3A3A3" /></div>
          <div>
            <p style={styles.perfilNombre}>{nombre}</p>
            <p style={styles.perfilCargo}>{cargo}</p>
          </div>
        </div>
      </div>

      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>{totalFiltrado}</p>
          <p style={styles.totalLabel}>Total registros</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {tabPrincipal === 'vacaciones' ? (
            <>
              <div style={styles.searchBox}>
                <Search size={14} color="#A3A3A3" />
                <input
                  style={styles.searchInput}
                  placeholder="Buscar por nombre o n° de documento"
                  value={busqueda}
                  onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
                />
              </div>
              <div style={styles.fechaBox}>
                <span style={styles.fechaLabel}>Fecha</span>
                <input
                  type="date"
                  style={styles.fechaInput}
                  value={fecha}
                  onChange={(e) => { setFecha(e.target.value); setPagina(0); }}
                />
              </div>
            </>
          ) : tabPrincipal === 'proximasVac' ? (
              <>
                  <div style={styles.searchBox}>
                      <Search size={14} color="#A3A3A3" />
                      <input
                          style={styles.searchInput}
                          placeholder="Buscar por nombre o n° de documento"
                          value={busqueda}
                          onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
                      />
                  </div>
                  <div style={styles.fechaBox}>
                      <span style={styles.fechaLabel}>Vacaciones antes de</span>
                      <input
                          type="date"
                          style={styles.fechaInput}
                          value={fecha}
                          onChange={(e) => { setFecha(e.target.value); setPagina(0); }}
                      />
                  </div>
              </>
          ) : (
            <>
              {esTabEmpleado && (
                <div style={styles.searchBox}>
                  <Search size={14} color="#A3A3A3" />
                  <input
                    style={styles.searchInput}
                    placeholder="Buscar por nombre o n° de documento"
                    value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
                  />
                </div>
              )}
              <div style={styles.fechaBox}>
                <span style={styles.fechaLabel}>Año</span>
                <div style={styles.filtroInputBox}>
                  <input
                    type="text"
                    style={styles.filtroInput}
                    placeholder="Ej: 2026"
                    value={anioFiltro}
                    onChange={(e) => { setAnioFiltro(e.target.value); setPagina(0); }}
                  />
                </div>
              </div>
            </>
          )}

          <button
            style={{
              background: hoverDescargar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A',
              border: 'none', borderRadius: '8px', padding: '10px 24px',
              fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif',
              cursor: 'pointer', color: '#fff', transition: 'background 0.3s ease', flexShrink: 0,
            }}
            onMouseEnter={() => setHoverDescargar(true)}
            onMouseLeave={() => setHoverDescargar(false)}
            onClick={handleDescargarExcel}
            disabled={cargando || datosActivos.length === 0}
          >
            Descargar en Excel
          </button>
          
        </div>
        
      </div>

      <div style={styles.tabsRow}>
        <div style={styles.tabsBox}>
          {TABS_PRINCIPAL.map((t) => (
            <button key={t.id}
              style={{ ...styles.tab, ...(tabPrincipal === t.id ? styles.tabActivo : {}) }}
              onClick={() => handleTabPrincipal(t.id)}
            >{t.label}</button>
          ))}
        </div>
        <div style={styles.porPaginaBox}>
          <span style={styles.porPaginaLabel}>Resultados por página:</span>
          <select value={porPagina} onChange={(e) => handlePorPagina(Number(e.target.value))} style={styles.porPaginaSelect}>
            {OPCIONES_PAGINA.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div style={styles.card}>
        <p style={styles.tableTitle}>{TITULOS[tabPrincipal]}</p>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>{renderCabecera()}</thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={24} style={styles.tdCentro}>Cargando...</td></tr>
              ) : datosPagina.length === 0 ? (
                <tr><td colSpan={24} style={styles.tdCentro}>Sin resultados</td></tr>
              ) : datosPagina.map((r, index) => renderFila(r, index))}
            </tbody>
          </table>
        </div>

        <div style={styles.paginacion}>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button key={i} onClick={() => setPagina(i)}
              style={{ ...styles.pageBtn, ...(pagina === i ? styles.pageBtnActivo : {}) }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPagina(totalPaginas - 1)} style={styles.pageBtn}
            disabled={pagina === totalPaginas - 1}>{'>>'}</button>
        </div>
      </div>

      {/* Volver */}
      <BarraAcciones justificar="flex-start">
        <button
          style={{ ...btnSecundario, padding: '10px 24px' }}
          onClick={() => navigate(`/empresas/${id}/reportes/empleados`)}
        >
          Volver
        </button>
      </BarraAcciones>

    </div>
  );
}

const styles = {
  container:       { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' },
  header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:          { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:       { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:       { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:          { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  perfilNombre:    { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:     { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  volverBtn:       { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0, width: 'fit-content' },
  toolbarCard:     { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  totalNum:        { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:      { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  searchBox:       { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '300px' },
  searchInput:     { border: 'none', outline: 'none', boxShadow: 'none', backgroundColor: 'transparent', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  filtroInputBox:  { display: 'flex', alignItems: 'center', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '100px' },
  filtroInput:     { border: 'none', outline: 'none', boxShadow: 'none', backgroundColor: 'transparent', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  fechaBox:        { display: 'flex', flexDirection: 'column', gap: '4px' },
  fechaLabel:      { fontSize: '11px', color: '#A3A3A3', fontWeight: '600' },
  fechaInput:      { border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', boxShadow: 'none', backgroundColor: '#fff', cursor: 'pointer', color: '#272525' },
  tabsRow:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E8E8' },
  tabsBox:         { display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', },
  tab:             { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px 16px', fontSize: '13px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' },
  tabActivo:       { color: '#0B662A', borderBottom: '2px solid #0B662A' },
  porPaginaBox:    { display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '4px', flexShrink: 0 },
  porPaginaLabel:  { fontSize: '13px', color: '#A3A3A3', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' },
  porPaginaSelect: { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '6px 28px 6px 12px', fontSize: '13px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23272525\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundColor: '#fff' },
  card:            { backgroundColor: '#fff', borderRadius: '16px', padding: '24px' },
  tableTitle:      { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tableWrapper:    { overflowX: 'auto', width: '100%' },
  table:           { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  th:              { fontSize: '11px', fontWeight: '700', color: '#A3A3A3', padding: '10px 10px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:              { fontSize: '12px', color: '#272525', padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' },
  tdCentro:        { textAlign: 'center', padding: '20px', color: '#A3A3A3' },
  trPar:           { backgroundColor: '#fff' },
  trImpar:         { backgroundColor: '#FAFAFA' },
  paginacion:      { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' },
  pageBtn:         { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif' },
  pageBtnActivo:   { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
};
