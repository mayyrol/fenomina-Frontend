import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useState, useRef, useEffect } from 'react';
import { useAccionesUsuario } from '../../hooks/useAccionesUsuario';
import logoFE from '../../../../assets/logo_fe.png';

export default function UsuariosPage() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [tabActiva, setTabActiva] = useState('activos');
  const [dropdownAbierto, setDropdownAbierto] = useState(null);
  const { ejecutar, cargando: cargandoAccion } = useAccionesUsuario(() => {
    window.location.reload();
  });

  const { usuarios, cargando, error } = useUsuarios();

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideBusqueda =
      u.nombresUsuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellidosUsuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.userName.toLowerCase().includes(busqueda.toLowerCase());

    const coincideTab =
      tabActiva === 'activos' ? u.estadoUsuario === true : u.estadoUsuario === false;

    return coincideBusqueda && coincideTab;
  });

  const getEstadoEstilo = (usuario) => {
    if (usuario.bloqueadoLogin)
      return { label: 'Bloqueado', color: '#b45309', bg: '#fef3c7' };
    if (usuario.estadoUsuario === true)
      return { label: 'Activo', color: '#0B662A', bg: '#e6f4ec' };
    return { label: 'Inactivo', color: '#e53e3e', bg: '#fde8e8' };
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (cargando) return <div style={styles.mensaje}>Cargando usuarios...</div>;
  if (error) return <div style={styles.mensajeError}>Error al cargar usuarios.</div>;

  return (
    <div style={styles.container}>
      {/**/}
      <div style={styles.encabezado}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logoFE} alt="" style={{ width: '28px', height: '28px' }} />
            <h1 style={styles.titulo}>Usuarios</h1>
          </div>
          <p style={styles.subtitulo}>Gestiona los usuarios del sistema</p>
        </div>
        <div style={styles.headerDerecha}>
          <div style={styles.userInfo}>
            {/**/}
          </div>
        </div>
      </div>

      {/* */}
      <div style={styles.barraAcciones}>
        <div>
          <span style={styles.totalLabel}>{usuariosFiltrados.length}</span>
          <p style={styles.totalSub}>Total usuarios</p>
        </div>
        <div style={styles.searchWrapper}>
          <Search size={16} color="#A3A3A3" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Enter a search word"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/**/}
      <div style={styles.filaBotones}>
        <p style={styles.creaLabel}>Crea un nuevo usuario</p>
        <button
          onClick={() => navigate('/usuarios/crear')}
          style={styles.btnCrear}
        >
          Crear usuario
        </button>
      </div>

      {/* */}
      <div style={styles.tabs}>
        <button
          onClick={() => setTabActiva('activos')}
          style={{
            ...styles.tab,
            borderBottom: tabActiva === 'activos' ? '2px solid #0B662A' : '2px solid transparent',
            color: tabActiva === 'activos' ? '#0B662A' : '#A3A3A3',
            fontWeight: tabActiva === 'activos' ? '700' : '400',
          }}
        >
          Activos
        </button>
        <button
          onClick={() => setTabActiva('inactivos')}
          style={{
            ...styles.tab,
            borderBottom: tabActiva === 'inactivos' ? '2px solid #0B662A' : '2px solid transparent',
            color: tabActiva === 'inactivos' ? '#0B662A' : '#A3A3A3',
            fontWeight: tabActiva === 'inactivos' ? '700' : '400',
          }}
        >
          Inactivos
        </button>
      </div>

      {/* */}
      <div style={styles.tablaWrapper}>
        <h2 style={styles.tablaTitulo}>Todos los Usuarios</h2>
        <table style={styles.tabla}>
          <thead>
            <tr>
              {['#', 'Nombre(s)', 'Apellidos', 'Cargo', 'N° Documento', 'Usuario', 'Fecha registro', 'Estado'].map((col) => (
                <th key={col} style={styles.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} style={styles.sinResultados}>
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u, index) => {
                const estado = getEstadoEstilo(u);
                return (
                  <tr key={u.usuarioId} style={styles.tr}>
                    <td style={styles.td}>{String(index + 1).padStart(2, '0')}</td>
                    <td style={styles.td}>{u.nombresUsuario}</td>
                    <td style={styles.td}>{u.apellidosUsuario}</td>
                    <td style={styles.td}>{u.cargoUsuario}</td>
                    <td style={styles.td}>{u.numIdentiUsuario}</td>
                    <td style={styles.td}>{u.userName}</td>
                    <td style={styles.td}>{formatearFecha(u.createdAt)}</td>
                    <td style={styles.td}>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setDropdownAbierto(dropdownAbierto === u.usuarioId ? null : u.usuarioId)}
                          style={{
                            ...styles.estadoBadge,
                            color: getEstadoEstilo(u).color,
                            backgroundColor: getEstadoEstilo(u).bg,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {getEstadoEstilo(u).label}
                          <ChevronDown size={14} />
                        </button>

                        {dropdownAbierto === u.usuarioId && (
                          <div style={styles.dropdown}>
                            {u.estadoUsuario === false && !u.bloqueadoLogin && (
                              <button
                                style={styles.dropdownItem}
                                onClick={() => { ejecutar('activar', u.usuarioId); setDropdownAbierto(null); }}
                              >
                                Activar
                              </button>
                            )}
                            {u.estadoUsuario === true && !u.bloqueadoLogin && (
                              <button
                                style={styles.dropdownItem}
                                onClick={() => { ejecutar('inactivar', u.usuarioId); setDropdownAbierto(null); }}
                              >
                                Inactivar
                              </button>
                            )}
                            {u.bloqueadoLogin && (
                              <button
                                style={styles.dropdownItem}
                                onClick={() => { ejecutar('desbloquear-login', u.usuarioId); setDropdownAbierto(null); }}
                              >
                                Desbloquear login
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Paginación */}
      <div style={styles.paginacion}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} style={{ ...styles.pageBtn, ...(n === 1 ? styles.pageBtnActivo : {}) }}>
            {n}
          </button>
        ))}
        <button style={styles.pageBtn}>{'>>'}</button>
      </div>
    </div>
  );
}


const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '16px' },
  mensaje: { textAlign: 'center', padding: '40px', color: '#A3A3A3' },
  mensajeError: { textAlign: 'center', padding: '40px', color: '#e53e3e' },
  encabezado: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  titulo: { fontSize: '20px', fontWeight: '800', color: '#272525' },
  subtitulo: { fontSize: '12px', color: '#A3A3A3', marginTop: '2px' },
  headerDerecha: { display: 'flex', alignItems: 'center' },
  barraAcciones: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  totalLabel: { fontSize: '28px', fontWeight: '800', color: '#272525' },
  totalSub: { fontSize: '12px', color: '#A3A3A3' },
  searchWrapper: {
    position: 'relative', display: 'flex', alignItems: 'center',
    width: '420px',
  },
  searchIcon: { position: 'absolute', left: '12px' },
  searchInput: {
    width: '100%', padding: '9px 12px 9px 36px',
    border: '1px solid #D0D0D0', borderRadius: '6px',
    fontSize: '13px', color: '#272525', outline: 'none',
    fontFamily: 'Nunito, sans-serif',
    transition: 'border-color 0.3s ease',
  },
  filaBotones: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#ffffff', padding: '14px 20px', borderRadius: '8px',
    border: '1px solid #D0D0D0',
  },
  creaLabel: { fontSize: '14px', fontWeight: '600', color: '#272525' },
  btnCrear: {
    backgroundColor: '#0B662A', color: '#ffffff', border: 'none',
    borderRadius: '6px', padding: '9px 18px', fontSize: '13px',
    fontWeight: '700', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
  },
  tabs: { display: 'flex', gap: '24px', borderBottom: '1px solid #D0D0D0' },
  tab: {
    background: 'none', border: 'none', padding: '8px 0',
    fontSize: '13px', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
  },
  tablaWrapper: {
    backgroundColor: '#ffffff', borderRadius: '8px',
    border: '1px solid #D0D0D0', overflow: 'hidden',
  },
  tablaTitulo: {
    fontSize: '14px', fontWeight: '700', color: '#272525',
    padding: '16px 20px', borderBottom: '1px solid #D0D0D0',
  },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '12px 16px', fontSize: '12px',
    fontWeight: '700', color: '#A3A3A3', borderBottom: '1px solid #D0D0D0',
  },
  td: {
    padding: '12px 16px', fontSize: '13px', color: '#272525',
    borderBottom: '1px solid #f0f0f0',
  },
  tr: { transition: 'background-color 0.15s' },
  sinResultados: {
    textAlign: 'center', padding: '32px', color: '#A3A3A3', fontSize: '13px',
  },
  estadoBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'transparent',   
    border: '1px solid currentColor', 
  },

  dropdown: {
  position: 'absolute',
  top: '100%',
  left: 0,
  backgroundColor: '#ffffff',
  border: '1px solid #D0D0D0',
  borderRadius: '6px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  zIndex: 100,
  minWidth: '160px',
  overflow: 'hidden',
},
dropdownItem: {
  display: 'block',
  width: '100%',
  padding: '10px 14px',
  background: 'none',
  border: 'none',
  textAlign: 'left',
  fontSize: '13px',
  fontFamily: 'Nunito, sans-serif',
  color: '#272525',
  cursor: 'pointer',
},
paginacion: {
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  gap: '6px', paddingTop: '8px',
},
pageBtn: {
  width: '34px', height: '34px', borderRadius: '6px',
  border: '1px solid #D0D0D0', background: '#ffffff',
  fontSize: '13px', fontWeight: '600', color: '#272525',
  cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
},
pageBtnActivo: {
  backgroundColor: '#0B662A', color: '#ffffff', border: '1px solid #0B662A',
},

};