import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { ScrollText, ChevronLeft, UserRound, Search } from 'lucide-react';

/* ─── MOCK DATA ──────────────────────────────────────────── */
const MOCK_LOGS = [
  { id: 1,  fecha: '2025-01-12', usuario: 'yrodri',       accion: 'Creo NOVEDAD para JHON RODRIGUEZ'           },
  { id: 2,  fecha: '2025-01-12', usuario: 'yrodri',       accion: 'Creo NOVEDAD para JHON RODRIGUEZ'           },
  { id: 3,  fecha: '2025-01-12', usuario: 'alchap',       accion: 'Creo NOVEDAD para JHON RODRIGUEZ'           },
  { id: 4,  fecha: '2025-01-12', usuario: 'pepitoperez',  accion: 'Cambio el estado a RETIRADO de PEPITO PEREZ'},
  { id: 5,  fecha: '2025-01-12', usuario: 'camilocas',    accion: 'Cambio el estado a RETIRADO de PEPITO PEREZ'},
  { id: 6,  fecha: '2025-01-12', usuario: 'camilocas',    accion: 'Cambio el estado a RETIRADO de PEPITO PEREZ'},
  { id: 7,  fecha: '2025-01-12', usuario: 'camilacas',    accion: 'Cambio el estado a RETIRADO de PEPITO PEREZ'},
  { id: 8,  fecha: '2025-01-12', usuario: 'camilocas',    accion: 'Cambio el estado a RETIRADO de PEPITO PEREZ'},
  { id: 9,  fecha: '2025-01-15', usuario: 'yrodri',       accion: 'Actualizo salario de ANA LOPEZ'             },
  { id: 10, fecha: '2025-01-15', usuario: 'alchap',       accion: 'Creo empleado CARLOS RODRIGUEZ'             },
  { id: 11, fecha: '2025-01-20', usuario: 'pepitoperez',  accion: 'Elimino novedad de LUIS DIAZ'               },
  { id: 12, fecha: '2025-01-20', usuario: 'camilocas',    accion: 'Cambio el estado a ACTIVO de MARIA HERNANDEZ'},
  { id: 13, fecha: '2025-02-01', usuario: 'yrodri',       accion: 'Creo NOVEDAD para ELENA TORRES'             },
  { id: 14, fecha: '2025-02-01', usuario: 'alchap',       accion: 'Actualizo datos de JORGE RAMIREZ'           },
  { id: 15, fecha: '2025-02-05', usuario: 'pepitoperez',  accion: 'Creo empleado PEDRO GARCIA'                 },
  { id: 16, fecha: '2025-02-05', usuario: 'camilacas',    accion: 'Cambio el estado a INACTIVO de LAURA GONZALEZ'},
  { id: 17, fecha: '2025-02-10', usuario: 'yrodri',       accion: 'Creo NOVEDAD para DAVID MARTINEZ'           },
  { id: 18, fecha: '2025-02-10', usuario: 'alchap',       accion: 'Actualizo cargo de IFEANYI RICHARDSON'      },
  { id: 19, fecha: '2025-02-15', usuario: 'camilocas',    accion: 'Creo NOVEDAD para VICTORIA IMOSEMI'         },
  { id: 20, fecha: '2025-02-15', usuario: 'pepitoperez',  accion: 'Cambio el estado a RETIRADO de OTOR JOHN'   },
];

const OPCIONES_PAGINA = [10, 25, 50];

