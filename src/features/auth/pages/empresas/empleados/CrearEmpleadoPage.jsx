import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from "../../../../../store/authStore";
import { Users, ChevronDown, ChevronLeft, ChevronRight, Plus, Trash2, Calendar } from 'lucide-react';
import MensajeModal from "../../../../../components/MensajeModal";
import ConfirmarCambiosModal from "../../../../../components/ConfirmarCambiosModal";

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
    <div style={{ position: 'relative' }}>
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
                <div key={i} onClick={() => c.actual && seleccionarDia(c.dia)} style={{ ...styles.calDia, color: !c.actual ? '#D0D0D0' : esSeleccionado ? '#fff' : '#272525', backgroundColor: esSeleccionado ? '#0B662A' : 'transparent', border: esHoy && !esSeleccionado ? '1px solid #0B662A' : '1px solid transparent', borderRadius: '50%', cursor: c.actual ? 'pointer' : 'default' }}>
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

const CAMPOS_REQUERIDOS = {
  tipoDocumento:    'select',
  numeroDocumento:  'input',
  nombresEmpleado:  'input',
  apellidosEmpleado:'input',
  direccion:        'input',
  cargo:            'input',
  tipoContrato:     'select',
  jornada:          'select',
  fechaIngreso:     'fecha',
  fechaFinContrato: 'fecha',
  tipoCotizante:    'select',
  subtipoCotizante: 'select',
  salario:          'input',
  auxTransporte:    'select',
  eps:              'input',
  fondoPensiones:   'input',
  arl:              'input',
  claseRiesgo:      'select',
  fondoCesantias:   'input',
  cajaCompensacion: 'input',
};

const MSG_SELECT = 'Debes seleccionar una opción';
const MSG_INPUT  = 'Este campo es obligatorio';
const MSG_FECHA  = 'Debes seleccionar una fecha';

