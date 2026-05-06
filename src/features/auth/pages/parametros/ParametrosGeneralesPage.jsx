import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../store/authStore';
import { Settings2, ChevronDown, Plus, Trash2, UserRound } from 'lucide-react';
import MensajeModal from '../../../../components/MensajeModal';
import ConfirmarCambiosModal from '../../../../components/ConfirmarCambiosModal';
import parametrosService from '../../../../services/parametrosService';
import { formatearMiles, limpiarMiles } from '../../../../utils/formatters';

const MAPA_PARAMETRO_NOMBRE = {
  'SMMLV (SALARIO MÍNIMO)':                    'SMMLV',
  'AUXILIO DE TRANSPORTE':                     'AUXILIO_TRANSPORTE',
  'VALOR UVT (UNIDAD DE VALOR TRIBUTARIO)':    'VALOR_UVT',
  'SANCIÓN MÍNIMA DIAN (10 UVT)':              'SANCION_MINIMA_DIAN',
  'TOPE DE COTIZACIÓN (IBC MÁXIMO)':           'TOPE_COTIZACION',
  'SALARIO INTEGRAL MÍNIMO':                   'SALARIO_INTEGRAL_MINIMO',
  'JORNADA MÁXIMA SEMANAL':                    'JORNADA_MAXIMA_SEMANAL',
  'HORAS TRABAJADAS AL MES':                   'HORAS_TRABAJADAS_MES',
  'VALOR HORA ORDINARIA':                      'VALOR_HORA_ORDINARIA',
  'HORA EXTRA DIURNA':                         'EXTRA_DIURNA',
  'HORA EXTRA NOCTURNA':                       'EXTRA_NOCTURNA',
  'HORA EXTRA DIURNA DOMINICAL/FESTIVA':       'EXTRA_DIURNA_DOMINICAL',
  'HORA EXTRA NOCTURNA DOMINICAL/FESTIVA':     'EXTRA_NOCTURNA_DOMINICAL',
  'RECARGO NOCTURNO ORDINARIO':                'RECARGO_NOCTURNO',
  'RECARGO DIURNO DOMINICAL O FESTIVO':        'RECARGO_DIURNO_DOMINICAL',
  'RECARGO NOCTURNO DOMINICAL O FESTIVO':      'RECARGO_NOCTURNO_DOMINICAL',
  'SALUD (DEDUCCIÓN EMPLEADO)':                'SALUD_EMPLEADO',
  'SALUD (DEDUCCIÓN EMPLEADOR)':               'SALUD_EMPLEADOR',
  'PENSIÓN (DEDUCCIÓN EMPLEADO)':              'PENSION_EMPLEADO',
  'PENSIÓN (DEDUCCIÓN EMPLEADOR)':             'PENSION_EMPLEADOR',
  'FONDO DE SOLIDARIDAD PENSIONAL >=4 A <16':  'FONDO_SOLIDARIDAD_PENSIONAL_1',
  'FONDO DE SOLIDARIDAD PENSIONAL >=16 A 17':  'FONDO_SOLIDARIDAD_PENSIONAL_2',
  'FONDO DE SOLIDARIDAD PENSIONAL DE 17 A 18': 'FONDO_SOLIDARIDAD_PENSIONAL_3',
  'FONDO DE SOLIDARIDAD PENSIONAL DE 18 A 19': 'FONDO_SOLIDARIDAD_PENSIONAL_4',
  'FONDO DE SOLIDARIDAD PENSIONAL DE 19 A 20': 'FONDO_SOLIDARIDAD_PENSIONAL_5',
  'FONDO DE SOLIDARIDAD PENSIONAL >20':        'FONDO_SOLIDARIDAD_PENSIONAL_6',
  'ARL EMPLEADOR CLASE I':                     'ARL_EMPLEADOR_I',
  'ARL EMPLEADOR CLASE II':                    'ARL_EMPLEADOR_II',
  'ARL EMPLEADOR CLASE III':                   'ARL_EMPLEADOR_III',
  'ARL EMPLEADOR CLASE IV':                    'ARL_EMPLEADOR_IV',
  'ARL EMPLEADOR CLASE V':                     'ARL_EMPLEADOR_V',
  'CAJA DE COMPENSACIÓN':                      'CAJA_COMPENSACION',
  'SENA':                                      'SENA',
  'ICBF':                                      'ICBF',
  'PRIMA DE SERVICIOS':                        'PRIMA_SERVICIOS',
  'CESANTÍAS':                                 'CESANTIAS',
  'INTERESES SOBRE CESANTÍAS':                 'INTERESES_CESANTIAS',
  'VACACIONES':                                'VACACIONES',
};

