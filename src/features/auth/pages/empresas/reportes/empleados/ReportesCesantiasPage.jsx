import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../../store/authStore';
import { Coins, ChevronLeft, UserRound, Search } from 'lucide-react';

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

const AFP = ['Porvenir', 'Protección', 'Colfondos', 'Old Mutual'];

const MOCK_CESANTIAS = NOMBRES.map((emp, i) => ({
  id: i + 1, ...emp,
  anio:              '2025-06-03',
  numIdentificacion: emp.doc,
  fechaInicio:       '2025-06-03',
  fechaCorte:        '2025-06-03',
  diasLaborados:     15,
  salarioBase:       100500,
  auxilioTransporte: 224000,
  salarioBaseLiqui:  224000,
  cesantias:         200000,
  interesesCesantias:150000,
  fondoCesantias:    AFP[i % AFP.length],
}));

const MOCK_CESANTIAS_PERIODO = NOMBRES.map((emp, i) => ({
  id: i + 1,
  anio:           '2025',
  totalCesantias: 1340000,
  totalIntereses: 200000,
}));

const TABS_PRINCIPAL = [
  { id: 'cesantias', label: 'Cesantías e intereses de empleados'       },
  { id: 'periodo',   label: 'Total cesantías e intereses por periodo'   },
];

const TABS_ESTADO = [
  { label: 'Activos',   value: 'ACTIVO'   },
  { label: 'Inactivos', value: 'INACTIVO' },
  { label: 'Retirados', value: 'RETIRADO' },
];

const OPCIONES_PAGINA = [10, 25, 50];