export default function CrearEmpleadoPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const inicial = usuario?.nombresUsuario?.charAt(0).toUpperCase() ?? 'U';
  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

  const [modal, setModal]               = useState(null);
  const [confirmar, setConfirmar]       = useState(false);
  const [errores, setErrores]           = useState({});
  const [hoverCrear, setHoverCrear]     = useState(false);
  const [hoverRegresar, setHoverRegresar] = useState(false);

  const [form, setForm] = useState({
    tipoDocumento:    '', numeroDocumento:  '', nombresEmpleado:  '',
    apellidosEmpleado:'', direccion:        '', cargo:            '',
    tipoContrato:     '', jornada:          '', fechaIngreso:     '',
    fechaFinContrato: '', tipoCotizante:    '', subtipoCotizante: '',
    salario:          '', auxTransporte:    '', eps:              '',
    fondoPensiones:   '', arl:              '', claseRiesgo:      '',
    fondoCesantias:   '', cajaCompensacion: '',
  });

  const [conceptos, setConceptos] = useState([{ nombre: '', valor: '' }]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: '' });
  };

  const handleFecha = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
    setErrores({ ...errores, [campo]: '' });
  };

  const agregarConcepto  = () => setConceptos([...conceptos, { nombre: '', valor: '' }]);
  const eliminarConcepto = (i) => setConceptos(conceptos.filter((_, idx) => idx !== i));
  const handleConcepto   = (i, campo, valor) => { const n = [...conceptos]; n[i][campo] = valor; setConceptos(n); };

  const validar = () => {
    const nuevosErrores = {};
    Object.entries(CAMPOS_REQUERIDOS).forEach(([campo, tipo]) => {
      if (!form[campo]) {
        if (tipo === 'select') nuevosErrores[campo] = MSG_SELECT;
        else if (tipo === 'fecha') nuevosErrores[campo] = MSG_FECHA;
        else nuevosErrores[campo] = MSG_INPUT;
      }
    });
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit    = () => { if (!validar()) return; setConfirmar(true); };
  const handleConfirmar = () => { setConfirmar(false); setModal('exito'); };

  const inputStyle  = (c) => ({ ...styles.input,  border: errores[c] ? '1px solid #E53E3E' : '1px solid #D0D0D0' });
  const selectStyle = (c) => ({ ...styles.select, border: errores[c] ? '1px solid #E53E3E' : '1px solid #D0D0D0' });

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Crear empleado</h2>
            <p style={styles.subtitulo}>Llena los datos que solicita el formulario para crear un nuevo empleado</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}>{inicial}</div>
          <div>
            <p style={styles.perfilNombre}>{nombre}</p>
            <p style={styles.perfilCargo}>{cargo}</p>
          </div>
        </div>
      </div>

      {/* ── Sección 1: Información Personal ── */}
      <div style={styles.card}>
        <h3 style={styles.formTitulo}>Crear empleado</h3>
        <p style={styles.seccionTitulo}>Información Personal e Identidad</p>
        <div style={styles.fila3}>
          <div style={styles.campo}>
            <label style={styles.label}>Tipo de documento<span style={styles.req}>*</span></label>
            <div style={styles.selectWrapper}>
              <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} style={selectStyle('tipoDocumento')}>
                <option value="">Seleccionar opción</option>
                <option value="RC">Registro Civil de Nacimiento</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PA">Pasaporte</option>
                <option value="PPT">PPT</option>
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
            {errores.tipoDocumento && <span style={styles.errorMsg}>{errores.tipoDocumento}</span>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Número de documento<span style={styles.req}>*</span></label>
            <input name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange} placeholder="Ingresar número" style={inputStyle('numeroDocumento')} />
            {errores.numeroDocumento && <span style={styles.errorMsg}>{errores.numeroDocumento}</span>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Nombre(s) Empleado<span style={styles.req}>*</span></label>
            <input name="nombresEmpleado" value={form.nombresEmpleado} onChange={handleChange} placeholder="Ingresar nombre" style={inputStyle('nombresEmpleado')} />
            {errores.nombresEmpleado && <span style={styles.errorMsg}>{errores.nombresEmpleado}</span>}
          </div>
        </div>
        <div style={{ ...styles.fila3, marginTop: '20px' }}>
          <div style={styles.campo}>
            <label style={styles.label}>Apellidos Empleado<span style={styles.req}>*</span></label>
            <input name="apellidosEmpleado" value={form.apellidosEmpleado} onChange={handleChange} placeholder="Ingresar apellidos" style={inputStyle('apellidosEmpleado')} />
            {errores.apellidosEmpleado && <span style={styles.errorMsg}>{errores.apellidosEmpleado}</span>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Dirección Empleado<span style={styles.req}>*</span></label>
            <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Ingresar dirección" style={inputStyle('direccion')} />
            {errores.direccion && <span style={styles.errorMsg}>{errores.direccion}</span>}
          </div>
          <div />
        </div>
      </div>

      {/* ── Sección 2: Vinculación y Detalles del Cargo ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Vinculación y Detalles del Cargo</p>
        <div style={styles.fila3}>
          <div style={styles.campo}>
            <label style={styles.label}>Cargo<span style={styles.req}>*</span></label>
            <input name="cargo" value={form.cargo} onChange={handleChange} placeholder="Ingresar cargo" style={inputStyle('cargo')} />
            {errores.cargo && <span style={styles.errorMsg}>{errores.cargo}</span>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Tipo de contrato<span style={styles.req}>*</span></label>
            <div style={styles.selectWrapper}>
              <select name="tipoContrato" value={form.tipoContrato} onChange={handleChange} style={selectStyle('tipoContrato')}>
                <option value="">Seleccionar opción</option>
                <option value="fijo">Término Fijo</option>
                <option value="indefinido">Término Indefinido</option>
                <option value="obra">Obra o Labor</option>
                <option value="aprendizaje">Aprendizaje</option>
                <option value="temporal">Temporal, Ocasional o Accidental</option>
                <option value="otro">Otro</option>
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
            {errores.tipoContrato && <span style={styles.errorMsg}>{errores.tipoContrato}</span>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Jornada<span style={styles.req}>*</span></label>
            <div style={styles.selectWrapper}>
              <select name="jornada" value={form.jornada} onChange={handleChange} style={selectStyle('jornada')}>
                <option value="">Seleccionar opción</option>
                <option value="unica">Única</option>
                <option value="turnos">Turnos</option>
                <option value="rotativa">Rotativa</option>
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
            {errores.jornada && <span style={styles.errorMsg}>{errores.jornada}</span>}
          </div>
        </div>
        <div style={{ ...styles.fila3, marginTop: '20px' }}>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha de ingreso<span style={styles.req}>*</span></label>
            <CalendarioInput value={form.fechaIngreso} onChange={(v) => handleFecha('fechaIngreso', v)} error={errores.fechaIngreso} />
            {errores.fechaIngreso && <span style={styles.errorMsg}>{errores.fechaIngreso}</span>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha de fin de contrato<span style={styles.req}>*</span></label>
            <CalendarioInput value={form.fechaFinContrato} onChange={(v) => handleFecha('fechaFinContrato', v)} error={errores.fechaFinContrato} />
            {errores.fechaFinContrato && <span style={styles.errorMsg}>{errores.fechaFinContrato}</span>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Tipo de cotizante<span style={styles.req}>*</span></label>
            <div style={styles.selectWrapper}>
              <select name="tipoCotizante" value={form.tipoCotizante} onChange={handleChange} style={selectStyle('tipoCotizante')}>
                <option value="">Seleccionar opción</option>
                <option value="01">01 - Dependiente</option>
                <option value="02">02 - Servicio Doméstico</option>
                <option value="03">03 - Independiente</option>
                <option value="12">12 - Aprendiz SENA (Etapa Lectiva)</option>
                <option value="19">19 - Apreniz SENA (Etapa Productiva)</option>
                <option value="20">20 - Estudiantes (Régimen especial ley 789 de 2002)</option>
                <option value="23">23 - Estudiantes aporte solo riesgos laborales</option>
                <option value="44">44 - Cotizante dependiente de empleo de emergencia con duración mayor o igual a un mes</option>
                <option value="45">45 - Cotizante dependiente de empleo de emergencia con duración menor a un mes</option>
                <option value="51">51 - Trabajador de tiempo parcial</option>
                <option value="59">59 - Independiente con contrato de prestación de servicios superior a 1 mes</option>
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
            {errores.tipoCotizante && <span style={styles.errorMsg}>{errores.tipoCotizante}</span>}
          </div>
        </div>
        <div style={{ ...styles.fila3, marginTop: '20px' }}>
          <div style={styles.campo}>
            <label style={styles.label}>Subtipo de cotizante<span style={styles.req}>*</span></label>
            <div style={styles.selectWrapper}>
              <select name="subtipoCotizante" value={form.subtipoCotizante} onChange={handleChange} style={selectStyle('subtipoCotizante')}>
                <option value="">Seleccionar opción</option>
                <option value="0">0 - Ninguno</option>
                <option value="1">1 - Dependiente Pensionado Activo</option>
                <option value="3">3 - Cotizante no Obligado a Cotización a Pensiones por Edad</option>
                <option value="4">4 - Con Requisitos Cumplidos para Pensión, Indemnización Sustitutiva o Devolución de Saldos</option>
                <option value="5">5 - Cotizante con Devolución de Saldos</option>
                <option value="6">6 - Cotizante Perteneciente a Régimen Exceptuado</option>
                <option value="9">9 - Cotizante Pensinado con Mesada Superior a 25 SMMLV</option>
                <option value="11">11 - Conductor de Vehículo Taxi</option>
                <option value="12">12 - Conductor de Vehículo Taxi no obligado a cotizar pensión</option>
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
            {errores.subtipoCotizante && <span style={styles.errorMsg}>{errores.subtipoCotizante}</span>}
          </div>
          <div /><div />
        </div>
      </div>

      {/* ── Sección 3: Compensación y Salarios ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Compensación y Salarios</p>
        <div style={styles.fila3}>
          <div style={styles.campo}>
            <label style={styles.label}>Salario básico mensual<span style={styles.req}>*</span></label>
            <input name="salario" value={form.salario} onChange={handleChange} placeholder="Ingresar valor" style={inputStyle('salario')} />
            {errores.salario && <span style={styles.errorMsg}>{errores.salario}</span>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Auxilio de transporte<span style={styles.req}>*</span></label>
            <div style={styles.selectWrapper}>
              <select name="auxTransporte" value={form.auxTransporte} onChange={handleChange} style={selectStyle('auxTransporte')}>
                <option value="">Seleccionar opción</option>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
            {errores.auxTransporte && <span style={styles.errorMsg}>{errores.auxTransporte}</span>}
          </div>
          <div />
        </div>
      </div>

      {/* ── Sección 4: Seguridad Social ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Seguridad Social, Riesgos Laborales y Prestaciones Sociales</p>
        <div style={styles.fila3}>
          <div style={styles.campo}>
            <label style={styles.label}>EPS (Entidad Promotora de Salud)<span style={styles.req}>*</span></label>
            <input name="eps" value={form.eps} onChange={handleChange} placeholder="Ingresar dato" style={inputStyle('eps')} />
            {errores.eps && <span style={styles.errorMsg}>{errores.eps}</span>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fondo de pensiones<span style={styles.req}>*</span></label>
            <input name="fondoPensiones" value={form.fondoPensiones} onChange={handleChange} placeholder="Ingresar dato" style={inputStyle('fondoPensiones')} />
            {errores.fondoPensiones && <span style={styles.errorMsg}>{errores.fondoPensiones}</span>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>ARL (Administradora de Riesgos Laborales)<span style={styles.req}>*</span></label>
            <input name="arl" value={form.arl} onChange={handleChange} placeholder="Ingresar dato" style={inputStyle('arl')} />
            {errores.arl && <span style={styles.errorMsg}>{errores.arl}</span>}
          </div>
        </div>
        <div style={{ ...styles.fila3, marginTop: '20px' }}>
          <div style={styles.campo}>
            <label style={styles.label}>Clase de Riesgo<span style={styles.req}>*</span></label>
            <div style={styles.selectWrapper}>
              <select name="claseRiesgo" value={form.claseRiesgo} onChange={handleChange} style={selectStyle('claseRiesgo')}>
                <option value="">Seleccionar opción</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
            {errores.claseRiesgo && <span style={styles.errorMsg}>{errores.claseRiesgo}</span>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fondo de cesantías<span style={styles.req}>*</span></label>
            <input name="fondoCesantias" value={form.fondoCesantias} onChange={handleChange} placeholder="Ingresar dato" style={inputStyle('fondoCesantias')} />
            {errores.fondoCesantias && <span style={styles.errorMsg}>{errores.fondoCesantias}</span>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Caja de compensación<span style={styles.req}>*</span></label>
            <input name="cajaCompensacion" value={form.cajaCompensacion} onChange={handleChange} placeholder="Ingresar dato" style={inputStyle('cajaCompensacion')} />
            {errores.cajaCompensacion && <span style={styles.errorMsg}>{errores.cajaCompensacion}</span>}
          </div>
        </div>
      </div>

      {/* ── Sección 5: Conceptos de Liquidación ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Conceptos de Liquidación de Nómina Permanentes</p>
        <p style={styles.textoDescripcion}>
          Tenga en cuenta que los conceptos que seleccione e ingrese en el siguiente espacio, harán parte
          de los cálculos internos para reportes de nómina que genere mes a mes o quincenalmente para dicho empleado.
        </p>
        {conceptos.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div style={{ ...styles.campo, flex: 1 }}>
              {i === 0 && <label style={styles.label}>Nombre concepto</label>}
              <div style={styles.selectWrapper}>
                <select value={c.nombre} onChange={(e) => handleConcepto(i, 'nombre', e.target.value)} style={styles.select}>
                  <option value="">Seleccionar opción</option>
                  <option value="beneficio">Beneficio o Extralegal</option>
                  <option value="bonificacion">Bonificaciones Habituales</option>
                  <option value="viaticos">Viáticos Permanentes</option>
                  <option value="constituyen">Otros pagos que constituyen salario</option>
                  <option value="no_constituyen">Otros pagos que no constituyen salario</option>
                </select>
                <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
              </div>
            </div>
            <div style={{ ...styles.campo, flex: 1 }}>
              {i === 0 && <label style={styles.label}>Valor neto (mensual)</label>}
              <input value={c.valor} onChange={(e) => handleConcepto(i, 'valor', e.target.value)} placeholder="Ingresar valor" style={styles.input} />
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingBottom: '2px' }}>
              <button style={styles.btnIcono} onClick={agregarConcepto}><Plus size={18} color="#0B662A" /></button>
              <button style={{ ...styles.btnIcono, opacity: conceptos.length === 1 ? 0.4 : 1 }} onClick={() => eliminarConcepto(i)} disabled={conceptos.length === 1}>
                <Trash2 size={18} color="#A3A3A3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Botones ── */}
      <div style={styles.botonesRow}>
        <button
          style={{
            ...styles.btnCrear,
            background: hoverCrear ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverCrear(true)}
          onMouseLeave={() => setHoverCrear(false)}
          onClick={handleSubmit}
        >
          Crear Empleado
        </button>
        <button
          style={{
            ...styles.btnRegresar,
            background: hoverRegresar ? 'linear-gradient(135deg, #f0f0f0, #e0e0e0)' : '#fff',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverRegresar(true)}
          onMouseLeave={() => setHoverRegresar(false)}
          onClick={() => navigate(-1)}
        >
          Regresar
        </button>
      </div>

      <ConfirmarCambiosModal visible={confirmar} onCancelar={() => setConfirmar(false)} onConfirmar={handleConfirmar} />
      <MensajeModal tipo={modal} onClose={() => { setModal(null); if (modal === 'exito') navigate(-1); }} />

    </div>
  );
}

const styles = {
  container:        { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '20px' },
  header:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:           { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:        { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:        { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:           { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', color: '#272525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  perfilNombre:     { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:      { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  formTitulo:       { fontSize: '20px', fontWeight: '800', color: '#272525', margin: '0 0 34px 0' },
  card:             { backgroundColor: '#fff', borderRadius: '16px', padding: '36px 40px' },
  seccionTitulo:    { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 24px 0' },
  textoDescripcion: { fontSize: '13px', color: '#555', margin: '0 0 20px 0', lineHeight: 1.7 },
  fila3:            { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' },
  campo:            { display: 'flex', flexDirection: 'column', gap: '8px' },
  label:            { fontSize: '13px', fontWeight: '600', color: '#272525' },
  req:              { color: '#E53E3E', marginLeft: '2px' },
  input:            { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', color: '#272525', width: '100%', boxSizing: 'border-box' },
  selectWrapper:    { position: 'relative' },
  select:           { width: '100%', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px 40px 12px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundColor: '#fff', color: '#A3A3A3', cursor: 'pointer', boxSizing: 'border-box', backgroundImage: 'none' },
  selectIcon:       { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  errorMsg:         { fontSize: '11px', color: '#E53E3E', marginTop: '2px' },
  btnIcono:         { width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #D0D0D0', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  botonesRow:       { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px' },
  btnCrear:         { color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnRegresar:      { color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  calendario:       { position: 'absolute', top: '110%', left: 0, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', padding: '16px', zIndex: 100, width: '280px' },
  calHeader:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  calMes:           { fontSize: '14px', fontWeight: '700', color: '#272525' },
  calBtn:           { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' },
  calGrid:          { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' },
  calDiaSemana:     { fontSize: '11px', fontWeight: '700', color: '#A3A3A3', padding: '4px 0' },
  calDia:           { fontSize: '12px', padding: '6px 2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', margin: '0 auto' },
};