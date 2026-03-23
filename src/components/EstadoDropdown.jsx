import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

const ESTADOS = [
  { value: 'Inactivo', color: '#E65100' },
  { value: 'Activo',   color: '#0B662A' },
  { value: 'Retirado', color: '#C62828' },
];

export default function EstadoDropdown({ estadoActual, onCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const colorActual = ESTADOS.find(e => e.value === estadoActual)?.color ?? '#0B662A';

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setAbierto(!abierto)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          backgroundColor: colorActual + '18',
          color: colorActual,
          border: `1px solid ${colorActual}40`,
          borderRadius: '20px', padding: '4px 12px',
          fontSize: '12px', fontWeight: '600',
          fontFamily: 'Nunito, sans-serif', cursor: 'pointer',
        }}
      >
        {estadoActual}
        <span style={{ fontSize: '10px' }}>▾</span>
      </button>

      {abierto && (
        <div style={styles.dropdown}>
          {ESTADOS.map((e) => (
            <div
              key={e.value}
              style={{
                ...styles.opcion,
                backgroundColor: estadoActual === e.value ? e.color + '10' : 'transparent',
              }}
              onClick={() => {
                if (e.value !== estadoActual) onCambiar(e.value);
                setAbierto(false);
              }}
            >
              <span style={{ color: e.color, fontWeight: '600', fontSize: '14px' }}>
                {e.value}
              </span>
              {estadoActual === e.value && <Check size={16} color="#272525" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  dropdown: { position: 'absolute', top: '110%', left: 0, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '160px', padding: '8px 0', overflow: 'hidden' },
  opcion:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', cursor: 'pointer' },
};