import { useState } from 'react';
import empleadosService from '../../../../../services/empleadosService';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { useEmpleados } from '../../../hooks/useEmpleados';
import { Users, Search, Eye, ChevronLeft, UserRound } from 'lucide-react';
import EstadoDropdown from '../../../../../components/EstadoDropdown';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import MensajeModal from '../../../../../components/MensajeModal';


export default function EmpleadosEmpresaPage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const { usuario } = useAuthStore();
  const {
    empleados, total, cargando,
    pagina, setPagina,
    tab, setTab,
    recargar,
  } = useEmpleados(id);

  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

  const [modalEstado, setModalEstado]                   = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado]                   = useState(null);
  const [modal, setModal]                               = useState(null);
  const [hoverCrear, setHoverCrear]                     = useState(false);
  const [fechaFiltro, setFechaFiltro]                   = useState('');
  const [busquedaLocal, setBusquedaLocal]               = useState('');
  const [itemsPerPage, setItemsPerPage]                 = useState(10);

  const tabs = ['activos', 'inactivos', 'retirados'];

  const handleCambiarEstado = (empleado, estado) => {
    setEmpleadoSeleccionado(empleado);
    setNuevoEstado(estado);
    setModalEstado(true);
  };

  const soloLectura = usuario?.rolUsuario === 'CLIENTE_EMPRESA' || usuario?.rolUsuario === 'AUDITOR';

  const handleConfirmarEstado = async () => {
    try {
      await empleadosService.cambiarEstado(empleadoSeleccionado.empleadoId, nuevoEstado.toUpperCase());
      setModalEstado(false);
      setModal('exito');
      recargar();
    } catch (err) {
      setModalEstado(false);
      setModal('error');
      console.error(err.response?.data?.message ?? 'Error al cambiar estado');
    }
  };

  // ── Filtro local por fecha Y por todas las columnas ──
  const empleadosFiltrados = empleados.filter((emp) => {
    if (fechaFiltro) {
      if (!emp.fechaIngresoEmp) return false;
      const fechaEmp = emp.fechaIngresoEmp.includes('-')
        ? emp.fechaIngresoEmp.slice(0, 10)
        : emp.fechaIngresoEmp.split('/').reverse().join('-');
      if (fechaEmp !== fechaFiltro) return false;
    }
    if (busquedaLocal.trim()) {
      const texto = busquedaLocal.toLowerCase();
      return (
        emp.nombresEmp?.toLowerCase().includes(texto) ||
        emp.apellidosEmp?.toLowerCase().includes(texto) ||
        emp.documentoEmp?.toLowerCase().includes(texto) ||
        emp.nombreEps?.toLowerCase().includes(texto) ||
        emp.fondoPensionEmp?.toLowerCase().includes(texto) ||
        emp.nombreArl?.toLowerCase().includes(texto) ||
        emp.cajaCompensacion?.toLowerCase().includes(texto) ||
        emp.salarioBascMensual?.toString().includes(texto) ||
        emp.fechaIngresoEmp?.includes(texto) ||
        (emp.tieneAuxTransporte ? 'si' : 'no').includes(texto)
      );
    }
    return true;
  });

  // ── Paginación sobre resultados filtrados ──
  const totalFiltrados        = empleadosFiltrados.length;
  const totalPaginasFiltradas = Math.max(1, Math.ceil(totalFiltrados / itemsPerPage));
  const inicioLocal           = pagina * itemsPerPage;
  const empleadosPagina       = empleadosFiltrados.slice(inicioLocal, inicioLocal + itemsPerPage);

  // ── Generar botones de paginación con ellipsis ──
  const generarPaginas = () => {
    const paginas = [];
    if (totalPaginasFiltradas <= 6) {
      for (let i = 0; i < totalPaginasFiltradas; i++) paginas.push(i);
    } else {
      paginas.push(0);
      if (pagina > 2) paginas.push('...');
      for (let i = Math.max(1, pagina - 1); i <= Math.min(totalPaginasFiltradas - 2, pagina + 1); i++) {
        paginas.push(i);
      }
      if (pagina < totalPaginasFiltradas - 3) paginas.push('...');
      paginas.push(totalPaginasFiltradas - 1);
    }
    return paginas;
  };

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Empleados</h2>
            <p style={styles.subtitulo}>Gestiona la información de los empleados asociados a cada empresa</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}>
            <UserRound size={22} color="#A3A3A3" />
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

      {/* Toolbar */}
      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>{total}</p>
          <p style={styles.totalLabel}>Total empleados</p>
        </div>
        <div style={styles.filtrosBox}>
          <div style={styles.searchBox}>
            <Search size={14} color="#A3A3A3" />
            <input
              style={styles.searchInput}
              placeholder="Buscar empleado por palabra clave"
              value={busquedaLocal}
              onChange={(e) => { setBusquedaLocal(e.target.value); setPagina(0); }}
            />
          </div>
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => { setFechaFiltro(e.target.value); setPagina(0); }}
            style={styles.dateInput}
          />
        </div>
      </div>

      {usuario?.rolUsuario !== 'CLIENTE_EMPRESA' && usuario?.rolUsuario !== 'AUDITOR' && (
        <div style={styles.addBar}>
          <span style={styles.addLabel}>Añadir nuevo empleado</span>
          <button
            style={{
              ...styles.btnCrear,
              background: hoverCrear ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={() => setHoverCrear(true)}
            onMouseLeave={() => setHoverCrear(false)}
            onClick={() => navigate(`/empresas/${id}/empleados/crear`)}
          >
            Crear empleado
          </button>
        </div>
      )}

      {/* Tabs + Resultados por página */}
      <div style={styles.tabsBox}>
        <div style={{ display: 'flex', gap: '0' }}>
          {tabs.map((t) => (
            <button
              key={t}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActivo : {}) }}
              onClick={() => { setTab(t); setPagina(0); }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div style={styles.porPaginaBox}>
          <span style={styles.porPaginaLabel}>Resultados por página:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPagina(0); }}
            style={styles.porPaginaSelect}
          >
            {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div style={styles.card}>
        <p style={styles.tableTitle}>Todos los Empleados</p>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Nombre(s)', 'Apellidos', 'Fecha de ingreso', 'Número de documento',
                  'Salario mensual', 'Aux. de transporte', 'EPS', 'Fondo de pensión',
                  'ARL', 'Caja de compensación', ...(!soloLectura ? ['Estado'] : []), 'Acciones'].map((col) => (
                  <th key={col} style={styles.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={soloLectura ? 12 : 13} style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
              ) : empleados.length === 0 ? (
                <tr><td colSpan={soloLectura ? 12 : 13} style={{ textAlign: 'center', padding: '20px', color: '#A3A3A3' }}>Sin resultados</td></tr>
              ) : (
                empleadosPagina.map((emp, index) => (
                  <tr key={emp.empleadoId} style={index % 2 === 0 ? styles.trPar : styles.trImpar}>
                    <td style={styles.td}>{String(inicioLocal + index + 1).padStart(2, '0')}</td>
                    <td style={styles.td}>{emp.nombresEmp}</td>
                    <td style={styles.td}>{emp.apellidosEmp}</td>
                    <td style={styles.td}>{emp.fechaIngresoEmp}</td>
                    <td style={styles.td}>{emp.documentoEmp}</td>
                    <td style={styles.td}>{emp.salarioBascMensual}</td>
                    <td style={styles.td}>{emp.tieneAuxTransporte ? 'SI' : 'NO'}</td>
                    <td style={styles.td}>{emp.nombreEps}</td>
                    <td style={styles.td}>{emp.fondoPensionEmp}</td>
                    <td style={styles.td}>{emp.nombreArl}</td>
                    <td style={styles.td}>{emp.cajaCompensacion}</td>

                    {!soloLectura && (
                      <td style={styles.td}>
                        <EstadoDropdown
                          estadoActual={emp.estadoEmp}
                          onCambiar={(nuevoE) => handleCambiarEstado(emp, nuevoE)}
                        />
                      </td>
                    )}

                    <td style={styles.td}>
                      <button style={styles.btnVer} onClick={() => navigate(`/empresas/${id}/empleados/${emp.empleadoId}`)}>
                        <Eye size={16} color="#0B662A" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación numerada */}
        <div style={styles.paginacion}>
          {generarPaginas().map((p, i) =>
            p === '...'
              ? <span key={`e-${i}`} style={styles.ellipsis}>...</span>
              : <button
                  key={p}
                  onClick={() => setPagina(p)}
                  style={{ ...styles.pageBtn, ...(pagina === p ? styles.pageBtnActivo : {}) }}
                >
                  {p + 1}
                </button>
          )}
          <button
            onClick={() => setPagina(p => Math.min(totalPaginasFiltradas - 1, p + 1))}
            disabled={pagina >= totalPaginasFiltradas - 1}
            style={{ ...styles.pageBtn, opacity: pagina >= totalPaginasFiltradas - 1 ? 0.4 : 1 }}
          >{'>>'}</button>
        </div>
      </div>

      <ConfirmarCambiosModal
        visible={modalEstado}
        onCancelar={() => setModalEstado(false)}
        onConfirmar={handleConfirmarEstado}
        titulo="¿Deseas cambiar el estado del empleado?"
        descripcion="Una vez confirmes, el estado del empleado será actualizado en los registros de información."
      />

      <MensajeModal tipo={modal} onClose={() => setModal(null)} />

    </div>
  );
}

const styles = {
  container:     { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box', minWidth: 0 },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  titulo:        { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:     { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:     { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:        { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', color: '#272525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  perfilNombre:  { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:   { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  volverBtn:     { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0, width: 'fit-content' },
  totalNum:      { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:    { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  toolbarCard:   { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxSizing: 'border-box' },
  filtrosBox:    { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  searchBox:     { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '320px', minWidth: '180px' },
  searchInput:   { border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  dateInput:     { border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', cursor: 'pointer', color: '#272525' },
  addBar:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px', flexWrap: 'wrap', gap: '12px', boxSizing: 'border-box' },
  addLabel:      { fontSize: '15px', fontWeight: '700', color: '#272525' },
  btnCrear:      { color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },

  // ── Tabs + resultados por página ──
  tabsBox:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E8E8', flexWrap: 'wrap', gap: '8px' },
  tab:           { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '14px 20px', fontSize: '14px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  tabActivo:     { color: '#0B662A', borderBottom: '2px solid #0B662A' },
  porPaginaBox:  { display: 'flex', alignItems: 'center', gap: '8px' },
  porPaginaLabel:{ fontSize: '13px', color: '#A3A3A3', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' },
  porPaginaSelect: { padding: '6px 28px 6px 10px', border: '1px solid #D0D0D0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23272525\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundColor: '#fff' },

  card:          { backgroundColor: '#fff', borderRadius: '16px', padding: '24px 24px', width: '100%', boxSizing: 'border-box', overflow: 'hidden' },
  tableTitle:    { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tableWrapper:  { overflowX: 'auto', width: '100%' },
  table:         { width: '100%', borderCollapse: 'collapse', minWidth: '1200px' },
  th:            { fontSize: '12px', fontWeight: '700', color: '#A3A3A3', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:            { fontSize: '13px', color: '#272525', padding: '12px 12px', textAlign: 'left', whiteSpace: 'nowrap' },
  trPar:         { backgroundColor: '#fff' },
  trImpar:       { backgroundColor: '#FAFAFA' },
  btnVer:        { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
  paginacion:    { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px', flexWrap: 'wrap' },
  pageBtn:       { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  pageBtnActivo: { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
  ellipsis:      { fontSize: '13px', color: '#A3A3A3', padding: '0 4px', lineHeight: '36px' },
};
