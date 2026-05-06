import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../../store/authStore';
import { Layers, ChevronLeft, UserRound, Search } from 'lucide-react';

const fmt = (v) => '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const NOMBRES = [
  { nombres: 'Abubakar',  apellidos: 'Alghazali',  doc: '10726589786', estado: 'ACTIVO'   },
  { nombres: 'Fatima',    apellidos: 'Mohammed',    doc: '10726589787', estado: 'ACTIVO'   },
  { nombres: 'Ibrahim',   apellidos: 'Bankole',     doc: '10726589788', estado: 'ACTIVO'   },
  { nombres: 'Sadiq',     apellidos: 'Sadiq',       doc: '10726589789', estado: 'ACTIVO'   },
  { nombres: 'James',     apellidos: 'Emmanuel',    doc: '10726589790', estado: 'ACTIVO'   },
  { nombres: 'Ranky',     apellidos: 'Solomon',     doc: '10726589791', estado: 'ACTIVO'   },
  { nombres: 'Otor',      apellidos: 'John',        doc: '10726589792', estado: 'ACTIVO'   },
  { nombres: 'Charles',   apellidos: 'Wilson',      doc: '10726589793', estado: 'ACTIVO'   },
  { nombres: 'Victoria',  apellidos: 'Imosemi',     doc: '10726589794', estado: 'ACTIVO'   },
  { nombres: 'Ifeanyi',   apellidos: 'Richardson',  doc: '10726589795', estado: 'ACTIVO'   },
  { nombres: 'Amoka',     apellidos: 'Mercy',       doc: '10726589796', estado: 'ACTIVO'   },
  { nombres: 'David',     apellidos: 'Martínez',    doc: '10726589797', estado: 'ACTIVO'   },
  { nombres: 'Laura',     apellidos: 'González',    doc: '10726589798', estado: 'ACTIVO'   },
  { nombres: 'Carlos',    apellidos: 'Rodríguez',   doc: '10726589799', estado: 'ACTIVO'   },
  { nombres: 'Ana',       apellidos: 'López',       doc: '10726589800', estado: 'ACTIVO'   },
  { nombres: 'Pedro',     apellidos: 'García',      doc: '10726589801', estado: 'ACTIVO'   },
  { nombres: 'María',     apellidos: 'Hernández',   doc: '10726589802', estado: 'ACTIVO'   },
  { nombres: 'Luis',      apellidos: 'Díaz',        doc: '10726589803', estado: 'ACTIVO'   },
  { nombres: 'Elena',     apellidos: 'Torres',      doc: '10726589804', estado: 'ACTIVO'   },
  { nombres: 'Jorge',     apellidos: 'Ramírez',     doc: '10726589805', estado: 'ACTIVO'   },
  { nombres: 'Alejandro', apellidos: 'Soto',        doc: '10726589821', estado: 'INACTIVO' },
  { nombres: 'Natalia',   apellidos: 'Mendoza',     doc: '10726589822', estado: 'INACTIVO' },
  { nombres: 'Mateo',     apellidos: 'Ríos',        doc: '10726589823', estado: 'INACTIVO' },
  { nombres: 'Valeria',   apellidos: 'Guerrero',    doc: '10726589824', estado: 'INACTIVO' },
  { nombres: 'Mauricio',  apellidos: 'Cortés',      doc: '10726589831', estado: 'RETIRADO' },
  { nombres: 'Paula',     apellidos: 'Sandoval',    doc: '10726589832', estado: 'RETIRADO' },
];

/* ─── MOCK DATA ─────────────────────────────────────────── */
const MOCK_HORAS = NOMBRES.map((e, i) => ({
  id: i + 1, ...e, periodoNovedad: '2025-06',
  recNocLS: 100500,    totalRecNocLS: 224000,
  recDiurDF: 224000,   totalRecDiurDF: 200000,
  recNoctDF: 150000,   totalRecNoctDF: 150000,
  hrsExDiurLS: 0,      totalHrsExDiurLS: 100500,
  hrsExNoctLS: 224000, totalHrsExNoctLS: 224000,
  hrsExDiurDF: 200000, totalHrsExDiurDF: 200000,
  hrsExNoctDF: 200000, totalHrsExNoctDF: 1623500,
  totalHrsRecargos: 200000,
}));

