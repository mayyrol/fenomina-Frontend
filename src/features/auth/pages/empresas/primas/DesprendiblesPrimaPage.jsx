import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { CreditCard, ChevronLeft, UserRound } from 'lucide-react';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import MensajeModal from '../../../../../components/MensajeModal';
import { usePrimaStore } from '../../../../../store/usePrimaStore';
import payrollService from '../../../../../services/payrollService';
import masterAxios from '../../../../../api/masterAxiosInstance';

const NOMBRE_MES = [
  '','Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

export default function DesprendiblesPrimaPage() {
  const navigate        = useNavigate();
  const { id, primaId } = useParams();
  const { usuario }     = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [proceso,  setProceso]  = useState(null);
  const [empresa,  setEmpresa]  = useState(null);
  const [cargando, setCargando] = useState(false);
  const [modal,    setModal]    = useState(null);

  const [confirmarCerrar,  setConfirmarCerrar]  = useState(false);
  const [confirmarAnular,  setConfirmarAnular]  = useState(false);
  const [confirmarEliminar,setConfirmarEliminar]= useState(false);

  const [hoverCerrar,  setHoverCerrar]  = useState(false);
  const [hoverAnular,  setHoverAnular]  = useState(false);
  const [hoverEliminar,setHoverEliminar]= useState(false);

  useEffect(() => {
    if (!primaId || !id) return;
    setCargando(true);

    Promise.all([
      payrollService.getProcesosPrima(id),
      masterAxios.get(`/api/master/empresas/${id}`),
    ])
      .then(([{ data: procesos }, { data: emp }]) => {
        const encontrado = procesos.find(
          p => String(p.procesoLiquiId) === String(primaId)
        );
        setProceso(encontrado ?? null);
        setEmpresa(emp);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [primaId, id]);

  const mesDelPeriodo = proceso?.fechaFinPeriodo
    ? NOMBRE_MES[new Date(proceso.fechaFinPeriodo + 'T00:00:00').getMonth() + 1]
    : '';

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Desprendibles Prima</h2>
            <p style={styles.subtitulo}>Gestión del proceso de prima en borrador</p>
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

      {/* Info proceso */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Desprendibles Prima</h3>
        {cargando ? (
          <p style={{ color: '#A3A3A3' }}>Cargando información del proceso...</p>
        ) : (
          <div style={styles.infoGrid}>
            <div style={styles.infoFila}>
              <span style={styles.infoLabel}>Nombre Empresa:</span>
              <span style={styles.infoValor}>{empresa?.nombreEmpresa ?? ''}</span>
            </div>
            <div style={styles.infoFila}>
              <span style={styles.infoLabel}>Nit:</span>
              <span style={styles.infoValor}>{empresa?.empresaNit ?? ''}</span>
            </div>
            <div style={styles.infoFila}>
              <span style={styles.infoLabel}>Fecha de Generación de Reporte:</span>
              <span style={styles.infoValor}>{new Date().toLocaleDateString('es-CO')}</span>
            </div>
            <div style={styles.infoFila}>
              <span style={styles.infoLabel}>Periodo:</span>
              <span style={styles.infoValor}>
                {proceso?.fechaInicioPeriodo} - {proceso?.fechaFinPeriodo}
              </span>
            </div>
            <div style={styles.infoFila}>
              <span style={styles.infoLabel}>Mes:</span>
              <span style={styles.infoValor}>{mesDelPeriodo}</span>
            </div>
            <div style={styles.infoFila}>
              <span style={styles.infoLabel}>Estado proceso:</span>
              <span style={styles.infoValor}>{proceso?.estadoProcNomina ?? ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div style={styles.accionesBar}>
        <button
          style={{
            ...styles.btnCerrar,
            background: hoverCerrar
              ? 'linear-gradient(135deg, #0B662A, #1a9e45)'
              : '#0B662A',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverCerrar(true)}
          onMouseLeave={() => setHoverCerrar(false)}
          onClick={() => setConfirmarCerrar(true)}
        >
          Cerrar proceso
        </button>
        <button
          style={{
            ...styles.btnAnular,
            transition: 'background 0.3s ease',
            ...(hoverAnular ? { backgroundColor: '#f5f5f5' } : {}),
          }}
          onMouseEnter={() => setHoverAnular(true)}
          onMouseLeave={() => setHoverAnular(false)}
          onClick={() => setConfirmarAnular(true)}
        >
          Anular
        </button>
        <button
          style={{
            ...styles.btnEliminar,
            transition: 'background 0.3s ease',
            ...(hoverEliminar ? { backgroundColor: '#FFF5F5' } : {}),
          }}
          onMouseEnter={() => setHoverEliminar(true)}
          onMouseLeave={() => setHoverEliminar(false)}
          onClick={() => setConfirmarEliminar(true)}
        >
          Eliminar
        </button>
        <button
          style={styles.btnAnular}
          onClick={() => navigate(`/empresas/${id}/primas`)}
        >
          Cancelar
        </button>
      </div>

      {/* Modales */}
      <ConfirmarCambiosModal
        visible={confirmarCerrar}
        onCancelar={() => setConfirmarCerrar(false)}
        onConfirmar={async () => {
          try {
            await payrollService.cambiarEstado(primaId, 'CERRADO');
            setConfirmarCerrar(false);
            navigate(`/empresas/${id}/primas/${primaId}/liquidar`);
          } catch {
            setConfirmarCerrar(false);
            setModal('error');
          }
        }}
        titulo="¿Deseas cerrar este proceso de prima?"
        descripcion="Al cerrar el proceso, el estado cambiará a Cerrado y no podrá editarse."
      />

      <ConfirmarCambiosModal
        visible={confirmarAnular}
        onCancelar={() => setConfirmarAnular(false)}
        onConfirmar={async () => {
          try {
            await payrollService.cambiarEstado(primaId, 'ANULADO');
            usePrimaStore.getState().limpiarProceso();
            setConfirmarAnular(false);
            navigate(`/empresas/${id}/primas`);
          } catch {
            setConfirmarAnular(false);
            setModal('error');
          }
        }}
        titulo="¿Estás seguro de que deseas anular este proceso?"
        descripcion="Esta acción es irreversible. Una vez anulado, el proceso no podrá volver a un estado activo."
        tipo="error"
      />

      <ConfirmarCambiosModal
        visible={confirmarEliminar}
        onCancelar={() => setConfirmarEliminar(false)}
        onConfirmar={async () => {
          try {
            await payrollService.eliminarProceso(primaId);
            usePrimaStore.getState().limpiarProceso();
            setConfirmarEliminar(false);
            navigate(`/empresas/${id}/primas`);
          } catch {
            setConfirmarEliminar(false);
            setModal('error');
          }
        }}
        titulo="¿Deseas eliminar este proceso de prima?"
        descripcion="Esta acción eliminará el proceso de prima."
      />

      <MensajeModal tipo={modal} onClose={() => setModal(null)} />
    </div>
  );
}


const styles = {
  container:          { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' },
  header:             { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:             { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:          { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:          { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:             { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  perfilNombre:       { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:        { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  volverBtn:          { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0, width: 'fit-content'},
  card:               { backgroundColor: '#fff', borderRadius: '16px', padding: '28px 32px' },
  cardTitulo:         { fontSize: '16px', fontWeight: '800', color: '#272525', margin: '0 0 20px 0' },
  infoGrid:           { display: 'flex', flexDirection: 'column', gap: '10px' },
  infoFila:           { display: 'flex', gap: '8px', alignItems: 'baseline' },
  infoLabel:          { fontSize: '13px', fontWeight: '700', color: '#272525', whiteSpace: 'nowrap' },
  infoValor:          { fontSize: '13px', color: '#272525' },
  searchCard:         { backgroundColor: '#fff', borderRadius: '12px', padding: '14px 24px', maxWidth: '900px', margin: '0 auto', width: '100%' },
  searchBox:          { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '100%' },
  searchInput:        { border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  empleadosBox:       { display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '900px', margin: '0 auto', width: '100%' },
  empCard:            { backgroundColor: '#fff', borderRadius: '12px', padding: '20px 24px', border: '1px solid #F0F0F0' },
  empHeader:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  empNombre:          { fontSize: '14px', fontWeight: '800', color: '#272525' },
  empDoc:             { fontSize: '13px', color: '#A3A3A3', fontWeight: '400' },
  empInfo:            { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
  empDetalle:         { fontSize: '13px', color: '#272525' },
  empSeparador:       { color: '#D0D0D0', fontSize: '13px' },
  diasRow:            { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' },
  novedadesBox:       { backgroundColor: '#FAFAFA', borderRadius: '8px', padding: '14px 16px', marginBottom: '12px', border: '1px solid #F0F0F0' },
  novedadesTitulo:    { fontSize: '12px', fontWeight: '700', color: '#272525', margin: '0 0 10px 0' },
  sinNovedades:       { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  novedadFila:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F0F0F0' },
  novedadTipo:        { fontSize: '12px', fontWeight: '700', color: '#272525', margin: '0 0 2px 0' },
  novedadDetalle:     { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  btnAccionNovedad:   { fontSize: '11px', fontWeight: '700', color: '#0B662A', backgroundColor: '#F0FAF4', border: '1px solid #C3E6CC', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  btnAgregarNovedad:  { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px dashed #0B662A', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#0B662A', fontFamily: 'Nunito, sans-serif' },
  btnIconoVerde:      { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  iconBtn:            { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' },
  btnPDF:             { color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  accionesBar:        { display: 'flex', gap: '12px', justifyContent: 'center', paddingBottom: '16px', flexWrap: 'wrap' },
  btnCerrar:          { flex: 1, maxWidth: '220px', backgroundColor: '#0B662A', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnAnular:          { flex: 1, maxWidth: '220px', backgroundColor: '#fff', color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnEliminar:        { flex: 1, maxWidth: '220px', backgroundColor: '#fff', color: '#E53E3E', border: '1px solid #E53E3E', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
};
