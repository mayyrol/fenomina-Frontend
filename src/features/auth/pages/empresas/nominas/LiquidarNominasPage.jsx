import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { FileText, Search, ChevronLeft, ChevronDown, Eye, FilePen } from 'lucide-react';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import MensajeModal from '../../../../../components/MensajeModal';
import { UserCircle } from 'lucide-react';

const MOCK_NOMINAS = [
  { id: 1,  nombres: 'Pepito',         apellidos: 'Perez',               fechaIngreso: '30/01/2023', documento: '10528967', valorNomina: '1.750.095', periodoLiq: '2025-06-15', estado: 'Cerrado' },
  { id: 2,  nombres: 'Carlos Andres',  apellidos: 'Rodriguez Ochoa',     fechaIngreso: '30/12/2023', documento: '10528967', valorNomina: '1.750.095', periodoLiq: '2025-06-15', estado: 'Cerrado' },
  { id: 3,  nombres: 'Alejandra Maria',apellidos: 'Anibal Leon',          fechaIngreso: '30/11/2022', documento: '10528967', valorNomina: '1.750.095', periodoLiq: '2025-06-15', estado: 'Cerrado' },
  { id: 4,  nombres: 'Carlos Alberto', apellidos: 'Domingo Rodriguez',    fechaIngreso: '30/01/2023', documento: '10528967', valorNomina: '1.750.095', periodoLiq: '2025-06-15', estado: 'Cerrado' },
  { id: 5,  nombres: 'Samuel',         apellidos: 'Martinez Ramos',       fechaIngreso: '30/01/2023', documento: '10528967', valorNomina: '1.750.095', periodoLiq: '2025-06-15', estado: 'Cerrado' },
  { id: 6,  nombres: 'Maria Alexandra',apellidos: 'Caicedo Jimenez',      fechaIngreso: '30/01/2023', documento: '10528967', valorNomina: '1.750.095', periodoLiq: '2025-06-15', estado: 'Cerrado' },
  { id: 7,  nombres: 'Ramiro',         apellidos: 'Martinez Rativa',      fechaIngreso: '30/01/2023', documento: '10528967', valorNomina: '1.750.095', periodoLiq: '2025-06-15', estado: 'Cerrado' },
  { id: 8,  nombres: 'Andres',         apellidos: 'Jimenez Ochoa',        fechaIngreso: '30/01/2023', documento: '10528967', valorNomina: '1.750.095', periodoLiq: '2025-06-15', estado: 'Cerrado' },
  { id: 9,  nombres: 'Carlos Andres',  apellidos: 'Rubio Giraldo',        fechaIngreso: '30/01/2023', documento: '10528967', valorNomina: '1.750.095', periodoLiq: '2025-06-15', estado: 'Cerrado' },
  { id: 10, nombres: 'Yeimy',          apellidos: 'Castañeda Rodriguez',  fechaIngreso: '30/01/2023', documento: '10528967', valorNomina: '1.750.095', periodoLiq: '2025-06-15', estado: 'Cerrado' },
  { id: 11, nombres: 'Ana Maria',      apellidos: 'Rodriguez Rodriguez',  fechaIngreso: '30/01/2023', documento: '10528967', valorNomina: '1.750.095', periodoLiq: '2025-06-15', estado: 'Cerrado' },
];

const TABS = ['Cerrado', 'Borrador'];
const PAGE_SIZE = 10;

const OPCIONES_POR_ESTADO = {
  'Cerrado':  ['Cerrado', 'Borrador'],
  'Borrador': ['Borrador', 'Cerrado'],
};

function EstadoSelect({ valor, onChange }) {
  const opciones = OPCIONES_POR_ESTADO[valor] ?? ['Cerrado'];
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: '1px solid #D0D0D0', borderRadius: '8px', padding: '6px 28px 6px 10px',
          fontSize: '12px', fontFamily: 'Nunito, sans-serif', outline: 'none',
          appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
          backgroundColor: '#fff', color: '#272525', cursor: 'pointer', backgroundImage: 'none',
        }}
      >
        {opciones.map((e) => <option key={e} value={e}>{e}</option>)}
      </select>
      <ChevronDown size={12} color="#A3A3A3" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    </div>
  );
}

