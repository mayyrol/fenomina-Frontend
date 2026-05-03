import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { CreditCard, Search, ChevronLeft, ChevronDown, UserRound, Pencil, Trash2, Upload, Eye } from 'lucide-react';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import MensajeModal from '../../../../../components/MensajeModal';
import { usePrimaStore } from '../../../../../store/usePrimaStore';
import payrollService from '../../../../../services/payrollService';



const TABS = ['Borrador', 'Cerrado', 'Pendiente por pagar', 'Pagado', 'Anulado'];
const PAGE_SIZE = 10;

const OPCIONES_POR_ESTADO = {
  'Borrador':            ['Borrador', 'Cerrado', 'Anulado'],
  'Cerrado':             ['Cerrado', 'Borrador', 'Anulado'],
  'Pendiente por pagar': ['Pendiente por pagar', 'Pagado', 'Anulado'],
  'Pagado':              ['Pagado', 'Anulado'],
  'Anulado':             ['Anulado'],
};

const formatMiles = (valor) => {
  const str = String(Math.round(valor));
  return '$' + str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

function EstadoSelect({ valor, onChange }) {
  const opciones = OPCIONES_POR_ESTADO[valor] ?? ['Borrador'];
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: '1px solid #D0D0D0', borderRadius: '8px', padding: '6px 28px 6px 10px',
          fontSize: '12px', fontFamily: 'Nunito, sans-serif', outline: 'none',
          appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
          backgroundColor: '#fff', color: '#272525', cursor: 'pointer', backgroundImage: 'none',
        }}
      >
        {opciones.map((e) => <option key={e} value={e}>{e}</option>)}
      </select>
      <ChevronDown size={12} color="#A3A3A3" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    </div>
  );
}

const ESTADO_LABEL = {
  BORRADOR:       'Borrador',
  CERRADO:        'Cerrado',
  PENDIENTE_PAGO: 'Pendiente por pagar',
  PAGADO:         'Pagado',
  ANULADO:        'Anulado',
};

const ESTADO_BACK = {
  'Borrador':           'BORRADOR',
  'Cerrado':            'CERRADO',
  'Pendiente por pagar':'PENDIENTE_PAGO',
  'Pagado':             'PAGADO',
  'Anulado':            'ANULADO',
};