const OPCIONES = {
  valoresBase: [
    'SMMLV (SALARIO MÍNIMO)',
    'AUXILIO DE TRANSPORTE',
    'VALOR UVT (UNIDAD DE VALOR TRIBUTARIO)',
    'SANCIÓN MÍNIMA DIAN (10 UVT)',
    'TOPE DE COTIZACIÓN (IBC MÁXIMO)',
    'SALARIO INTEGRAL MÍNIMO',
  ],
  jornada: [
    'JORNADA MÁXIMA SEMANAL',
    'HORAS TRABAJADAS AL MES',
    'VALOR HORA ORDINARIA',
    'HORA EXTRA DIURNA',
    'HORA EXTRA NOCTURNA',
    'HORA EXTRA DIURNA DOMINICAL/FESTIVA',
    'HORA EXTRA NOCTURNA DOMINICAL/FESTIVA',
    'RECARGO NOCTURNO ORDINARIO',
    'RECARGO DIURNO DOMINICAL O FESTIVO',
    'RECARGO NOCTURNO DOMINICAL O FESTIVO',
  ],
  seguridadSocial: [
    'SALUD (DEDUCCIÓN EMPLEADO)',
    'SALUD (DEDUCCIÓN EMPLEADOR)',
    'PENSIÓN (DEDUCCIÓN EMPLEADO)',
    'PENSIÓN (DEDUCCIÓN EMPLEADOR)',
    'FONDO DE SOLIDARIDAD PENSIONAL >=4 A <16',
    'FONDO DE SOLIDARIDAD PENSIONAL >=16 A 17',
    'FONDO DE SOLIDARIDAD PENSIONAL DE 17 A 18',
    'FONDO DE SOLIDARIDAD PENSIONAL DE 18 A 19',
    'FONDO DE SOLIDARIDAD PENSIONAL DE 19 A 20',
    'FONDO DE SOLIDARIDAD PENSIONAL >20',
    'ARL EMPLEADOR CLASE I',
    'ARL EMPLEADOR CLASE II',
    'ARL EMPLEADOR CLASE III',
    'ARL EMPLEADOR CLASE IV',
    'ARL EMPLEADOR CLASE V',
  ],
  parafiscales: [
    'CAJA DE COMPENSACIÓN',
    'SENA',
    'ICBF',
  ],
  prestaciones: [
    'PRIMA DE SERVICIOS',
    'CESANTÍAS',
    'INTERESES SOBRE CESANTÍAS',
    'VACACIONES',
  ],
};

const filaVacia = () => ({ nombre: '', fecha: '', valor: '', porcentaje: '', descripcion: '' });

