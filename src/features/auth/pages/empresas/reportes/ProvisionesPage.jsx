import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { Banknote, ChevronLeft, UserRound, Search } from 'lucide-react';

const fmt = (v) => '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* ─── DATOS BASE ─────────────────────────────────────────── */
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

const PERIODOS = [
  '2025-01-15','2025-01-15','2025-01-15','2025-01-15','2025-01-15','2025-01-15',
  '2025-01-15','2025-01-15','2025-01-15','2025-01-30','2025-01-30','2025-01-30',
];

/* ─── MOCK DATA ──────────────────────────────────────────── */
const MOCK_SEG_SOC = NOMBRES.map((e, i) => ({
  id: i + 1, ...e,
  periodo: '2025-01-15', fechaIngreso: '2025-01-02',
  saludEmp: 224000, pensionEmp: 224000, arlEmp: 200000,
  totalSegSoc: 200000, saludEmpl: 200000, pensionEmpl: 200000,
}));

const MOCK_SEG_SOC_PERIODO = PERIODOS.map((p, i) => ({
  id: i + 1, periodo: p,
  segSocSalud: 500000, segSocPension: 500000, segSocArl: 500000, totalSegSoc: 500000,
}));

const MOCK_PARAF = NOMBRES.map((e, i) => ({
  id: i + 1, ...e,
  periodo: '2025-01-15', fechaIngreso: '2025-01-02',
  sena: 224000, icbf: 224000, cajaComp: 200000, totalParaf: 200000,
}));

const MOCK_PARAF_PERIODO = PERIODOS.map((p, i) => ({
  id: i + 1, periodo: p,
  apParafSena: 500000, apParafIcbf: 500000, apParafCaja: 500000, totalParaf: 500000,
}));

const MOCK_CARGAS = NOMBRES.map((e, i) => ({
  id: i + 1, ...e,
  fechaReporte: '2025-01-15',
  totalCesantias: 500000, totalPrimas: 500000,
  totalVacaciones: 500000, totalIntCesantias: 500000,
}));

const MOCK_TOTAL = PERIODOS.map((p, i) => ({
  id: i + 1, periodo: p,
  totalSegSoc: 500000, totalParaf: 500000,
  totalPrimas: 500000, totalVacaciones: 500000, totalIntCesantias: 500000,
}));

/* ─── CONFIG ─────────────────────────────────────────────── */
const TABS = [
  { id: 'segSocEmpl',    label: 'Seguridad social empleados'  },
  { id: 'totalSegSoc',   label: 'Total seguridad social'      },
  { id: 'parafEmpl',     label: 'Aportes parafiscales'        },
  { id: 'totalParaf',    label: 'Total aportes parafiscales'  },
  { id: 'cargas',        label: 'Cargas prestacionales'       },
  { id: 'totalReportes', label: 'Total reportes empleador'    },
];

const TABS_CON_ESTADO = ['segSocEmpl', 'parafEmpl', 'cargas'];

const TABS_ESTADO = [
  { label: 'Activos',   value: 'ACTIVO'   },
  { label: 'Inactivos', value: 'INACTIVO' },
  { label: 'Retirados', value: 'RETIRADO' },
];

const OPCIONES_PAGINA = [10, 25, 50];

const TITULOS = {
  segSocEmpl:    'Histórico Detalles Seguridad Social por Empleado (Reporte del Empleador)',
  totalSegSoc:   'Histórico Seguridad Social por Periodo (Reporte del Empleador)',
  parafEmpl:     'Histórico Detalles Aportes Parafiscales por Empleado (Reporte del Empleador)',
  totalParaf:    'Histórico Aportes Parafiscales por Periodo (Reporte del Empleador)',
  cargas:        'Histórico Cargas Prestacionales por Empleado (Reporte del Empleador)',
  totalReportes: 'Histórico Total de Conceptos a Reportar por Empleador',
};

