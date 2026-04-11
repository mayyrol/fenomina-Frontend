import { useState } from 'react';
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
import logoFE from '../assets/logo_fe.png';
import logoERP from '../assets/logoerp.png'; 

export default function MainLayout() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

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

  const esSuperAdmin = usuario?.rolUsuario === 'SUPER_ADMIN';

  const navItems = [
    { to: '/inicio', label: 'Inicio', icon: <LayoutGrid size={16} /> },
    { to: '/empresas', label: 'Empresas', icon: <Building2 size={16} /> },
    ...(esSuperAdmin ? [{ to: '/parametros', label: 'Parámetros Generales', icon: <Settings2 size={16} /> }] : []),
    ...(esSuperAdmin ? [{ to: '/usuarios', label: 'Usuarios', icon: <UserRound size={16} /> }] : []),
    { to: '/logs', label: 'Logs FENomina', icon: <ScrollText size={16} /> },
  ];

  return (
    <div style={styles.container}>
      {/**/}
      <aside
        style={{
          ...styles.sidebar,
          width: sidebarExpanded ? '220px' : '64px',
          transition: 'width 0.25s ease',
        }}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo */}
        <div style={styles.logoArea}>
          <img src={logoFE} alt="FENomina ERP" style={styles.logoImg} />
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={!sidebarExpanded ? item.label : ''}
              style={({ isActive }) => ({
                ...styles.navItem,
                backgroundColor: isActive ? 'rgba(14,78,30,0.1)' : 'transparent',
                color: isActive ? '#0E4E1E' : '#0F172A',
                justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              })}
            >
              {item.icon}
              {sidebarExpanded && (
                <span style={styles.navLabel}>{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            ...styles.logoutBtn,
            justifyContent: 'center',
          }}
          title={!sidebarExpanded ? 'Salir' : ''}
        >
          <LogOut size={16} />
          {sidebarExpanded && <span style={styles.navLabel}>Salir</span>}
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
    width: '64px',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0',
    flexShrink: 0,
    borderRight: '1px solid #D0D0D0',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 10,
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 14px 20px 14px',
    width: '100%',
  },
  logoImg: {       
    height: '50px',
    objectFit: 'contain',
    maxWidth: '100%',
  },
  logoTextos: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
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
    color: '#272525',
  fontWeight: '800',
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
    gap: '2px',
    padding: '8px 10px',
    flex: 1,
    width: '100%',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 10px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '13px',
    fontFamily: 'Nunito, sans-serif',
    transition: 'background-color 0.2s, color 0.2s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  navLabel: {
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'Nunito, sans-serif',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: 'calc(100% - 20px)',
    margin: '0 10px',
    padding: '10px 14px',
    backgroundColor: 'rgba(14, 78, 30, 0.15)', 
    border: 'none',
    borderRadius: '10px',
    color: '#0F172A',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'Nunito, sans-serif',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#F0F2F5',
  },
  header: {
    height: '60px',
    backgroundColor: 'transparent',
    display: 'none',  
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 28px',
    borderBottom: 'none',
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
    padding: '20px 28px',
  },
};