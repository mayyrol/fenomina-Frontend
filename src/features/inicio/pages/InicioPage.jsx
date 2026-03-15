import { useAuthStore } from '../../../store/authStore';
import imagenPrincipal from '../../../assets/erpimagenprincipal_inicio.png';
import imgLiquiNomina from '../../../assets/liquinomina_inicio.png';
import imgLiquiPrima from '../../../assets/liquiprima_inicio.png';
import imgLiquiCesantias from '../../../assets/liquicesantias_inicio.png';
import imgReporte from '../../../assets/reporteliquis_inicio.png';
import { UserRound } from 'lucide-react';

const servicios = [
  { label: 'Liquidación de Nóminas', img: imgLiquiNomina, oscuro: false },
  { label: 'Liquidación de Primas', img: imgLiquiPrima, oscuro: false },
  { label: 'Liquidación de Cesantías', img: imgLiquiCesantias, oscuro: false},
  { label: 'Reportes de Liquidaciones', img: imgReporte, oscuro: false },
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

  return (
    <div style={styles.container}>
        {/* Encabezado — solo visible en inicio */}
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
        <div style={styles.heroImagen}>
          <img src={imagenPrincipal} alt="FENomina ERP" style={styles.imgPrincipal} />
        </div>
      </div>

      {/* Servicios */}
      <div style={styles.serviciosHeader}>
        <span style={styles.serviciosLabel}>Servicios</span>
        <p style={styles.serviciosDesc}>
          FENomina ERP System te ofrece las siguientes funcionalidades para que gestiones
          los procesos de Liquidación de Nóminas de forma más eficiente:
        </p>
      </div>

      <div style={styles.serviciosGrid}>
        {servicios.map((s) => (
          <div
            key={s.label}
            style={{
              ...styles.servicioCard,
              backgroundColor: s.oscuro ? '#272525' : '#ffffff',
              border: s.oscuro ? 'none' : '1px solid #D0D0D0',
            }}
          >
            <p style={{ ...styles.servicioLabel, color: s.oscuro ? '#ffffff' : '#272525' }}>
              {s.label}
            </p>
            <img src={s.img} alt={s.label} style={styles.servicioImg} />
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  bienvenida: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  bienvenidaTexto: { fontSize: '16px', fontWeight: '800', color: '#272525' },
  fecha: { fontSize: '12px', color: '#A3A3A3', marginTop: '2px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar: {
    width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e0e0e0',
    color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '15px',
  },
  userName: { fontSize: '13px', fontWeight: '700', color: '#272525', lineHeight: 1.2 },
  userCargo: { fontSize: '11px', color: '#A3A3A3' },
  hero: {
    backgroundColor: '#ffffff', borderRadius: '12px',
    border: '1px solid #D0D0D0', padding: '32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
  },
  heroTexto: { flex: 1, maxWidth: '55%' },
  heroTitulo: { fontSize: '28px', fontWeight: '800', color: '#272525', marginBottom: '16px', lineHeight: 1.3 },
  heroDesc: { fontSize: '14px', color: '#555', lineHeight: 1.7 },
  heroImagen: { flex: 1, display: 'flex', justifyContent: 'center' },
  imgPrincipal: { maxWidth: '100%', maxHeight: '250px', objectFit: 'contain' },
  serviciosHeader: {
    display: 'flex', alignItems: 'flex-start', gap: '20px',
  },
  serviciosLabel: {
    backgroundColor: '#268245', color: '#ffffff',
    padding: '8px 20px', borderRadius: '6px', fontSize: '16px',
    fontWeight: '700', whiteSpace: 'nowrap', fontFamily: 'Nunito, sans-serif',
    },
  serviciosDesc: { fontSize: '14px', color: '#555', lineHeight: 1.6, paddingTop: '4px' }, 
  serviciosGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', },
  servicioCard: {
    borderRadius: '12px', padding: '20px 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '16px', cursor: 'default',
  },
  servicioLabel: { fontSize: '18px', fontWeight: '700', maxWidth: '55%', lineHeight: 1.4 },
  servicioImg: { height: '70px', objectFit: 'contain' },
  encabezado: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '4px',
  },
  bienvenidaTexto: { fontSize: '16px', fontWeight: '800', color: '#272525' },
  fecha: { fontSize: '12px', color: '#A3A3A3', marginTop: '2px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  userName: { fontSize: '13px', fontWeight: '700', color: '#272525', lineHeight: 1.2 },
  userCargo: { fontSize: '11px', color: '#A3A3A3' },
};