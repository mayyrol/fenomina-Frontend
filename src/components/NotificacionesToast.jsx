import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import historicosService from '../services/historicosService';

const STORAGE_KEY = `notif_vistas_${new Date().toISOString().slice(0, 10)}`;

const getVistas = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch { return []; }
};

const marcarVista = (id) => {
    const vistas = getVistas();
    if (!vistas.includes(id)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...vistas, id]));
    }
};

export default function NotificacionesToast({ notificaciones, onCerrar }) {
    const navigate = useNavigate();

    const vistas = getVistas();
    const pendientes = notificaciones.filter(n =>
        !n.leida && !vistas.includes(n.id ?? `${n.fkEmpleadoId}-${n.fkIdEmpresa}`)
    );

    const [visibles,  setVisibles]  = useState(pendientes);
    const [animando,  setAnimando]  = useState('entrando');

    useEffect(() => {
        if (visibles.length === 0) { onCerrar(); return; }

        const t1 = setTimeout(() => setAnimando('quieto'), 50);
        const t2 = setTimeout(() => cerrarTodas(), 10000);

        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [visibles.length]);

    const cerrarTodas = () => {
        setAnimando('saliendo');
        setTimeout(() => { setVisibles([]); onCerrar(); }, 400);
    };

    const getKey = (n) => n.id ?? `${n.fkEmpleadoId}-${n.fkIdEmpresa}`;

    const handleClick = async (n) => {
        try {
            if (n.id) await historicosService.marcarLeida(n.id);
        } catch (_) {}
        marcarVista(getKey(n));
        cerrarTodas();
        navigate(`/empresas/${n.fkIdEmpresa}/reportes/empleados/conceptos?tab=proximasVac`);
    };

    const handleCerrarUna = (n) => {
        marcarVista(getKey(n));
        const nuevas = visibles.filter(v => getKey(v) !== getKey(n));
        setVisibles(nuevas);
        if (nuevas.length === 0) cerrarTodas();
    };

    if (visibles.length === 0) return null;

    return (
        <>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(120%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0);    opacity: 1; }
                    to   { transform: translateX(120%); opacity: 0; }
                }
            `}</style>
            <div style={styles.wrapper}>
                {visibles.slice(0, 3).map((n, i) => (
                    <div
                        key={getKey(n)}
                        style={{
                            ...styles.card,
                            animation: animando === 'saliendo'
                                ? 'slideOut 0.4s ease forwards'
                                : `slideIn 0.4s ease ${i * 80}ms forwards`,
                        }}
                    >
                        <div style={styles.topRow}>
                            <div style={styles.iconBox}>
                                <Bell size={16} color="#0B662A" />
                            </div>
                            <span style={styles.titulo}>Recordatorio de vacaciones</span>
                            <button
                                style={styles.btnX}
                                onClick={() => handleCerrarUna(n)}
                            >
                                <X size={14} color="#A3A3A3" />
                            </button>
                        </div>
                        <p style={styles.mensaje}>
                            <strong>{n.nombresEmp} {n.apellidosEmp}</strong> de{' '}
                            <strong>{n.nombreEmpresa}</strong> cumple un año de trabajo
                            el <strong>{n.proximaFechaVac}</strong>.
                            Faltan <strong>{n.diasRestantes} días</strong>.
                        </p>
                        <button style={styles.btnVer} onClick={() => handleClick(n)}>
                            Ver próximas vacaciones
                        </button>
                    </div>
                ))}
                {visibles.length > 3 && (
                    <div style={styles.cardExtra} onClick={() => {
                        cerrarTodas();
                        navigate('/notificaciones');
                    }}>
                        <Bell size={14} color="#0B662A" />
                        <span style={styles.extraTexto}>
                            +{visibles.length - 3} recordatorios más — ver todos
                        </span>
                    </div>
                )}
            </div>
        </>
    );
}

const styles = {
    wrapper:    { position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '360px' },
    card:       { backgroundColor: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1.5px solid #0B662A', opacity: 0 },
    topRow:     { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
    iconBox:    { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    titulo:     { fontSize: '13px', fontWeight: '700', color: '#272525', flex: 1, fontFamily: 'Nunito, sans-serif' },
    btnX:       { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' },
    mensaje:    { fontSize: '12px', color: '#272525', lineHeight: 1.5, margin: '0 0 12px 0', fontFamily: 'Nunito, sans-serif' },
    btnVer:     { backgroundColor: '#0B662A', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', width: '100%' },
    cardExtra:  { backgroundColor: '#E8F5EE', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
    extraTexto: { fontSize: '12px', fontWeight: '600', color: '#0B662A', fontFamily: 'Nunito, sans-serif' },
};