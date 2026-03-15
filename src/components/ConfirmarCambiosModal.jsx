import { CheckCircle } from 'lucide-react';

export default function ConfirmarCambiosModal({ visible, onCancelar, onConfirmar }) {
  if (!visible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Ícono */}
        <div style={styles.iconoCirculo}>
          <CheckCircle size={40} color="#0B662A" strokeWidth={1.5} />
        </div>

        {/* Título */}
        <p style={styles.titulo}>¿Estás seguro de querer guardar estos cambios?</p>

        {/* Descripción */}
        <p style={styles.descripcion}>
          Recuerda que una vez que hagas un cambio en la información, se actualizarán
          los datos que harán parte de la gestión de liquidación de contratos.
        </p>

        {/* Botones */}
        <div style={styles.botonesRow}>
          <button style={styles.btnCancelar} onClick={onCancelar}>Cancelar</button>
          <button style={styles.btnConfirmar} onClick={onConfirmar}>Confirmar</button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay:      { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:        { backgroundColor: '#fff', borderRadius: '20px', padding: '36px 40px', width: '620px', display: 'flex', flexDirection: 'column', gap: '16px' },
  iconoCirculo: { width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  titulo:       { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0, lineHeight: 1.4 },
  descripcion:  { fontSize: '15px', color: '#555', margin: 0, lineHeight: 1.7 },
  botonesRow:   { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  btnCancelar:  { backgroundColor: '#fff', color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnConfirmar: { backgroundColor: '#0B662A', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
};