function FilaParametro({ fila, index, opciones, seccionKey, openDropdown, setOpenDropdown, onChange, onAdd, onRemove }) {
  const dropKey = `${seccionKey}-${index}`;
  const isOpen  = openDropdown === dropKey;

  return (
    <div style={styles.filaWrapper}>
      <div style={styles.fila3}>

        {/* Nombre de Parámetro */}
        <div style={styles.campo}>
          <label style={styles.label}>Nombre de Parámetro<span style={styles.req}>*</span></label>
          <div style={styles.selectWrapper}>
            <button
              style={{ ...styles.selectBtn, color: fila.nombre ? '#272525' : '#A3A3A3' }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(isOpen ? null : dropKey);
              }}
            >
              <span style={{ fontSize: '13px', fontFamily: 'Nunito, sans-serif' }}>
                {fila.nombre || 'Seleccionar opción'}
              </span>
              <ChevronDown size={16} color="#A3A3A3" style={styles.chevronIcon} />
            </button>
            {isOpen && (
              <div style={styles.dropdown}>
                {opciones.map(op => (
                  <div
                    key={op}
                    style={{ ...styles.dropdownItem, backgroundColor: fila.nombre === op ? '#f0f9f4' : '#fff' }}
                    onMouseEnter={e => { if (fila.nombre !== op) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = fila.nombre === op ? '#f0f9f4' : '#fff'; }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(index, 'nombre', op);
                      setOpenDropdown(null);
                    }}
                  >
                    <span>{op}</span>
                    {fila.nombre === op && <span style={{ color: '#0B662A', fontWeight: '700' }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fecha */}
        <div style={styles.campo}>
          <label style={styles.label}>Fecha (en la que entra en vigencia el parametro)<span style={styles.req}>*</span></label>
          <input
            type="date"
            style={styles.input}
            value={fila.fecha}
            onChange={e => onChange(index, 'fecha', e.target.value)}
          />
        </div>

        {/* Valor — con formateo de miles */}
        <div style={styles.campo}>
          <label style={styles.label}>Valor</label>
          <input
            style={styles.input}
            placeholder="Ingresar valor"
            inputMode="numeric"
            value={formatearMiles(fila.valor)}
            onChange={e => onChange(index, 'valor', limpiarMiles(e.target.value))}
          />
        </div>
      </div>

      <div style={styles.filaInferior}>
        {/* Porcentaje — type text con restricción de caracteres */}
        <div style={{ ...styles.campo, width: '220px', flexShrink: 0 }}>
          <label style={styles.label}>Porcentaje (Ej: 4% = 0.04)</label>
          <input
            style={styles.input}
            placeholder="Ingresar número"
            type="text"
            inputMode="decimal"
            value={fila.porcentaje}
            onChange={e => onChange(index, 'porcentaje', e.target.value)}
            onKeyPress={e => { if (!/[\d.]/.test(e.key)) e.preventDefault(); }}
          />
        </div>

        <div style={{ ...styles.campo, flex: 1 }}>
          <label style={styles.label}>Descripción corta<span style={styles.req}>*</span></label>
          <input
            style={styles.input}
            placeholder="Ingresar texto"
            value={fila.descripcion}
            onChange={e => onChange(index, 'descripcion', e.target.value)}
          />
        </div>

        <div style={styles.accionesBox}>
          <button style={styles.btnAccion} title="Agregar fila" onClick={onAdd}>
            <Plus size={16} color="#A3A3A3" />
          </button>
          <button style={styles.btnAccion} title="Eliminar fila" onClick={() => onRemove(index)}>
            <Trash2 size={16} color="#A3A3A3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SeccionParametros({ titulo, descripcion, opciones, filas, setter, seccionKey, openDropdown, setOpenDropdown }) {
  const handleChange = (index, field, value) => {
    setter(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };
  const addRow    = () => setter(prev => [...prev, filaVacia()]);
  const removeRow = (index) => setter(prev => prev.length === 1 ? [filaVacia()] : prev.filter((_, i) => i !== index));

  return (
    <div style={styles.seccionBloque}>
      <p style={styles.seccionTitulo}>{titulo}</p>
      <p style={styles.textoDescripcion}>{descripcion}</p>
      {filas.map((fila, idx) => (
        <FilaParametro
          key={idx}
          fila={fila}
          index={idx}
          opciones={opciones}
          seccionKey={seccionKey}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          onChange={handleChange}
          onAdd={addRow}
          onRemove={removeRow}
        />
      ))}
    </div>
  );
}

export default function ParametrosGeneralesPage() {
  const navigate    = useNavigate();
  const { usuario } = useAuthStore();
  const rol = usuario?.rolUsuario;

  useEffect(() => {
    if (rol && rol !== 'SUPER_ADMIN') {
      navigate('/inicio');
    }
  }, [rol]);

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [openDropdown,    setOpenDropdown]    = useState(null);
  const [modal,           setModal]           = useState(null);
  const [mensajeError,    setMensajeError]    = useState('');
  const [modalCampos,     setModalCampos]     = useState(false);
  const [hoverGuardar,    setHoverGuardar]    = useState(false);
  const [hoverRegresar,   setHoverRegresar]   = useState(false);

  const [valoresBase,     setValoresBase]     = useState([filaVacia()]);
  const [jornada,         setJornada]         = useState([filaVacia()]);
  const [seguridadSocial, setSeguridadSocial] = useState([filaVacia()]);
  const [parafiscales,    setParafiscales]    = useState([filaVacia()]);
  const [prestaciones,    setPrestaciones]    = useState([filaVacia()]);

  const validar = () => {
    const secciones = [valoresBase, jornada, seguridadSocial, parafiscales, prestaciones];
    for (const seccion of secciones) {
      for (const fila of seccion) {
        const tocada = fila.nombre || fila.fecha || fila.valor || fila.porcentaje || fila.descripcion;
        if (!tocada) continue;
        if (!fila.nombre || !fila.fecha || !fila.descripcion) {
          setModalCampos(true);
          return false;
        }
      }
    }
    return true;
  };

  const handleGuardar = async () => {
    if (!validar()) return;

    const todasLasFilas = [
      ...valoresBase, ...jornada, ...seguridadSocial, ...parafiscales, ...prestaciones,
    ];

    const filasValidas = todasLasFilas.filter(f => f.nombre && f.fecha && f.descripcion);

    if (filasValidas.length === 0) {
      setMensajeError('Debes ingresar al menos un parámetro antes de guardar.');
      setModal('error');
      return;
    }

    for (const fila of filasValidas) {
      const tieneValor      = fila.valor      !== '' && fila.valor      != null;
      const tienePorcentaje = fila.porcentaje !== '' && fila.porcentaje != null;
      if ((tieneValor && tienePorcentaje) || (!tieneValor && !tienePorcentaje)) {
        setMensajeError(`El parámetro "${fila.nombre}" debe tener exactamente un valor o un porcentaje, no ambos ni ninguno.`);
        setModal('error');
        return;
      }
    }

    const dtos = filasValidas.map(fila => {
      const enumNombre      = MAPA_PARAMETRO_NOMBRE[fila.nombre];
      const tieneValor      = fila.valor !== '' && fila.valor != null;
      const tienePorcentaje = fila.porcentaje !== '' && fila.porcentaje != null;
      return {
        nombreParamGeneral:     enumNombre,
        descripcionParam:       fila.descripcion || null,
        fechaParamGeneral:      fila.fecha,
        valorParamGeneral:      tieneValor      ? parseFloat(fila.valor)      : null,
        porcentajeParamGeneral: tienePorcentaje ? parseFloat(fila.porcentaje) : null,
      };
    });

    try {
      await Promise.all(dtos.map(dto => parametrosService.crearParametro(dto)));
      setModal('exito');
    } catch (err) {
      const msg = err.response?.data?.message ?? '';
      setMensajeError(msg.length > 0 ? msg : 'Ocurrió un error al guardar los parámetros. Intenta de nuevo.');
      setModal('error');
    }
  };

  const handlePageClick = () => setOpenDropdown(null);
  const seccionProps = { openDropdown, setOpenDropdown };

  return (
    <div style={styles.container} onClick={handlePageClick}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings2 size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Parámetros Generales</h2>
            <p style={styles.subtitulo}>Llena el formulario de parámetros generales para aplicarlos a las nuevas reglas de cálculo para la liquidación de períodos que se realizarán</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}>
            <UserRound size={22} color="#A3A3A3" />
          </div>
          <div>
            <p style={styles.perfilNombre}>{nombre}</p>
            <p style={styles.perfilCargo}>{cargo}</p>
          </div>
        </div>
      </div>

      {/* Card intro + Valores Base */}
      <div style={styles.card}>
        <h3 style={styles.formTitulo}>Parámetros Generales</h3>
        <p style={styles.textoDescripcion}>
          En este apartado, podrás definir los valores de referencia y las variables maestras que rigen el motor de cálculos de su nómina.
          Estos parámetros (como el Salario Mínimo Legal Vigente, el Auxilio de Transporte y los porcentajes de ley) actúan como la base
          técnica para las fórmulas de liquidación en Colombia. Al configurar estos datos, el sistema aplicará automáticamente las reglas
          de seguridad social, prestaciones sociales y deducciones parafiscales, garantizando que cada pago sea preciso, esté actualizado
          frente a la normativa vigente y sea consistente con los estándares de la UGPP y la DIAN.
        </p>
        <SeccionParametros
          titulo="Parámetros de Valores Base"
          descripcion="Define los montos mínimos legales, el auxilio de transporte y los topes de referencia que sirven como base para todos los cálculos del año."
          opciones={OPCIONES.valoresBase}
          filas={valoresBase}
          setter={setValoresBase}
          seccionKey="valoresBase"
          {...seccionProps}
        />
      </div>

      {/* Jornada */}
      <div style={styles.card}>
        <SeccionParametros
          titulo="Parámetros de Jornada y Recargos (Suplementarios)"
          descripcion="Establece la duración de la jornada laboral legal y los porcentajes adicionales por trabajo extra, nocturno, dominical o festivo. (Ingrese el valor decimal. Ej: 4% = 0.04, 8.5% = 0.085)"
          opciones={OPCIONES.jornada}
          filas={jornada}
          setter={setJornada}
          seccionKey="jornada"
          {...seccionProps}
        />
      </div>

      {/* Seguridad Social */}
      <div style={styles.card}>
        <SeccionParametros
          titulo="Parámetros de Seguridad Social"
          descripcion="Configura los porcentajes de aporte obligatorio a Salud, Pensión y Riesgos Laborales (ARL) tanto para el empleador como para el trabajador. (Ingrese el valor decimal. Ej: 4% = 0.04, 8.5% = 0.085)"
          opciones={OPCIONES.seguridadSocial}
          filas={seguridadSocial}
          setter={setSeguridadSocial}
          seccionKey="seguridadSocial"
          {...seccionProps}
        />
      </div>

      {/* Parafiscales */}
      <div style={styles.card}>
        <SeccionParametros
          titulo="Parámetros de Parafiscales"
          descripcion="Determina las tarifas de aportes a Cajas de Compensación Familiar, SENA e ICBF, incluyendo las reglas de exoneración vigentes."
          opciones={OPCIONES.parafiscales}
          filas={parafiscales}
          setter={setParafiscales}
          seccionKey="parafiscales"
          {...seccionProps}
        />
      </div>

      {/* Prestaciones */}
      <div style={styles.card}>
        <SeccionParametros
          titulo="Parámetros de Prestaciones Sociales (Provisiones)"
          descripcion="Define los factores de cálculo para la reserva mensual de Prima de servicios, Cesantías, Intereses y Vacaciones generadas por el empleado."
          opciones={OPCIONES.prestaciones}
          filas={prestaciones}
          setter={setPrestaciones}
          seccionKey="prestaciones"
          {...seccionProps}
        />
      </div>

      {/* Botones */}
      <div style={styles.botonesRow}>
        <button
          style={{
            ...styles.btnGuardar,
            background: hoverGuardar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverGuardar(true)}
          onMouseLeave={() => setHoverGuardar(false)}
          onClick={handleGuardar}
        >
          Guardar
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

      {/* Modales */}
      <MensajeModal
        tipo={modal}
        mensaje={
          modal === 'exito'
            ? 'Los parámetros generales fueron guardados exitosamente.'
            : modal === 'error'
            ? mensajeError
            : ''
        }
        onClose={() => {
          setModal(null);
          if (modal === 'exito') navigate('/inicio');
        }}
      />
      <ConfirmarCambiosModal
        visible={modalCampos}
        tipo="error"
        onCancelar={() => setModalCampos(false)}
        onConfirmar={() => setModalCampos(false)}
        titulo="Faltan campos obligatorios"
        descripcion="Por favor completa todos los campos marcados con * antes de continuar."
      />
    </div>
  );
}

const styles = {
  container:        { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '100%' },
  header:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:           { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:        { fontSize: '12px', color: '#A3A3A3', margin: 0, maxWidth: '620px' },
  perfilBox:        { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:           { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  perfilNombre:     { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:      { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  card:             { backgroundColor: '#fff', borderRadius: '16px', padding: '55px 55px' },
  formTitulo:       { fontSize: '20px', fontWeight: '800', color: '#272525', margin: '0 0 20px 0' },
  textoDescripcion: { fontSize: '13px', color: '#555', margin: '0 0 28px 0', lineHeight: 1.7 },
  seccionBloque:    { marginBottom: '8px' },
  seccionTitulo:    { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 8px 0' },
  filaWrapper:      { marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #F5F5F5' },
  fila3:            { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '16px' },
  filaInferior:     { display: 'flex', alignItems: 'flex-end', gap: '40px' },
  campo:            { display: 'flex', flexDirection: 'column', gap: '8px' },
  label:            { fontSize: '13px', fontWeight: '600', color: '#272525' },
  req:              { color: '#E53E3E', marginLeft: '2px' },
  input:            { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', color: '#272525', width: '100%', boxSizing: 'border-box' },
  selectWrapper:    { position: 'relative' },
  selectBtn:        { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px 40px 12px 16px', fontFamily: 'Nunito, sans-serif', outline: 'none', backgroundColor: '#fff', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxSizing: 'border-box' },
  chevronIcon:      { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  dropdown:         { position: 'absolute', top: '106%', left: 0, right: 0, backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, maxHeight: '280px', overflowY: 'auto', border: '1px solid #ECECEC' },
  dropdownItem:     { padding: '11px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#272525', fontFamily: 'Nunito, sans-serif', transition: 'background 0.15s' },
  accionesBox:      { display: 'flex', gap: '8px', paddingBottom: '2px', flexShrink: 0 },
  btnAccion:        { width: '42px', height: '46px', border: '1px solid #D0D0D0', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  botonesRow:       { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px' },
  btnGuardar:       { color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnRegresar:      { color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
};