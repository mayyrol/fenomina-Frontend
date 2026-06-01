import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { ScrollText, ChevronLeft, UserRound, Search } from 'lucide-react';
import historicosService from "../../../services/historicosService";

export default function LogsPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [datos,    setDatos]    = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [fecha,    setFecha]    = useState('');

  useEffect(() => {
    setCargando(true);
    setError(false);
    historicosService.getSystemLogs({
      username: busqueda || undefined,
      desde:    fecha ? `${fecha}T00:00:00` : undefined,
      hasta:    fecha ? `${fecha}T23:59:59` : undefined,
    })
    .then(res => setDatos(res.data))
    .catch(() => setError(true))
    .finally(() => setCargando(false));
  }, [busqueda, fecha]);

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ScrollText size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Logs FENómina</h2>
            <p style={styles.subtitulo}>Revisa la trazabilidad de cambios en el sistema FENómina</p>
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

      <button style={styles.volverBtn} onClick={() => navigate(-1)}>
        <ChevronLeft size={16} color="#272525" />
        <span>Volver</span>
      </button>

      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>{datos.length}</p>
          <p style={styles.totalLabel}>Últimos registros</p>
        </div>
        <div style={styles.searchGroup}>
          <div style={styles.searchBox}>
            <Search size={14} color="#A3A3A3" />
            <input
              style={styles.searchInput}
              placeholder="Buscar por usuario"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div style={styles.fechaBox}>
            <input
              type="date"
              style={styles.fechaInput}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div style={styles.card}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Usuario</th>
                <th style={styles.th}>Módulo</th>
                <th style={styles.th}>Acción</th>
                <th style={styles.th}>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#A3A3A3' }}>Cargando...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#e53e3e' }}>Error al cargar los datos</td></tr>
              ) : datos.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#A3A3A3' }}>Sin resultados</td></tr>
              ) : datos.map((r, index) => (
                <tr key={r.auditId ?? index} style={index % 2 === 0 ? styles.trPar : styles.trImpar}>
                  <td style={styles.td}>{r.timestamp ? r.timestamp.substring(0, 10) : '-'}</td>
                  <td style={styles.td}>{r.username ?? '-'}</td>
                  <td style={styles.td}>{fmtTabla(r.tablaAfectada)}</td>
                  <td style={styles.td}>{fmtOperacion(r.operacion)}</td>
                  <td style={styles.td}>{r.descripcion ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const fmtOperacion = (v) => {
  if (!v) return '-';
  const map = { INSERT: 'Registro creado', UPDATE: 'Registro actualizado', DELETE: 'Registro eliminado' };
  return map[v.toUpperCase()] ?? v;
};

const fmtTabla = (v) => {
  if (!v) return '-';
  const map = {
    proceso_liquidacion: 'Proceso de nómina',
    nomina_cabecera:     'Nómina',
    novedad:             'Novedad',
    empleado:            'Empleado',
    empresa:             'Empresa',
    concepto_nomina:     'Concepto de nómina',
    parametro_general:   'Parámetro general',
  };
  return map[v.toLowerCase()] ?? v;
};
/*
const fmtDescripcion = (r) => {
  const modulo  = fmtTabla(r.tablaAfectada);
  const accion  = fmtOperacion(r.operacion).toLowerCase();
  const usuario = r.username ?? 'un usuario';
  if (!modulo || !accion) return r.descripcion ?? '-';
  return `${usuario} realizó la acción "${accion}" en el módulo ${modulo}`;
};
*/

const styles = {
  container:    { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:       { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:    { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:    { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:       { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  perfilNombre: { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:  { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  volverBtn:    { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0, width: 'fit-content' },
  toolbarCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalNum:     { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:   { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  searchGroup:  { display: 'flex', alignItems: 'center', gap: '12px' },
  fechaBox:     { border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff' },
  fechaInput:   { border: 'none', outline: 'none', fontSize: '13px', fontFamily: 'Nunito, sans-serif', color: '#272525', cursor: 'pointer' },
  searchBox:    { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '280px' },
  searchInput: { border: 'none', outline: 'none', boxShadow: 'none', backgroundColor: 'transparent', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  card:         { backgroundColor: '#fff', borderRadius: '16px', padding: '24px' },
  tableWrapper: { overflowX: 'auto', width: '100%' },
  table:        { width: '100%', borderCollapse: 'collapse', minWidth: '600px' },
  th:           { fontSize: '13px', fontWeight: '700', color: '#fff', backgroundColor: '#0B662A', padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' },
  td:           { fontSize: '13px', color: '#272525', padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' },
  trPar:        { backgroundColor: '#fff' },
  trImpar:      { backgroundColor: '#FAFAFA' },
};