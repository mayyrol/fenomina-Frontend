import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutGrid,
  Building2,
  Settings2,
  UserRound,
  ScrollText,
  LogOut
} from 'lucide-react';
import logoFE from '../../../assets/logo_fe.png';

export default function MainLayout() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      await import('../api/axiosInstance').then(({ default: axios }) =>
        axios.post('/auth/logout', { refreshToken })
      );
    } catch (_) {
    } finally {
      logout();
      navigate('/login');
    }
  };

  const navItems = [
    { to: '/inicio', label: 'Inicio', icon: <LayoutGrid size={20} /> },
    { to: '/empresas', label: 'Empresas', icon: <Building2 size={20} /> },
    { to: '/parametros', label: 'Parámetros Generales', icon: <Settings2 size={20} /> },
    { to: '/usuarios', label: 'Usuarios', icon: <UserRound size={20} /> },
    { to: '/logs', label: 'Logs FENomina', icon: <ScrollText size={20} /> },
  ];

  return (
    <div style={styles.container}>
      {/**/}
      <aside style={styles.sidebar}>
        {/**/}
        <div style={styles.logoArea}>
          {/* <img src={logoFE} alt="logo" style={styles.logoImg} /> */}
          <div style={styles.logoCircle}>FE</div>
          <div>
            <p style={styles.logoNombre}>FENomina</p>
            <p style={styles.logoSub}>ERP System</p>
          </div>
        </div>

        {/**/}
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navItem,
                backgroundColor: isActive ? '#f0f0f0' : 'transparent',
                color: isActive ? '#0B662A' : '#ffffff',
                fontWeight: isActive ? '700' : '400',
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/**/}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={18} />
          Salir
        </button>
      </aside>

      {/**/}
      <div style={styles.main}>
        {/**/}
        <header style={styles.header}>
          <div /> {/**/}
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {usuario?.nombresUsuario?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={styles.userName}>
                {usuario?.nombresUsuario} {usuario?.apellidosUsuario}
              </p>
              <p style={styles.userCargo}>{usuario?.cargoUsuario}</p>
            </div>
          </div>
        </header>

        {/**/}
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  sidebar: {
    width: '220px',
    backgroundColor: '#272525',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    flexShrink: 0,
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 20px 28px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '16px',
  },
  logoCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#0B662A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '14px',
    flexShrink: 0,
  },
  logoNombre: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '15px',
    lineHeight: 1.2,
  },
  logoSub: {
    color: '#A3A3A3',
    fontSize: '11px',
    fontWeight: '400',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 12px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '13px',
    fontFamily: 'Nunito, sans-serif',
    transition: 'background-color 0.2s',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 12px',
    padding: '10px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '13px',
    fontFamily: 'Nunito, sans-serif',
    cursor: 'pointer',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: '60px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    borderBottom: '1px solid #D0D0D0',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#0B662A',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '15px',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#272525',
    lineHeight: 1.2,
  },
  userCargo: {
    fontSize: '11px',
    color: '#A3A3A3',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '28px',
  },
};