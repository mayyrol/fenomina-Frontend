import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../../store/authStore';
import { CreditCard, ChevronLeft, UserRound, Search } from 'lucide-react';
import { useHistoricos } from "../../../../hooks/useHistoricos";
import historicosService from '../../../../../../services/historicosService';

const fmt = (v) => v == null ? '-' : '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const TABS_PRINCIPAL = [
  { id: 'primas',  label: 'Primas de empleados'     },
  { id: 'periodo', label: 'Total primas por periodo' },
];

const OPCIONES_PAGINA = [10, 25, 50];

export default function ReportesPrimasPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [tabPrincipal, setTabPrincipal] = useState('primas');
  const [busqueda,     setBusqueda]     = useState('');
  const [pagina,       setPagina]       = useState(0);
  const [porPagina,    setPorPagina]    = useState(10);

  const handleTabPrincipal = (t) => { setTabPrincipal(t); setBusqueda(''); setPagina(0); };
  const handlePorPagina    = (v) => { setPorPagina(v); setPagina(0); };

  const paramsEmpleados = {
    empresaId: id,
    nombres:   busqueda || undefined,
    page:      pagina,
    size:      porPagina,
  };

  const paramsPeriodo = {
    empresaId: id,
    page:      pagina,
    size:      porPagina,
  };

  const { datos: datosPrimas,  total: totalPri, cargando: cargandoPri } =
    useHistoricos(historicosService.getReportePrimasEmpleados, paramsEmpleados);

  const { datos: datosPeriodo, total: totalPer, cargando: cargandoPer } =
    useHistoricos(historicosService.getReportePrimasConsolidado, paramsPeriodo);

  const datosActivos = tabPrincipal === 'primas'  ? datosPrimas  : datosPeriodo;
  const totalActual  = tabPrincipal === 'primas'  ? totalPri     : totalPer;
  const cargando     = tabPrincipal === 'primas'  ? cargandoPri  : cargandoPer;
  const totalPaginas = Math.max(1, Math.ceil(totalActual / porPagina));

  const tituloTabla =
    tabPrincipal === 'primas'
      ? 'Histórico Detalles de Primas por Empleado'
      : 'Histórico Total de Primas por Periodo';

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Reportes Primas de Empleados</h2>
            <p style={styles.subtitulo}>Gestiona los reportes de primas por empleado asociados a la empresa</p>
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

      <button style={styles.volverBtn} onClick={() => navigate(`/empresas/${id}/reportes/empleados`)}>
        <ChevronLeft size={16} color="#272525" />
        <span>Volver</span>
      </button>

      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>{totalActual}</p>
          <p style={styles.totalLabel}>{tabPrincipal === 'primas' ? 'Total registros' : 'Total periodos'}</p>
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
        <p style={styles.tableTitle}>{tituloTabla}</p>
        <div style={styles.tableWrapper}>
          <table style={{ ...styles.table, minWidth: tabPrincipal === 'periodo' ? '400px' : '1000px' }}>
            <thead>
              {tabPrincipal === 'primas' && (
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Nombre(s)</th>
                  <th style={styles.th}>Apellidos</th>
                  <th style={styles.th}>Año</th>
                  <th style={styles.th}>Semestre</th>
                  <th style={styles.th}>Número de identificación</th>
                  <th style={styles.th}>Fecha inicio periodo</th>
                  <th style={styles.th}>Fecha fin periodo</th>
                  <th style={styles.th}>Fecha inicio corte prima</th>
                  <th style={styles.th}>Fecha fin corte prima</th>
                  <th style={styles.th}>Días laborados</th>
                  <th style={styles.th}>Salario base</th>
                  <th style={styles.th}>Aux. transporte</th>
                  <th style={styles.th}>Otros (variables)</th>
                  <th style={styles.th}>Base liquidación</th>
                  <th style={styles.th}>Total prima</th>
                </tr>
              )}
              {tabPrincipal === 'periodo' && (
                <tr>
                  <th style={styles.th}>Año</th>
                  <th style={styles.th}>Semestre</th>
                  <th style={styles.th}>Total neto primas</th>
                  <th style={styles.th}>Total empleados</th>
                </tr>
              )}
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={16} style={styles.tdCentro}>Cargando...</td></tr>
              ) : datosActivos.length === 0 ? (
                <tr><td colSpan={16} style={styles.tdCentro}>Sin resultados</td></tr>
              ) : datosActivos.map((r, index) => (
                <tr key={index} style={index % 2 === 0 ? styles.trPar : styles.trImpar}>
                  {tabPrincipal === 'primas' && <>
                    <td style={styles.td}>{String(index + 1 + pagina * porPagina).padStart(2, '0')}</td>
                    <td style={styles.td}>{r.nombresEmp}</td>
                    <td style={styles.td}>{r.apellidosEmp}</td>
                    <td style={styles.td}>{r.anioLiqui}</td>
                    <td style={styles.td}>{r.periodoLiqui}</td>
                    <td style={styles.td}>{r.documentoEmp}</td>
                    <td style={styles.td}>{r.finicioGeneral ?? '-'}</td>
                    <td style={styles.td}>{r.ffinalGeneral ?? '-'}</td>
                    <td style={styles.td}>{r.fechaInicioCorte ?? '-'}</td>
                    <td style={styles.td}>{r.fechaFinCorte ?? '-'}</td>
                    <td style={styles.td}>{r.diasLiquidados}</td>
                    <td style={styles.td}>{fmt(r.salarioBase)}</td>
                    <td style={styles.td}>{r.tieneAuxTransporte ? fmt(r.salarioBase) : '-'}</td>
                    <td style={styles.td}>{fmt(r.promedioVarPeriodo)}</td>
                    <td style={styles.td}>{fmt(r.baseLiquiTotal)}</td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.valorNetoPrima)}</td>
                  </>}
                  {tabPrincipal === 'periodo' && <>
                    <td style={styles.td}>{r.anio}</td>
                    <td style={styles.td}>{r.periodo}</td>
                    <td style={styles.td}>{fmt(r.totalNetoPrimas)}</td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{r.totalEmpleados}</td>
                  </>}
                </tr>
              ))}
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
  tabsRow:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E8E8' },
  tabsBox:         { display: 'flex' },
  tab:             { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px 20px', fontSize: '14px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  tabActivo:       { color: '#0B662A', borderBottom: '2px solid #0B662A' },
  porPaginaBox:    { display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '4px' },
  porPaginaLabel:  { fontSize: '13px', color: '#A3A3A3', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' },
  porPaginaSelect: { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '6px 28px 6px 12px', fontSize: '13px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23272525\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundColor: '#fff' },
  card:            { backgroundColor: '#fff', borderRadius: '16px', padding: '24px' },
  tableTitle:      { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tableWrapper:    { overflowX: 'auto', width: '100%' },
  table:           { width: '100%', borderCollapse: 'collapse' },
  th:              { fontSize: '12px', fontWeight: '700', color: '#A3A3A3', padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:              { fontSize: '13px', color: '#272525', padding: '12px 12px', textAlign: 'center', whiteSpace: 'nowrap' },
  tdCentro:        { textAlign: 'center', padding: '20px', color: '#A3A3A3' },
  trPar:           { backgroundColor: '#fff' },
  trImpar:         { backgroundColor: '#FAFAFA' },
  paginacion:      { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' },
  pageBtn:         { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif' },
  pageBtnActivo:   { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
};