import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { CreditCard, ChevronLeft, ChevronRight, UserRound, Calendar, ChevronDown, Eye } from 'lucide-react';
import MensajeModal from '../../../../../components/MensajeModal';
import { usePrimaStore } from '../../../../../store/usePrimaStore';
import payrollService from '../../../../../services/payrollService';

function CalendarioInput({ value, onChange, placeholder = 'DD/MM/YYYY' }) {
  const [abierto, setAbierto] = useState(false);
  const hoy = new Date();
  const [mes, setMes]   = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());

  const meses     = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const diasSem   = ['S','M','T','W','T','F','S'];
  const primerDia = new Date(anio, mes, 1).getDay();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const diasAnt   = new Date(anio, mes, 0).getDate();

  const seleccionar = (dia) => {
    onChange(`${String(dia).padStart(2,'0')}/${String(mes+1).padStart(2,'0')}/${anio}`);
    setAbierto(false);
  };

  const anteriorMes  = () => { if (mes === 0) { setMes(11); setAnio(anio-1); } else setMes(mes-1); };
  const siguienteMes = () => { if (mes === 11) { setMes(0); setAnio(anio+1); } else setMes(mes+1); };

  const diaS  = value ? Number(value.split('/')[0]) : null;
  const mesS  = value ? Number(value.split('/')[1])-1 : null;
  const anioS = value ? Number(value.split('/')[2]) : null;

  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push({ dia: diasAnt - primerDia + 1 + i, actual: false });
  for (let i = 1; i <= diasEnMes; i++) celdas.push({ dia: i, actual: true });
  for (let i = 1; i <= 42 - celdas.length; i++) celdas.push({ dia: i, actual: false });

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
      <div
        style={{ ...styles.input, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setAbierto(!abierto)}
      >
        <span style={{ color: value ? '#272525' : '#A3A3A3', fontSize: '13px' }}>{value || placeholder}</span>
        <Calendar size={16} color="#A3A3A3" />
      </div>
      {abierto && (
        <div style={styles.calendario}>
          <div style={styles.calHeader}>
            <button style={styles.calBtn} onClick={anteriorMes}><ChevronLeft size={16} /></button>
            <span style={styles.calMes}>{meses[mes]} {anio}</span>
            <button style={styles.calBtn} onClick={siguienteMes}><ChevronRight size={16} /></button>
          </div>
          <div style={styles.calGrid}>
            {diasSem.map((d,i) => <div key={i} style={styles.calDiaSem}>{d}</div>)}
            {celdas.map((c,i) => {
              const sel = c.actual && c.dia === diaS && mes === mesS && anio === anioS;
              const esHoy = c.actual && c.dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();
              return (
                <div key={i} onClick={() => c.actual && seleccionar(c.dia)}
                  style={{ ...styles.calDia, color: !c.actual ? '#D0D0D0' : sel ? '#fff' : '#272525', backgroundColor: sel ? '#0B662A' : 'transparent', border: esHoy && !sel ? '1px solid #0B662A' : '1px solid transparent', borderRadius: '50%', cursor: c.actual ? 'pointer' : 'default' }}>
                  {c.dia}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const SEMESTRES = ['Primer semestre', 'Segundo semestre'];
const SEMESTRE_A_PERIODO = {
  'Primer semestre': 1,
  'Segundo semestre': 2,
};

function SelectSemestre({ value, onChange }) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.select}>
        <option value="">Seleccionar opción</option>
        {SEMESTRES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <ChevronDown size={16} color="#A3A3A3" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    </div>
  );
}

export default function GenerarReportePrimasPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [fechaInicio, setFechaInicio]     = useState('');
  const [fechaFin, setFechaFin]           = useState('');
  const [semestre, setSemestre]           = useState('');
  const [seleccionados, setSeleccionados] = useState([]);
  const [modal, setModal]                 = useState(null);
  const [hoverSeguir, setHoverSeguir]     = useState(false);

  const todosSeleccionados =
    seleccionados.length === empleados.length && empleados.length > 0;

  const toggleTodos = () => {
    if (todosSeleccionados) setSeleccionados([]);
    else setSeleccionados(empleados.map(e => e.empleadoId));
  };

  const toggleEmpleado = (empId) => {
    setSeleccionados(prev =>
      prev.includes(empId)
        ? prev.filter(i => i !== empId)
        : [...prev, empId]
    );
  };

  const camposCompletos = fechaInicio && fechaFin && semestre && seleccionados.length > 0;

  const handleSeguir = async () => {
    if (!camposCompletos) { setModal('error'); return; }

    try {
      const [diaInicio, mesInicio, anioInicio] = fechaInicio.split('/');
      const [diaFin,    mesFin,    anioFin]    = fechaFin.split('/');

      const payload = {
        empresaId:   Number(id),
        tipoProceso: 'PRIMA_SEMESTRAL',
        anio:        Number(anioInicio),
        periodo:     SEMESTRE_A_PERIODO[semestre],
        fechaInicio: `${anioInicio}-${mesInicio}-${diaInicio}`,
        fechaFin:    `${anioFin}-${mesFin}-${diaFin}`,
      };

      const { data } = await payrollService.crearProceso(payload);
      usePrimaStore.getState().setProcesoActual(data);
      usePrimaStore.getState().setEmpleadosSeleccionados(seleccionados);
      navigate(`/empresas/${id}/primas/${data.procesoLiquiId}/desprendibles`);
    } catch {
      setModal('error');
    }
  };

  const [empleados,   setEmpleados]   = useState([]);
  const [cargandoEmp, setCargandoEmp] = useState(false);

  useEffect(() => {
    if (!id) return;
    setCargandoEmp(true);
    payrollService.getEmpleadosActivos(id)
      .then(({ data }) => setEmpleados(data))
      .catch(() => {})
      .finally(() => setCargandoEmp(false));
  }, [id]);


  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Generar reporte prima</h2>
            <p style={styles.subtitulo}>Llena los datos que solicita el formulario para generar los desprendibles de prima de los empleados asociados a la empresa</p>
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

      {/* Volver */}
      <button style={styles.volverBtn} onClick={() => navigate(-1)}>
        <ChevronLeft size={16} color="#272525" />
        <span>Volver</span>
      </button>

      {/* Card 1 — Cabecera */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Generar Cabecera de Reporte Prima</h3>
        <p style={styles.seccionTitulo}>Periodo de Liquidación</p>
        <div style={styles.filaFechas}>
          <div style={styles.campoBox}>
            <label style={styles.label}>Fecha de inicio de corte <span style={styles.req}>*</span></label>
            <CalendarioInput value={fechaInicio} onChange={setFechaInicio} />
          </div>
          <div style={styles.campoBox}>
            <label style={styles.label}>Fecha de fin de corte <span style={styles.req}>*</span></label>
            <CalendarioInput value={fechaFin} onChange={setFechaFin} />
          </div>
          <div style={styles.campoBox}>
            <label style={styles.label}>Semestre a liquidar <span style={styles.req}>*</span></label>
            <SelectSemestre value={semestre} onChange={setSemestre} />
          </div>
        </div>
      </div>

      {/* Card 2 — Empleados */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Primas</h3>
        <p style={styles.descripcion}>
          Marque las casillas de los empleados a los que les liquidará la prima para la generación de sus respectivos desprendibles correspondientes al periodo seleccionado.
        </p>
        <p style={styles.seccionTitulo}>Empleados</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                <th style={{ ...styles.th, textAlign: 'left' }}>Nombre(s)</th>
                <th style={styles.th}>Apellidos</th>
                <th style={styles.th}>Fecha de ingreso</th>
                <th style={styles.th}>Número de documento</th>
                <th style={styles.th}>Ver prima</th>
                <th style={styles.th}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span>Seleccionar</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#A3A3A3', fontWeight: '400' }}>Seleccionar todos</span>
                      <input type="checkbox" checked={todosSeleccionados} onChange={toggleTodos} style={styles.checkbox} />
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {cargandoEmp ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                    Cargando empleados...
                  </td>
                </tr>
              ) : empleados.map((emp, i) => (
                <tr key={emp.empleadoId}
                  style={i % 2 === 0 ? styles.trPar : styles.trImpar}>
                  <td style={{ ...styles.td, textAlign: 'left' }}>{emp.nombresEmp}</td>
                  <td style={styles.td}>{emp.apellidosEmp}</td>
                  <td style={styles.td}>{emp.fechaIngresoEmp}</td>
                  <td style={styles.td}>{emp.documentoEmp}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.iconBtn}
                      onClick={() => navigate(
                        `/empresas/${id}/primas/ver-prima/${emp.empleadoId}`
                      )}
                      title="Ver prima"
                    >
                      <Eye size={16} color="#0B662A" />
                    </button>
                  </td>
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(emp.empleadoId)}
                      onChange={() => toggleEmpleado(emp.empleadoId)}
                      style={styles.checkbox}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botones */}
      <div style={styles.botonesRow}>
        <button
          style={{ ...styles.btnSeguir, background: hoverSeguir ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A', transition: 'background 0.3s ease', opacity: camposCompletos ? 1 : 0.7 }}
          onMouseEnter={() => setHoverSeguir(true)}
          onMouseLeave={() => setHoverSeguir(false)}
          onClick={handleSeguir}
        >
          Seguir proceso de liquidación
        </button>
        <button style={styles.btnCancelar} onClick={() => navigate(-1)}>Cancelar</button>
      </div>

      <MensajeModal tipo={modal} mensaje="Por favor completa todos los campos obligatorios y selecciona al menos un empleado." onClose={() => setModal(null)} />

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
  cardTitulo:   { fontSize: '16px', fontWeight: '800', color: '#272525', margin: '0 0 24px 0' },
  seccionTitulo:{ fontSize: '14px', fontWeight: '700', color: '#272525', margin: '0 0 16px 0' },
  descripcion:  { fontSize: '13px', color: '#555', margin: '0 0 20px 0', lineHeight: 1.7 },
  filaFechas:   { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  campoBox:     { flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '6px' },
  label:        { fontSize: '13px', fontWeight: '600', color: '#272525' },
  req:          { color: '#E53E3E' },
  input:        { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '11px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', color: '#272525', width: '100%', boxSizing: 'border-box', userSelect: 'none' },
  select:       { width: '100%', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '11px 36px 11px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', appearance: 'none', WebkitAppearance: 'none', backgroundColor: '#fff', color: '#272525', cursor: 'pointer', boxSizing: 'border-box' },
  tabla:        { width: '100%', borderCollapse: 'collapse', minWidth: '650px' },
  th:           { fontSize: '12px', fontWeight: '700', color: '#A3A3A3', padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:           { fontSize: '13px', color: '#272525', padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' },
  trPar:        { backgroundColor: '#fff' },
  trImpar:      { backgroundColor: '#FAFAFA' },
  checkbox:     { width: '16px', height: '16px', accentColor: '#0B662A', cursor: 'pointer' },
  iconBtn:      { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', margin: '0 auto' },
  botonesRow:   { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px', flexWrap: 'wrap' },
  btnSeguir:    { color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 40px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnCancelar:  { color: '#0B662A', border: '1px solid #0B662A', borderRadius: '8px', padding: '14px 40px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', backgroundColor: '#fff' },
  calendario:   { position: 'absolute', top: '110%', left: 0, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', padding: '16px', zIndex: 100, width: '280px' },
  calHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  calMes:       { fontSize: '14px', fontWeight: '700', color: '#272525' },
  calBtn:       { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' },
  calGrid:      { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' },
  calDiaSem:    { fontSize: '11px', fontWeight: '700', color: '#A3A3A3', padding: '4px 0' },
  calDia:       { fontSize: '12px', padding: '6px 2px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', margin: '0 auto' },
};
