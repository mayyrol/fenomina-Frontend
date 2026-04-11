import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { FileText, ChevronDown, ChevronLeft, ChevronRight, Plus, Trash2, Calendar } from 'lucide-react';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import MensajeModal from '../../../../../components/MensajeModal';
import { UserCircle } from 'lucide-react';

function CalendarioInput({ value, onChange, placeholder = 'DD/MM/YYYY', error }) {
  const [abierto, setAbierto] = useState(false);
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());

  const meses = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];
  const diasSemana = ['S','M','T','W','T','F','S'];
  const primerDia      = new Date(anio, mes, 1).getDay();
  const diasEnMes      = new Date(anio, mes + 1, 0).getDate();
  const diasAnteriores = new Date(anio, mes, 0).getDate();

  const seleccionarDia = (dia) => {
    const d = String(dia).padStart(2, '0');
    const m = String(mes + 1).padStart(2, '0');
    onChange(`${d}/${m}/${anio}`);
    setAbierto(false);
  };

  const anteriorMes  = () => { if (mes === 0) { setMes(11); setAnio(anio - 1); } else setMes(mes - 1); };
  const siguienteMes = () => { if (mes === 11) { setMes(0); setAnio(anio + 1); } else setMes(mes + 1); };

  const diaSeleccionado  = value ? Number(value.split('/')[0]) : null;
  const mesSeleccionado  = value ? Number(value.split('/')[1]) - 1 : null;
  const anioSeleccionado = value ? Number(value.split('/')[2]) : null;

  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push({ dia: diasAnteriores - primerDia + 1 + i, actual: false });
  for (let i = 1; i <= diasEnMes; i++) celdas.push({ dia: i, actual: true });
  const restantes = 42 - celdas.length;
  for (let i = 1; i <= restantes; i++) celdas.push({ dia: i, actual: false });

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <div
        style={{ ...styles.input, border: error ? '1px solid #E53E3E' : '1px solid #D0D0D0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
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
            {diasSemana.map((d, i) => <div key={i} style={styles.calDiaSemana}>{d}</div>)}
            {celdas.map((c, i) => {
              const esSeleccionado = c.actual && c.dia === diaSeleccionado && mes === mesSeleccionado && anio === anioSeleccionado;
              const esHoy = c.actual && c.dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();
              return (
                <div key={i} onClick={() => c.actual && seleccionarDia(c.dia)}
                  style={{ ...styles.calDia, color: !c.actual ? '#D0D0D0' : esSeleccionado ? '#fff' : '#272525', backgroundColor: esSeleccionado ? '#0B662A' : 'transparent', border: esHoy && !esSeleccionado ? '1px solid #0B662A' : '1px solid transparent', borderRadius: '50%', cursor: c.actual ? 'pointer' : 'default' }}>
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

function SelectWrapper({ value, onChange, options, placeholder = 'Seleccionar opción' }) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.select}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
    </div>
  );
}

const OPCIONES_TIEMPO_LICENCIAS = [
  'INCAPACIDAD POR ORIGEN COMUN','INCAPACIDAD POR ORIGEN LABORAL',
  'LICENCIA MATERNIDAD/PATERNIDAD','LICENCIA CALAMIDAD DOMÉSTICA',
  'LICENCIA POR MATRIMONIO','LICENCIA LEY ISAAC','LICENCIA POR SUFRAGIO',
  'LICENCIA NO REMUNERADA','CARGOS TRANSITORIOS','CITACIONES JUDICIALES',
  'OTROS PERMISOS REMUNERADOS PACTADOS','AUSENCIAS NO PACTADAS NI REMUNERADAS',
];

const OPCIONES_HORAS_EXTRA = [
  'RECARGO NOCTURNO','RECARGO DOMINICAL O FESTIVO',
  'RECARGO NOCTURNO EN DOMINICAL O FESTIVO','HORAS EXTRA DIURNAS',
  'HORAS EXTRA NOCTURNAS','HORAS EXTRA DIURNAS DOMINICALES O FESTIVAS',
  'HORAS EXTRA NOCTURNAS DOMINICALES O FESTIVAS',
];

const OPCIONES_PAGOS_EXTRA = [
  'BENEFICIO O EXTRALEGAL','COMISION',
  'BONIFICACIONES OCASIONALES O POR MERA LIBERALIDAD',
  'OTROS PAGOS QUE NO CONSTITUYEN EL SALARIO',
];

const OPCIONES_VACACIONES = [
  'VACACIONES DISFRUTADAS','VACACIONES COMPENSADAS EN DINERO',
];

const filaVacia      = () => ({ nombre: '', fechaInicio: '', fechaFin: '' });
const filaVaciaHoras = () => ({ nombre: '', fecha: '', cantidad: '' });
const filaVaciaPagos = () => ({ nombre: '', fecha: '', monto: '' });
const filaVaciaOtros = () => ({ descripcion: '', monto: '', fecha: '', constituyeSalario: 'si' });
const filaVaciaReten = () => ({ descripcion: '', monto: '', fecha: '' });

const soloNumeros = (e) => {
  if (!/[0-9.,]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }
};

export default function NovedadesPage() {
  const navigate             = useNavigate();
  const { id, nominaId }     = useParams();
  const { usuario }          = useAuthStore();

  const inicial = usuario?.nombresUsuario?.charAt(0).toUpperCase() ?? 'U';
  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

  const [diasLaborados, setDiasLaborados] = useState('');
  const [tiempoLic, setTiempoLic]         = useState([filaVacia()]);
  const [horasExtra, setHorasExtra]       = useState([filaVaciaHoras()]);
  const [pagosExtra, setPagosExtra]       = useState([filaVaciaPagos()]);
  const [vacaciones, setVacaciones]       = useState([filaVacia()]);
  const [reporteVacaciones, setReporteVacaciones] = useState(false);
  const [otrosDeveng, setOtrosDeveng]     = useState([filaVaciaOtros()]);
  const [retencion, setRetencion]         = useState([filaVaciaReten()]);
  const [otrosDeducir, setOtrosDeducir]   = useState([filaVaciaOtros()]);

  const [modal, setModal]                         = useState(null);
  const [confirmarGuardar, setConfirmarGuardar]   = useState(false);
  const [confirmarBorrador, setConfirmarBorrador] = useState(false);
  const [hoverGuardar, setHoverGuardar]           = useState(false);
  const [hoverBorrador, setHoverBorrador]         = useState(false);
  const [hoverRegresar, setHoverRegresar]         = useState(false);

  const updateFila = (setter, arr, i, campo, valor) => {
    const n = [...arr]; n[i] = { ...n[i], [campo]: valor }; setter(n);
  };
  const addFila    = (setter, arr, empty) => setter([...arr, empty()]);
  const removeFila = (setter, arr, i) => arr.length > 1 && setter(arr.filter((_, idx) => idx !== i));

  const campo = (label, children, i) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {i === 0 && <label style={styles.label}>{label}</label>}
      {children}
    </div>
  );

  const iconos = (onAdd, onRemove, disabled, i) => (
    <div style={{ ...styles.iconosRow, marginTop: i === 0 ? '22px' : '0' }}>
      <button style={styles.btnIcono} onClick={onAdd}><Plus size={16} color="#0B662A" /></button>
      <button style={{ ...styles.btnIcono, opacity: disabled ? 0.4 : 1 }} onClick={onRemove} disabled={disabled}>
        <Trash2 size={16} color="#A3A3A3" />
      </button>
    </div>
  );

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Novedades</h2>
            <p style={styles.subtitulo}>Llena el formulario de novedades que registró el empleado dentro del periodo a liquidar</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}>
            <UserCircle size={28} color="#555" />
          </div>
          <div>
            <p style={styles.perfilNombre}>{nombre}</p>
            <p style={styles.perfilCargo}>{cargo}</p>
          </div>
        </div>
      </div>

      {/* ── Card 1: Base de Liquidación ── */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Novedades</h3>
        <p style={styles.seccionTitulo}>Base de Liquidación</p>
        <p style={styles.descripcion}>
          Ingrese el número de días efectivamente trabajados en el periodo (máximo 30).{' '}
          <strong>Recuerde que si el empleado trabaja bajo una jornada por horas, cuenta con el espacio para registrar dicha novedad.</strong>
        </p>
        <div style={{ maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={styles.label}>Días laborados</label>
          <input
            value={diasLaborados}
            onChange={(e) => setDiasLaborados(e.target.value)}
            onKeyDown={soloNumeros}
            placeholder="Ingresar número"
            style={styles.input}
          />
        </div>
      </div>

      {/* ── Card 2: Novedades de Tiempo y Licencias ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Novedades de Tiempo y Licencias</p>
        <p style={styles.descripcion}>
          Registre aquí cualquier situación que haya afectado la jornada laboral normal del trabajador, ya sea por motivos de salud, legales o permisos personales.
        </p>
        {tiempoLic.map((f, i) => (
          <div key={i} style={styles.filaRow}>
            {campo('Nombre de novedad', <SelectWrapper value={f.nombre} onChange={(v) => updateFila(setTiempoLic, tiempoLic, i, 'nombre', v)} options={OPCIONES_TIEMPO_LICENCIAS} />, i)}
            {campo('Fecha de inicio de la novedad', <CalendarioInput value={f.fechaInicio} onChange={(v) => updateFila(setTiempoLic, tiempoLic, i, 'fechaInicio', v)} />, i)}
            {campo('Fecha de fin de la novedad', <CalendarioInput value={f.fechaFin} onChange={(v) => updateFila(setTiempoLic, tiempoLic, i, 'fechaFin', v)} />, i)}
            {iconos(() => addFila(setTiempoLic, tiempoLic, filaVacia), () => removeFila(setTiempoLic, tiempoLic, i), tiempoLic.length === 1, i)}
          </div>
        ))}
      </div>

      {/* ── Card 3: Horas Extra y Recargos ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Horas Extra y Recargos</p>
        <p style={styles.descripcion}>
          Indique la cantidad de horas adicionales laboradas fuera de la jornada ordinaria o en horarios especiales para el cálculo de sus respectivos recargos.
        </p>
        {horasExtra.map((f, i) => (
          <div key={i} style={styles.filaRow}>
            {campo('Nombre de novedad', <SelectWrapper value={f.nombre} onChange={(v) => updateFila(setHorasExtra, horasExtra, i, 'nombre', v)} options={OPCIONES_HORAS_EXTRA} />, i)}
            {campo('Fecha de novedad', <CalendarioInput value={f.fecha} onChange={(v) => updateFila(setHorasExtra, horasExtra, i, 'fecha', v)} />, i)}
            {campo('Cantidad de horas o recargos',
              <input value={f.cantidad} onChange={(e) => updateFila(setHorasExtra, horasExtra, i, 'cantidad', e.target.value)} onKeyDown={soloNumeros} placeholder="Ingresar número" style={styles.input} />, i)}
            {iconos(() => addFila(setHorasExtra, horasExtra, filaVaciaHoras), () => removeFila(setHorasExtra, horasExtra, i), horasExtra.length === 1, i)}
          </div>
        ))}
      </div>

      {/* ── Card 4: Pagos Extralegales y Compensaciones ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Pagos Extralegales y Compensaciones</p>
        <p style={styles.descripcion}>
          Ingrese los montos correspondientes a incentivos, premios o beneficios adicionales pactados que deba recibir el colaborador en este periodo.
        </p>
        {pagosExtra.map((f, i) => (
          <div key={i} style={styles.filaRow}>
            {campo('Nombre de novedad', <SelectWrapper value={f.nombre} onChange={(v) => updateFila(setPagosExtra, pagosExtra, i, 'nombre', v)} options={OPCIONES_PAGOS_EXTRA} />, i)}
            {campo('Fecha de novedad', <CalendarioInput value={f.fecha} onChange={(v) => updateFila(setPagosExtra, pagosExtra, i, 'fecha', v)} />, i)}
            {campo('Monto (valor del pago o compensación)',
              <input value={f.monto} onChange={(e) => updateFila(setPagosExtra, pagosExtra, i, 'monto', e.target.value)} onKeyDown={soloNumeros} placeholder="Ingresar monto" style={styles.input} />, i)}
            {iconos(() => addFila(setPagosExtra, pagosExtra, filaVaciaPagos), () => removeFila(setPagosExtra, pagosExtra, i), pagosExtra.length === 1, i)}
          </div>
        ))}
      </div>

      {/* ── Card 5: Vacaciones ── */}
        <div style={styles.card}>
        <p style={styles.seccionTitulo}>Vacaciones</p>
        <p style={styles.descripcion}>
            Reporte si el trabajador tomó días de descanso remunerado o si se realizó el pago en dinero de un periodo de vacaciones pendiente.
        </p>
        {vacaciones.map((f, i) => (
            <div key={i} style={styles.filaRow}>
            {campo('Nombre de novedad', <SelectWrapper value={f.nombre} onChange={(v) => updateFila(setVacaciones, vacaciones, i, 'nombre', v)} options={OPCIONES_VACACIONES} />, i)}
            {campo('Fecha de inicio de la novedad', <CalendarioInput value={f.fechaInicio} onChange={(v) => updateFila(setVacaciones, vacaciones, i, 'fechaInicio', v)} />, i)}
            {campo('Fecha de fin de la novedad', <CalendarioInput value={f.fechaFin} onChange={(v) => updateFila(setVacaciones, vacaciones, i, 'fechaFin', v)} />, i)}
            {iconos(() => addFila(setVacaciones, vacaciones, filaVacia), () => removeFila(setVacaciones, vacaciones, i), vacaciones.length === 1, i)}
            </div>
        ))}

        {/* Checkbox reporte desprendible */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '8px' }}>
            <input
            type="checkbox"
            checked={reporteVacaciones}
            onChange={(e) => setReporteVacaciones(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#0B662A', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#272525' }}>
            Ver reporte de vacaciones en el desprendible
            </span>
        </label>
        </div>

      {/* ── Card 6: Otros Conceptos a Devengar ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Otros Conceptos a Devengar</p>
        <p style={styles.descripcion}>
          Registre cualquier otro ingreso a favor del trabajador no incluido en las secciones anteriores.
        </p>
        {otrosDeveng.map((f, i) => (
          <div key={i} style={styles.filaRow}>
            {campo('Descripción concepto',
              <input value={f.descripcion} onChange={(e) => updateFila(setOtrosDeveng, otrosDeveng, i, 'descripcion', e.target.value)} placeholder="Ingresar breve descripción" style={styles.input} />, i)}
            {campo('Monto/Valor del concepto a devenir',
              <input value={f.monto} onChange={(e) => updateFila(setOtrosDeveng, otrosDeveng, i, 'monto', e.target.value)} onKeyDown={soloNumeros} placeholder="Ingresar monto" style={styles.input} />, i)}
            {campo('Fecha de la novedad', <CalendarioInput value={f.fecha} onChange={(v) => updateFila(setOtrosDeveng, otrosDeveng, i, 'fecha', v)} />, i)}
            <div style={{ flex: '0 0 160px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {i === 0 && <label style={styles.label}>¿Constituye salario?</label>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '43px' }}>
                <label style={styles.radioLabel}>
                  <input type="radio" name={`deveng-sal-${i}`} value="si" checked={f.constituyeSalario === 'si'} onChange={() => updateFila(setOtrosDeveng, otrosDeveng, i, 'constituyeSalario', 'si')} style={styles.radio} /> Sí
                </label>
                <label style={styles.radioLabel}>
                  <input type="radio" name={`deveng-sal-${i}`} value="no" checked={f.constituyeSalario === 'no'} onChange={() => updateFila(setOtrosDeveng, otrosDeveng, i, 'constituyeSalario', 'no')} style={styles.radio} /> No
                </label>
              </div>
            </div>
            {iconos(() => addFila(setOtrosDeveng, otrosDeveng, filaVaciaOtros), () => removeFila(setOtrosDeveng, otrosDeveng, i), otrosDeveng.length === 1, i)}
          </div>
        ))}
      </div>

      {/* ── Card 7: Retención en la Fuente ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Retención en la Fuente</p>
        <p style={styles.descripcion}>
          Monto calculado para el impuesto de renta según el procedimiento de ley.
        </p>
        {retencion.map((f, i) => (
          <div key={i} style={styles.filaRow}>
            {campo('Descripción concepto',
              <input value={f.descripcion} onChange={(e) => updateFila(setRetencion, retencion, i, 'descripcion', e.target.value)} placeholder="Ingresar breve descripción" style={styles.input} />, i)}
            {campo('Monto/Valor de retención',
              <input value={f.monto} onChange={(e) => updateFila(setRetencion, retencion, i, 'monto', e.target.value)} onKeyDown={soloNumeros} placeholder="Ingresar monto" style={styles.input} />, i)}
            {campo('Fecha de la novedad', <CalendarioInput value={f.fecha} onChange={(v) => updateFila(setRetencion, retencion, i, 'fecha', v)} />, i)}
            {iconos(() => addFila(setRetencion, retencion, filaVaciaReten), () => removeFila(setRetencion, retencion, i), retencion.length === 1, i)}
          </div>
        ))}
      </div>

      {/* ── Card 8: Otros Conceptos a Deducir ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Otros Conceptos a Deducir</p>
        <p style={styles.descripcion}>
          Descuentos manuales como préstamos, fondos de empleados o ajustes negativos.
        </p>
        {otrosDeducir.map((f, i) => (
          <div key={i} style={styles.filaRow}>
            {campo('Descripción concepto',
              <input value={f.descripcion} onChange={(e) => updateFila(setOtrosDeducir, otrosDeducir, i, 'descripcion', e.target.value)} placeholder="Ingresar breve descripción" style={styles.input} />, i)}
            {campo('Monto/Valor del concepto a devenir',
              <input value={f.monto} onChange={(e) => updateFila(setOtrosDeducir, otrosDeducir, i, 'monto', e.target.value)} onKeyDown={soloNumeros} placeholder="Ingresar monto" style={styles.input} />, i)}
            {campo('Fecha de la novedad', <CalendarioInput value={f.fecha} onChange={(v) => updateFila(setOtrosDeducir, otrosDeducir, i, 'fecha', v)} />, i)}
            <div style={{ flex: '0 0 160px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {i === 0 && <label style={styles.label}>¿Constituye salario?</label>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '43px' }}>
                <label style={styles.radioLabel}>
                  <input type="radio" name={`deducir-sal-${i}`} value="si" checked={f.constituyeSalario === 'si'} onChange={() => updateFila(setOtrosDeducir, otrosDeducir, i, 'constituyeSalario', 'si')} style={styles.radio} /> Sí
                </label>
                <label style={styles.radioLabel}>
                  <input type="radio" name={`deducir-sal-${i}`} value="no" checked={f.constituyeSalario === 'no'} onChange={() => updateFila(setOtrosDeducir, otrosDeducir, i, 'constituyeSalario', 'no')} style={styles.radio} /> No
                </label>
              </div>
            </div>
            {iconos(() => addFila(setOtrosDeducir, otrosDeducir, filaVaciaOtros), () => removeFila(setOtrosDeducir, otrosDeducir, i), otrosDeducir.length === 1, i)}
          </div>
        ))}
      </div>

      {/* ── Botones finales ── */}
      <div style={styles.botonesRow}>
        <button
          style={{ ...styles.btnGuardarCerrar, background: hoverGuardar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A', transition: 'background 0.3s ease' }}
          onMouseEnter={() => setHoverGuardar(true)} onMouseLeave={() => setHoverGuardar(false)}
          onClick={() => setConfirmarGuardar(true)}
        >
          Guardar y Cerrar Proceso
        </button>
        <button
          style={{ ...styles.btnBorrador, background: hoverBorrador ? 'linear-gradient(135deg, #f0f0f0, #e0e0e0)' : '#fff', transition: 'background 0.3s ease' }}
          onMouseEnter={() => setHoverBorrador(true)} onMouseLeave={() => setHoverBorrador(false)}
          onClick={() => setConfirmarBorrador(true)}
        >
          Guardar Borrador
        </button>
        <button
          style={{ ...styles.btnRegresar, background: hoverRegresar ? 'linear-gradient(135deg, #f0f0f0, #e0e0e0)' : '#fff', transition: 'background 0.3s ease' }}
          onMouseEnter={() => setHoverRegresar(true)} onMouseLeave={() => setHoverRegresar(false)}
          onClick={() => navigate(-1)}
        >
          Regresar
        </button>
      </div>

      <ConfirmarCambiosModal
        visible={confirmarGuardar}
        onCancelar={() => setConfirmarGuardar(false)}
        onConfirmar={() => { setConfirmarGuardar(false); setModal('exito'); }}
        titulo="¿Deseas guardar y cerrar el proceso?"
        descripcion="Una vez confirmes, el proceso será cerrado y los datos guardados definitivamente."
      />
      <ConfirmarCambiosModal
        visible={confirmarBorrador}
        onCancelar={() => setConfirmarBorrador(false)}
        onConfirmar={() => { setConfirmarBorrador(false); setModal('exito'); }}
        titulo="¿Deseas guardar como borrador?"
        descripcion="Los datos serán guardados temporalmente y podrás continuar editando más tarde."
      />
      <MensajeModal tipo={modal} onClose={() => { setModal(null); if (modal === 'exito') navigate(-1); }} />

    </div>
  );
}

const styles = {
  container:       { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '20px' },
  header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:          { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:       { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:       { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:          { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', color: '#272525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  perfilNombre:    { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:     { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  card:            { backgroundColor: '#fff', borderRadius: '16px', padding: '36px 40px' },
  cardTitulo:      { fontSize: '20px', fontWeight: '800', color: '#272525', margin: '0 0 32px 0' },
  seccionTitulo:   { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 12px 0' },
  descripcion:     { fontSize: '13px', color: '#555', margin: '0 0 24px 0', lineHeight: 1.7 },
  label:           { fontSize: '13px', fontWeight: '600', color: '#272525' },
  input:           { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '11px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', color: '#272525', width: '100%', boxSizing: 'border-box' },
  select:          { width: '100%', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '11px 36px 11px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundColor: '#fff', color: '#272525', cursor: 'pointer', backgroundImage: 'none', boxSizing: 'border-box' },
  selectIcon:      { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  filaRow:         { display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '16px' },
  iconosRow:       { display: 'flex', gap: '8px', flexShrink: 0 },
  btnIcono:        { width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #D0D0D0', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
  radioLabel:      { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#272525', cursor: 'pointer' },
  radio:           { accentColor: '#0B662A', width: '16px', height: '16px', cursor: 'pointer' },
  botonesRow:      { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px' },
  btnGuardarCerrar:{ color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 40px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnBorrador:     { color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '14px 40px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnRegresar:     { color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '14px 40px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  calendario:      { position: 'absolute', top: '110%', left: 0, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', padding: '16px', zIndex: 100, width: '280px' },
  calHeader:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  calMes:          { fontSize: '14px', fontWeight: '700', color: '#272525' },
  calBtn:          { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' },
  calGrid:         { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' },
  calDiaSemana:    { fontSize: '11px', fontWeight: '700', color: '#A3A3A3', padding: '4px 0' },
  calDia:          { fontSize: '12px', padding: '6px 2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', margin: '0 auto' },
};