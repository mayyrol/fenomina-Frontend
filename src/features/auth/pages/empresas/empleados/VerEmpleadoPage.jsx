import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from "../../../../../store/authStore";
import { Users, ChevronDown, Calendar } from 'lucide-react';
import empleadosService from '../../../../../services/empleadosService';
import { UserCircle } from 'lucide-react';

export default function VerEmpleadoPage() {
  const navigate    = useNavigate();
  const { id, empleadoId } = useParams();
  const { usuario } = useAuthStore();

  const inicial = usuario?.nombresUsuario?.charAt(0).toUpperCase() ?? 'U';
  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

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

  return (
    <div style={styles.container}>

      {/* Header */}
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
            <UserCircle size={28} color="#555" />
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
            <input readOnly value={empleado.tipoDocumento} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Número de documento<span style={styles.req}>*</span></label>
            <input readOnly value={empleado.documentoEmp} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Nombre(s) Empleado<span style={styles.req}>*</span></label>
            <input readOnly value={empleado.nombresEmp} style={styles.inputRO} />
          </div>
        </div>
        <div style={{ ...styles.fila3, marginTop: '20px' }}>
          <div style={styles.campo}>
            <label style={styles.label}>Apellidos Empleado<span style={styles.req}>*</span></label>
            <input readOnly value={empleado.apellidosEmp} style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Dirección Empleado</label>
            <input readOnly value={empleado.direccionEmp} style={styles.inputRO} />
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
            <input readOnly value={empleado.cargoEmp} placeholder="Ingresar cargo" style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Tipo de contrato</label>
            <div style={styles.selectWrapper}>
              <select disabled value={empleado.tipoContratoEmp} style={styles.selectRO}>
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
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Jornada</label>
            <div style={styles.selectWrapper}>
              <select disabled value={empleado.jornadaTrabajoEmp} style={styles.selectRO}>
                <option value="">Seleccionar opción</option>
                <option value="unica">Única</option>
                <option value="turnos">Turnos</option>
                <option value="rotativa">Rotativa</option>
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
          </div>
        </div>
        <div style={{ ...styles.fila3, marginTop: '20px' }}>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha de ingreso<span style={styles.req}>*</span></label>
            <div style={styles.inputRO}>
              <span style={{ color: empleado.fechaIngresoEmp ? '#272525' : '#A3A3A3', fontSize: '13px' }}>
                {empleado.fechaIngresoEmp || 'DD/MM/YYYY'}
              </span>
              <Calendar size={16} color="#A3A3A3" />
            </div>
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha de fin de contrato</label>
            <div style={styles.inputRO}>
              <span style={{ color: empleado.fechaFinContrato ? '#272525' : '#A3A3A3', fontSize: '13px' }}>
                {empleado.fechaFinContrato || 'DD/MM/YYYY'}
              </span>
              <Calendar size={16} color="#A3A3A3" />
            </div>
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Tipo de cotizante</label>
            <div style={styles.selectWrapper}>
              <select disabled value={empleado.tipoCotizante} style={styles.selectRO}>
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
          </div>
        </div>
        <div style={{ ...styles.fila3, marginTop: '20px' }}>
          <div style={styles.campo}>
            <label style={styles.label}>Subtipo de cotizante</label>
            <div style={styles.selectWrapper}>
              <select disabled value={empleado.subtipoCotizante} style={styles.selectRO}>
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
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha de retiro</label>
            <div style={styles.inputRO}>
              <span style={{ color: empleado.fechaRetiroEmp ? '#272525' : '#A3A3A3', fontSize: '13px' }}>
                {empleado.fechaRetiroEmp || 'DD/MM/YYYY'}
              </span>
              <Calendar size={16} color="#A3A3A3" />
            </div>
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
            <input readOnly value={empleado.salarioBascMensual} placeholder="Ingresar valor" style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Auxilio de transporte<span style={styles.req}>*</span></label>
            <div style={styles.selectWrapper}>
              <select disabled value={empleado.tieneAuxTransporte ? 'SI' : 'NO'} style={styles.selectRO}>
                <option value="">Seleccionar opción</option>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
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
            <input readOnly value={empleado.nombreEps} placeholder="Ingresar dato" style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fondo de pensiones<span style={styles.req}>*</span></label>
            <input readOnly value={empleado.fondoPensionEmp} placeholder="Ingresar dato" style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>ARL (Administradora de Riesgos Laborales)<span style={styles.req}>*</span></label>
            <input readOnly value={empleado.nombreArl} placeholder="Ingresar dato" style={styles.inputRO} />
          </div>
        </div>
        <div style={{ ...styles.fila3, marginTop: '20px' }}>
          <div style={styles.campo}>
            <label style={styles.label}>Clase de Riesgo<span style={styles.req}>*</span></label>
            <div style={styles.selectWrapper}>
              <select disabled value={empleado.claseRiesgo} style={styles.selectRO}>
                <option value="">Seleccionar opción</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fondo de cesantías<span style={styles.req}>*</span></label>
            <input readOnly value={empleado.fondoCesantiasEmp} placeholder="Ingresar dato" style={styles.inputRO} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Caja de compensación<span style={styles.req}>*</span></label>
            <input readOnly value={empleado.cajaCompensacion} placeholder="Ingresar dato" style={styles.inputRO} />
          </div>
        </div>
      </div>

      {/* ── Sección 5: Conceptos — CAMBIO: solo se muestra si hay conceptos registrados ── */}
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
                <div style={styles.selectWrapper}>
                  <select disabled value={c.nombre} style={styles.selectRO}>
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
                <input readOnly value={c.valor} placeholder="Ingresar valor" style={styles.inputRO} />
              </div>
              <div style={{ width: '88px' }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Botones ── */}
      <div style={styles.botonesRow}>
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
        <button
          style={{
            ...styles.btnEditar,
            background: hoverEditar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverEditar(true)}
          onMouseLeave={() => setHoverEditar(false)}
          onClick={() => navigate(`/empresas/${id}/empleados/${empleadoId}/editar`)}
        >
          Editar Información
        </button>
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
  inputRO:          { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', color: '#272525', width: '100%', boxSizing: 'border-box', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  selectWrapper:    { position: 'relative' },
  selectRO:         { width: '100%', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px 40px 12px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundColor: '#fff', color: '#272525', boxSizing: 'border-box', backgroundImage: 'none' },
  selectIcon:       { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  botonesRow:       { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px' },
  btnRegresar:      { color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnEditar:        { color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
};