import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { Coins, UserRound } from 'lucide-react';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import { useCesantiaStore } from '../../../../../store/useCesantiaStore';
import payrollService from '../../../../../services/payrollService';
import masterAxios from '../../../../../api/masterAxiosInstance';
import MensajeModal from '../../../../../components/MensajeModal';


export default function LiquidarCesantiasPage() {
  const navigate              = useNavigate();
  const { id, cesantiaId }    = useParams();
  const { usuario }           = useAuthStore();

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
    const state = useCesantiaStore.getState();
    console.log('Estado del store de cesantías:', state);
    console.log('Empleados seleccionados:', state.empleadosSeleccionados);
    console.log('sessionStorage cesantia-store:', sessionStorage.getItem('cesantia-store'));
    if (!cesantiaId || !id) return;
    setCargando(true);

    Promise.all([
      payrollService.getProcesosCesantias(id),
      masterAxios.get(`/api/master/empresas/${id}`),
    ])
      .then(([{ data: procesos }, { data: emp }]) => {
        const encontrado = procesos.find(
          p => String(p.procesoLiquiId) === String(cesantiaId)
        );
        setProceso(encontrado ?? null);
        setEmpresa(emp);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [cesantiaId, id]);

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Coins size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Liquidar Cesantías e Intereses</h2>
            <p style={styles.subtitulo}>Ver desprendibles de cesantías e intereses</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}><UserRound size={22} color="#A3A3A3" /></div>
          <div><p style={styles.perfilNombre}>{nombre}</p><p style={styles.perfilCargo}>{cargo}</p></div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Liquidar Cesantías e Intereses</h3>
        <div style={styles.infoGrid}>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Nombre Empresa:</span><span style={styles.infoValor}>{empresa?.nombreEmpresa ?? ''}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Nit:</span><span style={styles.infoValor}>{empresa?.empresaNit ?? ''}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Fecha de Generación de Reporte:</span><span style={styles.infoValor}>{new Date().toLocaleDateString('es-CO')}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Periodo:</span><span style={styles.infoValor}>{proceso?.anio ?? ''}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Estado:</span><span style={styles.infoValor}>{proceso?.estadoProcNomina ?? ''}</span></div>
        </div>
        <hr style={styles.divider} />
      </div>

      <div style={styles.botonesRow}>
        <button
          style={{ ...styles.btnLiquidar, background: hoverLiquidar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A', transition: 'background 0.3s ease' }}
          onMouseEnter={() => setHoverLiquidar(true)} onMouseLeave={() => setHoverLiquidar(false)}
          onClick={() => setConfirmarLiquidar(true)}
        >
          Calcular y Liquidar
        </button>
        <button
          style={{ ...styles.btnCancelar, background: hoverCancelar ? '#f5f5f5' : '#fff', transition: 'background 0.3s ease' }}
          onMouseEnter={() => setHoverCancelar(true)} onMouseLeave={() => setHoverCancelar(false)}
          onClick={() => navigate(`/empresas/${id}/cesantias`)}
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
            const { procesoInteresesActual, empleadosSeleccionados } =
              useCesantiaStore.getState();

            let empleados = empleadosSeleccionados;
            if (!empleados || empleados.length === 0) {
              const { data: empleadosActivos } =
                await payrollService.getEmpleadosActivos(id);
              empleados = empleadosActivos.map(e => e.empleadoId);
            }

            await payrollService.liquidarCesantias(cesantiaId, {
              empleadosSeleccionados: empleados,
            });

            let procesoIntereses = procesoInteresesActual;
            if (!procesoIntereses) {
              const { data: procesos } = await payrollService.getProcesosIntereses(id);
              procesoIntereses = procesos.find(
                p => p.anio === proceso?.anio &&
                  p.estadoProcNomina !== 'ANULADO' &&
                  p.estadoProcNomina !== 'PAGADO'
              ) ?? null;
            }

            if (procesoIntereses) {
              await payrollService.liquidarIntereses(
                procesoIntereses.procesoLiquiId,
                { empleadosSeleccionados: empleados }
              );
            }

            useCesantiaStore.getState().limpiarProceso();
            navigate(`/empresas/${id}/cesantias/${cesantiaId}/resultado`);
          } catch {
            setModal('error');
          }
        }}
        titulo="¿Deseas calcular y liquidar estas cesantías?"
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
