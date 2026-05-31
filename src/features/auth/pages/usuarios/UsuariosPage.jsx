import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../store/authStore';
import { Search, ChevronDown, UserRound, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAccionesUsuario } from '../../hooks/useAccionesUsuario';
import { useEmpresasLista } from '../../hooks/useEmpresasLista';

function Modal({ tipo, mensaje, onAceptar, onCancelar }) {
  const esConfirmacion = tipo === 'confirmacion';
  const esExito = tipo === 'exito';
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        <div style={{
          ...styles.modalIconCircle,
          backgroundColor: esExito || esConfirmacion ? '#e6f4ec' : '#fef3c7',
        }}>
          {esExito || esConfirmacion
            ? <CheckCircle2 size={36} color="#0B662A" strokeWidth={1.5} />
            : <AlertTriangle size={36} color="#b45309" strokeWidth={1.5} />
          }
        </div>
        <h3 style={styles.modalTitulo}>
          {esExito ? '¡Perfecto!' : esConfirmacion ? '¿Deseas cambiar el estado del usuario?' : '¡Ups!'}
        </h3>
        <p style={styles.modalMensaje}>{mensaje}</p>
        <div style={styles.modalBotones}>
          {esConfirmacion && (
            <button onClick={onCancelar} style={styles.btnCancelar}>Cancelar</button>
          )}
          <button onClick={onAceptar} style={styles.btnConfirmar}>{esConfirmacion ? 'Confirmar' : 'Ok'}</button>
        </div>
      </div>
    </div>
  );
}

