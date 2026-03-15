import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../store/authStore';
import { useEmpleados } from '../../hooks/useEmpleados';
import { Users, Search, Eye, ChevronLeft } from 'lucide-react';
import EstadoDropdown from '../../../../components/EstadoDropdown';
import ConfirmarCambiosModal from '../../../../components/ConfirmarCambiosModal';

export default function EmpleadosPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();
  const {
    empleados, total, totalPaginas, cargando,
    pagina, setPagina,
    busqueda, setBusqueda,
    tab, setTab,
  } = useEmpleados();

  const inicial = usuario?.nombresUsuario?.charAt(0).toUpperCase() ?? 'U';
  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

  const [modalEstado, setModalEstado]               = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado]               = useState(null);

  const tabs = ['activos', 'inactivos', 'retirados'];

  const handleCambiarEstado = (empleado, estado) => {
    setEmpleadoSeleccionado(empleado);
    setNuevoEstado(estado);
    setModalEstado(true);
  };

  const handleConfirmarEstado = () => {
    setModalEstado(false);
    console.log(`Cambiar empleado ${empleadoSeleccionado?.id} a ${nuevoEstado}`);
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
          <div style={styles.avatar}>{inicial}</div>
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
      <div style={styles.toolbar}>
        <div>
          <p style={styles.totalNum}>{total}</p>
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

      {/* Añadir nuevo empleado */}
      <div style={styles.addBar}>
        <span style={styles.addLabel}>Añadir nuevo empleado</span>
        <button style={styles.btnCrear} onClick={() => navigate(`/empresas/${id}/empleados/crear`)}>
          Crear empleado
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabsBox}>
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

      {/* Tabla */}
      <div style={styles.card}>
        <p style={styles.tableTitle}>Todos los Empleados</p>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Nombre(s)', 'Apellidos', 'Fecha de ingreso', 'Número de documento',
                  'Salario mensual', 'Aux. de transporte', 'EPS', 'Fondo de pensión',
                  'ARL', 'Caja de compensación', 'Estado', 'Acciones'].map((col) => (
                  <th key={col} style={styles.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={13} style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
              ) : empleados.length === 0 ? (
                <tr><td colSpan={13} style={{ textAlign: 'center', padding: '20px', color: '#A3A3A3' }}>Sin resultados</td></tr>
              ) : (
                empleados.map((emp, index) => (
                  <tr key={emp.id} style={index % 2 === 0 ? styles.trPar : styles.trImpar}>
                    <td style={styles.td}>{String(pagina * 10 + index + 1).padStart(2, '0')}</td>
                    <td style={styles.td}>{emp.nombres}</td>
                    <td style={styles.td}>{emp.apellidos}</td>
                    <td style={styles.td}>{emp.fechaIngreso}</td>
                    <td style={styles.td}>{emp.documento}</td>
                    <td style={styles.td}>{emp.salario}</td>
                    <td style={styles.td}>{emp.auxTransporte}</td>
                    <td style={styles.td}>{emp.eps}</td>
                    <td style={styles.td}>{emp.pension}</td>
                    <td style={styles.td}>{emp.arl}</td>
                    <td style={styles.td}>{emp.caja}</td>
                    <td style={styles.td}>
                      <EstadoDropdown
                        estadoActual={emp.estado}
                        onCambiar={(nuevoE) => handleCambiarEstado(emp, nuevoE)}
                      />
                    </td>
                    <td style={styles.td}>
                      <button style={styles.btnVer} onClick={() => navigate(`/empresas/${id}/empleados/${emp.id}`)}>
                        <Eye size={16} color="#0B662A" />
                      </button>
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

      {/* Modal cambio de estado */}
      <ConfirmarCambiosModal
        visible={modalEstado}
        onCancelar={() => setModalEstado(false)}
        onConfirmar={handleConfirmarEstado}
        titulo="¿Deseas cambiar el estado del empleado?"
        descripcion="Una vez confirmes, el estado del empleado será actualizado en los registros de información."
      />

    </div>
  );
}

const styles = {
  container:     { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:        { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:     { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:     { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:        { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', color: '#272525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  perfilNombre:  { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:   { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  volverBtn:     { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0 },
  toolbar:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  totalNum:      { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:    { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  searchBox:     { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '280px' },
  searchInput:   { border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  addBar:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px' },
  addLabel:      { fontSize: '15px', fontWeight: '700', color: '#272525' },
  btnCrear:      { backgroundColor: '#0B662A', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  tabsBox:       { display: 'flex', gap: '0', borderBottom: '1px solid #E8E8E8' },
  tab:           { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px 20px', fontSize: '14px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  tabActivo:     { color: '#0B662A', borderBottom: '2px solid #0B662A' },
  card:          { backgroundColor: '#fff', borderRadius: '16px', padding: '24px 24px' },
  tableTitle:    { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tableWrapper:  { overflowX: 'auto', width: '100%' },
  table:         { width: '100%', borderCollapse: 'collapse', minWidth: '1200px' },
  th:            { fontSize: '12px', fontWeight: '700', color: '#A3A3A3', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:            { fontSize: '13px', color: '#272525', padding: '12px 12px', textAlign: 'left', whiteSpace: 'nowrap' },
  trPar:         { backgroundColor: '#fff' },
  trImpar:       { backgroundColor: '#FAFAFA' },
  btnVer:        { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
  paginacion:    { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' },
  pageBtn:       { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif' },
  pageBtnActivo: { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
};