export default function ProvisionesPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [tabActual,  setTabActual]  = useState('segSocEmpl');
  const [tabEstado,  setTabEstado]  = useState('ACTIVO');
  const [busqueda,   setBusqueda]   = useState('');
  const [pagina,     setPagina]     = useState(0);
  const [porPagina,  setPorPagina]  = useState(10);

  const handleTab       = (t) => { setTabActual(t);  setBusqueda(''); setPagina(0); };
  const handleEstado    = (v) => { setTabEstado(v);  setBusqueda(''); setPagina(0); };
  const handlePorPagina = (v) => { setPorPagina(v);  setPagina(0); };

  const mostrarEstado = TABS_CON_ESTADO.includes(tabActual);
  const esDetalle     = TABS_CON_ESTADO.includes(tabActual);

  const buscar        = (r) => busqueda === '' || `${r.nombres ?? ''} ${r.apellidos ?? ''} ${r.doc ?? ''}`.toLowerCase().includes(busqueda.toLowerCase());
  const buscarPeriodo = (r, campo) => busqueda === '' || String(r[campo] ?? '').includes(busqueda);

  const getDatos = () => {
    switch (tabActual) {
      case 'segSocEmpl':    return MOCK_SEG_SOC.filter(r => r.estado === tabEstado).filter(buscar);
      case 'totalSegSoc':   return MOCK_SEG_SOC_PERIODO.filter(r => buscarPeriodo(r, 'periodo'));
      case 'parafEmpl':     return MOCK_PARAF.filter(r => r.estado === tabEstado).filter(buscar);
      case 'totalParaf':    return MOCK_PARAF_PERIODO.filter(r => buscarPeriodo(r, 'periodo'));
      case 'cargas':        return MOCK_CARGAS.filter(r => r.estado === tabEstado).filter(buscar);
      case 'totalReportes': return MOCK_TOTAL.filter(r => buscarPeriodo(r, 'periodo'));
      default: return [];
    }
  };

  const datosActivos = getDatos();
  const totalPaginas = Math.max(1, Math.ceil(datosActivos.length / porPagina));
  const datosPagina  = datosActivos.slice(pagina * porPagina, pagina * porPagina + porPagina);

  const renderCabecera = () => {
    switch (tabActual) {
      case 'segSocEmpl': return (
        <tr>
          {['#','Nombre(s)','Apellidos','Número de documento','Periodo','Fecha de ingreso',
            'Salud empleador','Pensión empleador','ARL empleador',
            'Total seguridad social empleador','Salud empleado','Pensión empleado']
            .map(h => <th key={h} style={styles.th}>{h}</th>)}
        </tr>
      );
      case 'totalSegSoc': return (
        <tr>
          {['Periodo','Seg. social salud','Seg. social pensión','Seg. social ARL','Total seguridad social']
            .map(h => <th key={h} style={styles.thP}>{h}</th>)}
        </tr>
      );
      case 'parafEmpl': return (
        <tr>
          {['#','Nombre(s)','Apellidos','Número de documento','Periodo','Fecha de ingreso',
            'SENA','ICBF','Caja de compensación','Total aportes parafiscales']
            .map(h => <th key={h} style={styles.th}>{h}</th>)}
        </tr>
      );
      case 'totalParaf': return (
        <tr>
          {['Periodo','Ap. paraf. SENA','Ap. paraf. ICBF','Ap. paraf. caja de compensación','Total aportes parafiscales']
            .map(h => <th key={h} style={styles.thP}>{h}</th>)}
        </tr>
      );
      case 'cargas': return (
        <tr>
          {['#','Nombre(s)','Apellidos','Número de documento','Fecha de reporte',
            'Total cesantías (informativo)','Total primas','Total vacaciones','Total intereses de cesantías']
            .map(h => <th key={h} style={styles.th}>{h}</th>)}
        </tr>
      );
      case 'totalReportes': return (
        <tr>
          {['Periodo','Total seguridad social','Total aportes parafiscales','Total primas','Total vacaciones','Total intereses de cesantías']
            .map(h => <th key={h} style={styles.thP}>{h}</th>)}
        </tr>
      );
      default: return null;
    }
  };

  const renderFila = (r, index) => {
    const bg  = index % 2 === 0 ? styles.trPar : styles.trImpar;
    const num = String(index + 1 + pagina * porPagina).padStart(2, '0');

    switch (tabActual) {
      case 'segSocEmpl': return (
        <tr key={r.id} style={bg}>
          <td style={styles.td}>{num}</td>
          <td style={styles.td}>{r.nombres}</td>
          <td style={styles.td}>{r.apellidos}</td>
          <td style={styles.td}>{r.doc}</td>
          <td style={styles.td}>{r.periodo}</td>
          <td style={styles.td}>{r.fechaIngreso}</td>
          <td style={styles.td}>{fmt(r.saludEmp)}</td>
          <td style={styles.td}>{fmt(r.pensionEmp)}</td>
          <td style={styles.td}>{fmt(r.arlEmp)}</td>
          <td style={styles.td}>{fmt(r.totalSegSoc)}</td>
          <td style={styles.td}>{fmt(r.saludEmpl)}</td>
          <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.pensionEmpl)}</td>
        </tr>
      );
      case 'totalSegSoc': return (
        <tr key={r.id} style={bg}>
          <td style={styles.tdP}>{r.periodo}</td>
          <td style={styles.tdP}>{fmt(r.segSocSalud)}</td>
          <td style={styles.tdP}>{fmt(r.segSocPension)}</td>
          <td style={styles.tdP}>{fmt(r.segSocArl)}</td>
          <td style={{ ...styles.tdP, fontWeight: '700' }}>{fmt(r.totalSegSoc)}</td>
        </tr>
      );
      case 'parafEmpl': return (
        <tr key={r.id} style={bg}>
          <td style={styles.td}>{num}</td>
          <td style={styles.td}>{r.nombres}</td>
          <td style={styles.td}>{r.apellidos}</td>
          <td style={styles.td}>{r.doc}</td>
          <td style={styles.td}>{r.periodo}</td>
          <td style={styles.td}>{r.fechaIngreso}</td>
          <td style={styles.td}>{fmt(r.sena)}</td>
          <td style={styles.td}>{fmt(r.icbf)}</td>
          <td style={styles.td}>{fmt(r.cajaComp)}</td>
          <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalParaf)}</td>
        </tr>
      );
      case 'totalParaf': return (
        <tr key={r.id} style={bg}>
          <td style={styles.tdP}>{r.periodo}</td>
          <td style={styles.tdP}>{fmt(r.apParafSena)}</td>
          <td style={styles.tdP}>{fmt(r.apParafIcbf)}</td>
          <td style={styles.tdP}>{fmt(r.apParafCaja)}</td>
          <td style={{ ...styles.tdP, fontWeight: '700' }}>{fmt(r.totalParaf)}</td>
        </tr>
      );
      case 'cargas': return (
        <tr key={r.id} style={bg}>
          <td style={styles.td}>{num}</td>
          <td style={styles.td}>{r.nombres}</td>
          <td style={styles.td}>{r.apellidos}</td>
          <td style={styles.td}>{r.doc}</td>
          <td style={styles.td}>{r.fechaReporte}</td>
          <td style={styles.td}>{fmt(r.totalCesantias)}</td>
          <td style={styles.td}>{fmt(r.totalPrimas)}</td>
          <td style={styles.td}>{fmt(r.totalVacaciones)}</td>
          <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalIntCesantias)}</td>
        </tr>
      );
      case 'totalReportes': return (
        <tr key={r.id} style={bg}>
          <td style={styles.tdP}>{r.periodo}</td>
          <td style={styles.tdP}>{fmt(r.totalSegSoc)}</td>
          <td style={styles.tdP}>{fmt(r.totalParaf)}</td>
          <td style={styles.tdP}>{fmt(r.totalPrimas)}</td>
          <td style={styles.tdP}>{fmt(r.totalVacaciones)}</td>
          <td style={{ ...styles.tdP, fontWeight: '700' }}>{fmt(r.totalIntCesantias)}</td>
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
          <Banknote size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Reportes Empleador</h2>
            <p style={styles.subtitulo}>Gestiona los conceptos a reportar por parte del empleador</p>
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
      <button style={styles.volverBtn} onClick={() => navigate(`/empresas/${id}/reportes`)}>
        <ChevronLeft size={16} color="#272525" />
        <span>Volver</span>
      </button>

      {/* Toolbar */}
      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>{NOMBRES.length}</p>
          <p style={styles.totalLabel}>Total empleados</p>
        </div>
        <div style={styles.searchBox}>
          <Search size={14} color="#A3A3A3" />
          <input
            style={styles.searchInput}
            placeholder="Ingresa palabra de búsqueda"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
          />
        </div>
      </div>

      {/* Tabs principales + resultados por página */}
      <div style={styles.tabsRow}>
        <div style={styles.tabsBox}>
          {TABS.map((t) => (
            <button
              key={t.id}
              style={{ ...styles.tab, ...(tabActual === t.id ? styles.tabActivo : {}) }}
              onClick={() => handleTab(t.id)}
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

        {/* Tabs de estado DENTRO del card, alineados a la derecha, antes del título */}
        {mostrarEstado && (
          <div style={styles.estadoTabsRow}>
            {TABS_ESTADO.map((t) => (
              <button
                key={t.value}
                style={{ ...styles.estadoTab, ...(tabEstado === t.value ? styles.estadoTabActivo : {}) }}
                onClick={() => handleEstado(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <p style={styles.tableTitle}>{TITULOS[tabActual]}</p>

        <div style={styles.tableWrapper}>
          <table style={{ ...styles.table, minWidth: esDetalle ? '1200px' : '0' }}>
            <thead>{renderCabecera()}</thead>
            <tbody>
              {datosPagina.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '20px', color: '#A3A3A3' }}>
                    Sin resultados
                  </td>
                </tr>
              ) : datosPagina.map((r, index) => renderFila(r, index))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div style={styles.paginacion}>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => setPagina(i)}
              style={{ ...styles.pageBtn, ...(pagina === i ? styles.pageBtnActivo : {}) }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPagina(totalPaginas - 1)}
            style={styles.pageBtn}
            disabled={pagina === totalPaginas - 1}
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container:        { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' },
  header:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:           { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:        { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:        { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:           { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  perfilNombre:     { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:      { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  volverBtn:        { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0, width: 'fit-content' },
  toolbarCard:      { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalNum:         { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:       { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  searchBox:        { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '320px' },
  searchInput:      { border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },

  tabsRow:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E8E8', flexWrap: 'wrap', gap: '8px' },
  tabsBox:          { display: 'flex', flexWrap: 'wrap' },
  tab:              { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px 14px', fontSize: '13px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' },
  tabActivo:        { color: '#0B662A', borderBottom: '2px solid #0B662A' },
  porPaginaBox:     { display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px', flexShrink: 0 },
  porPaginaLabel:   { fontSize: '13px', color: '#A3A3A3', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' },
  porPaginaSelect:  { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '6px 28px 6px 12px', fontSize: '13px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23272525\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundColor: '#fff' },

  /* Tabs de estado DENTRO del card */
  estadoTabsRow:    { display: 'flex', justifyContent: 'flex-end', gap: '4px', marginBottom: '16px' },
  estadoTab:        { background: 'none', border: '1px solid #D0D0D0', borderRadius: '20px', padding: '4px 16px', fontSize: '13px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  estadoTabActivo:  { backgroundColor: '#0B662A', borderColor: '#0B662A', color: '#fff' },

  card:             { backgroundColor: '#fff', borderRadius: '16px', padding: '24px' },
  tableTitle:       { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tableWrapper:     { overflowX: 'auto', width: '100%' },
  table:            { width: '100%', borderCollapse: 'collapse' },

  th:  { fontSize: '11px', fontWeight: '700', color: '#A3A3A3', padding: '10px 10px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:  { fontSize: '12px', color: '#272525', padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' },
  thP: { fontSize: '12px', fontWeight: '700', color: '#A3A3A3', padding: '12px 20px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  tdP: { fontSize: '13px', color: '#272525', padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' },

  trPar:         { backgroundColor: '#fff' },
  trImpar:       { backgroundColor: '#FAFAFA' },
  paginacion:    { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' },
  pageBtn:       { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif' },
  pageBtnActivo: { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
};
