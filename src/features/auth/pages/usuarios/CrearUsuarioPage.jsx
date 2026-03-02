import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'RRHH', label: 'Recursos Humanos' },
  { value: 'AUDITOR', label: 'Auditor' },
  { value: 'CLIENTE_EMPRESA', label: 'Cliente Empresa' },
];

const camposVacios = {
  userName: '',
  nombresUsuario: '',
  apellidosUsuario: '',
  numIdentiUsuario: '',
  cargoUsuario: '',
  contrasenaUsuario: '',
  rolUsuario: '',
  fkIdEmpresa: '',
};

export default function CrearUsuarioPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(camposVacios);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [errores, setErrores] = useState({});
  const [errorGlobal, setErrorGlobal] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrores({ ...errores, [name]: '' });
    setErrorGlobal('');
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!form.userName) nuevosErrores.userName = 'El username es obligatorio.';
    else if (form.userName.length < 4) nuevosErrores.userName = 'Mínimo 4 caracteres.';
    else if (!/^[a-zA-Z0-9._-]+$/.test(form.userName)) nuevosErrores.userName = 'Solo letras, números, puntos, guiones y guiones bajos.';

    if (!form.nombresUsuario) nuevosErrores.nombresUsuario = 'Los nombres son obligatorios.';
    if (!form.apellidosUsuario) nuevosErrores.apellidosUsuario = 'Los apellidos son obligatorios.';
    if (!form.numIdentiUsuario) nuevosErrores.numIdentiUsuario = 'El número de identificación es obligatorio.';
    if (!form.cargoUsuario) nuevosErrores.cargoUsuario = 'El cargo es obligatorio.';
    if (!form.rolUsuario) nuevosErrores.rolUsuario = 'El rol es obligatorio.';

    if (!form.contrasenaUsuario) {
      nuevosErrores.contrasenaUsuario = 'La contraseña es obligatoria.';
    } else if (form.contrasenaUsuario.length < 8) {
      nuevosErrores.contrasenaUsuario = 'Mínimo 8 caracteres.';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.contrasenaUsuario)) {
      nuevosErrores.contrasenaUsuario = 'Debe tener mayúscula, minúscula y número.';
    }

    return nuevosErrores;
  };

  const handleSubmit = async () => {
    const nuevosErrores = validar();
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setCargando(true);
    try {
      await axiosInstance.post('/auth/usuarios', {
        ...form,
        fkIdEmpresa: form.fkIdEmpresa ? Number(form.fkIdEmpresa) : null,
      });
      navigate('/usuarios');
    } catch (err) {
      const errorCode = err.response?.data?.errorCode;
      const erroresBackend = err.response?.data?.errors;

      if (erroresBackend) {
        // Errores de validación campo por campo del backend
        setErrores(erroresBackend);
      } else if (errorCode === 'AUTH_006') {
        setErrores({ userName: 'Este username ya está en uso.' });
      } else if (errorCode === 'AUTH_007') {
        setErrores({ numIdentiUsuario: 'Este número de identificación ya está registrado.' });
      } else {
        setErrorGlobal('Ocurrió un error al crear el usuario. Intenta de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Encabezado */}
      <div style={styles.encabezado}>
        <h1 style={styles.titulo}>Crear usuario</h1>
        <p style={styles.subtitulo}>Llena el formulario para crear un nuevo usuario</p>
      </div>

      {errorGlobal && <p style={styles.errorGlobal}>{errorGlobal}</p>}

      {/* Sección 1 - Información personal */}
      <div style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>Información Personal e Identidad</h2>
        <div style={styles.grid3}>
          <Campo
            label="Nombre(s) Usuario*"
            name="nombresUsuario"
            placeholder="Ingresar nombres"
            value={form.nombresUsuario}
            onChange={handleChange}
            error={errores.nombresUsuario}
          />
          <Campo
            label="Apellidos Usuario*"
            name="apellidosUsuario"
            placeholder="Ingresar apellidos"
            value={form.apellidosUsuario}
            onChange={handleChange}
            error={errores.apellidosUsuario}
          />
          <Campo
            label="Cargo*"
            name="cargoUsuario"
            placeholder="Ingresar cargo"
            value={form.cargoUsuario}
            onChange={handleChange}
            error={errores.cargoUsuario}
          />
        </div>
        <div style={styles.grid1}>
          <Campo
            label="Número de Identificación*"
            name="numIdentiUsuario"
            placeholder="Ingresar número"
            value={form.numIdentiUsuario}
            onChange={handleChange}
            error={errores.numIdentiUsuario}
          />
        </div>
      </div>

      {/* Sección 2 - Datos de usuario */}
      <div style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>Datos de Usuario</h2>
        <div style={styles.grid2}>
          <Campo
            label="Nombre de usuario*"
            name="userName"
            placeholder="Ingresar nombre"
            value={form.userName}
            onChange={handleChange}
            error={errores.userName}
          />

          {/* Contraseña con ojo */}
          <div>
            <label style={styles.label}>Contraseña*</label>
            <div style={styles.inputWrapper}>
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                name="contrasenaUsuario"
                placeholder="Ingresar contraseña"
                value={form.contrasenaUsuario}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  borderColor: errores.contrasenaUsuario ? '#e53e3e' : '#D0D0D0',
                }}
              />
              <button
                type="button"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                style={styles.eyeButton}
              >
                {mostrarContrasena
                  ? <EyeOff size={18} color="#777777" />
                  : <Eye size={18} color="#777777" />}
              </button>
            </div>
            {errores.contrasenaUsuario && (
              <span style={styles.errorTexto}>{errores.contrasenaUsuario}</span>
            )}
          </div>
        </div>

        {/* Rol */}
        <div style={{ ...styles.grid2, marginTop: '16px' }}>
          <div>
            <label style={styles.label}>Rol*</label>
            <select
              name="rolUsuario"
              value={form.rolUsuario}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errores.rolUsuario ? '#e53e3e' : '#D0D0D0',
                color: form.rolUsuario ? '#272525' : '#A3A3A3',
              }}
            >
              <option value="">Seleccionar rol</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errores.rolUsuario && (
              <span style={styles.errorTexto}>{errores.rolUsuario}</span>
            )}
          </div>

          <Campo
            label="ID Empresa (opcional)"
            name="fkIdEmpresa"
            placeholder="Dejar vacío para acceso total"
            value={form.fkIdEmpresa}
            onChange={handleChange}
            error={errores.fkIdEmpresa}
            type="number"
          />
        </div>
      </div>

      {/* Botones */}
      <div style={styles.filaBotones}>
        <button
          onClick={() => navigate('/usuarios')}
          style={styles.btnRegresar}
        >
          Regresar
        </button>
        <button
          onClick={handleSubmit}
          disabled={cargando}
          style={{ ...styles.btnCrear, opacity: cargando ? 0.7 : 1 }}
        >
          {cargando ? 'Creando...' : 'Crear usuario'}
        </button>
      </div>
    </div>
  );
}

