import { useNavigate } from 'react-router-dom';
import { useEmpresas } from '../../hooks/useEmpresas';
import { useAuthStore } from '../../../../store/authStore';
import { Building2, Plus, Search } from 'lucide-react';
import { useState } from 'react';

function Carpeta({ children, dashed = false }) {
  return (
    <svg viewBox="0 0 120 100" width="180" height="150" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0,14 Q0,10 4,10 L44,10 Q48,10 50,14 L54,18 L116,18 Q120,18 120,22 L120,96 Q120,100 116,100 L4,100 Q0,100 0,96 Z"
        fill="#E8F0E9"
        stroke={dashed ? '#0B662A' : 'none'}
        strokeWidth={dashed ? '2' : '0'}
        strokeDasharray={dashed ? '6,3' : 'none'}
      />
      <foreignObject x="20" y="28" width="80" height="58">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
        >
          {children}
        </div>
      </foreignObject>
    </svg>
  );
}

export default function EmpresasPage() {
  const navigate    = useNavigate();
  const { usuario } = useAuthStore();
  const {
    empresas, total, totalPaginas, cargando, error,
    pagina, setPagina,
    busqueda, setBusqueda,
    size, setSize,
  } = useEmpresas();
  const [fechaFiltro, setFechaFiltro] = useState('');


  const inicial = usuario?.nombresUsuario?.charAt(0).toUpperCase() ?? 'U';
  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

  if (error) return <p>Error al cargar empresas</p>;

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Empresas</h2>
            <p style={styles.subtitulo}>Selecciona la empresa que deseas gestionar</p>
          </div>
        </div>

        {/* Perfil usuario */}
        <div style={styles.perfilBox}>
          <div style={styles.avatar}>{inicial}</div>
          <div>
            <p style={styles.perfilNombre}>{nombre}</p>
            <p style={styles.perfilCargo}>{cargo}</p>
          </div>
        </div>
      </div>

      {/* Toolbar en bloque blanco */}
      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>{total}</p>
          <p style={styles.totalLabel}>Total companies</p>
        </div>
        <div style={styles.filtrosBox}>
          <div style={styles.searchBox}>
            <Search size={14} color="#A3A3A3" />
            <input
              style={styles.searchInput}
              placeholder="Buscar empresa por palabra clave"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
            />
          </div>
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            style={styles.dateInput}
          />
        </div>
      </div>

      {/* Card blanco contenedor */}
      <div style={styles.card}>

        {/* Grid header: título + showing per page */}
        <div style={styles.gridHeader}>
          <span style={styles.gridTitle}>All Companies</span>
          <div style={styles.showingBox}>
            <span>Showing</span>
            <select
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPagina(0); }}
              style={styles.select}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>per page</span>
          </div>
        </div>

        {/* Grid */}
        {cargando ? (
          <p style={{ padding: '20px' }}>Cargando...</p>
        ) : (
          <div style={styles.grid}>

            {/* Tarjeta añadir */}
            <div style={styles.gridCard} onClick={() => navigate('/empresas/crear')}>
              <Carpeta dashed={true}>
                <Plus size={36} color="#0B662A" />
              </Carpeta>
              <p style={styles.cardLabel}>Añadir nueva empresa</p>
            </div>

            {/* Tarjetas empresas */}
            {empresas.map((empresa) => (
              <div key={empresa.empresaId} style={styles.gridCard} onClick={() => navigate(`/empresas/${empresa.empresaId}`)}>
                <Carpeta>
                  <Building2 size={36} color="#0B662A" />
                </Carpeta>
                <p style={styles.cardLabel}>{empresa.nombreEmpresa}</p>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        <div style={styles.paginacion}>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => setPagina(i)}
              style={{ ...styles.pageBtn, ...(pagina === i ? styles.pageBtnActivo : {}) }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPagina(totalPaginas - 1)}
            style={styles.pageBtn}
            disabled={pagina === totalPaginas - 1}
          >
            {'>>'}
          </button>
        </div>

      </div>

    </div>
  );
}

const styles = {
  container:     { padding: '0', fontFamily: 'Nunito, sans-serif' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  titulo:        { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:     { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:     { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:        { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', color: '#272525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  perfilNombre:  { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:   { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  totalNum:      { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:    { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  card:          { backgroundColor: '#fff', borderRadius: '16px', padding: '24px 32px' },
  gridHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  gridTitle:     { fontSize: '16px', fontWeight: '700', color: '#272525' },
  showingBox:    { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#272525' },
  select:        { border: '1px solid #D0D0D0', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  grid:          { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '24px', marginBottom: '32px' },
  gridCard:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  cardLabel:     { fontSize: '13px', fontWeight: '600', color: '#272525', textAlign: 'center', margin: 0, maxWidth: '180px' },
  paginacion:    { display: 'flex', justifyContent: 'center', gap: '6px' },
  pageBtn:       { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif' },
  pageBtnActivo: { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
  toolbarCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  filtrosBox:   { display: 'flex', alignItems: 'center', gap: '12px' },
  searchBox:    { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '380px' },
  searchInput:  { border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  dateInput:    { border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', cursor: 'pointer', color: '#272525' },
};