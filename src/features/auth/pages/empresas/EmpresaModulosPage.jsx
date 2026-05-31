import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../store/authStore';
import { Building2, Users, FileText, CreditCard, Coins, Globe, ChevronLeft, UserRound  } from 'lucide-react';
import empresasService from '../../../../services/empresasService';

function Carpeta({ children }) {
  return (
    <svg viewBox="0 0 160 130" width="100%" xmlns="http://www.w3.org/2000/svg">

      <path
        d="M0,18 Q0,12 6,12 L58,12 Q64,12 67,18 L72,24 L154,24 Q160,24 160,30 L160,124 Q160,130 154,130 L6,130 Q0,130 0,124 Z"
        fill="#DDE8DC"
      />
      <foreignObject x="10" y="30" width="140" height="90">
        <div xmlns="http://www.w3.org/1999/xhtml"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          {children}
        </div>
      </foreignObject>
    </svg>
  );
}

const MODULOS_BASE = [
  { id: 'info',      label: 'Información Empresa',  icon: <Building2 size={52} color="#0B662A" />,  ruta: 'info',      siempre: true },
  { id: 'empleados', label: 'Empleados',             icon: <Users size={52} color="#0B662A" />,      ruta: 'empleados', siempre: true },
  { id: 'nominas',   label: 'Nóminas',               icon: <FileText size={52} color="#0B662A" />,   ruta: 'nominas',   campo: 'aplicaNomina' },
  { id: 'primas',    label: 'Primas',                icon: <CreditCard size={52} color="#0B662A" />, ruta: 'primas',    campo: 'aplicaPrima' },
  { id: 'cesantias', label: 'Cesantías e Intereses', icon: <Coins size={52} color="#0B662A" />,      ruta: 'cesantias', campo: 'aplicaCesantias' },
  { id: 'reportes',  label: 'Reportes',              icon: <Globe size={52} color="#0B662A" />,      ruta: 'reportes',  siempre: true },
];

export default function EmpresaModulosPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { usuario } = useAuthStore();
  const [hoverVolver, setHoverVolver] = useState(false);
  const [empresa, setEmpresa] = useState(null);
  const [cargando, setCargando] = useState(true);

  const inicial = usuario?.nombresUsuario?.charAt(0).toUpperCase() ?? 'U';
  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

  useEffect(() => {
    empresasService.getEmpresaById(id)
      .then(({ data }) => setEmpresa(data))
      .catch(() => setEmpresa(null))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <p>Cargando...</p>;
  if (!empresa) return <p>Empresa no encontrada.</p>;

  const modulosVisibles = MODULOS_BASE.filter(m =>
    m.siempre || (empresa[m.campo] === true)
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Empresas</h2>
            <p style={styles.subtitulo}>Selecciona el módulo al que deseas acceder</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}>
            <UserRound size={22} color="#A3A3A3" />
          </div>
          <div>
            <p style={styles.perfilNombre}>{nombre}</p>
            <p style={styles.perfilCargo}>{cargo}</p>
          </div>
        </div>
      </div>

      <button
        style={{ ...styles.volverBtn, color: hoverVolver ? '#0B662A' : '#272525' }}
        onClick={() => navigate('/empresas')}
        onMouseEnter={() => setHoverVolver(true)}
        onMouseLeave={() => setHoverVolver(false)}
      >
        <ChevronLeft size={16} color={hoverVolver ? '#0B662A' : '#272525'} />
        <span>Volver</span>
      </button>

      <div style={styles.areaContenido}>
        <div style={styles.card}>
          <div style={styles.grid}>
            {modulosVisibles.map((modulo) => (
              <div key={modulo.id} style={styles.moduloCard}
                onClick={() => navigate(`/empresas/${id}/${modulo.ruta}`)}>
                <Carpeta>{modulo.icon}</Carpeta>
                <p style={styles.moduloLabel}>{modulo.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container:    { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', height: '100%' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  titulo:       { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:    { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:    { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:       { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', color: '#272525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  perfilNombre: { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:  { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  volverBtn:    { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0, width: 'fit-content' },
  areaContenido:{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card:         { backgroundColor: '#fff', borderRadius: '16px', padding: '60px 40px', width: '100%', boxSizing: 'border-box' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px 32px' },
  moduloCard:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', width: '100%', maxWidth: '220px', margin: '0 auto' },
  moduloLabel:  { fontSize: '15px', fontWeight: '600', color: '#272525', textAlign: 'center', margin: 0 },
};