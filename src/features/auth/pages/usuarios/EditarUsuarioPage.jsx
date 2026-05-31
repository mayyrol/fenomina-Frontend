import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserRound, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../../../../api/axiosInstance';
import { useAuthStore } from '../../../../store/authStore';
import { useEmpresasLista } from '../../hooks/useEmpresasLista';

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'RRHH', label: 'Recursos Humanos' },
  { value: 'AUDITOR', label: 'Auditor' },
  { value: 'CLIENTE_EMPRESA', label: 'Cliente Empresa' },
];

function Campo({ label, name, placeholder, value, onChange, error, type = 'text' }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange}
        style={{ ...styles.input, borderColor: error ? '#e53e3e' : '#D0D0D0' }} />
      {error && <span style={styles.errorTexto}>{error}</span>}
    </div>
  );
}

export default function EditarUsuarioPage() {
  const { id } = useParams();
  const { empresas, cargando: cargandoEmpresas } = useEmpresasLista();
  const navigate = useNavigate();
  const { usuario: usuarioActual } = useAuthStore();
  const [form, setForm] = useState({ nombresUsuario: '', apellidosUsuario: '', cargoUsuario: '', numIdentiUsuario: '', userName: '', contrasenaUsuario: '', rolUsuario: '', fkIdEmpresa: '' });
  const [errores, setErrores] = useState({});
  const [errorGlobal, setErrorGlobal] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [hoverGuardar, setHoverGuardar] = useState(false);
  const [exito, setExito] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  useEffect(() => {
    axiosInstance.get(`/auth/usuarios/${id}`).then(({ data }) => {
      setForm({
        nombresUsuario:   data.nombresUsuario || '',
        apellidosUsuario: data.apellidosUsuario || '',
        cargoUsuario:     data.cargoUsuario || '',
        numIdentiUsuario: data.numIdentiUsuario || '',
        userName:         data.userName || '',
        contrasenaUsuario: '',
        rolUsuario:       data.rolUsuario || '',
        fkIdEmpresa:      data.fkIdEmpresa ?? '',
      });
    }).finally(() => setCargando(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevoForm = { ...form, [name]: value };
    if (name === 'rolUsuario' && value !== 'CLIENTE_EMPRESA') {
      nuevoForm.fkIdEmpresa = '';
    }
    setForm(nuevoForm);
    setErrores({ ...errores, [name]: '' });
    setErrorGlobal('');
  };

  const validar = () => {
    const e = {};
    if (!form.nombresUsuario)   e.nombresUsuario   = 'Los nombres son obligatorios.';
    if (!form.apellidosUsuario) e.apellidosUsuario = 'Los apellidos son obligatorios.';
    if (!form.cargoUsuario)     e.cargoUsuario     = 'El cargo es obligatorio.';
    if (!form.numIdentiUsuario) e.numIdentiUsuario = 'El número de identificación es obligatorio.';
    if (!form.userName)         e.userName         = 'El nombre de usuario es obligatorio.';
    if (form.contrasenaUsuario) {
      if (form.contrasenaUsuario.length < 8)
        e.contrasenaUsuario = 'Mínimo 8 caracteres.';
      else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.contrasenaUsuario))
        e.contrasenaUsuario = 'Debe tener al menos una mayúscula y un número.';
    }
    if (!form.rolUsuario) e.rolUsuario = 'El rol es obligatorio.';
    if (form.rolUsuario === 'CLIENTE_EMPRESA' && !form.fkIdEmpresa) {
      e.fkIdEmpresa = 'Debes seleccionar una empresa para este rol.';
    }
    return e;
  };

  const handleSubmit = async () => {
    const nuevosErrores = validar();
    if (Object.keys(nuevosErrores).length > 0) { setErrores(nuevosErrores); return; }
    setGuardando(true);
    try {
      const payload = {
        ...form,
        fkIdEmpresa: form.fkIdEmpresa ? Number(form.fkIdEmpresa) : null,
      };
      if (!payload.contrasenaUsuario) delete payload.contrasenaUsuario;
      await axiosInstance.put(`/auth/usuarios/${id}`, payload);
      setExito(true);
    } catch (err) {
      const erroresBackend = err.response?.data?.errors;
      if (erroresBackend) setErrores(erroresBackend);
      else setErrorGlobal('Ocurrió un error al actualizar el usuario. Intenta de nuevo.');
    } finally { setGuardando(false); }
  };

  if (cargando) return <div style={{ padding: '40px', textAlign: 'center', color: '#A3A3A3' }}>Cargando...</div>;

  return (
    <div style={styles.container}>
      {/* Modal éxito */}
      {exito && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalIconCircle}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="18" fill="#e6f4ec" />
                <path d="M10 18L15.5 23.5L26 12.5" stroke="#0B662A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 style={styles.modalTitulo}>¡Perfecto!</h3>
            <p style={styles.modalMensaje}>La información del usuario ha sido actualizada exitosamente.</p>
            <button onClick={() => navigate(`/usuarios/${id}`)} style={styles.btnConfirmar}>Ok</button>
          </div>
        </div>
      )}

      {/* Encabezado */}
      <div style={styles.encabezado}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserRound size={22} color="#0B662A" />
          <div>
            <h1 style={styles.titulo}>Editar usuario</h1>
            <p style={styles.subtitulo}>Modifica la información del usuario</p>
          </div>
        </div>
        <div style={styles.userInfo}>
                <div style={styles.userAvatar}>
                    <UserRound size={20} color="#A3A3A3" />
                </div>
          <div>
            <p style={styles.userName}>{usuarioActual?.nombresUsuario} {usuarioActual?.apellidosUsuario}</p>
            <p style={styles.userCargo}>{usuarioActual?.cargoUsuario}</p>
          </div>
        </div>
      </div>

      {errorGlobal && <p style={styles.errorGlobal}>{errorGlobal}</p>}

      {/* Sección 1: Información Personal */}
      <div style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>Información Personal e Identidad</h2>
        <div style={styles.grid3}>
          <Campo label="Nombre(s) Usuario*" name="nombresUsuario" placeholder="Ingresar nombres" value={form.nombresUsuario} onChange={handleChange} error={errores.nombresUsuario} />
          <Campo label="Apellidos Usuario*" name="apellidosUsuario" placeholder="Ingresar apellidos" value={form.apellidosUsuario} onChange={handleChange} error={errores.apellidosUsuario} />
          <Campo label="Cargo*" name="cargoUsuario" placeholder="Ingresar cargo" value={form.cargoUsuario} onChange={handleChange} error={errores.cargoUsuario} />
        </div>
        <div style={{ marginTop: '16px', maxWidth: '32%' }}>
          <Campo label="Número de Identificación*" name="numIdentiUsuario" placeholder="Ingresar número" value={form.numIdentiUsuario} onChange={handleChange} error={errores.numIdentiUsuario} />
        </div>
      </div>

      {/* Sección 2: Datos de Usuario */}
      <div style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>Datos de Usuario</h2>
        <div style={styles.grid2}>
          <Campo label="Nombre de usuario*" name="userName" placeholder="Ingresar nombre de usuario" value={form.userName} onChange={handleChange} error={errores.userName} />
          <div>
            <label style={styles.label}>Nueva contraseña <span style={{ color: '#A3A3A3', fontWeight: '400' }}>(dejar vacío para no cambiar)</span></label>
            <div style={styles.inputWrapper}>
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                name="contrasenaUsuario"
                placeholder="Ingresar nueva contraseña"
                value={form.contrasenaUsuario}
                onChange={handleChange}
                style={{ ...styles.input, borderColor: errores.contrasenaUsuario ? '#e53e3e' : '#D0D0D0' }}
              />
              <button type="button" onClick={() => setMostrarContrasena(v => !v)} style={styles.eyeButton}>
                {mostrarContrasena ? <EyeOff size={18} color="#777777" /> : <Eye size={18} color="#777777" />}
              </button>
            </div>
            {errores.contrasenaUsuario && <span style={styles.errorTexto}>{errores.contrasenaUsuario}</span>}
          </div>
        </div>
        <div style={{ ...styles.grid2, marginTop: '16px' }}>
          <div>
            <label style={styles.label}>Rol*</label>
            <select name="rolUsuario" value={form.rolUsuario} onChange={handleChange}
              style={{ ...styles.input, borderColor: errores.rolUsuario ? '#e53e3e' : '#D0D0D0', color: form.rolUsuario ? '#272525' : '#A3A3A3' }}>
              <option value="">Seleccionar rol</option>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {errores.rolUsuario && <span style={styles.errorTexto}>{errores.rolUsuario}</span>}
          </div>
          {form.rolUsuario === 'CLIENTE_EMPRESA' && (
            <div>
              <label style={styles.label}>Empresa<span style={{ color: '#e53e3e' }}>*</span></label>
              <select name="fkIdEmpresa" value={form.fkIdEmpresa} onChange={handleChange}
                style={{ ...styles.input, borderColor: errores.fkIdEmpresa ? '#e53e3e' : '#D0D0D0', color: form.fkIdEmpresa ? '#272525' : '#A3A3A3' }}>
                <option value="">Seleccionar empresa</option>
                {cargandoEmpresas
                  ? <option disabled>Cargando empresas...</option>
                  : empresas.map(e => <option key={e.empresaId} value={e.empresaId}>{e.nombreEmpresa}</option>)
                }
              </select>
              {errores.fkIdEmpresa && <span style={styles.errorTexto}>{errores.fkIdEmpresa}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Botones */}
      <div style={styles.filaBotones}>
        <button onClick={() => navigate(`/usuarios/${id}`)} style={styles.btnRegresar}>Regresar</button>
        <button onClick={handleSubmit} disabled={guardando}
          onMouseEnter={() => setHoverGuardar(true)} onMouseLeave={() => setHoverGuardar(false)}
          style={{
            ...styles.btnGuardar, opacity: guardando ? 0.7 : 1,
            background: hoverGuardar ? 'linear-gradient(135deg, #0B662A 0%, #20B445 100%)' : '#0B662A',
          }}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}


const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
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
  errorGlobal: {
    color: '#e53e3e', fontSize: '13px', backgroundColor: '#fde8e8',
    padding: '10px 14px', borderRadius: '6px', border: '1px solid #e53e3e',
  },
  seccion: { backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #D0D0D0', padding: '20px 24px' },
  seccionTitulo: { fontSize: '14px', fontWeight: '700', color: '#272525', marginBottom: '16px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#272525', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', border: '1px solid #D0D0D0',
    borderRadius: '6px', fontSize: '14px', color: '#272525', outline: 'none',
    fontFamily: 'Nunito, sans-serif', backgroundColor: '#ffffff',
  },
  inputWrapper: { position: 'relative' },
  eyeButton:    { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' },
  errorTexto:   { display: 'block', marginTop: '5px', fontSize: '12px', color: '#e53e3e' },
  filaBotones: { display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' },
  btnRegresar: {
    padding: '10px 32px', backgroundColor: '#ffffff', color: '#272525',
    border: '1px solid #D0D0D0', borderRadius: '6px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
  },
  btnGuardar: {
    padding: '10px 32px', color: '#ffffff', border: 'none', borderRadius: '6px',
    fontSize: '14px', fontWeight: '700', cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif', transition: 'background 0.3s ease',
  },
  modalOverlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(14, 78, 30, 0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalBox: {
    backgroundColor: '#ffffff', borderRadius: '16px', padding: '36px 32px',
    maxWidth: '360px', width: '90%', textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  },
  modalIconCircle: { display: 'flex', justifyContent: 'center', marginBottom: '16px' },
  modalTitulo: { fontSize: '16px', fontWeight: '800', color: '#272525', marginBottom: '10px' },
  modalMensaje: { fontSize: '13px', color: '#555', marginBottom: '24px', lineHeight: 1.6 },
  btnConfirmar: {
    padding: '10px 32px', backgroundColor: '#0B662A', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '13px',
    fontWeight: '700', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
  },
};