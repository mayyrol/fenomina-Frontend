import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import imagenLogin from '../../../assets/Imagenautenticacion.png';
import logoFE from '../../../assets/logo_fe.png';
import { useAuthStore } from '../../../store/authStore';
import axiosInstance from '../../../api/axiosInstance';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setTokens, setUsuario } = useAuthStore();

  const [form, setForm] = useState({ userName: '', contrasenaUsuario: '' });
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const { data } = await axiosInstance.post('/auth/login', {
        userName: form.userName,
        contrasenaUsuario: form.contrasenaUsuario,
      });

      setTokens(data.accessToken, data.refreshToken, data.expiresIn);
      setUsuario(data.usuario);
      navigate('/usuarios');
    } catch (err) {
      const status = err.response?.status;
      const mensaje = err.response?.data?.message || '';

      if (status === 423) {
        setError('Tu cuenta ha sido bloqueada por múltiples intentos fallidos. Contacta al administrador.');
      } else if (status === 401) {
        setError('Contraseña incorrecta.');
      } else if (status === 404) {
        setError('Usuario no encontrado.');
      } else {
        setError('Ocurrió un error. Intenta de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Lado izquierdo - imagen */}
      <div style={styles.imagenLado}>
        <img src={imagenLogin} alt="FENomina oficina" style={styles.imagen} />
        <div style={styles.overlay}>
          <div style={styles.logo}>
            <img src={logoFE} alt="FENomina logo" style={styles.logoImg} />
            <span style={styles.logoTexto}>FENomina</span>
          </div>
        </div>
      </div>

      {/* Lado derecho - formulario */}
      <div style={styles.formularioLado}>
        <form onSubmit={handleSubmit} style={styles.formulario}>
          <p style={styles.bienvenido}>Bienvenido,</p>
          <h1 style={styles.titulo}>Autenticate para ingresar</h1>

          <div style={styles.campo}>
            <label style={styles.label}>Usuario</label>
            <input
              type="text"
              name="userName"
              placeholder="Ingresa tu nombre de usuario"
              value={form.userName}
              onChange={handleChange}
              style={styles.input}
              autoComplete="username"
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                name="contrasenaUsuario"
                placeholder="••••••••••"
                value={form.contrasenaUsuario}
                onChange={handleChange}
                style={{ ...styles.input, borderColor: error ? '#e53e3e' : '#D0D0D0' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                style={styles.eyeButton}
              >
                {mostrarContrasena
                  ? <EyeOff size={18} color="#777777" />
                  : <Eye size={18} color="#777777" />
                }
              </button>
            </div>
            {error && <span style={styles.errorTexto}>{error}</span>}
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{ ...styles.boton, opacity: cargando ? 0.7 : 1 }}
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
  },
  imagenLado: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  imagen: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(11, 102, 42, 0.45)',
    display: 'flex',
    alignItems: 'flex-start',
    padding: '32px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoImg: {
  width: '36px',
  height: '36px',
  objectFit: 'contain',
  },
  logoTexto: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '800',
    fontFamily: 'Nunito, sans-serif',
  },
  formularioLado: {
    width: '420px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: '48px 40px',
  },
  formulario: {
    width: '100%',
  },
  bienvenido: {
    fontSize: '14px',
    color: '#A3A3A3',
    marginBottom: '4px',
  },
  titulo: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#272525',
    marginBottom: '32px',
  },
  campo: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#272525',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #D0D0D0',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#272525',
    outline: 'none',
    fontFamily: 'Nunito, sans-serif',
  },
  inputWrapper: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  errorTexto: {
    display: 'block',
    marginTop: '6px',
    fontSize: '12px',
    color: '#e53e3e',
  },
  boton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0B662A',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif',
    marginTop: '8px',
  },
};