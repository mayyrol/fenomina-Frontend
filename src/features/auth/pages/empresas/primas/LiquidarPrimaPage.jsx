import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { CreditCard, ChevronLeft, UserRound } from 'lucide-react';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import MensajeModal from '../../../../../components/MensajeModal';
import { usePrimaStore } from '../../../../../store/usePrimaStore';
import payrollService from '../../../../../services/payrollService';
import masterAxios from '../../../../../api/masterAxiosInstance';

export default function LiquidarPrimaPage() {
  const navigate             = useNavigate();
  const { id, primaId }      = useParams();
  const { usuario }          = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [confirmarLiquidar, setConfirmarLiquidar] = useState(false);
  const [hoverLiquidar, setHoverLiquidar]         = useState(false);
  const [hoverCancelar, setHoverCancelar]         = useState(false);

  const [proceso,  setProceso]  = useState(null);
  const [empresa,  setEmpresa]  = useState(null);
  const [cargando, setCargando] = useState(false);
  const [modal,    setModal]    = useState(null);

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

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Liquidar Prima</h2>
            <p style={styles.subtitulo}>Ver desprendibles de prima</p>
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

      {/* Card */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Liquidar Prima</h3>
        <div style={styles.infoGrid}>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Nombre Empresa:</span><span style={styles.infoValor}>{empresa?.nombreEmpresa ?? ''}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Nit:</span><span style={styles.infoValor}>{empresa?.empresaNit ?? ''}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Fecha de Generación de Reporte:</span><span style={styles.infoValor}>{new Date().toLocaleDateString('es-CO')}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Periodo:</span><span style={styles.infoValor}>{proceso?.fechaInicioPeriodo} - {proceso?.fechaFinPeriodo}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Estado:</span><span style={styles.infoValor}>{proceso?.estadoProcNomina ?? ''}</span></div>
        </div>
        <hr style={styles.divider} />
      </div>

      {/* Botones */}
      <div style={styles.botonesRow}>
        <button
          style={{ ...styles.btnLiquidar, background: hoverLiquidar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A', transition: 'background 0.3s ease' }}
          onMouseEnter={() => setHoverLiquidar(true)}
          onMouseLeave={() => setHoverLiquidar(false)}
          onClick={() => setConfirmarLiquidar(true)}
        >
          Calcular y Liquidar
        </button>
        <button
          style={{ ...styles.btnCancelar, background: hoverCancelar ? '#f5f5f5' : '#fff', transition: 'background 0.3s ease' }}
          onMouseEnter={() => setHoverCancelar(true)}
          onMouseLeave={() => setHoverCancelar(false)}
          onClick={() => navigate(`/empresas/${id}/primas`)}
        >
          Cancelar
        </button>
      </div>

      <ConfirmarCambiosModal
        visible={confirmarLiquidar}
        onCancelar={() => setConfirmarLiquidar(false)}
        onConfirmar={async () => {
          setConfirmarLiquidar(false);
          try {
            const { empleadosSeleccionados } = usePrimaStore.getState();

            await payrollService.liquidarPrima(primaId, {
              empleadosSeleccionados,
            });

            usePrimaStore.getState().limpiarProceso();
            navigate(`/empresas/${id}/primas/${primaId}/resultado`);
          } catch {
            setModal('error');
          }
        }}
        titulo="¿Deseas calcular y liquidar esta prima?"
        descripcion="Una vez confirmes, se procesará la liquidación del periodo seleccionado."
      />

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
  card:         { backgroundColor: '#fff', borderRadius: '16px', padding: '36px 40px' },
  cardTitulo:   { fontSize: '20px', fontWeight: '800', color: '#272525', margin: '0 0 32px 0' },
  infoGrid:     { display: 'flex', flexDirection: 'column', gap: '14px' },
  infoFila:     { display: 'flex', gap: '8px', alignItems: 'baseline' },
  infoLabel:    { fontSize: '13px', fontWeight: '700', color: '#272525', whiteSpace: 'nowrap' },
  infoValor:    { fontSize: '13px', color: '#272525' },
  divider:      { border: 'none', borderTop: '1px solid #E8E8E8', margin: '32px 0 0 0' },
  botonesRow:   { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px', flexWrap: 'wrap' },
  btnLiquidar:  { color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnCancelar:  { color: '#0B662A', border: '1px solid #0B662A', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
};
