import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, X } from 'lucide-react';
import historicosService from '../../../services/historicosService';

const agrupar = (notificaciones) => {
    const hoy    = new Date();
    const grupos = { hoy: [], semana: [], quincena: [], mes: [], antiguos: [] };
    notificaciones.forEach(n => {
        const fecha = new Date(n.fechaDisparo);
        const diff  = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
        if (diff === 0)      grupos.hoy.push(n);
        else if (diff <= 7)  grupos.semana.push(n);
        else if (diff <= 15) grupos.quincena.push(n);
        else if (diff <= 30) grupos.mes.push(n);
        else                 grupos.antiguos.push(n);
    });
    return grupos;
};

const SECCIONES = [
    { key: 'hoy',      label: 'Hoy'             },
    { key: 'semana',   label: 'Últimos 7 días'  },
    { key: 'quincena', label: 'Últimos 15 días' },
    { key: 'mes',      label: 'Último mes'       },
    { key: 'antiguos', label: 'Más antiguos'     },
];

export default function NotificacionesPage() {
    const navigate = useNavigate();

    const [notificaciones, setNotificaciones] = useState([]);
    const [cargando,       setCargando]       = useState(false);
    const [empresa,        setEmpresa]        = useState('');
    const [fecha,          setFecha]          = useState('');

    useEffect(() => {
        return () => {
            window.dispatchEvent(new CustomEvent('actualizarBadgeNotif'));
        };
    }, []);

    const cargar = () => {
        setCargando(true);
        historicosService.getNotificaciones({
            nombreEmpresa: empresa || undefined,
            desde:         fecha   || undefined,
            hasta:         fecha   || undefined,
        })
        .then(res => setNotificaciones(res.data))
        .catch(() => setNotificaciones([]))
        .finally(() => setCargando(false));
    };

    useEffect(() => { cargar(); }, [empresa, fecha]);

    const handleClick = async (n) => {
        try {
            if (!n.leida) {
                await historicosService.marcarLeida(n.id);
                setNotificaciones(prev =>
                    prev.map(x => x.id === n.id ? { ...x, leida: true } : x)
                );
                window.dispatchEvent(new CustomEvent('actualizarBadgeNotif'));
            }
        } catch (_) {}
        navigate(`/empresas/${n.fkIdEmpresa}/reportes/empleados/conceptos?tab=proximasVac`);
    };

    const marcarTodas = async () => {
        try {
            await historicosService.marcarTodasLeidas();
            setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
            window.dispatchEvent(new CustomEvent('actualizarBadgeNotif'));
        } catch (_) {}
    };

    const grupos      = agrupar(notificaciones);
    const hayNoLeidas = notificaciones.some(n => !n.leida);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={18} color="#0B662A" />
                    <div>
                        <h2 style={styles.titulo}>Notificaciones</h2>
                        <p style={styles.subtitulo}>
                            Historial de recordatorios de próximas vacaciones
                        </p>
                    </div>
                </div>
                {hayNoLeidas && (
                    <button style={styles.btnMarcar} onClick={marcarTodas}>
                        Marcar todas como leídas
                    </button>
                )}
            </div>

            <div style={styles.filtros}>
                <div style={styles.fechaBox}>
                    <span style={styles.fechaLabel}>Nombre de empresa</span>
                    <div style={styles.searchBox}>
                        <Search size={14} color="#A3A3A3" />
                        <input
                            style={styles.searchInput}
                            placeholder="Ej: ConstruObras"
                            value={empresa}
                            onChange={e => setEmpresa(e.target.value)}
                        />
                        {empresa && (
                            <button style={styles.btnLimpiar} onClick={() => setEmpresa('')}>
                                <X size={12} color="#A3A3A3" />
                            </button>
                        )}
                    </div>
                </div>
                <div style={styles.fechaBox}>
                    <span style={styles.fechaLabel}>Fecha de disparo</span>
                    <input
                        type="date"
                        style={styles.fechaInput}
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                    />
                </div>
                {fecha && (
                    <button style={styles.btnLimpiarFecha} onClick={() => setFecha('')}>
                        <X size={14} color="#A3A3A3" /> Limpiar fecha
                    </button>
                )}
            </div>

            {cargando ? (
                <p style={styles.vacio}>Cargando...</p>
            ) : notificaciones.length === 0 ? (
                <p style={styles.vacio}>No hay notificaciones</p>
            ) : (
                SECCIONES.map(({ key, label }) =>
                    grupos[key].length === 0 ? null : (
                        <div key={key} style={styles.seccion}>
                            <p style={styles.seccionLabel}>{label}</p>
                            {grupos[key].map(n => (
                                <div
                                    key={n.id}
                                    style={{
                                        ...styles.card,
                                        opacity:     n.leida ? 0.6 : 1,
                                        borderColor: n.leida ? '#D0D0D0' : '#0B662A',
                                        cursor:      'pointer',
                                    }}
                                    onClick={() => handleClick(n)}
                                >
                                    <div style={styles.cardTop}>
                                        <div style={styles.iconBox}>
                                            <Bell size={14} color={n.leida ? '#A3A3A3' : '#0B662A'} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={styles.cardTitulo}>
                                                {n.nombresEmp} {n.apellidosEmp}
                                                {!n.leida && (
                                                    <span style={styles.badge}>Nueva</span>
                                                )}
                                            </p>
                                            <p style={styles.cardEmpresa}>{n.nombreEmpresa}</p>
                                        </div>
                                        <p style={styles.cardFecha}>{n.fechaDisparo}</p>
                                    </div>
                                    <p style={styles.cardMensaje}>
                                        Próximas vacaciones el{' '}
                                        <strong>{n.proximaFechaVac}</strong> —{' '}
                                        faltan <strong>{n.diasRestantes} días</strong>
                                    </p>
                                </div>
                            ))}
                        </div>
                    )
                )
            )}
        </div>
    );
}

