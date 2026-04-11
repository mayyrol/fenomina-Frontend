import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import axiosInstance from '../../../../api/axiosInstance';
import { useAuthStore } from '../../../../store/authStore';
import { useEmpresasLista } from '../../hooks/useEmpresasLista';

const LABEL_ROL = {
  SUPER_ADMIN: 'Super Admin', RRHH: 'Recursos Humanos',
  AUDITOR: 'Auditor', CLIENTE_EMPRESA: 'Cliente Empresa',
};

export default function VerUsuarioPage() {
  const { empresas } = useEmpresasLista();
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario: usuarioActual } = useAuthStore();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [hoverEditar, setHoverEditar] = useState(false);

  useEffect(() => {
    axiosInstance.get(`/auth/usuarios/${id}`)
      .then(({ data }) => setUsuario(data))
      .finally(() => setCargando(false));
  }, [id]);

  const formatearFecha = (f) => f
    ? new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  if (cargando) return <div style={styles.mensaje}>Cargando...</div>;
  if (!usuario)  return <div style={styles.mensajeError}>Usuario no encontrado.</div>;

  const nombreEmpresa = usuario.fkIdEmpresa
    ? (empresas.find(e => e.empresaId === usuario.fkIdEmpresa)?.nombreEmpresa ?? `Empresa ID: ${usuario.fkIdEmpresa}`)
    : 'Acceso a todas las empresas';

  const colorEstado = usuario.bloqueadoLogin ? '#b45309' : usuario.estadoUsuario ? '#0B662A' : '#e53e3e';
  const labelEstado = usuario.bloqueadoLogin ? 'Bloqueado' : usuario.estadoUsuario ? 'Activo' : 'Inactivo';

  return (
    <div style={styles.container}>

      {/* Encabezado */}
      <div style={styles.encabezado}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserRound size={22} color="#0B662A" />
          <div>
            <h1 style={styles.titulo}>Detalle de usuario</h1>
            <p style={styles.subtitulo}>Información del usuario seleccionado</p>
          </div>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}><UserRound size={20} color="#A3A3A3" /></div>
          <div>
            <p style={styles.userName}>{usuarioActual?.nombresUsuario} {usuarioActual?.apellidosUsuario}</p>
            <p style={styles.userCargo}>{usuarioActual?.cargoUsuario}</p>
          </div>
        </div>
      </div>

      {/* ── Tabla de información ── */}
      <div style={styles.tablaWrapper}>
        <h2 style={styles.tablaTitulo}>Información del Usuario</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                {['Nombre(s)', 'Apellidos', 'Cargo', 'N° Identificación', 'Usuario', 'Rol', 'Empresa', 'Fecha registro', 'Último login', 'Estado'].map((col) => (
                  <th key={col} style={styles.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={styles.tr}>
                <td style={styles.td}>{usuario.nombresUsuario || '—'}</td>
                <td style={styles.td}>{usuario.apellidosUsuario || '—'}</td>
                <td style={styles.td}>{usuario.cargoUsuario || '—'}</td>
                <td style={styles.td}>{usuario.numIdentiUsuario || '—'}</td>
                <td style={styles.td}>{usuario.userName || '—'}</td>
                <td style={styles.td}>{LABEL_ROL[usuario.rolUsuario] || usuario.rolUsuario || '—'}</td>
                <td style={styles.td}>{nombreEmpresa}</td>
                <td style={styles.td}>{formatearFecha(usuario.createdAt)}</td>
                <td style={styles.td}>{formatearFecha(usuario.ultimoLogin)}</td>
                <td style={{ ...styles.td, color: colorEstado, fontWeight: '700' }}>{labelEstado}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Botones */}
      <div style={styles.filaBotones}>
        <button onClick={() => navigate('/usuarios')} style={styles.btnRegresar}>Regresar</button>
        <button
          onClick={() => navigate(`/usuarios/${id}/editar`)}
          onMouseEnter={() => setHoverEditar(true)}
          onMouseLeave={() => setHoverEditar(false)}
          style={{
            ...styles.btnEditar,
            background: hoverEditar ? 'linear-gradient(135deg, #0B662A 0%, #20B445 100%)' : '#0B662A',
            transition: 'background 0.3s ease',
          }}
        >
          Editar información
        </button>
      </div>

    </div>
  );
}

const styles = {
  container:    { display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Nunito, sans-serif' },
  mensaje:      { textAlign: 'center', padding: '40px', color: '#A3A3A3' },
  mensajeError: { textAlign: 'center', padding: '40px', color: '#e53e3e' },
  encabezado:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:       { fontSize: '20px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:    { fontSize: '12px', color: '#A3A3A3', marginTop: '2px' },
  userInfo:     { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar:   { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e0e0e0', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px' },
  userName:     { fontSize: '13px', fontWeight: '700', color: '#272525', lineHeight: 1.2 },
  userCargo:    { fontSize: '11px', color: '#A3A3A3' },
  tablaWrapper: { backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', width: '100%', boxSizing: 'border-box', overflow: 'hidden' },
  tablaTitulo:  { fontSize: '14px', fontWeight: '700', color: '#272525', padding: '16px 20px', borderBottom: '1px solid #D0D0D0', margin: 0 },
  tabla:        { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  th:           { textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#A3A3A3', borderBottom: '1px solid #D0D0D0', whiteSpace: 'nowrap' },
  td:           { padding: '16px', fontSize: '13px', color: '#272525', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' },
  tr:           { backgroundColor: '#fff' },
  filaBotones:  { display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' },
  btnRegresar:  { padding: '10px 32px', backgroundColor: '#ffffff', color: '#272525', border: '1px solid #D0D0D0', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  btnEditar:    { padding: '10px 32px', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
};
