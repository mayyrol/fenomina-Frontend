import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import axiosInstance from '../../../../api/axiosInstance';
import { useAuthStore } from '../../../../store/authStore';

const LABEL_ROL = {
  SUPER_ADMIN: 'Super Admin', RRHH: 'Recursos Humanos',
  AUDITOR: 'Auditor', CLIENTE_EMPRESA: 'Cliente Empresa',
};

export default function VerUsuarioPage() {
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
  if (!usuario) return <div style={styles.mensajeError}>Usuario no encontrado.</div>;

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
          <div style={styles.userAvatar}> <UserRound size={20} color="#A3A3A3" /> </div>
          <div>
            <p style={styles.userName}>{usuarioActual?.nombresUsuario} {usuarioActual?.apellidosUsuario}</p>
            <p style={styles.userCargo}>{usuarioActual?.cargoUsuario}</p>
          </div>
        </div>
      </div>

      {/* Sección 1 */}
      <div style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>Información Personal e Identidad</h2>
        <div style={styles.grid3}>
          <Campo label="Nombre(s)" valor={usuario.nombresUsuario} />
          <Campo label="Apellidos" valor={usuario.apellidosUsuario} />
          <Campo label="Cargo" valor={usuario.cargoUsuario} />
        </div>
        <div style={{ marginTop: '16px', maxWidth: '32%' }}>
          <Campo label="Número de Identificación" valor={usuario.numIdentiUsuario} />
        </div>
      </div>

      {/* Sección 2 */}
      <div style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>Datos de Usuario</h2>
        <div style={styles.grid2}>
          <Campo label="Nombre de usuario" valor={usuario.userName} />
          <Campo label="Rol" valor={LABEL_ROL[usuario.rolUsuario] || usuario.rolUsuario} />
        </div>
        <div style={{ ...styles.grid2, marginTop: '16px' }}>
          <Campo label="ID Empresa" valor={usuario.fkIdEmpresa ?? 'Acceso a todas las empresas'} />
          <Campo label="Fecha de registro" valor={formatearFecha(usuario.createdAt)} />
        </div>
        <div style={{ ...styles.grid2, marginTop: '16px' }}>
          <Campo label="Último login" valor={formatearFecha(usuario.ultimoLogin)} />
            <div>
                <p style={styles.label}>Estado</p>
                <div style={{
                    ...styles.valorBox,
                    color: usuario.bloqueadoLogin ? '#b45309' : usuario.estadoUsuario ? '#0B662A' : '#e53e3e',
                    fontWeight: '600',
                }}>
                    {usuario.bloqueadoLogin ? 'Bloqueado' : usuario.estadoUsuario ? 'Activo' : 'Inactivo'}
                </div>
            </div>
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
                background: hoverEditar
                    ? 'linear-gradient(135deg, #0B662A 0%, #20B445 100%)'
                    : '#0B662A',
                transition: 'background 0.3s ease',
            }}
        >
            Editar información
        </button>
      </div>
    </div>
  );
}

function Campo({ label, valor }) {
  return (
    <div>
      <p style={styles.label}>{label}</p>
      <div style={styles.valorBox}>{valor || '—'}</div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  mensaje: { textAlign: 'center', padding: '40px', color: '#A3A3A3' },
  mensajeError: { textAlign: 'center', padding: '40px', color: '#e53e3e' },
  encabezado: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { fontSize: '20px', fontWeight: '800', color: '#272525' },
  subtitulo: { fontSize: '12px', color: '#A3A3A3', marginTop: '2px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar: {
    width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e0e0e0',
    color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '15px',
  },
  userName: { fontSize: '13px', fontWeight: '700', color: '#272525', lineHeight: 1.2 },
  userCargo: { fontSize: '11px', color: '#A3A3A3' },
  seccion: { backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #D0D0D0', padding: '20px 24px' },
  seccionTitulo: { fontSize: '14px', fontWeight: '700', color: '#272525', marginBottom: '16px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#272525', marginBottom: '6px' },
  valorBox: {
    width: '100%', padding: '10px 14px', border: '1px solid #D0D0D0',
    borderRadius: '6px', fontSize: '14px', color: '#272525',
    backgroundColor: '#f9f9f9', fontFamily: 'Nunito, sans-serif',
  },
  estadoBadge: {
    display: 'inline-flex', padding: '5px 14px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600',
  },
  filaBotones: { display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' },
  btnRegresar: {
    padding: '10px 32px', backgroundColor: '#ffffff', color: '#272525',
    border: '1px solid #D0D0D0', borderRadius: '6px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
  },
  btnEditar: {
    padding: '10px 32px', color: '#ffffff', border: 'none',
    borderRadius: '6px', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
  },
};