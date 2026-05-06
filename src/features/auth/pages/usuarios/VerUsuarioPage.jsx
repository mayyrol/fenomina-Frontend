import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserRound, ChevronLeft } from 'lucide-react';
import axiosInstance from '../../../../api/axiosInstance';
import { useAuthStore } from '../../../../store/authStore';
import { useEmpresasLista } from '../../hooks/useEmpresasLista';

const LABEL_ROL = {
  SUPER_ADMIN: 'Super Admin',
  RRHH: 'Recursos Humanos',
  AUDITOR: 'Auditor',
  CLIENTE_EMPRESA: 'Cliente Empresa',
};

export default function VerUsuarioPage() {
  const { empresas } = useEmpresasLista();
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario: usuarioActual } = useAuthStore();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [hoverEditar, setHoverEditar] = useState(false);
  const [hoverRegresar, setHoverRegresar] = useState(false);


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

  const nombreEmpresa = usuario.fkIdEmpresa
    ? (empresas.find(e => e.empresaId === usuario.fkIdEmpresa)?.nombreEmpresa ?? `Empresa ID: ${usuario.fkIdEmpresa}`)
    : 'Acceso a todas las empresas';

  const labelEstado = usuario.bloqueadoLogin ? 'Bloqueado' : usuario.estadoUsuario ? 'Activo' : 'Inactivo';
  const colorEstado = usuario.bloqueadoLogin ? '#b45309' : usuario.estadoUsuario ? '#0B662A' : '#e53e3e';

  return (
    <div style={styles.container}>

      {/* Encabezado */}
      <div style={styles.encabezado}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserRound size={22} color="#0B662A" />
          <div>
            <h1 style={styles.titulo}>Ver usuario</h1>
            <p style={styles.subtitulo}>Información de solo lectura del usuario seleccionado</p>
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

      {/* Volver */}
      <button style={styles.volverBtn} onClick={() => navigate('/usuarios')}>
        <ChevronLeft size={16} color="#272525" />
        <span>Volver</span>
      </button>

      {/* Sección 1: Información Personal e Identidad */}
      <div style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>Información Personal e Identidad</h2>
        <div style={styles.grid3}>
          <Campo label="Nombre(s) Usuario" value={usuario.nombresUsuario ?? ''} />
          <Campo label="Apellidos Usuario" value={usuario.apellidosUsuario ?? ''} />
          <Campo label="Cargo" value={usuario.cargoUsuario ?? ''} />
        </div>
        <div style={{ marginTop: '16px', maxWidth: '32%' }}>
          <Campo label="Número de Identificación" value={usuario.numIdentiUsuario ?? ''} />
        </div>
      </div>

      {/* Sección 2: Datos de Usuario */}
      <div style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>Datos de Usuario</h2>
        <div style={styles.grid2}>
          <Campo label="Nombre de usuario" value={usuario.userName ?? ''} />
          <div>
            <label style={styles.label}>Contraseña</label>
            <input
              readOnly
              type="password"
              value="placeholder"
              style={styles.inputRO}
            />
          </div>
        </div>
        <div style={{ ...styles.grid2, marginTop: '16px' }}>
          <Campo label="Rol" value={LABEL_ROL[usuario.rolUsuario] ?? usuario.rolUsuario ?? '—'} />
          {usuario.rolUsuario === 'CLIENTE_EMPRESA' && (
            <Campo label="Empresa" value={nombreEmpresa} />
          )}
        </div>
      </div>

      {/* Sección 3: Estado y Actividad */}
      <div style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>Estado y Actividad</h2>
        <div style={styles.grid3}>
          <div>
            <label style={styles.label}>Estado</label>
            <div style={{ ...styles.inputRO, color: colorEstado, fontWeight: '700' }}>
              {labelEstado}
            </div>
          </div>
          <Campo label="Fecha de registro" value={formatearFecha(usuario.createdAt)} />
          <Campo label="Último login" value={formatearFecha(usuario.ultimoLogin)} />
        </div>
      </div>

      {/* Botones */}
      <div style={styles.filaBotones}>
        <button
          onClick={() => navigate('/usuarios')}
          onMouseEnter={() => setHoverRegresar(true)}
          onMouseLeave={() => setHoverRegresar(false)}
          style={{
            ...styles.btnRegresar,
            background: hoverRegresar ? 'linear-gradient(135deg, #f0f0f0, #e0e0e0)' : '#ffffff',
            transition: 'background 0.3s ease',
          }}
        >
          Regresar
        </button>
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

function Campo({ label, value }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input readOnly value={value} style={styles.inputRO} />
    </div>
  );
}

const styles = {
  container:     { display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Nunito, sans-serif' },
  mensaje:       { textAlign: 'center', padding: '40px', color: '#A3A3A3' },
  mensajeError:  { textAlign: 'center', padding: '40px', color: '#e53e3e' },
  encabezado:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  titulo:        { fontSize: '20px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:     { fontSize: '12px', color: '#A3A3A3', marginTop: '2px' },
  volverBtn:     { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0, width: 'fit-content' },
  userInfo:      { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar:    { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e0e0e0', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px' },
  userName:      { fontSize: '13px', fontWeight: '700', color: '#272525', lineHeight: 1.2 },
  userCargo:     { fontSize: '11px', color: '#A3A3A3' },
  seccion:       { backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #D0D0D0', padding: '20px 24px' },
  seccionTitulo: { fontSize: '14px', fontWeight: '700', color: '#272525', marginBottom: '16px' },
  grid3:         { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' },
  grid2:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  label:         { display: 'block', fontSize: '13px', fontWeight: '600', color: '#272525', marginBottom: '6px' },
  inputWrapper:  { position: 'relative' },
  eyeButton:     { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' },
  inputRO:       { width: '100%', padding: '10px 14px', border: '1px solid #D0D0D0', borderRadius: '6px', fontSize: '14px', color: '#272525', fontFamily: 'Nunito, sans-serif', backgroundColor: '#F7F9FB', boxSizing: 'border-box', outline: 'none' },
  filaBotones:   { display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px', paddingBottom: '8px' },
  btnRegresar:   { padding: '10px 32px', color: '#272525', border: '1px solid #D0D0D0', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  btnEditar:     { padding: '10px 32px', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
};
