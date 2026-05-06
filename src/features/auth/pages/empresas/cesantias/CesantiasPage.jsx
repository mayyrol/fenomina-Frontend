import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { Coins, Search, ChevronLeft, ChevronDown, UserRound, Pencil, Trash2, Upload, Eye, X  } from 'lucide-react';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import MensajeModal from '../../../../../components/MensajeModal';
import payrollService from '../../../../../services/payrollService';

const PAGE_SIZE = 10;

const OPCIONES_POR_ESTADO = {
  'Borrador':            ['Borrador', 'Cerrado', 'Anulado'],
  'Cerrado':             ['Cerrado', 'Borrador', 'Anulado'],
  'Pendiente por pagar': ['Pendiente por pagar', 'Pagado', 'Anulado'],
  'Pagado':              ['Pagado', 'Anulado'],
  'Anulado':             ['Anulado'],
};

const formatMiles = (valor) => '$' + String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function EstadoSelect({ valor, onChange }) {
  const opciones = OPCIONES_POR_ESTADO[valor] ?? ['Borrador'];
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select value={valor} onChange={(e) => onChange(e.target.value)}
        style={{ border: '1px solid #D0D0D0', borderRadius: '8px', padding: '6px 28px 6px 10px', fontSize: '12px', fontFamily: 'Nunito, sans-serif', outline: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundColor: '#fff', color: '#272525', cursor: 'pointer', backgroundImage: 'none' }}>
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
  'Borrador':            'BORRADOR',
  'Cerrado':             'CERRADO',
  'Pendiente por pagar': 'PENDIENTE_PAGO',
  'Pagado':              'PAGADO',
  'Anulado':             'ANULADO',
};

const TABS_ESTADO = ['Borrador', 'Cerrado', 'Pendiente por pagar', 'Pagado', 'Anulado'];