const styles = {
    container:       { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' },
    header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    titulo:          { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
    subtitulo:       { fontSize: '12px', color: '#A3A3A3', margin: 0 },
    btnMarcar:       { background: 'none', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
    filtros:         { display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' },
    fechaBox:        { display: 'flex', flexDirection: 'column', gap: '4px' },
    fechaLabel:      { fontSize: '11px', color: '#A3A3A3', fontWeight: '600' },
    searchBox:       { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '260px' },
    searchInput:     { border: 'none', outline: 'none', boxShadow: 'none', backgroundColor: 'transparent', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
    btnLimpiar:      { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 },
    fechaInput:      { border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', backgroundColor: '#fff', color: '#272525', cursor: 'pointer' },
    btnLimpiarFecha: { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
    seccion:         { display: 'flex', flexDirection: 'column', gap: '8px' },
    seccionLabel:    { fontSize: '12px', fontWeight: '700', color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '8px 0 4px 0' },
    card:            { backgroundColor: '#fff', borderRadius: '12px', padding: '14px 16px', border: '1.5px solid #0B662A', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'opacity 0.2s, border-color 0.2s' },
    cardTop:         { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
    iconBox:         { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    cardTitulo:      { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
    badge:           { backgroundColor: '#0B662A', color: '#fff', borderRadius: '12px', padding: '2px 8px', fontSize: '10px', fontWeight: '700' },
    cardEmpresa:     { fontSize: '11px', color: '#A3A3A3', margin: '2px 0 0 0' },
    cardFecha:       { fontSize: '11px', color: '#A3A3A3', whiteSpace: 'nowrap' },
    cardMensaje:     { fontSize: '12px', color: '#272525', margin: 0, lineHeight: 1.5 },
    vacio:           { textAlign: 'center', color: '#A3A3A3', fontSize: '13px', padding: '40px 0' },
};