const MOCK_HORAS_PERIODO = [
  '2025-01-15','2025-01-30','2025-02-15','2025-02-28',
  '2025-03-15','2025-03-31','2025-04-15','2025-04-30',
  '2025-05-15','2025-05-30','2025-06-15',
].map((p, i) => ({
  id: i + 1, periodoLiquidacion: p,
  totalHorasExtra: 1340000, totalRecargos: 200000, totalHorasRecargos: 1340000,
}));

const MOCK_INCAP = NOMBRES.map((e, i) => ({
  id: i + 1, ...e, fechaInicio: '2025-01-02', fechaFin: '2025-01-02',
  pagoPor: 224000, diasIncapComun: 224000, diasIncapLaboral: 224000,
  totalIncapComun: 200000, totalIncapLaboral: 1623500,
}));

const MOCK_INCAP_PERIODO = [
  '2025-01','2025-01','2025-01','2025-01','2025-01','2025-01',
  '2025-02','2025-02','2025-02','2025-02','2025-02',
].map((p, i) => ({
  id: i + 1, periodoIncapacidad: p,
  totalLaboral: 1340000, totalComun: 200000, totalLaboralComun: 1340000,
}));

const MOCK_LICENCIAS = NOMBRES.map((e, i) => ({
  id: i + 1, ...e, fechaInicio: '2025-01-02', fechaFin: '2025-01-02',
  diasLicRemun: 224000, totalLicRemun: 224000,
  diasLicNoRemun: 200000, totalLicNoRemun: 200000,
}));

const MOCK_LICENCIAS_PERIODO = [
  '2025-01','2025-01','2025-01','2025-01','2025-01','2025-01',
  '2025-02','2025-02','2025-02','2025-02','2025-02',
].map((p, i) => ({
  id: i + 1, periodoLicencia: p,
  totalRemun: 1340000, totalNoRemun: 200000, totalRemunNoRemun: 1340000,
}));

const MOCK_VACACIONES = NOMBRES.map((e, i) => ({
  id: i + 1, ...e, fechaInicio: '2025-01-02', fechaFin: '2025-01-02',
  diasVacaciones: 224000,
  tipoVacaciones: i % 2 === 0 ? 'Compensadas' : 'Disfrutadas',
  valorLiquidar: 200000,
}));

const MOCK_VACACIONES_PERIODO = [
  '2025-01','2025-01','2025-01','2025-01','2025-01','2025-01',
  '2025-02','2025-02','2025-02','2025-02','2025-02',
].map((p, i) => ({
  id: i + 1, periodoLicencia: p,
  totalDisfrutadas: 1340000, totalCompensadas: 200000,
  totalDisfrutadasCompensadas: 1340000,
}));

/* ─── CONFIG ─────────────────────────────────────────────── */
const TABS_PRINCIPAL = [
  { id: 'horasExtra',      label: 'Horas extra y recargos'       },
  { id: 'totalHoras',      label: 'Total horas extra y recargos' },
  { id: 'incapacidades',   label: 'Incapacidades'                },
  { id: 'totalIncap',      label: 'Total incapacidades'          },
  { id: 'licencias',       label: 'Licencias'                    },
  { id: 'totalLicencias',  label: 'Total licencias'              },
  { id: 'vacaciones',      label: 'Vacaciones'                   },
  { id: 'totalVacaciones', label: 'Total vacaciones'             },
];

const TABS_CON_ESTADO = ['horasExtra', 'incapacidades', 'licencias', 'vacaciones'];
const TABS_PERIODO    = ['totalHoras', 'totalIncap', 'totalLicencias', 'totalVacaciones'];