export default function CesantiasPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [tab,          setTab]          = useState('Borrador');
  const [busqueda,     setBusqueda]     = useState('');
  const [pagina,       setPagina]       = useState(0);
  const [periodos,     setPeriodos]     = useState([]);
  const [cargando,     setCargando]     = useState(false);
  const [modal,        setModal]        = useState(null);
  const [confirmarEstado,   setConfirmarEstado]   = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [confirmarAnulado,  setConfirmarAnulado]  = useState(false);
  const [cambioEstado,      setCambioEstado]      = useState({ periodoId: null, nuevoEstado: null });
  const [periodoEliminar,   setPeriodoEliminar]   = useState(null);
  const [hoverLiquidar,     setHoverLiquidar]     = useState(false);
  const [fechaBusqueda, setFechaBusqueda] = useState('');
  const [itemsPerPage, setItemsPerPage]   = useState(10);
  const periodosFiltrados = periodos.filter(p => {
    if (p.deletedAt) return false;
    if (ESTADO_LABEL[p.estadoProcNomina] !== tab) return false;
    if (busqueda && !p.fechaInicioPeriodo?.includes(busqueda) && !p.fechaFinPeriodo?.includes(busqueda)) return false;
    if (fechaBusqueda) {
      const matchInicio  = (p.fechaInicioPeriodo ?? '').slice(0, 10) === fechaBusqueda;
      const matchCreacion = (p.createdAt ?? '').slice(0, 10) === fechaBusqueda;
      if (!matchInicio && !matchCreacion) return false;
    }
    return true;
  });
  const totalPaginas   = Math.max(1, Math.ceil(periodosFiltrados.length / itemsPerPage));
  const periodosPagina = periodosFiltrados.slice(pagina * itemsPerPage, pagina * itemsPerPage + itemsPerPage);
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
      const { data } = await payrollService.getProcesosCesantias(id);
      setPeriodos(data);
      setConfirmarEstado(false);
      setModal('exito');
    } catch {
      setConfirmarEstado(false);
      setModal('error');
    }
  };

  const handleEliminar = (periodo) => { setPeriodoEliminar(periodo); setConfirmarEliminar(true); };

  const handleConfirmarEliminar = async () => {
    try {
      await payrollService.eliminarProceso(periodoEliminar.procesoLiquiId);
      const { data } = await payrollService.getProcesosCesantias(id);
      setPeriodos(data);
      setConfirmarEliminar(false);
      setModal('exito');
    } catch {
      setConfirmarEliminar(false);
      setModal('error');
    }
  };

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    payrollService.getProcesosCesantias(id)
      .then(({ data }) => {
        console.log('Procesos cesantías recibidos:', data);
        console.log('totalIntereses primer proceso:', data[0]?.totalIntereses);
        setPeriodos(data);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [id]);

  const generarPaginas = () => {
    const paginas = [];
    if (totalPaginas <= 6) {
      for (let i = 0; i < totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(0);
      if (pagina > 2) paginas.push('...');
      for (let i = Math.max(1, pagina - 1); i <= Math.min(totalPaginas - 2, pagina + 1); i++) paginas.push(i);
      if (pagina < totalPaginas - 3) paginas.push('...');
      paginas.push(totalPaginas - 1);
    }
    return paginas;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Coins size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Cesantías e Intereses</h2>
            <p style={styles.subtitulo}>Gestiona la liquidación de cesantías e intereses para cada uno de los empleados asociados a la empresa</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}><UserRound size={22} color="#A3A3A3" /></div>
          <div><p style={styles.perfilNombre}>{nombre}</p><p style={styles.perfilCargo}>{cargo}</p></div>
        </div>
      </div>

      <button style={{ ...styles.volverBtn, width: 'fit-content' }} onClick={() => navigate(`/empresas/${id}`)}>
        <ChevronLeft size={16} color="#272525" /><span>Volver</span>
      </button>

      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>{periodosFiltrados.length}</p>
          <p style={styles.totalLabel}>Total reportes</p>
        </div>
        <div style={styles.filtrosBox}>
          <div style={styles.searchBox}>
            <Search size={14} color="#A3A3A3" />
            <input style={styles.searchInput} placeholder="Buscar cesantía por palabra clave" value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }} />
          </div>
          <div style={styles.dateWrapper}>
            <input
              type="date"
              value={fechaBusqueda}
              onChange={(e) => { setFechaBusqueda(e.target.value); setPagina(0); }}
              style={styles.dateInput}
            />
            {fechaBusqueda && (
              <button onClick={() => { setFechaBusqueda(''); setPagina(0); }} style={styles.clearDateBtn} title="Limpiar filtro de fecha">
                <X size={14} color="#A3A3A3" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={styles.addBar}>
        <span style={styles.addLabel}>Generar reportes de cesantías e intereses</span>
        <button
          style={{ ...styles.btnLiquidar, background: hoverLiquidar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A', transition: 'background 0.3s ease' }}
          onMouseEnter={() => setHoverLiquidar(true)} onMouseLeave={() => setHoverLiquidar(false)}
          onClick={() => navigate(`/empresas/${id}/cesantias/generar-reporte`)}
        >
          Nuevo proceso de liquidación
        </button>
      </div>

      <div style={styles.tabsBox}>
        <div style={{ display: 'flex' }}>
          {TABS_ESTADO.map((t) => (
            <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.tabActivo : {}) }} onClick={() => { setTab(t); setPagina(0); }}>{t}</button>
          ))}
        </div>
        <div style={styles.porPaginaBox}>
          <span style={styles.porPaginaLabel}>Resultados por página:</span>
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPagina(0); }} style={styles.porPaginaSelect}>
            {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div style={styles.card}>
        <p style={styles.tableTitle}>Histórico Total de Cesantías e Intereses por Periodo</p>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Periodo</th>
                {!['Borrador', 'Cerrado'].includes(tab) && (
                  <th style={styles.th}>Empleados incluidos</th>
                )}
                {!['Borrador', 'Cerrado'].includes(tab) && (
                  <th style={styles.th}>Total cesantías</th>
                )}
                {!['Borrador', 'Cerrado'].includes(tab) && (
                  <th style={styles.th}>Total intereses</th>
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
                      ['Pendiente por pagar', 'Pagado'].includes(tab) ? 7 :
                      tab === 'Anulado' ? 6 : 4
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
                    {!['Borrador', 'Cerrado'].includes(tab) && (
                      <td style={styles.td}>
                        {p.totalIntereses != null && p.totalIntereses > 0
                          ? formatMiles(p.totalIntereses)
                          : '-'}
                      </td>
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
                                onClick={() => navigate(`/empresas/${id}/cesantias/${p.procesoLiquiId}/desprendibles`)}
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
                              onClick={() => navigate(`/empresas/${id}/cesantias/${p.procesoLiquiId}/liquidar`)}
                              title="Liquidar">
                              <Upload size={16} color="#0B662A" />
                            </button>
                          )}
                          {['PENDIENTE_PAGO', 'PAGADO'].includes(p.estadoProcNomina) && (
                            <button style={styles.iconBtn}
                              onClick={() => navigate(`/empresas/${id}/cesantias/${p.procesoLiquiId}/resultado`)}
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
        <div style={styles.paginacion}>
          {generarPaginas().map((p, i) =>
            p === '...'
              ? <span key={`e-${i}`} style={styles.ellipsis}>...</span>
              : <button key={p} onClick={() => setPagina(p)} style={{ ...styles.pageBtn, ...(pagina === p ? styles.pageBtnActivo : {}) }}>{p + 1}</button>
          )}
          <button onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))} disabled={pagina >= totalPaginas - 1}
            style={{ ...styles.pageBtn, opacity: pagina >= totalPaginas - 1 ? 0.4 : 1 }}>{'>>'}</button>
        </div>
      </div>

      <ConfirmarCambiosModal visible={confirmarEstado} onCancelar={() => setConfirmarEstado(false)} onConfirmar={handleConfirmarEstado} titulo="¿Deseas cambiar el estado del proceso?" descripcion="Una vez confirmes, el estado del proceso será actualizado." />
      <ConfirmarCambiosModal visible={confirmarAnulado} onCancelar={() => setConfirmarAnulado(false)}
        onConfirmar={async () => {
          try {
            await payrollService.cambiarEstado(cambioEstado.periodoId, 'ANULADO');
            const { data } = await payrollService.getProcesosCesantias(id);
            setPeriodos(data);
            setConfirmarAnulado(false);
            setModal('exito');
          } catch {
            setConfirmarAnulado(false);
            setModal('error');
          }
        }}
        titulo="¿Estás seguro de que deseas anular este proceso?" descripcion="Esta acción es irreversible." tipo="error" />
      <ConfirmarCambiosModal visible={confirmarEliminar} onCancelar={() => setConfirmarEliminar(false)} onConfirmar={handleConfirmarEliminar} titulo="¿Deseas eliminar este proceso?" descripcion="Esta acción registrará la fecha de eliminación." />
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
  volverBtn:    { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0 },
  totalNum:     { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:   { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  addBar:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px' },
  addLabel:     { fontSize: '15px', fontWeight: '700', color: '#272525' },
  btnLiquidar:  { color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
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
  dateWrapper:    { display: 'flex', alignItems: 'center', gap: '4px' },
  clearDateBtn:   { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '4px' },
  dateInput:      { border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', cursor: 'pointer', color: '#272525' },
  tabsBox:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E8E8', flexWrap: 'wrap', gap: '8px' },
  porPaginaBox:   { display: 'flex', alignItems: 'center', gap: '8px' },
  porPaginaLabel: { fontSize: '13px', color: '#A3A3A3', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' },
  porPaginaSelect:{ padding: '6px 28px 6px 10px', border: '1px solid #D0D0D0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23272525\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundColor: '#fff' },
  ellipsis:       { fontSize: '13px', color: '#A3A3A3', padding: '0 4px', lineHeight: '36px' },
};
