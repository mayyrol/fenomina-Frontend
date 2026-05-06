import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { Banknote, ChevronLeft, UserRound, Search } from 'lucide-react';
import { useHistoricos } from "../../../hooks/useHistoricos";
import historicosService from '../../../../../services/historicosService';

const fmt = (v) => v == null ? '-' : '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const TABS = [
  { id: 'segSocEmpl',    label: 'Seguridad social empleados'  },
  { id: 'totalSegSoc',   label: 'Total seguridad social'      },
  { id: 'parafEmpl',     label: 'Aportes parafiscales'        },
  { id: 'totalParaf',    label: 'Total aportes parafiscales'  },
  { id: 'cargas',        label: 'Cargas prestacionales'       },
  { id: 'totalReportes', label: 'Total reportes empleador'    },
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
  const [busqueda,   setBusqueda]   = useState('');
  const [pagina,     setPagina]     = useState(0);
  const [porPagina,  setPorPagina]  = useState(10);

  const handleTab       = (t) => { setTabActual(t); setBusqueda(''); setPagina(0); };
  const handlePorPagina = (v) => { setPorPagina(v); setPagina(0); };

  const paramsEmpleado = { empresaId: id, nombres: busqueda || undefined, page: pagina, size: porPagina };
  const paramsPeriodo  = { empresaId: id, page: pagina, size: porPagina };

  const { datos: datosSegSocEmp,  total: totSSEmp,  cargando: cSSEmp  } = useHistoricos(historicosService.getSegSocialXEmpleado,     paramsEmpleado);
  const { datos: datosSegSocTot,  total: totSSTot,  cargando: cSSTot  } = useHistoricos(historicosService.getSegSocialTotal,          paramsPeriodo);
  const { datos: datosParafEmp,   total: totPEmp,   cargando: cPEmp   } = useHistoricos(historicosService.getAportesParafXEmpleado,   paramsEmpleado);
  const { datos: datosParafTot,   total: totPTot,   cargando: cPTot   } = useHistoricos(historicosService.getAportesParafTotal,       paramsPeriodo);
  const { datos: datosCargasTot,  total: totCTot,   cargando: cCTot   } = useHistoricos(historicosService.getCargasPrestacionales,    paramsPeriodo);
  const { datos: datosConsolidado,total: totCons,   cargando: cCons   } = useHistoricos(historicosService.getConsolidadoEmpleador,    paramsPeriodo);

  const mapaData = {
    segSocEmpl:    { datos: datosSegSocEmp,   total: totSSEmp,  cargando: cSSEmp  },
    totalSegSoc:   { datos: datosSegSocTot,   total: totSSTot,  cargando: cSSTot  },
    parafEmpl:     { datos: datosParafEmp,    total: totPEmp,   cargando: cPEmp   },
    totalParaf:    { datos: datosParafTot,    total: totPTot,   cargando: cPTot   },
    cargas:        { datos: datosCargasTot,   total: totCTot,   cargando: cCTot   },
    totalReportes: { datos: datosConsolidado, total: totCons,   cargando: cCons   },
  };

  const { datos: datosActivos, total: totalActual, cargando } = mapaData[tabActual];
  const totalPaginas = Math.max(1, Math.ceil(totalActual / porPagina));
  const esDetalle    = ['segSocEmpl', 'parafEmpl'].includes(tabActual);

  const renderCabecera = () => {
    switch (tabActual) {
      case 'segSocEmpl': return (
        <tr>
          {['#','Nombre(s)','Apellidos','Número de documento','Año','Periodo','Fecha de ingreso',
            'Salud empleador','Pensión empleador','ARL empleador','Total seg. social empleador']
            .map(h => <th key={h} style={styles.th}>{h}</th>)}
        </tr>
      );
      case 'totalSegSoc': return (
        <tr>
          {['Año','Periodo','Seg. social salud','Seg. social pensión','Seg. social ARL','Total seguridad social']
            .map(h => <th key={h} style={styles.thP}>{h}</th>)}
        </tr>
      );
      case 'parafEmpl': return (
        <tr>
          {['#','Nombre(s)','Apellidos','Número de documento','Año','Periodo','Fecha de ingreso',
            'SENA','ICBF','Caja de compensación','Total aportes parafiscales']
            .map(h => <th key={h} style={styles.th}>{h}</th>)}
        </tr>
      );
      case 'totalParaf': return (
        <tr>
          {['Año','Periodo','Ap. paraf. SENA','Ap. paraf. ICBF','Ap. paraf. caja compensación','Total aportes parafiscales']
            .map(h => <th key={h} style={styles.thP}>{h}</th>)}
        </tr>
      );
      case 'cargas': return (
        <tr>
          {['Año','Periodo','Cesantías (informativo)','Primas','Vacaciones','Intereses de cesantías']
            .map(h => <th key={h} style={styles.thP}>{h}</th>)}
        </tr>
      );
      case 'totalReportes': return (
        <tr>
          {['Año','Periodo','Total seg. social','Total aportes parafiscales',
            'Total primas','Total vacaciones','Total intereses de cesantías']
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
        <tr key={index} style={bg}>
          <td style={styles.td}>{num}</td>
          <td style={styles.td}>{r.nombresEmp}</td>
          <td style={styles.td}>{r.apellidosEmp}</td>
          <td style={styles.td}>{r.documentoEmp}</td>
          <td style={styles.td}>{r.anio}</td>
          <td style={styles.td}>{r.periodo}</td>
          <td style={styles.td}>{r.fechaIngresoEmp ?? '-'}</td>
          <td style={styles.td}>{fmt(r.empleadorSalud)}</td>
          <td style={styles.td}>{fmt(r.empleadorPension)}</td>
          <td style={styles.td}>{fmt(r.empleadorArl)}</td>
          <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalSocialEmpleador)}</td>
        </tr>
      );
      case 'totalSegSoc': return (
        <tr key={index} style={bg}>
          <td style={styles.tdP}>{r.anio}</td>
          <td style={styles.tdP}>{r.periodo}</td>
          <td style={styles.tdP}>{fmt(r.segSocialSalud)}</td>
          <td style={styles.tdP}>{fmt(r.segSocialPension)}</td>
          <td style={styles.tdP}>{fmt(r.segSocialArl)}</td>
          <td style={{ ...styles.tdP, fontWeight: '700' }}>{fmt(r.totalSegSocialEmpr)}</td>
        </tr>
      );
      case 'parafEmpl': return (
        <tr key={index} style={bg}>
          <td style={styles.td}>{num}</td>
          <td style={styles.td}>{r.nombresEmp}</td>
          <td style={styles.td}>{r.apellidosEmp}</td>
          <td style={styles.td}>{r.documentoEmp}</td>
          <td style={styles.td}>{r.anio}</td>
          <td style={styles.td}>{r.periodo}</td>
          <td style={styles.td}>{r.fechaIngresoEmp ?? '-'}</td>
          <td style={styles.td}>{fmt(r.apFiscaSena)}</td>
          <td style={styles.td}>{fmt(r.apFiscaIcbf)}</td>
          <td style={styles.td}>{fmt(r.apFiscaCajaComp)}</td>
          <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalAportesParafEmpleador)}</td>
        </tr>
      );
      case 'totalParaf': return (
        <tr key={index} style={bg}>
          <td style={styles.tdP}>{r.anio}</td>
          <td style={styles.tdP}>{r.periodo}</td>
          <td style={styles.tdP}>{fmt(r.apFiscaSena)}</td>
          <td style={styles.tdP}>{fmt(r.apFiscaIcbf)}</td>
          <td style={styles.tdP}>{fmt(r.apFiscaCajaComp)}</td>
          <td style={{ ...styles.tdP, fontWeight: '700' }}>{fmt(r.totalAportesParafEmpr)}</td>
        </tr>
      );
      case 'cargas': return (
        <tr key={index} style={bg}>
          <td style={styles.tdP}>{r.anio}</td>
          <td style={styles.tdP}>{r.periodo}</td>
          <td style={styles.tdP}>{fmt(r.cargPresCesantiasInformativo)}</td>
          <td style={styles.tdP}>{fmt(r.cargPresPrimas)}</td>
          <td style={styles.tdP}>{fmt(r.cargPresVacaciones)}</td>
          <td style={{ ...styles.tdP, fontWeight: '700' }}>{fmt(r.cargPresIntCesantias)}</td>
        </tr>
      );
      case 'totalReportes': return (
        <tr key={index} style={bg}>
          <td style={styles.tdP}>{r.anio}</td>
          <td style={styles.tdP}>{r.periodo}</td>
          <td style={styles.tdP}>{fmt(r.totalSegSocialEmpr)}</td>
          <td style={styles.tdP}>{fmt(r.totalAportesParafEmpr)}</td>
          <td style={styles.tdP}>{fmt(r.cargPresPrimas)}</td>
          <td style={styles.tdP}>{fmt(r.cargPresVacaciones)}</td>
          <td style={{ ...styles.tdP, fontWeight: '700' }}>{fmt(r.cargPresIntCesantias)}</td>
        </tr>
      );
      default: return null;
    }
  };

  return (
    <div style={styles.container}>

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

      <button style={styles.volverBtn} onClick={() => navigate(`/empresas/${id}/reportes`)}>
        <ChevronLeft size={16} color="#272525" />
        <span>Volver</span>
      </button>

      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>{totalActual}</p>
          <p style={styles.totalLabel}>Total registros</p>
        </div>
        <div style={styles.searchBox}>
          <Search size={14} color="#A3A3A3" />
          <input
            style={styles.searchInput}
            placeholder="Buscar por nombre o documento"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
          />
        </div>
      </div>

      <div style={styles.tabsRow}>
        <div style={styles.tabsBox}>
          {TABS.map((t) => (
            <button key={t.id}
              style={{ ...styles.tab, ...(tabActual === t.id ? styles.tabActivo : {}) }}
              onClick={() => handleTab(t.id)}
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
        <p style={styles.tableTitle}>{TITULOS[tabActual]}</p>
        <div style={styles.tableWrapper}>
          <table style={{ ...styles.table, minWidth: esDetalle ? '1100px' : '0' }}>
            <thead>{renderCabecera()}</thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={11} style={styles.tdCentro}>Cargando...</td></tr>
              ) : datosActivos.length === 0 ? (
                <tr><td colSpan={11} style={styles.tdCentro}>Sin resultados</td></tr>
              ) : datosActivos.map((r, index) => renderFila(r, index))}
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
  volverBtn:       { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0, width: 'fit-content' },
  toolbarCard:     { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalNum:        { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:      { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  searchBox:       { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '320px' },
  searchInput:     { border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  tabsRow:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E8E8', flexWrap: 'wrap', gap: '8px' },
  tabsBox:         { display: 'flex', flexWrap: 'wrap' },
  tab:             { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px 14px', fontSize: '13px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' },
  tabActivo:       { color: '#0B662A', borderBottom: '2px solid #0B662A' },
  porPaginaBox:    { display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px', flexShrink: 0 },
  porPaginaLabel:  { fontSize: '13px', color: '#A3A3A3', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' },
  porPaginaSelect: { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '6px 28px 6px 12px', fontSize: '13px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23272525\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundColor: '#fff' },
  card:            { backgroundColor: '#fff', borderRadius: '16px', padding: '24px' },
  tableTitle:      { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tableWrapper:    { overflowX: 'auto', width: '100%' },
  table:           { width: '100%', borderCollapse: 'collapse' },
  th:              { fontSize: '11px', fontWeight: '700', color: '#A3A3A3', padding: '10px 10px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:              { fontSize: '12px', color: '#272525', padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' },
  thP:             { fontSize: '12px', fontWeight: '700', color: '#A3A3A3', padding: '12px 20px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  tdP:             { fontSize: '13px', color: '#272525', padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' },
  tdCentro:        { textAlign: 'center', padding: '20px', color: '#A3A3A3' },
  trPar:           { backgroundColor: '#fff' },
  trImpar:         { backgroundColor: '#FAFAFA' },
  paginacion:      { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' },
  pageBtn:         { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif' },
  pageBtnActivo:   { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
};