const TABS_ESTADO = [
  { label: 'Activos',   value: 'ACTIVO'   },
  { label: 'Inactivos', value: 'INACTIVO' },
  { label: 'Retirados', value: 'RETIRADO' },
];

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
};

export default function ReportesConceptosPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [tabPrincipal, setTabPrincipal] = useState('horasExtra');
  const [tabEstado,    setTabEstado]    = useState('ACTIVO');
  const [busqueda,     setBusqueda]     = useState('');
  const [pagina,       setPagina]       = useState(0);
  const [porPagina,    setPorPagina]    = useState(10);

  const handleTabPrincipal = (t) => { setTabPrincipal(t); setBusqueda(''); setPagina(0); };
  const handleTabEstado    = (v) => { setTabEstado(v);    setBusqueda(''); setPagina(0); };
  const handlePorPagina    = (v) => { setPorPagina(v);   setPagina(0); };

  const mostrarEstado = TABS_CON_ESTADO.includes(tabPrincipal);
  const esPeriodo     = TABS_PERIODO.includes(tabPrincipal);

  const buscar        = (r) => busqueda === '' || `${r.nombres ?? ''} ${r.apellidos ?? ''} ${r.doc ?? ''}`.toLowerCase().includes(busqueda.toLowerCase());
  const buscarPeriodo = (r, campo) => busqueda === '' || String(r[campo] ?? '').includes(busqueda);

  const getDatos = () => {
    switch (tabPrincipal) {
      case 'horasExtra':      return MOCK_HORAS.filter(r => r.estado === tabEstado).filter(buscar);
      case 'totalHoras':      return MOCK_HORAS_PERIODO.filter(r => buscarPeriodo(r, 'periodoLiquidacion'));
      case 'incapacidades':   return MOCK_INCAP.filter(r => r.estado === tabEstado).filter(buscar);
      case 'totalIncap':      return MOCK_INCAP_PERIODO.filter(r => buscarPeriodo(r, 'periodoIncapacidad'));
      case 'licencias':       return MOCK_LICENCIAS.filter(r => r.estado === tabEstado).filter(buscar);
      case 'totalLicencias':  return MOCK_LICENCIAS_PERIODO.filter(r => buscarPeriodo(r, 'periodoLicencia'));
      case 'vacaciones':      return MOCK_VACACIONES.filter(r => r.estado === tabEstado).filter(buscar);
      case 'totalVacaciones': return MOCK_VACACIONES_PERIODO.filter(r => buscarPeriodo(r, 'periodoLicencia'));
      default: return [];
    }
  };

  const datosActivos = getDatos();
  const totalPaginas = Math.max(1, Math.ceil(datosActivos.length / porPagina));
  const datosPagina  = datosActivos.slice(pagina * porPagina, pagina * porPagina + porPagina);

  /* ── Estilos dinámicos cabecera periodo ── */
  const thP = { ...styles.thP, width: '25%' };
  const tdP = styles.tdP;

  const renderCabecera = () => {
    switch (tabPrincipal) {
      case 'horasExtra': return (
        <tr>
          {['#','Nombre(s)','Apellidos','Periodo novedad','Número de documento',
            'Rec. noc. lunes a sábado','Total rec. noc. lunes a sábado',
            'Rec. diur. dom/festivo','Total rec. diur. dom/festivo',
            'Rec. noct. dom/festivo','Total rec. noct. dom/festivo',
            '# hrs extra diur. lunes a sabado','Total # hrs extra diur. lunes a sabado',
            '# hrs extra noct. lunes a sabado','Total # hrs ex. noct. lunes a sabado',
            '# hrs extra diu. dom/festivo','Total # hrs ex. diu. dom/festivo',
            '# hrs extra noct. dom/festivo','Total # hrs extra noct. dom/festivo',
            'Total hrs extra y recargos'].map(h => <th key={h} style={styles.th}>{h}</th>)}
        </tr>
      );
      case 'totalHoras': return (
        <tr>
          <th style={thP}>Periodo de liquidación</th>
          <th style={thP}>Total horas extra</th>
          <th style={thP}>Total recargos</th>
          <th style={thP}>Total horas extra y recargos</th>
        </tr>
      );
      case 'incapacidades': return (
        <tr>
          {['#','Nombre(s)','Apellidos','Número de documento','Fecha incio','Fecha fin',
            'Pago por','Días de incap. orig. común','Días de incap. orig. laboral',
            'Total incap. orig. común','Total incap. orig. laboral'].map(h => <th key={h} style={styles.th}>{h}</th>)}
        </tr>
      );
      case 'totalIncap': return (
        <tr>
          <th style={thP}>Periodo de incapacidad</th>
          <th style={thP}>Total incapacidades por orig. laboral</th>
          <th style={thP}>Total incapacidades por orig. común</th>
          <th style={thP}>Total inc. por orig. laboral y común</th>
        </tr>
      );
      case 'licencias': return (
        <tr>
          {['#','Nombre(s)','Apellidos','Número de documento','Fecha incio','Fecha fin',
            'Días de licencia/permisos remun.','Total licencia/permisos remun.',
            'Días de licencia/permisos no remun.','Total licencia/permisos no remun.'].map(h => <th key={h} style={styles.th}>{h}</th>)}
        </tr>
      );
      case 'totalLicencias': return (
        <tr>
          <th style={thP}>Periodo de licencia</th>
          <th style={thP}>Total licencias/permisos remunerados</th>
          <th style={thP}>Total licencias/permisos no remunerados</th>
          <th style={thP}>Total licencias y permisos remun. y no remun.</th>
        </tr>
      );
      case 'vacaciones': return (
        <tr>
          {['#','Nombre(s)','Apellidos','Número de documento','Fecha incio','Fecha fin',
            'Días vacaciones','Tipo vacaciones','Valor a liquidar vacaciones'].map(h => <th key={h} style={styles.th}>{h}</th>)}
        </tr>
      );
      case 'totalVacaciones': return (
        <tr>
          <th style={thP}>Periodo de licencia</th>
          <th style={thP}>Total vacaciones disfrutadas</th>
          <th style={thP}>Total vacaciones compensadas</th>
          <th style={thP}>Total vacaciones disfrutadas y compensadas</th>
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
        <tr key={r.id} style={bg}>
          <td style={styles.td}>{num}</td>
          <td style={styles.td}>{r.nombres}</td>
          <td style={styles.td}>{r.apellidos}</td>
          <td style={styles.td}>{r.periodoNovedad}</td>
          <td style={styles.td}>{r.doc}</td>
          <td style={styles.td}>{fmt(r.recNocLS)}</td>
          <td style={styles.td}>{fmt(r.totalRecNocLS)}</td>
          <td style={styles.td}>{fmt(r.recDiurDF)}</td>
          <td style={styles.td}>{fmt(r.totalRecDiurDF)}</td>
          <td style={styles.td}>{fmt(r.recNoctDF)}</td>
          <td style={styles.td}>{fmt(r.totalRecNoctDF)}</td>
          <td style={styles.td}>{fmt(r.hrsExDiurLS)}</td>
          <td style={styles.td}>{fmt(r.totalHrsExDiurLS)}</td>
          <td style={styles.td}>{fmt(r.hrsExNoctLS)}</td>
          <td style={styles.td}>{fmt(r.totalHrsExNoctLS)}</td>
          <td style={styles.td}>{fmt(r.hrsExDiurDF)}</td>
          <td style={styles.td}>{fmt(r.totalHrsExDiurDF)}</td>
          <td style={styles.td}>{fmt(r.hrsExNoctDF)}</td>
          <td style={styles.td}>{fmt(r.totalHrsExNoctDF)}</td>
          <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalHrsRecargos)}</td>
        </tr>
      );
      case 'totalHoras': return (
        <tr key={r.id} style={bg}>
          <td style={tdP}>{r.periodoLiquidacion}</td>
          <td style={tdP}>{fmt(r.totalHorasExtra)}</td>
          <td style={tdP}>{fmt(r.totalRecargos)}</td>
          <td style={{ ...tdP, fontWeight: '700' }}>{fmt(r.totalHorasRecargos)}</td>
        </tr>
      );
      case 'incapacidades': return (
        <tr key={r.id} style={bg}>
          <td style={styles.td}>{num}</td>
          <td style={styles.td}>{r.nombres}</td>
          <td style={styles.td}>{r.apellidos}</td>
          <td style={styles.td}>{r.doc}</td>
          <td style={styles.td}>{r.fechaInicio}</td>
          <td style={styles.td}>{r.fechaFin}</td>
          <td style={styles.td}>{fmt(r.pagoPor)}</td>
          <td style={styles.td}>{fmt(r.diasIncapComun)}</td>
          <td style={styles.td}>{fmt(r.diasIncapLaboral)}</td>
          <td style={styles.td}>{fmt(r.totalIncapComun)}</td>
          <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalIncapLaboral)}</td>
        </tr>
      );
      case 'totalIncap': return (
        <tr key={r.id} style={bg}>
          <td style={tdP}>{r.periodoIncapacidad}</td>
          <td style={tdP}>{fmt(r.totalLaboral)}</td>
          <td style={tdP}>{fmt(r.totalComun)}</td>
          <td style={{ ...tdP, fontWeight: '700' }}>{fmt(r.totalLaboralComun)}</td>
        </tr>
      );
      case 'licencias': return (
        <tr key={r.id} style={bg}>
          <td style={styles.td}>{num}</td>
          <td style={styles.td}>{r.nombres}</td>
          <td style={styles.td}>{r.apellidos}</td>
          <td style={styles.td}>{r.doc}</td>
          <td style={styles.td}>{r.fechaInicio}</td>
          <td style={styles.td}>{r.fechaFin}</td>
          <td style={styles.td}>{fmt(r.diasLicRemun)}</td>
          <td style={styles.td}>{fmt(r.totalLicRemun)}</td>
          <td style={styles.td}>{fmt(r.diasLicNoRemun)}</td>
          <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalLicNoRemun)}</td>
        </tr>
      );
      case 'totalLicencias': return (
        <tr key={r.id} style={bg}>
          <td style={tdP}>{r.periodoLicencia}</td>
          <td style={tdP}>{fmt(r.totalRemun)}</td>
          <td style={tdP}>{fmt(r.totalNoRemun)}</td>
          <td style={{ ...tdP, fontWeight: '700' }}>{fmt(r.totalRemunNoRemun)}</td>
        </tr>
      );
      case 'vacaciones': return (
        <tr key={r.id} style={bg}>
          <td style={styles.td}>{num}</td>
          <td style={styles.td}>{r.nombres}</td>
          <td style={styles.td}>{r.apellidos}</td>
          <td style={styles.td}>{r.doc}</td>
          <td style={styles.td}>{r.fechaInicio}</td>
          <td style={styles.td}>{r.fechaFin}</td>
          <td style={styles.td}>{fmt(r.diasVacaciones)}</td>
          <td style={styles.td}>{r.tipoVacaciones}</td>
          <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.valorLiquidar)}</td>
        </tr>
      );
      case 'totalVacaciones': return (
        <tr key={r.id} style={bg}>
          <td style={tdP}>{r.periodoLicencia}</td>
          <td style={tdP}>{fmt(r.totalDisfrutadas)}</td>
          <td style={tdP}>{fmt(r.totalCompensadas)}</td>
          <td style={{ ...tdP, fontWeight: '700' }}>{fmt(r.totalDisfrutadasCompensadas)}</td>
        </tr>
      );
      default: return null;
    }
  };

  return (
    <div style={styles.container}>

      {/* Header */}
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

      {/* Volver */}
      <button style={styles.volverBtn} onClick={() => navigate(`/empresas/${id}/reportes/empleados`)}>
        <ChevronLeft size={16} color="#272525" />
        <span>Volver</span>
      </button>

      {/* Toolbar */}
      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>50</p>
          <p style={styles.totalLabel}>Total employees</p>
        </div>
        <div style={styles.searchBox}>
          <Search size={14} color="#A3A3A3" />
          <input
            style={styles.searchInput}
            placeholder="Enter search word"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
          />
        </div>
      </div>

      {/* Tabs + resultados por página */}
      <div style={styles.tabsRow}>
        <div style={styles.tabsBox}>
          {TABS_PRINCIPAL.map((t) => (
            <button
              key={t.id}
              style={{ ...styles.tab, ...(tabPrincipal === t.id ? styles.tabActivo : {}) }}
              onClick={() => handleTabPrincipal(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={styles.porPaginaBox}>
          <span style={styles.porPaginaLabel}>Resultados por página:</span>
          <select
            value={porPagina}
            onChange={(e) => handlePorPagina(Number(e.target.value))}
            style={styles.porPaginaSelect}
          >
            {OPCIONES_PAGINA.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Card */}
      <div style={styles.card}>

        {/* Estado-tabs solo en detalle */}
        {mostrarEstado && (
          <div style={styles.estadoTabsRow}>
            {TABS_ESTADO.map((t) => (
              <button
                key={t.value}
                style={{ ...styles.estadoTab, ...(tabEstado === t.value ? styles.estadoTabActivo : {}) }}
                onClick={() => handleTabEstado(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <p style={styles.tableTitle}>{TITULOS[tabPrincipal]}</p>
        <div style={styles.tableWrapper}>
          <table style={{
            ...styles.table,
            minWidth:    esPeriodo ? '0'    : '1400px',
            tableLayout: esPeriodo ? 'auto' : 'auto',
          }}>
            <thead>{renderCabecera()}</thead>
            <tbody>
              {datosPagina.length === 0 ? (
                <tr><td colSpan={20} style={{ textAlign: 'center', padding: '20px', color: '#A3A3A3' }}>Sin resultados</td></tr>
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
  volverBtn:       { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0 },
  toolbarCard:     { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalNum:        { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:      { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  searchBox:       { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '320px' },
  searchInput:     { border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  tabsRow:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E8E8' },
  tabsBox:         { display: 'flex', flexWrap: 'wrap' },
  tab:             { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px 16px', fontSize: '13px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' },
  tabActivo:       { color: '#0B662A', borderBottom: '2px solid #0B662A' },
  porPaginaBox:    { display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '4px', flexShrink: 0 },
  porPaginaLabel:  { fontSize: '13px', color: '#A3A3A3', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' },
  porPaginaSelect: { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '6px 28px 6px 12px', fontSize: '13px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23272525\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundColor: '#fff' },
  estadoTabsRow:   { display: 'flex', justifyContent: 'flex-end', gap: '4px', marginBottom: '16px' },
  estadoTab:       { background: 'none', border: '1px solid #D0D0D0', borderRadius: '20px', padding: '4px 16px', fontSize: '13px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  estadoTabActivo: { backgroundColor: '#0B662A', borderColor: '#0B662A', color: '#fff' },
  card:            { backgroundColor: '#fff', borderRadius: '16px', padding: '24px' },
  tableTitle:      { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tableWrapper:    { overflowX: 'auto', width: '100%' },
  table:           { width: '100%', borderCollapse: 'collapse' },
  /* Detalle (centrado) */
  th:              { fontSize: '11px', fontWeight: '700', color: '#A3A3A3', padding: '10px 10px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:              { fontSize: '12px', color: '#272525', padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' },
  /* Periodo (left, ancho distribuido) */
  thP:             { fontSize: '12px', fontWeight: '700', color: '#A3A3A3', padding: '12px 20px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },  tdP:             { fontSize: '13px', color: '#272525', padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' },
  trPar:           { backgroundColor: '#fff' },
  trImpar:         { backgroundColor: '#FAFAFA' },
  paginacion:      { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' },
  pageBtn:         { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif' },
  pageBtnActivo:   { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
};
