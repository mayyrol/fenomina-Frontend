import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function ConfirmarCambiosModal({ 
  visible, 
  onCancelar, 
  onConfirmar,
  titulo = '¿Estás seguro de querer guardar estos cambios?',
  descripcion = 'Recuerda que una vez que hagas un cambio en la información, se actualizarán los datos en el sistema.'
}) {
  const [hoverConfirmar, setHoverConfirmar] = useState(false);
  const [hoverCancelar,  setHoverCancelar]  = useState(false);

  if (!visible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Ícono centrado */}
        <div style={styles.iconoCirculo}>
          <CheckCircle size={48} color="#0B662A" strokeWidth={1.5} />
        </div>

        {/* Título centrado */}
        <p style={styles.titulo}>{titulo}</p>

        {/* Descripción centrada */}
        <p style={styles.descripcion}>{descripcion}</p>

        {/* Botones centrados */}
        <div style={styles.botonesRow}>
          <button
            style={{
              ...styles.btnCancelar,
              background: hoverCancelar ? 'linear-gradient(135deg, #f0f0f0, #e0e0e0)' : '#fff',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={() => setHoverCancelar(true)}
            onMouseLeave={() => setHoverCancelar(false)}
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            style={{
              ...styles.btnConfirmar,
              background: hoverConfirmar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={() => setHoverConfirmar(true)}
            onMouseLeave={() => setHoverConfirmar(false)}
            onClick={onConfirmar}
          >
            Confirmar
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay:      { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal:        { backgroundColor: '#fff', borderRadius: '20px', padding: '40px 48px', width: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' },
  iconoCirculo: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' },
  titulo:       { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0, lineHeight: 1.4 },
  descripcion:  { fontSize: '13px', color: '#555', margin: 0, lineHeight: 1.7 },
  botonesRow:   { display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px', width: '100%' },
  btnCancelar:  { flex: 1, color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px 0', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnConfirmar: { flex: 1, color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 0', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
};