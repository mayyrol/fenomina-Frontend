import { CheckCircle, AlertCircle } from 'lucide-react';

export default function MensajeModal({ tipo, mensaje, onClose }) {
  if (!tipo) return null;

  const exitoso = tipo === 'exito';

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        <div style={{ ...styles.iconoCirculo, backgroundColor: exitoso ? '#E8F5E9' : '#FFF8E1' }}>
          {exitoso
            ? <CheckCircle size={48} color="#0B662A" strokeWidth={1.5} />
            : <AlertCircle size={48} color="#E65100" strokeWidth={1.5} />
          }
        </div>

        <p style={styles.titulo}>
          {exitoso ? '¡Perfecto!' : '¡Ups!'}
        </p>

        {/* ── CAMBIO: usa la prop mensaje si viene, si no usa el texto por defecto ── */}
        <p style={styles.mensaje}>
          {mensaje
            ? mensaje
            : exitoso
              ? 'La información ha sido guardada exitosamente.'
              : 'Algo ha salido mal. Intentalo de nuevo.'
          }
        </p>

        <button style={styles.btn} onClick={onClose}>Ok</button>

      </div>
    </div>
  );
}

const styles = {
  overlay:      { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:        { backgroundColor: '#fff', borderRadius: '20px', padding: '40px 48px', width: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' },
  iconoCirculo: { width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  titulo:       { fontSize: '22px', fontWeight: '800', color: '#272525', margin: 0 },
  mensaje:      { fontSize: '15px', color: '#555', margin: 0, lineHeight: 1.6 },
  btn:          { backgroundColor: '#0B662A', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 0', width: '100%', fontSize: '16px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', marginTop: '8px' },
};