export default function PrimasPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [tab, setTab]                           = useState('Borrador');
  const [busqueda, setBusqueda]                 = useState('');
  const [pagina, setPagina]                     = useState(0);
  const [periodos,  setPeriodos]  = useState([]);
  const [cargando,  setCargando]  = useState(false);
  const [modal, setModal]                       = useState(null);
  const [confirmarEstado, setConfirmarEstado]   = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [confirmarAnulado, setConfirmarAnulado] = useState(false);
  const [cambioEstado, setCambioEstado]         = useState({ periodoId: null, nuevoEstado: null });
  const [periodoEliminar, setPeriodoEliminar]   = useState(null);
  const [hoverLiquidar, setHoverLiquidar]       = useState(false);

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    payrollService.getProcesosPrima(id)
      .then(({ data }) => setPeriodos(data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [id]);
 
  const periodosFiltrados = periodos.filter(p =>
    !p.deletedAt &&
    ESTADO_LABEL[p.estadoProcNomina] === tab &&
    (p.fechaInicioPeriodo?.includes(busqueda) ||
     p.fechaFinPeriodo?.includes(busqueda))
  );

  const totalPaginas   = Math.max(1, Math.ceil(periodosFiltrados.length / PAGE_SIZE));
  const periodosPagina = periodosFiltrados.slice(pagina * PAGE_SIZE, pagina * PAGE_SIZE + PAGE_SIZE);

  const handleEstadoChange = (periodoId, nuevoEstado) => {
    setCambioEstado({ periodoId, nuevoEstado });
    if (nuevoEstado === 'Anulado') setConfirmarAnulado(true);
    else setConfirmarEstado(true);
  };

  const handleConfirmarEstado = async () => {
    try {
      await payrollService.cambiarEstado(
        cambioEstado.periodoId,
        cambioEstado.nuevoEstado
      );
      const { data } = await payrollService.getProcesosPrima(id);
      setPeriodos(data);
      setConfirmarEstado(false);
      setModal('exito');
    } catch {
      setConfirmarEstado(false);
      setModal('error');
    }
  };

  const handleEliminar = (periodo) => {
    setPeriodoEliminar(periodo);
    setConfirmarEliminar(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      await payrollService.eliminarProceso(periodoEliminar.procesoLiquiId);
      const { data } = await payrollService.getProcesosPrima(id);
      setPeriodos(data);
      setConfirmarEliminar(false);
      setModal('exito');
    } catch {
      setConfirmarEliminar(false);
      setModal('error');
    }
  };

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Primas</h2>
            <p style={styles.subtitulo}>Gestiona la liquidación de primas para cada uno de los empleados asociados a la empresa</p>
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
          <p style={styles.totalNum}>{periodosFiltrados.length}</p>
          <p style={styles.totalLabel}>Total reportes</p>
        </div>
        <div style={styles.filtrosBox}>
          <div style={styles.searchBox}>
            <Search size={14} color="#A3A3A3" />
            <input
              style={styles.searchInput}
              placeholder="Buscar prima por palabra clave"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
            />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div style={styles.addBar}>
        <span style={styles.addLabel}>Generar reportes de primas empleados</span>
        <button
          style={{ ...styles.btnLiquidar, background: hoverLiquidar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A', transition: 'background 0.3s ease' }}
          onMouseEnter={() => setHoverLiquidar(true)}
          onMouseLeave={() => setHoverLiquidar(false)}
          onClick={() => navigate(`/empresas/${id}/primas/generar-reporte`)}
        >
          Nuevo proceso de liquidación
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabsBox}>
        {TABS.map((t) => (
          <button
            key={t}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActivo : {}) }}
            onClick={() => { setTab(t); setPagina(0); }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div style={styles.card}>
        <p style={styles.tableTitle}>Histórico Total de Primas por Periodo</p>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Periodo</th>
                {!['Borrador', 'Cerrado'].includes(tab) && (
                  <th style={styles.th}>Empleados incluidos</th>
                )}
                {!['Borrador', 'Cerrado'].includes(tab) && (
                  <th style={styles.th}>Total neto</th>
                )}
                <th style={styles.th}>Fecha de creación proceso</th>
                <th style={styles.th}>Estado</th>
                {['Borrador', 'Cerrado', 'Pendiente por pagar', 'Pagado'].includes(tab) && (
                  <th style={styles.th}>Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {periodosPagina.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      ['Borrador', 'Cerrado'].includes(tab) ? 4 :
                      ['Pendiente por pagar', 'Pagado'].includes(tab) ? 6 :
                      tab === 'Anulado' ? 5 : 4
                    }
                    style={{ textAlign: 'center', padding: '20px', color: '#A3A3A3' }}
                  >
                    Sin resultados
                  </td>
                </tr>
              ) : (
                periodosPagina.map((p, index) => (
                  <tr key={p.procesoLiquiId} style={index % 2 === 0 ? styles.trPar : styles.trImpar}>
                    <td style={styles.td}>{p.fechaInicioPeriodo} - {p.fechaFinPeriodo}</td>
                    {!['Borrador', 'Cerrado'].includes(tab) && (
                      <td style={styles.td}>{p.cantidadEmpleados ?? '-'}</td>
                    )}
                    {!['Borrador', 'Cerrado'].includes(tab) && (
                      <td style={styles.td}>{p.totalNeto ? formatMiles(p.totalNeto) : '-'}</td>
                    )}
                    <td style={styles.td}>{p.createdAt?.split('T')[0]}</td>
                    <td style={styles.td}>
                      {p.estadoProcNomina === 'ANULADO'
                        ? <span style={styles.estadoTexto}>{ESTADO_LABEL[p.estadoProcNomina]}</span>
                        : <EstadoSelect
                            valor={ESTADO_LABEL[p.estadoProcNomina]}
                            onChange={(v) => handleEstadoChange(p.procesoLiquiId, ESTADO_BACK[v])}
                          />
                      }
                    </td>
                    {['Borrador', 'Cerrado', 'Pendiente por pagar', 'Pagado'].includes(tab) && (
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                          {p.estadoProcNomina === 'BORRADOR' && (
                            <>
                              <button style={styles.iconBtn}
                                onClick={() => navigate(`/empresas/${id}/primas/${p.procesoLiquiId}/desprendibles`)}
                                title="Editar">
                                <Pencil size={16} color="#0B662A" />
                              </button>
                              <button style={styles.iconBtn}
                                onClick={() => handleEliminar(p)}
                                title="Eliminar">
                                <Trash2 size={16} color="#E53E3E" />
                              </button>
                            </>
                          )}
                          {p.estadoProcNomina === 'CERRADO' && (
                            <button style={styles.iconBtn}
                              onClick={() => navigate(`/empresas/${id}/primas/${p.procesoLiquiId}/liquidar`)}
                              title="Liquidar">
                              <Upload size={16} color="#0B662A" />
                            </button>
                          )}
                          {['PENDIENTE_PAGO', 'PAGADO'].includes(p.estadoProcNomina) && (
                            <button style={styles.iconBtn}
                              onClick={() => navigate(`/empresas/${id}/primas/${p.procesoLiquiId}/resultado`)}
                              title="Ver reportes">
                              <Eye size={16} color="#0B662A" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div style={styles.paginacion}>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button key={i} onClick={() => setPagina(i)} style={{ ...styles.pageBtn, ...(pagina === i ? styles.pageBtnActivo : {}) }}>{i + 1}</button>
          ))}
          <button onClick={() => setPagina(totalPaginas - 1)} style={styles.pageBtn} disabled={pagina === totalPaginas - 1}>{'>>'}</button>
        </div>
      </div>

      {/* Modales */}
      <ConfirmarCambiosModal visible={confirmarEstado} onCancelar={() => setConfirmarEstado(false)} onConfirmar={handleConfirmarEstado} titulo="¿Deseas cambiar el estado del proceso?" descripcion="Una vez confirmes, el estado del proceso será actualizado en los registros de información." />
      <ConfirmarCambiosModal visible={confirmarAnulado} onCancelar={() => setConfirmarAnulado(false)}
        onConfirmar={async () => {
          try {
            await payrollService.cambiarEstado(cambioEstado.periodoId, 'ANULADO');
            const { data } = await payrollService.getProcesosPrima(id);
            setPeriodos(data);
            setConfirmarAnulado(false);
            setModal('exito');
          } catch {
            setConfirmarAnulado(false);
            setModal('error');
          }
        }}
        titulo="¿Estás seguro de que deseas anular este proceso?" descripcion="Esta acción es irreversible. Una vez anulado, el proceso no podrá volver a un estado activo." tipo="error" />
      <ConfirmarCambiosModal visible={confirmarEliminar} onCancelar={() => setConfirmarEliminar(false)} onConfirmar={handleConfirmarEliminar} titulo="¿Deseas eliminar este proceso de prima?" descripcion="Esta acción registrará la fecha de eliminación del proceso y dejará de mostrarse en la lista." />
      <MensajeModal tipo={modal} onClose={() => setModal(null)} />

    </div>
  );
}

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
  totalNum:     { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:   { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  addBar:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px' },
  addLabel:     { fontSize: '15px', fontWeight: '700', color: '#272525' },
  btnLiquidar:  { color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  tabsBox:      { display: 'flex', borderBottom: '1px solid #E8E8E8' },
  tab:          { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px 20px', fontSize: '14px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  tabActivo:    { color: '#0B662A', borderBottom: '2px solid #0B662A' },
  card:         { backgroundColor: '#fff', borderRadius: '16px', padding: '24px' },
  tableTitle:   { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tableWrapper: { overflowX: 'auto', width: '100%' },
  table:        { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  th:           { fontSize: '12px', fontWeight: '700', color: '#A3A3A3', padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:           { fontSize: '13px', color: '#272525', padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' },
  trPar:        { backgroundColor: '#fff' },
  trImpar:      { backgroundColor: '#FAFAFA' },
  estadoTexto:  { fontSize: '12px', color: '#272525' },
  paginacion:   { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' },
  pageBtn:      { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif' },
  pageBtnActivo:{ backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
  toolbarCard:  { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  filtrosBox:   { display: 'flex', alignItems: 'center', gap: '12px' },
  searchBox:    { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '380px' },
  searchInput:  { border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  iconBtn:      { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' },
};