export default function LogsPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [busqueda,  setBusqueda]  = useState('');
  const [fecha,     setFecha]     = useState('');
  const [pagina,    setPagina]    = useState(0);
  const [porPagina, setPorPagina] = useState(10);

  const handlePorPagina = (v) => { setPorPagina(v); setPagina(0); };

  const filtrados = MOCK_LOGS.filter(r => {
    const matchTexto = busqueda === '' ||
      `${r.usuario} ${r.accion}`.toLowerCase().includes(busqueda.toLowerCase());
    const matchFecha = fecha === '' || r.fecha === fecha;
    return matchTexto && matchFecha;
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const datosPagina  = filtrados.slice(pagina * porPagina, pagina * porPagina + porPagina);

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ScrollText size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Logs FENómina</h2>
            <p style={styles.subtitulo}>Revisa la trazabilidad de cambios que se han hecho en el sistema FENómina</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}><UserRound size={22} color="#A3A3A3" /></div>
          <div>
            <p style={styles.perfilNombre}>{nombre}</p>
            <p style={styles.perfilCargo}>{cargo}</p>
          </div>
        </div>
      </div>

      {/* Volver */}
      <button style={styles.volverBtn} onClick={() => navigate(`/empresas/${id}`)}>
        <ChevronLeft size={16} color="#272525" />
        <span>Volver</span>
      </button>

      {/* Toolbar */}
      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>{MOCK_LOGS.length}</p>
          <p style={styles.totalLabel}>Registros totales</p>
        </div>
        <div style={styles.searchGroup}>
          {/* Búsqueda por texto */}
          <div style={styles.searchBox}>
            <Search size={14} color="#A3A3A3" />
            <input
              style={styles.searchInput}
              placeholder="Ingresa palabra de búsqueda"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
            />
          </div>
          {/* Búsqueda por fecha */}
          <div style={styles.fechaBox}>
            <input
              type="date"
              style={styles.fechaInput}
              value={fecha}
              onChange={(e) => { setFecha(e.target.value); setPagina(0); }}
            />
          </div>
        </div>
      </div>

      {/* Resultados por página */}
      <div style={styles.porPaginaRow}>
        <span style={styles.porPaginaLabel}>Resultados por página:</span>
        <select
          value={porPagina}
          onChange={(e) => handlePorPagina(Number(e.target.value))}
          style={styles.porPaginaSelect}
        >
          {OPCIONES_PAGINA.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Card tabla */}
      <div style={styles.card}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Nombre de usuario</th>
                <th style={styles.th}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {datosPagina.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#A3A3A3' }}>
                    Sin resultados
                  </td>
                </tr>
              ) : datosPagina.map((r, index) => (
                <tr key={r.id} style={index % 2 === 0 ? styles.trPar : styles.trImpar}>
                  <td style={styles.td}>{r.fecha}</td>
                  <td style={styles.td}>{r.usuario}</td>
                  <td style={styles.td}>{r.accion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
  container:       { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' },
  header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:          { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:       { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:       { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:          { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  perfilNombre:    { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:     { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  volverBtn:       { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0, width: 'fit-content' },

  toolbarCard:     { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalNum:        { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:      { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  searchGroup:     { display: 'flex', alignItems: 'center', gap: '12px' },
  fechaBox:        { border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff' },
  fechaInput:      { border: 'none', outline: 'none', fontSize: '13px', fontFamily: 'Nunito, sans-serif', color: '#272525', cursor: 'pointer' },
  searchBox:       { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '280px' },
  searchInput:     { border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },

  porPaginaRow:    { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' },
  porPaginaLabel:  { fontSize: '13px', color: '#A3A3A3', fontFamily: 'Nunito, sans-serif' },
  porPaginaSelect: { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '6px 28px 6px 12px', fontSize: '13px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23272525\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundColor: '#fff' },

  card:            { backgroundColor: '#fff', borderRadius: '16px', padding: '24px' },
  tableWrapper:    { overflowX: 'auto', width: '100%' },
  table:           { width: '100%', borderCollapse: 'collapse', minWidth: '600px' },

  /* Header verde sólido como en el mockup */
  th:              { fontSize: '13px', fontWeight: '700', color: '#fff', backgroundColor: '#0B662A', padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' },
  td:              { fontSize: '13px', color: '#272525', padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' },

  trPar:           { backgroundColor: '#fff' },
  trImpar:         { backgroundColor: '#FAFAFA' },
  paginacion:      { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' },
  pageBtn:         { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif' },
  pageBtnActivo:   { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
};
