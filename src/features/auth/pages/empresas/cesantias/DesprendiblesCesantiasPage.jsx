import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { Coins, UserRound } from 'lucide-react';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import MensajeModal from '../../../../../components/MensajeModal';
import { useCesantiaStore } from '../../../../../store/useCesantiaStore';
import payrollService from '../../../../../services/payrollService';
import masterAxios from '../../../../../api/masterAxiosInstance';

const NOMBRE_MES = [
  '','Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

export default function DesprendiblesCesantiasPage() {
  const navigate           = useNavigate();
  const { id, cesantiaId } = useParams();
  const { usuario }        = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [modal,            setModal]            = useState(null);
  const [confirmarCerrar,  setConfirmarCerrar]  = useState(false);
  const [confirmarAnular,  setConfirmarAnular]  = useState(false);
  const [confirmarEliminar,setConfirmarEliminar]= useState(false);
  const [hoverCerrar,      setHoverCerrar]      = useState(false);
  const [hoverAnular,      setHoverAnular]      = useState(false);
  const [hoverEliminar,    setHoverEliminar]    = useState(false);
  const [proceso,          setProceso]          = useState(null);
  const [empresa,          setEmpresa]          = useState(null);
  const [cargando,         setCargando]         = useState(false);

  useEffect(() => {
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
            <h2 style={styles.titulo}>Desprendibles Cesantías e Intereses</h2>
            <p style={styles.subtitulo}>Gestión del proceso en borrador</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}><UserRound size={22} color="#A3A3A3" /></div>
          <div><p style={styles.perfilNombre}>{nombre}</p><p style={styles.perfilCargo}>{cargo}</p></div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Desprendibles Cesantías e Intereses</h3>
        {cargando ? (
          <p style={{ color: '#A3A3A3' }}>Cargando...</p>
        ) : (
          <div style={styles.infoGrid}>
            <div style={styles.infoFila}><span style={styles.infoLabel}>Nombre Empresa:</span><span style={styles.infoValor}>{empresa?.nombreEmpresa ?? ''}</span></div>
            <div style={styles.infoFila}><span style={styles.infoLabel}>Nit:</span><span style={styles.infoValor}>{empresa?.empresaNit ?? ''}</span></div>
            <div style={styles.infoFila}><span style={styles.infoLabel}>Fecha de Generación:</span><span style={styles.infoValor}>{new Date().toLocaleDateString('es-CO')}</span></div>
            <div style={styles.infoFila}><span style={styles.infoLabel}>Año:</span><span style={styles.infoValor}>{proceso?.anio ?? ''}</span></div>
            <div style={styles.infoFila}><span style={styles.infoLabel}>Estado proceso:</span><span style={styles.infoValor}>{proceso?.estadoProcNomina ?? ''}</span></div>
          </div>
        )}
      </div>

      <div style={styles.accionesBar}>
        <button
          style={{ ...styles.btnCerrar, background: hoverCerrar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A', transition: 'background 0.3s ease' }}
          onMouseEnter={() => setHoverCerrar(true)} onMouseLeave={() => setHoverCerrar(false)}
          onClick={() => setConfirmarCerrar(true)}
        >
          Cerrar proceso
        </button>
        <button
          style={{ ...styles.btnAnular, transition: 'background 0.3s ease', ...(hoverAnular ? { backgroundColor: '#f5f5f5' } : {}) }}
          onMouseEnter={() => setHoverAnular(true)} onMouseLeave={() => setHoverAnular(false)}
          onClick={() => setConfirmarAnular(true)}
        >
          Anular
        </button>
        <button
          style={{ ...styles.btnEliminar, transition: 'background 0.3s ease', ...(hoverEliminar ? { backgroundColor: '#FFF5F5' } : {}) }}
          onMouseEnter={() => setHoverEliminar(true)} onMouseLeave={() => setHoverEliminar(false)}
          onClick={() => setConfirmarEliminar(true)}
        >
          Eliminar
        </button>
        <button style={styles.btnAnular} onClick={() => navigate(`/empresas/${id}/cesantias`)}>
          Cancelar
        </button>
      </div>

      <ConfirmarCambiosModal
        visible={confirmarCerrar}
        onCancelar={() => setConfirmarCerrar(false)}
        onConfirmar={async () => {
          try {
            await payrollService.cambiarEstado(cesantiaId, 'CERRADO');
            setConfirmarCerrar(false);
            navigate(`/empresas/${id}/cesantias/${cesantiaId}/liquidar`);
          } catch {
            setConfirmarCerrar(false);
            setModal('error');
          }
        }}
        titulo="¿Deseas cerrar este proceso?"
        descripcion="Al cerrar el proceso, el estado cambiará a Cerrado y no podrá editarse."
      />

      <ConfirmarCambiosModal
        visible={confirmarAnular}
        onCancelar={() => setConfirmarAnular(false)}
        onConfirmar={async () => {
          try {
            await payrollService.cambiarEstado(cesantiaId, 'ANULADO');
            useCesantiaStore.getState().limpiarProceso();
            setConfirmarAnular(false);
            navigate(`/empresas/${id}/cesantias`);
          } catch {
            setConfirmarAnular(false);
            setModal('error');
          }
        }}
        titulo="¿Estás seguro de que deseas anular este proceso?"
        descripcion="Esta acción es irreversible."
        tipo="error"
      />

      <ConfirmarCambiosModal
        visible={confirmarEliminar}
        onCancelar={() => setConfirmarEliminar(false)}
        onConfirmar={async () => {
          try {
            await payrollService.eliminarProceso(cesantiaId);
            useCesantiaStore.getState().limpiarProceso();
            setConfirmarEliminar(false);
            navigate(`/empresas/${id}/cesantias`);
          } catch {
            setConfirmarEliminar(false);
            setModal('error');
          }
        }}
        titulo="¿Deseas eliminar este proceso?"
        descripcion="Esta acción eliminará el proceso de cesantías."
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
  card:         { backgroundColor: '#fff', borderRadius: '16px', padding: '28px 32px' },
  cardTitulo:   { fontSize: '16px', fontWeight: '800', color: '#272525', margin: '0 0 20px 0' },
  infoGrid:     { display: 'flex', flexDirection: 'column', gap: '10px' },
  infoFila:     { display: 'flex', gap: '8px', alignItems: 'baseline' },
  infoLabel:    { fontSize: '13px', fontWeight: '700', color: '#272525', whiteSpace: 'nowrap' },
  infoValor:    { fontSize: '13px', color: '#272525' },
  accionesBar:  { display: 'flex', gap: '12px', justifyContent: 'center', paddingBottom: '16px', flexWrap: 'wrap' },
  btnCerrar:    { flex: 1, maxWidth: '220px', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnAnular:    { flex: 1, maxWidth: '220px', backgroundColor: '#fff', color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnEliminar:  { flex: 1, maxWidth: '220px', backgroundColor: '#fff', color: '#E53E3E', border: '1px solid #E53E3E', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
};