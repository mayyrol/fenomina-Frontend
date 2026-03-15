import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserRound, CheckCircle2, AlertTriangle } from 'lucide-react';
import axiosInstance from '../../../../api/axiosInstance';
import { useAuthStore } from '../../../../store/authStore';

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'RRHH', label: 'Recursos Humanos' },
  { value: 'AUDITOR', label: 'Auditor' },
  { value: 'CLIENTE_EMPRESA', label: 'Cliente Empresa' },
];

const camposVacios = {
  userName: '', nombresUsuario: '', apellidosUsuario: '',
  numIdentiUsuario: '', cargoUsuario: '', contrasenaUsuario: '',
  rolUsuario: '', fkIdEmpresa: '',
};

export default function CrearUsuarioPage() {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const [form, setForm] = useState(camposVacios);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [errores, setErrores] = useState({});
  const [errorGlobal, setErrorGlobal] = useState('');
  const [cargando, setCargando] = useState(false);
  const [hoverCrear, setHoverCrear] = useState(false);
  const [modalCrear, setModalCrear] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrores({ ...errores, [name]: '' });
    setErrorGlobal('');
  };

  const validar = () => {
    const e = {};
    if (!form.userName) e.userName = 'El username es obligatorio.';
    else if (form.userName.length < 4) e.userName = 'Mínimo 4 caracteres.';
    else if (!/^[a-zA-Z0-9._-]+$/.test(form.userName)) e.userName = 'Solo letras, números, puntos, guiones y guiones bajos.';
    if (!form.nombresUsuario) e.nombresUsuario = 'Los nombres son obligatorios.';
    if (!form.apellidosUsuario) e.apellidosUsuario = 'Los apellidos son obligatorios.';
    if (!form.numIdentiUsuario) {
      e.numIdentiUsuario = 'El número de identificación es obligatorio.';
    } else if (!/^\d{6,15}$/.test(form.numIdentiUsuario)) {
      e.numIdentiUsuario = 'Debe tener entre 6 y 15 dígitos numéricos.';
    }
    if (!form.cargoUsuario) e.cargoUsuario = 'El cargo es obligatorio.';
    if (!form.rolUsuario) e.rolUsuario = 'El rol es obligatorio.';
    if (!form.contrasenaUsuario) e.contrasenaUsuario = 'La contraseña es obligatoria.';
    else if (form.contrasenaUsuario.length < 8) e.contrasenaUsuario = 'Mínimo 8 caracteres.';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.contrasenaUsuario))
      e.contrasenaUsuario = 'Debe tener mayúscula, minúscula y número.';
    return e;
  };

  const handleSubmit = async () => {
    const nuevosErrores = validar();
    if (Object.keys(nuevosErrores).length > 0) { setErrores(nuevosErrores); return; }
    setCargando(true);
    try {
      await axiosInstance.post('/auth/usuarios', {
        ...form, fkIdEmpresa: form.fkIdEmpresa ? Number(form.fkIdEmpresa) : null,
      });
      setModalCrear({ tipo: 'exito', mensaje: 'El usuario ha sido creado exitosamente.' });
    } catch (err) {
      const errorCode = err.response?.data?.errorCode;
      const erroresBackend = err.response?.data?.errors;
      if (erroresBackend) setErrores(erroresBackend);
      else if (errorCode === 'AUTH_006') setErrores({ userName: 'Este username ya está en uso.' });
      else if (errorCode === 'AUTH_007') setErrores({ numIdentiUsuario: 'Este número de identificación ya está registrado.' });
      else setModalCrear({ tipo: 'error', mensaje: 'Ocurrió un error al crear el usuario. Intenta de nuevo.' });
    } finally {
      setCargando(false);
    }
  };


  return (
    <div style={styles.container}>
      {modalCrear && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={{
              ...styles.modalIconCircle,
              backgroundColor: modalCrear.tipo === 'exito' ? '#e6f4ec' : '#fef3c7',
            }}>
              {modalCrear.tipo === 'exito'
                ? <CheckCircle2 size={36} color="#0B662A" strokeWidth={1.5} />
                : <AlertTriangle size={36} color="#b45309" strokeWidth={1.5} />
              }
            </div>
            <h3 style={styles.modalTitulo}>{modalCrear.tipo === 'exito' ? '¡Perfecto!' : '¡Ups!'}</h3>
            <p style={styles.modalMensaje}>{modalCrear.mensaje}</p>
            <button
              onClick={() => modalCrear.tipo === 'exito' ? navigate('/usuarios') : setModalCrear(null)}
              style={styles.btnConfirmar}
            >Ok</button>
          </div>
        </div>
      )}
      {/* Encabezado */}
      <div style={styles.encabezado}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserRound size={22} color="#0B662A" />
          <div>
            <h1 style={styles.titulo}>Crear usuario</h1>
            <p style={styles.subtitulo}>Llena el formulario para crear un nuevo usuario</p>
          </div>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}> <UserRound size={20} color="#A3A3A3" /> </div>
          <div>
            <p style={styles.userName}>{usuario?.nombresUsuario} {usuario?.apellidosUsuario}</p>
            <p style={styles.userCargo}>{usuario?.cargoUsuario}</p>
          </div>
        </div>
      </div>

      {errorGlobal && <p style={styles.errorGlobal}>{errorGlobal}</p>}

      {/* Sección 1 */}
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

      {/* Sección 2 */}
      <div style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>Datos de Usuario</h2>
        <div style={styles.grid2}>
          <Campo label="Nombre de usuario*" name="userName" placeholder="Ingresar nombre" value={form.userName} onChange={handleChange} error={errores.userName} />
          <div>
            <label style={styles.label}>Contraseña*</label>
            <div style={styles.inputWrapper}>
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                name="contrasenaUsuario" placeholder="Ingresar contraseña"
                value={form.contrasenaUsuario} onChange={handleChange}
                style={{ ...styles.input, borderColor: errores.contrasenaUsuario ? '#e53e3e' : '#D0D0D0' }}
              />
              <button type="button" onClick={() => setMostrarContrasena(!mostrarContrasena)} style={styles.eyeButton}>
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
          <Campo label="ID Empresa (opcional)" name="fkIdEmpresa" placeholder="Dejar vacío para acceso total" value={form.fkIdEmpresa} onChange={handleChange} error={errores.fkIdEmpresa} type="number" />
        </div>
      </div>

      {/* Botones */}
      <div style={styles.filaBotones}>
        <button onClick={() => navigate('/usuarios')} style={styles.btnRegresar}>Regresar</button>
        <button onClick={handleSubmit} disabled={cargando}
          onMouseEnter={() => setHoverCrear(true)} onMouseLeave={() => setHoverCrear(false)}
          style={{
            ...styles.btnCrear, opacity: cargando ? 0.7 : 1,
            background: hoverCrear ? 'linear-gradient(135deg, #0B662A 0%, #20B445 100%)' : '#0B662A',
          }}>
          {cargando ? 'Creando...' : 'Crear usuario'}
        </button>
      </div>
    </div>
  );
}

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
  seccion: {
    backgroundColor: '#ffffff', borderRadius: '8px',
    border: '1px solid #D0D0D0', padding: '20px 24px',
  },
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
  eyeButton: {
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
    display: 'flex', alignItems: 'center',
  },
  errorTexto: { display: 'block', marginTop: '5px', fontSize: '12px', color: '#e53e3e' },
  filaBotones: { display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' },
  btnRegresar: {
    padding: '10px 32px', backgroundColor: '#ffffff', color: '#272525',
    border: '1px solid #D0D0D0', borderRadius: '6px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
  },
  btnCrear: {
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
  modalIconCircle: {
    width: '72px', height: '72px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  modalTitulo: { fontSize: '16px', fontWeight: '800', color: '#272525', marginBottom: '10px' },
  modalMensaje: { fontSize: '13px', color: '#555', marginBottom: '24px', lineHeight: 1.6 },
  btnConfirmar: {
    padding: '10px 32px', backgroundColor: '#0B662A', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '13px',
    fontWeight: '700', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
  },
};