export default function LiquidarNominasPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const inicial = usuario?.nombresUsuario?.charAt(0).toUpperCase() ?? 'U';
  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

  const [tab, setTab]             = useState('Cerrado');
  const [busqueda, setBusqueda]   = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [pagina, setPagina]       = useState(0);
  const [nominas, setNominas]     = useState(MOCK_NOMINAS);
  const [modal, setModal]         = useState(null);
  const [confirmarEstado, setConfirmarEstado] = useState(false);
  const [cambioEstado, setCambioEstado]       = useState({ nominaId: null, nuevoEstado: null });
  const [hoverReportes, setHoverReportes]     = useState(false);
  const [hoverLiquidar, setHoverLiquidar]     = useState(false);

  const nominasFiltradas = nominas.filter(n =>
    n.estado === tab &&
    (n.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
     n.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
     n.documento.includes(busqueda))
  );

  const totalPaginas  = Math.max(1, Math.ceil(nominasFiltradas.length / PAGE_SIZE));
  const nominasPagina = nominasFiltradas.slice(pagina * PAGE_SIZE, pagina * PAGE_SIZE + PAGE_SIZE);

  const handleEstadoChange = (nominaId, nuevoEstado) => {
    setCambioEstado({ nominaId, nuevoEstado });
    setConfirmarEstado(true);
  };

  const handleConfirmarEstado = () => {
    setNominas(nominas.map(n =>
      n.id === cambioEstado.nominaId ? { ...n, estado: cambioEstado.nuevoEstado } : n
    ));
    setConfirmarEstado(false);
    setModal('exito');
  };

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Nóminas</h2>
            <p style={styles.subtitulo}>Gestiona la liquidación de conceptos de nómina para cada uno de los empleados asociados a la empresa</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}>
            <UserCircle size={28} color="#555" />
          </div>
          <div>
            <p style={styles.perfilNombre}>{nombre}</p>
            <p style={styles.perfilCargo}>{cargo}</p>
          </div>
        </div>
      </div>

      {/* Volver */}
      <button style={styles.volverBtn} onClick={() => navigate(-1)}>
        <ChevronLeft size={16} color="#272525" />
        <span>Volver</span>
      </button>

      {/* Card 1 — Toolbar: total + buscador + fecha */}
      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>{nominas.length}</p>
          <p style={styles.totalLabel}>Total nóminas</p>
        </div>
        <div style={styles.filtrosBox}>
          <div style={styles.searchBox}>
            <Search size={14} color="#A3A3A3" />
            <input
              style={styles.searchInput}
              placeholder="Buscar nómina por palabra clave"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
            />
          </div>
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            style={styles.dateInput}
          />
        </div>
      </div>

      {/* Card 2 — Tabs + Botones */}
      <div style={styles.tabsBotonesCard}>
        <div style={styles.tabsBox}>
          {TABS.map((t) => (
            <button
              key={t}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActivo : {}) }}
              onClick={() => { setTab(t); setPagina(0); }}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={{
              ...styles.btnAccion,
              background: hoverReportes ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={() => setHoverReportes(true)}
            onMouseLeave={() => setHoverReportes(false)}
            onClick={() => navigate(`/empresas/${id}/nominas/reporte`)}
          >
            Ver reportes de liquidaciones
          </button>
          {tab === 'Cerrado' && (
          <button
            style={{
              ...styles.btnAccion,
              background: hoverLiquidar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={() => setHoverLiquidar(true)}
            onMouseLeave={() => setHoverLiquidar(false)}
            onClick={() => {}}
          >
            Ir a liquidar nóminas
          </button>
        )}
        </div>
      </div>

      {/* Card 3 — Tabla */}
      <div style={styles.card}>
        <p style={styles.tableTitle}>Todas las Liquidaciones de Nóminas (Histórico)</p>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Nombre(s)', 'Apellidos', 'Fecha de ingreso', 'Número de documento',
                  'Valor última nómina', 'Periodo de liq. de última nómina',
                  'Estado del proceso', 'Acciones'].map((col) => (
                  <th key={col} style={styles.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nominasPagina.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#A3A3A3' }}>Sin resultados</td></tr>
              ) : (
                nominasPagina.map((n, index) => (
                  <tr key={n.id} style={index % 2 === 0 ? styles.trPar : styles.trImpar}>
                    <td style={styles.td}>{n.nombres}</td>
                    <td style={styles.td}>{n.apellidos}</td>
                    <td style={styles.td}>{n.fechaIngreso}</td>
                    <td style={styles.td}>{n.documento}</td>
                    <td style={styles.td}>{n.valorNomina}</td>
                    <td style={styles.td}>{n.periodoLiq}</td>
                    <td style={styles.td}>
                      <EstadoSelect valor={n.estado} onChange={(v) => handleEstadoChange(n.id, v)} />
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
                        {tab === 'Borrador' && (
                          <button style={styles.btnVer} onClick={() => navigate(`/empresas/${id}/nominas/${n.id}/novedades`)}>
                            <FilePen size={16} color="#0B662A" />
                          </button>
                        )}
                        <button style={styles.btnVer} onClick={() => navigate(`/empresas/${id}/nominas/${n.id}`)}>
                          <Eye size={16} color="#0B662A" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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

      <ConfirmarCambiosModal
        visible={confirmarEstado}
        onCancelar={() => setConfirmarEstado(false)}
        onConfirmar={handleConfirmarEstado}
        titulo="¿Deseas cambiar el estado del proceso?"
        descripcion="Una vez confirmes, el estado del proceso será actualizado en los registros de información."
      />
      <MensajeModal tipo={modal} onClose={() => setModal(null)} />

    </div>
  );
}

const styles = {
  container:        { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' },
  header:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:           { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:        { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:        { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:           { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', color: '#272525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  perfilNombre:     { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:      { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  volverBtn:        { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0 },
  toolbarCard:      { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalNum:         { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:       { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  filtrosBox:       { display: 'flex', alignItems: 'center', gap: '12px' },
  searchBox:        { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '320px' },
  searchInput:      { border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  dateInput:        { border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', cursor: 'pointer', color: '#272525' },
  tabsBotonesCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tabsBox:          { display: 'flex' },
  tab:              { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px 20px', fontSize: '14px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  tabActivo:        { color: '#0B662A', borderBottom: '2px solid #0B662A' },
  btnAccion:        { color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  card:             { backgroundColor: '#fff', borderRadius: '16px', padding: '24px' },
  tableTitle:       { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tableWrapper:     { overflowX: 'auto', width: '100%' },
  table:            { width: '100%', borderCollapse: 'collapse', minWidth: '1000px' },
  th:               { fontSize: '12px', fontWeight: '700', color: '#A3A3A3', padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap'},
  td:               { fontSize: '13px', color: '#272525', padding: '12px 12px', textAlign: 'center', whiteSpace: 'nowrap' },
  trPar:            { backgroundColor: '#fff' },
  trImpar:          { backgroundColor: '#FAFAFA' },
  btnVer:           { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
  paginacion:       { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' },
  pageBtn:          { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif' },
  pageBtnActivo:    { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
};