export default function ReportesCesantiasPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [tabPrincipal, setTabPrincipal] = useState('cesantias');
  const [tabEstado,    setTabEstado]    = useState('ACTIVO');
  const [busqueda,     setBusqueda]     = useState('');
  const [pagina,       setPagina]       = useState(0);
  const [porPagina,    setPorPagina]    = useState(10);

  const handleTabPrincipal = (t) => { setTabPrincipal(t); setBusqueda(''); setPagina(0); };
  const handleTabEstado    = (v) => { setTabEstado(v);    setBusqueda(''); setPagina(0); };
  const handlePorPagina    = (v) => { setPorPagina(v);   setPagina(0); };

  const filtradosCesantias = MOCK_CESANTIAS
    .filter(r => r.estado === tabEstado)
    .filter(r => busqueda === '' || `${r.nombres} ${r.apellidos} ${r.doc}`.toLowerCase().includes(busqueda.toLowerCase()));

  const filtradosPeriodo = MOCK_CESANTIAS_PERIODO
    .filter(r => busqueda === '' || String(r.anio).includes(busqueda));

  const datosActivos = tabPrincipal === 'cesantias' ? filtradosCesantias : filtradosPeriodo;
  const totalPaginas = Math.max(1, Math.ceil(datosActivos.length / porPagina));
  const datosPagina  = datosActivos.slice(pagina * porPagina, pagina * porPagina + porPagina);

  const tituloTabla =
    tabPrincipal === 'cesantias'
      ? 'Histórico Detalles de Cesantías e Intereses por Empleado'
      : 'Histórico Total de Cesantías e Intereses por Periodo';

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Coins size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Reportes Cesantías e Intereses de Empleados</h2>
            <p style={styles.subtitulo}>Gestiona los reportes de cesantías e intereses por cada empleado asociado a la empresa</p>
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

      {/* Toolbar: total + búsqueda */}
      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>{MOCK_CESANTIAS.length}</p>
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

      {/* Tabs principales + resultados por página a la derecha */}
      <div style={styles.tabsRow}>
        <div style={styles.tabsBox}>
          {TABS_PRINCIPAL.map((t) => (
            <button
              key={t.id}
              style={{ ...styles.tab, ...(tabPrincipal === t.id ? styles.tabActivo : {}) }}
              onClick={() => handleTabPrincipal(t.id)}
            >{t.label}</button>
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

      {/* Tabla */}
      <div style={styles.card}>

        {/* Estado-tabs dentro del card, alineados a la derecha */}
        {tabPrincipal === 'cesantias' && (
          <div style={styles.estadoTabsRow}>
            {TABS_ESTADO.map((t) => (
              <button
                key={t.value}
                style={{ ...styles.estadoTab, ...(tabEstado === t.value ? styles.estadoTabActivo : {}) }}
                onClick={() => handleTabEstado(t.value)}
              >{t.label}</button>
            ))}
          </div>
        )}

        <p style={styles.tableTitle}>{tituloTabla}</p>
        <div style={styles.tableWrapper}>
          <table style={{ ...styles.table, minWidth: tabPrincipal === 'periodo' ? '0' : '900px' }}>
            <thead>
              {tabPrincipal === 'cesantias' && (
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Nombre(s)</th>
                  <th style={styles.th}>Apellidos</th>
                  <th style={styles.th}>Año</th>
                  <th style={styles.th}>Número de identificación</th>
                  <th style={styles.th}>Fecha de inicio cesantías</th>
                  <th style={styles.th}>Fecha de corte cesantías</th>
                  <th style={styles.th}>Días laborados</th>
                  <th style={styles.th}>Salario base</th>
                  <th style={styles.th}>Auxilio de transporte</th>
                  <th style={styles.th}>Salario base de liqui.</th>
                  <th style={styles.th}>Cesantías</th>
                  <th style={styles.th}>Intereses de cesantías</th>
                  <th style={styles.th}>Fondo de cesantías</th>
                </tr>
              )}
              {tabPrincipal === 'periodo' && (
                <tr>
                  <th style={{ ...styles.th, width: '33%' }}>Año</th>
                  <th style={{ ...styles.th, width: '33%' }}>Total cesantías</th>
                  <th style={{ ...styles.th, width: '34%' }}>Total intereses cesantías</th>
                </tr>
              )}
            </thead>
            <tbody>
              {datosPagina.length === 0 ? (
                <tr><td colSpan={14} style={{ textAlign: 'center', padding: '20px', color: '#A3A3A3' }}>Sin resultados</td></tr>
              ) : datosPagina.map((r, index) => (
                <tr key={r.id} style={index % 2 === 0 ? styles.trPar : styles.trImpar}>
                  {tabPrincipal === 'cesantias' && <>
                    <td style={styles.td}>{String(index + 1 + pagina * porPagina).padStart(2, '0')}</td>
                    <td style={styles.td}>{r.nombres}</td>
                    <td style={styles.td}>{r.apellidos}</td>
                    <td style={styles.td}>{r.anio}</td>
                    <td style={styles.td}>{r.numIdentificacion}</td>
                    <td style={styles.td}>{r.fechaInicio}</td>
                    <td style={styles.td}>{r.fechaCorte}</td>
                    <td style={styles.td}>{r.diasLaborados}</td>
                    <td style={styles.td}>{fmt(r.salarioBase)}</td>
                    <td style={styles.td}>{fmt(r.auxilioTransporte)}</td>
                    <td style={styles.td}>{fmt(r.salarioBaseLiqui)}</td>
                    <td style={styles.td}>{fmt(r.cesantias)}</td>
                    <td style={styles.td}>{fmt(r.interesesCesantias)}</td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{r.fondoCesantias}</td>
                  </>}
                  {tabPrincipal === 'periodo' && <>
                    <td style={styles.td}>{r.anio}</td>
                    <td style={styles.td}>{fmt(r.totalCesantias)}</td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalIntereses)}</td>
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
  volverBtn:       { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0 },
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
  estadoTabsRow:   { display: 'flex', justifyContent: 'flex-end', gap: '4px', marginBottom: '16px' },
  estadoTab:       { background: 'none', border: '1px solid #D0D0D0', borderRadius: '20px', padding: '4px 16px', fontSize: '13px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  estadoTabActivo: { backgroundColor: '#0B662A', borderColor: '#0B662A', color: '#fff' },
  card:            { backgroundColor: '#fff', borderRadius: '16px', padding: '24px' },
  tableTitle:      { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tableWrapper:    { overflowX: 'auto', width: '100%' },
  table:           { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  th:              { fontSize: '12px', fontWeight: '700', color: '#A3A3A3', padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:              { fontSize: '13px', color: '#272525', padding: '12px 12px', textAlign: 'center', whiteSpace: 'nowrap' },
  trPar:           { backgroundColor: '#fff' },
  trImpar:         { backgroundColor: '#FAFAFA' },
  paginacion:      { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' },
  pageBtn:         { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif' },
  pageBtnActivo:   { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
};
