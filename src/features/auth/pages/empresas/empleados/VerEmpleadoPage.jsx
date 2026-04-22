import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from "../../../../../store/authStore";
import { Users, UserRound } from 'lucide-react';
import empleadosService from '../../../../../services/empleadosService';

export default function VerEmpleadoPage() {
  const navigate    = useNavigate();
  const { id, empleadoId } = useParams();
  const { usuario } = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [hoverEditar,   setHoverEditar]   = useState(false);
  const [hoverRegresar, setHoverRegresar] = useState(false);

  const [empleado, setEmpleado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [conceptos, setConceptos] = useState([]);

  useEffect(() => {
    Promise.all([
      empleadosService.getEmpleadoById(empleadoId),
      empleadosService.getConceptosEmpleado(empleadoId),
    ])
      .then(([{ data: emp }, { data: conc }]) => {
        setEmpleado(emp);
        setConceptos(conc);
      })
      .catch(() => setEmpleado(null))
      .finally(() => setCargando(false));
  }, [empleadoId]);

  if (cargando) return <p>Cargando...</p>;
  if (!empleado) return <p>Empleado no encontrado.</p>;

  const LABEL_TIPO_CONTRATO = {
    'TERMINO_FIJO':                  'Término Fijo',
    'TERMINO_INDEFINIDO':            'Término Indefinido',
    'OBRA_LABOR':                    'Obra o Labor',
    'APRENDIZAJE':                   'Aprendizaje',
    'TEMPORAL_OCASIONAL_ACCIDENTAL': 'Temporal, Ocasional o Accidental',
    'OTRO':                          'Otro',
  };

  const LABEL_JORNADA = {
    'UNICA': 'Única', 'TURNOS': 'Turnos', 'ROTATIVA': 'Rotativa',
  };

  const LABEL_TIPO_COTIZANTE = {
    'DEPENDIENTE':                        '01 - Dependiente',
    'SERVICIO_DOMESTICO':                 '02 - Servicio Doméstico',
    'INDEPENDIENTE':                      '03 - Independiente',
    'APRENDIZ_SENA_LECTIVA':              '12 - Aprendiz SENA (Etapa Lectiva)',
    'APRENDIZ_SENA_PRODUCTIVA':           '19 - Aprendiz SENA (Etapa Productiva)',
    'ESTUDIANTE_LEY_789':                 '20 - Estudiantes (Régimen especial ley 789 de 2002)',
    'ESTUDIANTE_SOLO_ARL':                '23 - Estudiantes aporte solo riesgos laborales',
    'COTIZANTE_EMERGENCIA_1':             '44 - Cotizante dependiente de empleo de emergencia ≥ 1 mes',
    'COTIZANTE_EMERGENCIA_2':             '45 - Cotizante dependiente de empleo de emergencia < 1 mes',
    'TIEMPO_PARCIAL':                     '51 - Trabajador de tiempo parcial',
    'INDEPENDIENTE_PRESTACION_SERVICIOS': '59 - Independiente con contrato de prestación de servicios',
  };

  const LABEL_SUBTIPO_COTIZANTE = {
    'CODIGO_0':  '0 - Ninguno',
    'CODIGO_1':  '1 - Dependiente Pensionado Activo',
    'CODIGO_3':  '3 - Cotizante no Obligado a Cotización a Pensiones por Edad',
    'CODIGO_4':  '4 - Con Requisitos Cumplidos para Pensión',
    'CODIGO_5':  '5 - Cotizante con Devolución de Saldos',
    'CODIGO_6':  '6 - Cotizante Perteneciente a Régimen Exceptuado',
    'CODIGO_9':  '9 - Cotizante Pensionado con Mesada Superior a 25 SMMLV',
    'CODIGO_11': '11 - Conductor de Vehículo Taxi',
    'CODIGO_12': '12 - Conductor de Vehículo Taxi no obligado a cotizar pensión',
  };

  const LABEL_CLASE_RIESGO = {
    'CLASE_I':'I', 'CLASE_II':'II', 'CLASE_III':'III', 'CLASE_IV':'IV', 'CLASE_V':'V',
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div style={styles.container}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Ver empleado</h2>
            <p style={styles.subtitulo}>Ver información registrada del empleado y/o editar información</p>
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

      {/* ── Sección 1: Información Personal ── */}
      <div style={styles.card}>
        <h3 style={styles.formTitulo}>Ver empleado</h3>
        <p style={styles.seccionTitulo}>Información Personal e Identidad</p>
        <div style={styles.fila3}>
          <div style={styles.campo}>
            <label style={styles.label}>Tipo de documento<span style={styles.req}>*</span></label>
            <input readOnly value={empleado.tipoDocumento ?? ''} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Número de documento<span style={styles.req}>*</span></label>
            <input readOnly value={empleado.documentoEmp ?? ''} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Nombre(s) Empleado<span style={styles.req}>*</span></label>
            <input readOnly value={empleado.nombresEmp ?? ''} style={styles.inputRO} />
          </div>
        </div>
        <div style={{ ...styles.fila3, marginTop: '20px' }}>
          <div style={styles.campo}>
            <label style={styles.label}>Apellidos Empleado<span style={styles.req}>*</span></label>
            <input readOnly value={empleado.apellidosEmp ?? ''} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Dirección Empleado</label>
            <input readOnly value={empleado.direccionEmp ?? ''} style={styles.inputRO} />
          </div>
          <div />
        </div>
      </div>

      {/* ── Sección 2: Vinculación ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Vinculación y Detalles del Cargo</p>
        <div style={styles.fila3}>
          <div style={styles.campo}>
            <label style={styles.label}>Cargo</label>
            <input readOnly value={empleado.cargoEmp ?? ''} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Tipo de contrato</label>
            <input readOnly value={LABEL_TIPO_CONTRATO[empleado.tipoContratoEmp] ?? '—'} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Jornada</label>
            <input readOnly value={LABEL_JORNADA[empleado.jornadaTrabajoEmp] ?? '—'} style={styles.inputRO} />
          </div>
        </div>
        <div style={{ ...styles.fila3, marginTop: '20px' }}>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha de ingreso<span style={styles.req}>*</span></label>
            <input readOnly value={formatearFecha(empleado.fechaIngresoEmp)} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha de fin de contrato</label>
            <input readOnly value={formatearFecha(empleado.fechaFinContrato)} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Tipo de cotizante</label>
            <input readOnly value={LABEL_TIPO_COTIZANTE[empleado.tipoCotizante] ?? '—'} style={styles.inputRO} />
          </div>
        </div>
        <div style={{ ...styles.fila3, marginTop: '20px' }}>
          <div style={styles.campo}>
            <label style={styles.label}>Subtipo de cotizante</label>
            <input readOnly value={LABEL_SUBTIPO_COTIZANTE[empleado.subtipoCotizante] ?? '—'} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha de retiro</label>
            <input readOnly value={formatearFecha(empleado.fechaRetiroEmp)} style={styles.inputRO} />
          </div>
          <div />
        </div>
      </div>

      {/* ── Sección 3: Compensación ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Compensación y Salarios</p>
        <div style={styles.fila3}>
          <div style={styles.campo}>
            <label style={styles.label}>Salario básico mensual</label>
            <input readOnly value={empleado.salarioBascMensual ?? ''} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Auxilio de transporte</label>
            <input readOnly value={empleado.tieneAuxTransporte ? 'SI' : 'NO'} style={styles.inputRO} />
          </div>
          <div />
        </div>
      </div>

      {/* ── Sección 4: Seguridad Social ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Seguridad Social, Riesgos Laborales y Prestaciones Sociales</p>
        <div style={styles.fila3}>
          <div style={styles.campo}>
            <label style={styles.label}>EPS (Entidad Promotora de Salud)</label>
            <input readOnly value={empleado.nombreEps ?? ''} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fondo de pensiones</label>
            <input readOnly value={empleado.fondoPensionEmp ?? ''} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>ARL (Administradora de Riesgos Laborales)</label>
            <input readOnly value={empleado.nombreArl ?? ''} style={styles.inputRO} />
          </div>
        </div>
        <div style={{ ...styles.fila3, marginTop: '20px' }}>
          <div style={styles.campo}>
            <label style={styles.label}>Clase de Riesgo</label>
            <input readOnly value={LABEL_CLASE_RIESGO[empleado.claseRiesgo] ?? '—'} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fondo de cesantías</label>
            <input readOnly value={empleado.fondoCesantiasEmp ?? ''} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Caja de compensación</label>
            <input readOnly value={empleado.cajaCompensacion ?? ''} style={styles.inputRO} />
          </div>
        </div>
      </div>

      {/* ── Sección 5: Conceptos — solo visible si el empleado tiene conceptos ── */}
      {conceptos && conceptos.length > 0 && (
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
                <input readOnly value={c.conceptoNombre ?? ''} style={styles.inputRO} />
              </div>
              <div style={{ ...styles.campo, flex: 1 }}>
                {i === 0 && <label style={styles.label}>Valor neto (mensual)</label>}
                <input readOnly value={c.valorFijo ?? ''} style={styles.inputRO} />
              </div>
              <div style={{ width: '88px' }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Botones ── */}
      <div style={styles.botonesRow}>
        <button
          style={{ ...styles.btnRegresar, background: hoverRegresar ? 'linear-gradient(135deg, #f0f0f0, #e0e0e0)' : '#fff', transition: 'background 0.3s ease' }}
          onMouseEnter={() => setHoverRegresar(true)}
          onMouseLeave={() => setHoverRegresar(false)}
          onClick={() => navigate(-1)}
        >
          Regresar
        </button>

        {usuario?.rolUsuario !== 'CLIENTE_EMPRESA' && usuario?.rolUsuario !== 'AUDITOR' && (
          <button
            style={{ ...styles.btnEditar, background: hoverEditar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A', transition: 'background 0.3s ease' }}
            onMouseEnter={() => setHoverEditar(true)}
            onMouseLeave={() => setHoverEditar(false)}
            onClick={() => navigate(`/empresas/${id}/empleados/${empleadoId}/editar`)}
          >
            Editar Información
          </button>
        )}
      </div>

    </div>
  );
}

const styles = {
  container:        { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '20px' },
  header:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:           { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:        { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:        { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:           { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
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
  inputRO:          { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', color: '#272525', width: '100%', boxSizing: 'border-box', backgroundColor: '#fff' },
  botonesRow:       { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px' },
  btnRegresar:      { color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnEditar:        { color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
};