// Componente reutilizable para campos simples
function Campo({ label, name, placeholder, value, onChange, error, type = 'text' }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          ...styles.input,
          borderColor: error ? '#e53e3e' : '#D0D0D0',
        }}
      />
      {error && <span style={styles.errorTexto}>{error}</span>}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '860px',
  },
  encabezado: { marginBottom: '4px' },
  titulo: { fontSize: '20px', fontWeight: '800', color: '#272525' },
  subtitulo: { fontSize: '12px', color: '#A3A3A3', marginTop: '2px' },
  errorGlobal: {
    color: '#e53e3e', fontSize: '13px', backgroundColor: '#fde8e8',
    padding: '10px 14px', borderRadius: '6px', border: '1px solid #e53e3e',
  },
  seccion: {
    backgroundColor: '#ffffff', borderRadius: '8px',
    border: '1px solid #D0D0D0', padding: '20px 24px',
  },
  seccionTitulo: {
    fontSize: '14px', fontWeight: '700', color: '#272525', marginBottom: '16px',
  },
  grid3: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px',
  },
  grid2: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
  },
  grid1: {
    marginTop: '16px', maxWidth: '280px',
  },
  label: {
    display: 'block', fontSize: '13px', fontWeight: '600',
    color: '#272525', marginBottom: '6px',
  },
  input: {
    width: '100%', padding: '10px 14px', border: '1px solid #D0D0D0',
    borderRadius: '6px', fontSize: '14px', color: '#272525', outline: 'none',
    fontFamily: 'Nunito, sans-serif', backgroundColor: '#ffffff',
  },
  inputWrapper: { position: 'relative' },
  eyeButton: {
    position: 'absolute', right: '12px', top: '50%',
    transform: 'translateY(-50%)', background: 'none',
    border: 'none', cursor: 'pointer', padding: 0,
    display: 'flex', alignItems: 'center',
  },
  errorTexto: {
    display: 'block', marginTop: '5px', fontSize: '12px', color: '#e53e3e',
  },
  filaBotones: {
    display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px',
  },
  btnRegresar: {
    padding: '10px 32px', backgroundColor: '#ffffff', color: '#272525',
    border: '1px solid #D0D0D0', borderRadius: '6px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
  },
  btnCrear: {
    padding: '10px 32px', backgroundColor: '#0B662A', color: '#ffffff',
    border: 'none', borderRadius: '6px', fontSize: '14px',
    fontWeight: '700', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
  },
};