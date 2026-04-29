import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { FileText, ChevronLeft, UserRound } from 'lucide-react';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import MensajeModal from '../../../../../components/MensajeModal';
import payrollService from '../../../../../services/payrollService';
import { useNominaStore } from '../../../../../store/useNominaStore';

export default function LiquidarNominaPage() {
  const navigate             = useNavigate();
  const { id, nominaId }     = useParams();
  const { usuario }          = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [modal, setModal]                       = useState(null);
  const [confirmarLiquidar, setConfirmarLiquidar] = useState(false);
  const [hoverLiquidar, setHoverLiquidar]       = useState(false);
  const [hoverCancelar, setHoverCancelar]       = useState(false);

  const [proceso, setProceso] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!nominaId) return;
    setCargando(true);
    payrollService.getProcesos(id)
      .then(({ data }) => {
        const encontrado = data.find(p => String(p.procesoLiquiId) === String(nominaId));
        setProceso(encontrado ?? null);
      })
      .catch(() => setProceso(null))
      .finally(() => setCargando(false));
  }, [nominaId, id]);

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Liquidar Nómina</h2>
            <p style={styles.subtitulo}>Ver desprendibles de nómina</p>
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

      {/* Volver */}
      <button style={styles.volverBtn} onClick={() => navigate(-1)}>
        <ChevronLeft size={16} color="#272525" />
        <span>Volver</span>
      </button>

      {/* Card info proceso */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Liquidar Nómina</h3>

        <div style={styles.infoGrid}>
          <div style={styles.infoFila}>
            <span style={styles.infoLabel}>Nombre Empresa:</span>
            <span style={styles.infoValor}>{proceso?.nombreEmpresa ?? ''}</span>
          </div>
          <div style={styles.infoFila}>
            <span style={styles.infoLabel}>Nit:</span>
            <span style={styles.infoValor}>{proceso?.nit ?? ''}</span>
          </div>
          <div style={styles.infoFila}>
            <span style={styles.infoLabel}>Fecha de Generación de Reporte:</span>
            <span style={styles.infoValor}>{proceso?.fechaGeneracion ?? ''}</span>
          </div>
          <div style={styles.infoFila}>
            <span style={styles.infoLabel}>Periodo:</span>
            <span style={styles.infoValor}>{proceso?.periodo ?? ''}</span>
          </div>
          <div style={styles.infoFila}>
            <span style={styles.infoLabel}>Mes:</span>
            <span style={styles.infoValor}>{proceso?.mes ?? ''}</span>
          </div>
          <div style={styles.infoFila}>
            <span style={styles.infoLabel}>Estado:</span>
            <span style={styles.infoValor}>{proceso?.estado ?? ''}</span>
          </div>
        </div>

        <hr style={styles.divider} />
      </div>

      {/* Botones */}
      <div style={styles.botonesRow}>
        <button
          style={{
            ...styles.btnLiquidar,
            background: hoverLiquidar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverLiquidar(true)}
          onMouseLeave={() => setHoverLiquidar(false)}
          onClick={() => setConfirmarLiquidar(true)}
        >
          Calcular y Liquidar
        </button>
        <button
          style={{
            ...styles.btnCancelar,
            background: hoverCancelar ? '#f5f5f5' : '#fff',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverCancelar(true)}
          onMouseLeave={() => setHoverCancelar(false)}
          onClick={() => navigate(-1)}
        >
          Cancelar
        </button>
      </div>

      {/* Modales */}
      <ConfirmarCambiosModal
        visible={confirmarLiquidar}
        onCancelar={() => setConfirmarLiquidar(false)}
        onConfirmar={async () => {
          setConfirmarLiquidar(false);
          try {
            const { empleadosSeleccionados, diasLaborados } =
              useNominaStore.getState();

            await payrollService.liquidarNomina(nominaId, {
              empleadosSeleccionados,
              diasLaborados,
            });

            useNominaStore.getState().limpiarProceso();
            navigate(`/empresas/${id}/nominas/${nominaId}/resultado`);
          } catch (err) {
            setModal('error');
          }
        }}
        titulo="¿Deseas calcular y liquidar esta nómina?"
        descripcion="Una vez confirmes, se procesará la liquidación del periodo seleccionado."
      />

      <MensajeModal
        tipo={modal}
        onClose={() => { setModal(null); if (modal === 'exito') navigate(-1); }}
      />

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