export default function UsuariosPage() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [fechaBusqueda, setFechaBusqueda] = useState('');
  const LABEL_ROL = {
    SUPER_ADMIN: 'Super Admin', RRHH: 'Recursos Humanos',
    AUDITOR: 'Auditor', CLIENTE_EMPRESA: 'Cliente Empresa',
  };
  const [tabActiva, setTabActiva] = useState('activos');
  const [dropdownAbierto, setDropdownAbierto] = useState(null);
  const [modal, setModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoverCrear, setHoverCrear] = useState(false);
  const dropdownRef = useRef(null);

  const { ejecutar } = useAccionesUsuario(
    () => { setModal({ tipo: 'exito', mensaje: 'El estado del usuario ha sido actualizado exitosamente.' }); },
    () => setModal({ tipo: 'error', mensaje: 'No se pudo cambiar el estado. Intenta de nuevo.' })
  );

  const { usuarios, cargando, error, recargar } = useUsuarios();
  const { usuario } = useAuthStore();
  const { empresas } = useEmpresasLista();

  const mapaEmpresas = useMemo(() => {
    const mapa = {};
    empresas.forEach(e => { mapa[e.empresaId] = e.nombreEmpresa; });
    return mapa;
  }, [empresas]);

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAbierto(null);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    const textoBusqueda = busqueda.toLowerCase();

    const coincideBusqueda =
      u.nombresUsuario?.toLowerCase().includes(textoBusqueda) ||
      u.apellidosUsuario?.toLowerCase().includes(textoBusqueda) ||
      u.userName?.toLowerCase().includes(textoBusqueda) ||
      u.numIdentiUsuario?.toLowerCase().includes(textoBusqueda) ||
      (LABEL_ROL[u.rolUsuario] || '').toLowerCase().includes(textoBusqueda) ||
      u.rolUsuario?.toLowerCase().includes(textoBusqueda) ||
      u.cargoUsuario?.toLowerCase().includes(textoBusqueda) ||
      (u.fkIdEmpresa ? (mapaEmpresas[u.fkIdEmpresa] ?? '').toLowerCase().includes(textoBusqueda) : false);

    const coincideFecha = fechaBusqueda
      ? (() => {
          if (!u.createdAt) return false;
          const fecha = new Date(u.createdAt);
          const [anio, mes, dia] = fechaBusqueda.split('-');
          return (
            fecha.getFullYear() === Number(anio) &&
            fecha.getMonth() + 1 === Number(mes) &&
            fecha.getDate() === Number(dia)
          );
        })()
      : true;

    let coincideTab;
    if (tabActiva === 'activos') {
      coincideTab = u.estadoUsuario === true && u.bloqueadoLogin === false;
    } else if (tabActiva === 'inactivos') {
      coincideTab = u.estadoUsuario === false && u.bloqueadoLogin === false;
    } else if (tabActiva === 'bloqueados') {
      coincideTab = u.bloqueadoLogin === true;
    }

    return coincideBusqueda && coincideFecha && coincideTab;
  });

  const totalPages = Math.max(1, Math.ceil(usuariosFiltrados.length / itemsPerPage));
  const inicio = currentPage * itemsPerPage;
  const usuariosPagina = usuariosFiltrados.slice(inicio, inicio + itemsPerPage);

  const getEstadoEstilo = (u) => {
    if (u.estadoUsuario === true) return { label: 'Activo', color: '#0B662A' };
    return { label: 'Inactivo', color: '#e53e3e' };
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const solicitarAccion = (accion, id) => {
    setDropdownAbierto(null);
    const mensajes = {
      activar: 'Una vez confirmes, el usuario quedará habilitado nuevamente.',
      inactivar: 'Una vez confirmes, el usuario quedará inhabilitado.',
      'desbloquear-login': 'Una vez confirmes, el usuario podrá volver a intentar iniciar sesión.',
    };
    setModal({ tipo: 'confirmacion', mensaje: mensajes[accion], accion, id });
  };

  const confirmarAccion = () => { ejecutar(modal.accion, modal.id); setModal(null); };
  const cerrarModal = () => { if (modal?.tipo === 'exito') recargar(); setModal(null); };

  // ── Generar botones de paginación con ellipsis ──
  const generarPaginas = () => {
    const paginas = [];
    if (totalPages <= 6) {
      for (let i = 0; i < totalPages; i++) paginas.push(i);
    } else {
      paginas.push(0);
      if (currentPage > 2) paginas.push('...');
      for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
        paginas.push(i);
      }
      if (currentPage < totalPages - 3) paginas.push('...');
      paginas.push(totalPages - 1);
    }
    return paginas;
  };

  if (cargando) return <div style={styles.mensaje}>Cargando usuarios...</div>;
  if (error) return <div style={styles.mensajeError}>Error al cargar usuarios.</div>;

  return (
    <div style={styles.container} ref={dropdownRef}>
      {modal && <Modal tipo={modal.tipo} mensaje={modal.mensaje} onAceptar={modal.tipo === 'confirmacion' ? confirmarAccion : cerrarModal} onCancelar={cerrarModal} />}

      {/* Encabezado */}
      <div style={styles.encabezado}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserRound size={22} color="#0B662A" />
          <div>
            <h1 style={styles.titulo}>Usuarios</h1>
            <p style={styles.subtitulo}>Gestiona los usuarios del sistema</p>
          </div>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            <UserRound size={20} color="#A3A3A3" />
          </div>
          <div>
            <p style={styles.userName}>{usuario?.nombresUsuario} {usuario?.apellidosUsuario}</p>
            <p style={styles.userCargo}>{usuario?.cargoUsuario}</p>
          </div>
        </div>
      </div>

      {/* Total + búsqueda */}
      <div style={styles.panelSuperior}>
        <div style={styles.barraAcciones}>
          <div style={{ flexShrink: 0 }}>
            <span style={styles.totalLabel}>{usuariosFiltrados.length}</span>
            <p style={styles.totalSub}>Total usuarios</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={styles.searchWrapper}>
              <Search size={16} color="#A3A3A3" style={styles.searchIcon} />
              <input type="text" placeholder="Buscar usuario por palabra clave"
                value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(0); }}
                style={styles.searchInput} />
            </div>
            <input type="date" value={fechaBusqueda}
              onChange={(e) => { setFechaBusqueda(e.target.value); setCurrentPage(0); }}
              style={styles.inputFecha} />
          </div>
        </div>
      </div>

      {/* Crear usuario */}
      <div style={styles.filaBotones}>
        <p style={styles.creaLabel}>Crea un nuevo usuario</p>
        <button
          onClick={() => navigate('/usuarios/crear')}
          onMouseEnter={() => setHoverCrear(true)}
          onMouseLeave={() => setHoverCrear(false)}
          style={{
            ...styles.btnCrear,
            background: hoverCrear ? 'linear-gradient(135deg, #0B662A 0%, #20B445 100%)' : '#0B662A',
          }}
        >
          Crear usuario
        </button>
      </div>

      {/* Tabs + Resultados por página */}
      <div style={styles.tabs}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {['activos', 'inactivos', 'bloqueados'].map((tab) => (
            <button key={tab} onClick={() => { setTabActiva(tab); setCurrentPage(0); }}
              style={{
                ...styles.tab,
                borderBottom: tabActiva === tab ? '2px solid #0B662A' : '2px solid transparent',
                color: tabActiva === tab ? '#0B662A' : '#A3A3A3',
                fontWeight: tabActiva === tab ? '700' : '400',
              }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div style={styles.porPaginaBox}>
          <span style={styles.porPaginaLabel}>Resultados por página:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(0); }}
            style={styles.porPaginaSelect}
          >
            {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div style={styles.tablaWrapper}>

        {/* ── Título de la tabla ── */}
        <div style={styles.tablaHeader}>
          <h2 style={styles.tablaTitulo}>Todos los Usuarios</h2>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                {tabActiva === 'bloqueados' ? (
                  ['#', 'Nombre(s)', 'Apellidos', 'Cargo', 'N° Documento', 'Usuario', 'Rol', 'Empresa', 'Fecha registro', 'Estado', 'Acceso login', 'Acciones'].map((col) => (
                    <th key={col} style={{ ...styles.th, textAlign: col === 'Acciones' ? 'center' : 'left' }}>{col}</th>
                  ))
                ) : (
                  ['#', 'Nombre(s)', 'Apellidos', 'Cargo', 'N° Documento', 'Usuario', 'Rol', 'Empresa', 'Fecha registro', 'Estado', 'Acciones'].map((col) => (
                    <th key={col} style={{ ...styles.th, textAlign: col === 'Acciones' ? 'center' : 'left' }}>{col}</th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {usuariosPagina.length === 0 ? (
                <tr><td colSpan={tabActiva === 'bloqueados' ? 12 : 11} style={styles.sinResultados}>No se encontraron usuarios.</td></tr>
              ) : (
                usuariosPagina.map((u, index) => (
                  <tr key={u.usuarioId} style={index % 2 === 0 ? styles.trPar : styles.trImpar}>
                    <td style={styles.td}>{String(inicio + index + 1).padStart(2, '0')}</td>
                    <td style={styles.td}>{u.nombresUsuario}</td>
                    <td style={styles.td}>{u.apellidosUsuario}</td>
                    <td style={styles.td}>{u.cargoUsuario}</td>
                    <td style={styles.td}>{u.numIdentiUsuario}</td>
                    <td style={styles.td}>{u.userName}</td>
                    <td style={styles.td}>{u.rolUsuario || '—'}</td>
                    <td style={styles.td}>{u.fkIdEmpresa ? (mapaEmpresas[u.fkIdEmpresa] ?? `Empresa ID: ${u.fkIdEmpresa}`) : 'Todas'}</td>
                    <td style={styles.td}>{formatearFecha(u.createdAt)}</td>

                    {/* COLUMNA ESTADO */}
                    <td style={{ ...styles.td, position: 'relative', padding: '12px 16px' }}>
                      {tabActiva === 'bloqueados' ? (
                        <div style={{ ...styles.estadoBadge, color: getEstadoEstilo(u).color, cursor: 'default' }}>
                          <span>{getEstadoEstilo(u).label}</span>
                        </div>
                      ) : (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            onClick={() => setDropdownAbierto(dropdownAbierto === u.usuarioId ? null : u.usuarioId)}
                            style={{ ...styles.estadoBadge, color: getEstadoEstilo(u).color }}
                          >
                            <span>{getEstadoEstilo(u).label}</span>
                            <ChevronDown size={14} color="#A3A3A3" />
                          </button>
                          {dropdownAbierto === u.usuarioId && (
                            <div style={styles.dropdown}>
                              <button
                                style={{ ...styles.dropdownItem, color: '#0B662A', backgroundColor: u.estadoUsuario === true ? '#f5fbf7' : 'transparent' }}
                                onClick={() => u.estadoUsuario === false && solicitarAccion('activar', u.usuarioId)}
                              >
                                <span>Activo</span>
                                {u.estadoUsuario === true && (
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M2 7L5.5 10.5L12 3.5" stroke="#0B662A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </button>
                              <button
                                style={{ ...styles.dropdownItem, color: '#e53e3e', backgroundColor: u.estadoUsuario === false ? '#fff5f5' : 'transparent' }}
                                onClick={() => u.estadoUsuario === true && solicitarAccion('inactivar', u.usuarioId)}
                              >
                                <span>Inactivo</span>
                                {u.estadoUsuario === false && (
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M2 7L5.5 10.5L12 3.5" stroke="#e53e3e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* COLUMNA ACCESO LOGIN (solo en tab bloqueados) */}
                    {tabActiva === 'bloqueados' && (
                      <td style={{ ...styles.td, padding: '12px 16px' }}>
                        <button
                          onClick={() => solicitarAccion('desbloquear-login', u.usuarioId)}
                          style={{ ...styles.estadoBadge, color: '#b45309', cursor: 'pointer', border: '1px solid #fbbf24', backgroundColor: '#fef3c7' }}
                        >
                          <span>Bloqueado</span>
                        </button>
                      </td>
                    )}

                    {/* COLUMNA ACCIONES */}
                    <td style={{ ...styles.td, textAlign: 'center', verticalAlign: 'middle' }}>
                      <button onClick={() => navigate(`/usuarios/${u.usuarioId}`)} style={styles.btnAccion} title="Ver detalle">
                        <Eye size={17} color="#0B662A" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Paginación numerada ── */}
        <div style={styles.paginacion}>
          {generarPaginas().map((p, i) =>
            p === '...'
              ? <span key={`e-${i}`} style={styles.ellipsis}>...</span>
              : <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  style={{ ...styles.pageBtn, ...(currentPage === p ? styles.pageBtnActivo : {}) }}
                >
                  {p + 1}
                </button>
          )}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            style={{ ...styles.pageBtn, opacity: currentPage >= totalPages - 1 ? 0.4 : 1 }}
          >{'>>'}</button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container:        { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box', minWidth: 0 },
  mensaje:          { textAlign: 'center', padding: '40px', color: '#A3A3A3' },
  mensajeError:     { textAlign: 'center', padding: '40px', color: '#e53e3e' },
  encabezado:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  titulo:           { fontSize: '20px', fontWeight: '800', color: '#272525' },
  subtitulo:        { fontSize: '12px', color: '#A3A3A3', marginTop: '2px' },
  panelSuperior:    { backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 24px', width: '100%', boxSizing: 'border-box' },
  barraAcciones:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  totalLabel:       { fontSize: '28px', fontWeight: '800', color: '#272525' },
  totalSub:         { fontSize: '12px', color: '#A3A3A3' },
  searchWrapper:    { position: 'relative', display: 'flex', alignItems: 'center', width: '320px', minWidth: '180px' },
  searchIcon:       { position: 'absolute', left: '12px' },
  searchInput:      { width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #0B662A', borderRadius: '8px', fontSize: '13px', color: '#272525', outline: 'none', fontFamily: 'Nunito, sans-serif', backgroundColor: '#F7F9FB', boxSizing: 'border-box' },
  filaBotones:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: '12px', boxSizing: 'border-box' },
  creaLabel:        { fontSize: '14px', fontWeight: '800', color: '#272525' },
  btnCrear:         { color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 60px', fontSize: '13px', fontWeight: '400', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', transition: 'background 0.3s ease' },
  tabs:             { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', backgroundColor: '#ffffff', padding: '0 24px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', minHeight: '52px', flexWrap: 'wrap', boxSizing: 'border-box' },
  tab:              { background: 'none', border: 'none', padding: '16px 0', fontSize: '13px', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  tablaWrapper:     { backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', width: '100%', boxSizing: 'border-box', overflow: 'hidden' },

  // ── Fila superior tabla ──
  tablaHeader:      { padding: '16px 20px', borderBottom: '1px solid #D0D0D0' },
  tablaTitulo:      { fontSize: '14px', fontWeight: '700', color: '#272525', margin: 0 },
  porPaginaBox:     { display: 'flex', alignItems: 'center', gap: '8px' },
  porPaginaLabel:   { fontSize: '13px', color: '#A3A3A3', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' },
  porPaginaSelect:  { padding: '6px 28px 6px 10px', border: '1px solid #D0D0D0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23272525\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundColor: '#fff' },

  tabla:            { width: '100%', borderCollapse: 'collapse', minWidth: '1200px' },
  th:               { textAlign: 'left', padding: '10px 12px', fontSize: '12px', fontWeight: '700', color: '#A3A3A3', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:               { padding: '12px 16px', fontSize: '13px', color: '#272525', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' },
  trPar:            { backgroundColor: '#ffffff' },
  trImpar:          { backgroundColor: '#F7F9FB' },
  sinResultados:    { textAlign: 'center', padding: '32px', color: '#A3A3A3', fontSize: '13px' },
  estadoBadge:      { display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '400', backgroundColor: '#ffffff', border: '1px solid #D0D0D0', cursor: 'pointer', minWidth: '95px' },
  dropdown:         { position: 'absolute', top: '110%', left: 0, backgroundColor: '#ffffff', border: '1px solid #D0D0D0', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 999, width: '110px', padding: '4px 0' },
  dropdownItem:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', fontWeight: '400', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },

  // ── Paginación numerada ──
  paginacion:       { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', padding: '16px 20px', flexWrap: 'wrap' },
  pageBtn:          { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  pageBtnActivo:    { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
  ellipsis:         { fontSize: '13px', color: '#A3A3A3', padding: '0 4px', lineHeight: '36px' },

  userInfo:         { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar:       { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e0e0e0', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px' },
  userName:         { fontSize: '13px', fontWeight: '700', color: '#272525', lineHeight: 1.2 },
  userCargo:        { fontSize: '11px', color: '#A3A3A3' },
  modalOverlay:     { position: 'fixed', inset: 0, backgroundColor: 'rgba(14, 78, 30, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox:         { backgroundColor: '#ffffff', borderRadius: '16px', padding: '36px 32px', maxWidth: '380px', width: '90%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' },
  modalIconCircle:  { width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  modalTitulo:      { fontSize: '16px', fontWeight: '800', color: '#272525', marginBottom: '10px' },
  modalMensaje:     { fontSize: '13px', color: '#555', marginBottom: '24px', lineHeight: 1.6 },
  modalBotones:     { display: 'flex', justifyContent: 'center', gap: '12px' },
  btnCancelar:      { padding: '10px 24px', backgroundColor: '#ffffff', color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  btnConfirmar:     { padding: '10px 24px', backgroundColor: '#0B662A', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  btnAccion:        { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  inputFecha:       { padding: '9px 12px', border: '1.5px solid #0B662A', borderRadius: '8px', fontSize: '13px', color: '#272525', outline: 'none', fontFamily: 'Nunito, sans-serif', backgroundColor: '#F7F9FB', cursor: 'pointer' },
};
