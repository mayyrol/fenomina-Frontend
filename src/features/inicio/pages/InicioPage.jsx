import { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import imagenFondo from '../../../assets/oficina3.png';
import iconNominas from '../../../assets/icon_nominas.png';
import iconPrimas from '../../../assets/icon_primas.png';
import iconCesantias from '../../../assets/icon_cesantias.png';
import iconReportes from '../../../assets/icon_reportes.png';
import heroIllustration from '../../../assets/hero_illustration.png';
import { UserRound } from 'lucide-react';

const servicios = [
  { label: 'Liquidación de Nóminas',    icon: iconNominas   },
  { label: 'Liquidación de Primas',     icon: iconPrimas    },
  { label: 'Liquidación de Cesantías',  icon: iconCesantias },
  { label: 'Reportes de Liquidaciones', icon: iconReportes  },
];

function getDiaSemana() {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const hoy = new Date();
  return `Hoy es ${dias[hoy.getDay()]}, ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
}

export default function InicioPage() {
  const { usuario } = useAuthStore();
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div style={styles.pageBackground}>
      <div style={styles.pageOverlay}>

        {/* Encabezado */}
        <div style={styles.encabezado}>
          <div>
            <p style={styles.bienvenidaTexto}>
              Bienvenido, {usuario?.nombresUsuario} {usuario?.apellidosUsuario} 👋
            </p>
            <p style={styles.fecha}>{getDiaSemana()}</p>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              <UserRound size={20} color="#A3A3A3" />
            </div>
            <div>
              <p style={styles.userName}>
                {usuario?.nombresUsuario} {usuario?.apellidosUsuario}
              </p>
              <p style={styles.userCargo}>{usuario?.cargoUsuario}</p>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div style={styles.hero}>
          <div style={styles.heroTexto}>
            <h1 style={styles.heroTitulo}>Gestiona tus procesos de nómina eficientemente</h1>
            <p style={styles.heroDesc}>
              Nuestra herramienta de Gestión de Nóminas Colombianas te ayudará a calcular
              de forma automática los conceptos de reporte de nómina, generando
              desprendibles que podrás proporcionarle a las empresas para el pago de cada
              uno de sus empleados mes a mes.
            </p>
          </div>
          <div style={styles.heroIcon}>
            <img src={heroIllustration} alt="FENomina dashboard" style={styles.heroImg} />
          </div>
        </div>

        {/* Servicios header */}
        <div style={styles.serviciosHeader}>
          <span style={styles.serviciosLabel}>Servicios</span>
          <p style={styles.serviciosDesc}>
            FENomina ERP System te ofrece las siguientes funcionalidades para que gestiones
            los procesos de Liquidación de Nóminas de forma más eficiente:
          </p>
        </div>

        {/* Servicios grid */}
        <div style={styles.serviciosGrid}>
          {servicios.map((s, i) => (
            <div
              key={s.label}
              style={{
                ...styles.servicioCard,
                ...(hoveredCard === i ? styles.servicioCardHovered : {}),
              }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <p style={styles.servicioLabel}>{s.label}</p>
              <img src={s.icon} alt={s.label} style={styles.servicioImg} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    backgroundImage: `url(${imagenFondo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'local',
    minHeight: '100vh',
    width: '100%',
  },
  pageOverlay: {
    background: 'rgba(242, 250, 245, 0.86)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '24px',
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  encabezado: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0',
  },
  bienvenidaTexto: { fontSize: '17px', fontWeight: '800', color: '#1a3a28' },
  fecha: { fontSize: '12px', color: '#6a8a78', marginTop: '2px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar: {
    width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#D0D0D0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userName: { fontSize: '13px', fontWeight: '700', color: '#1a3a28', lineHeight: 1.2 },
  userCargo: { fontSize: '11px', color: '#6a8a78' },
  hero: {
    background: 'rgba(2, 36, 18, 0.78)',
    borderRadius: '16px',
    border: '1px solid rgba(45,190,108,0.2)',
    boxShadow: '0 8px 32px rgba(3,65,35,0.3)',
    padding: '36px 40px',
    minHeight: '210px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    overflow: 'hidden',
  },
  heroTexto: { flex: 1, maxWidth: '55%' },
  heroTitulo: {
    fontSize: '30px', fontWeight: '800', color: '#ffffff',
    marginBottom: '16px', lineHeight: 1.3,
  },
  heroDesc: { fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75 },
  heroIcon: { flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  heroImg: {
    height: '250px',
    width: 'auto',
    objectFit: 'contain',
    filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.35)) drop-shadow(0px 4px 8px rgba(45,190,108,0.3))',
  },
  serviciosHeader: { display: 'flex', alignItems: 'flex-start', gap: '20px' },
  serviciosLabel: {
    backgroundColor: '#034123', color: '#ffffff',
    padding: '8px 20px', borderRadius: '6px', fontSize: '16px',
    fontWeight: '700', whiteSpace: 'nowrap', fontFamily: 'Nunito, sans-serif',
    boxShadow: '0 4px 14px rgba(3,65,35,0.3)', letterSpacing: '0.5px',
  },
  serviciosDesc: { fontSize: '14px', color: '#2a4a36', lineHeight: 1.6, paddingTop: '4px' },
  serviciosGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' },
  servicioCard: {
    background: 'rgba(255,255,255,0.92)',
    boxShadow: '0 6px 24px rgba(3,65,35,0.12), 0 1px 0 rgba(255,255,255,0.9) inset',
    border: '1.5px solid rgba(3,65,35,0.1)',
    borderRadius: '18px',
    padding: '26px 30px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '16px', cursor: 'default',
  },
  servicioCardHovered: {
    background: 'rgba(255,255,255,0.99)',
    boxShadow: '0 14px 40px rgba(3,65,35,0.2), 0 1px 0 rgba(255,255,255,0.95) inset',
  },
  servicioLabel: {
    fontSize: '17px', fontWeight: '800', color: '#034123',
    maxWidth: '55%', lineHeight: 1.4,
  },
  servicioImg: {
    width: '155px',
    height: '155px',
    objectFit: 'contain',
    flexShrink: 0,
    filter: 'drop-shadow(0px 8px 12px rgba(3,65,35,0.28)) drop-shadow(0px 2px 4px rgba(0,0,0,0.15))',
  },
};