import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { useNominaStore } from '../../../../../store/useNominaStore';
import payrollService from '../../../../../services/payrollService';
import payrollAxios from '../../../../../api/payrollAxiosInstance';
import masterAxios from '../../../../../api/masterAxiosInstance';
import {
  FileText, ChevronDown, ChevronLeft, ChevronRight,
  Plus, Trash2, Calendar, UserRound
} from 'lucide-react';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import MensajeModal from '../../../../../components/MensajeModal';

function CalendarioInput({ value, onChange, placeholder = 'DD/MM/YYYY', error }) {
  const [abierto, setAbierto] = useState(false);
  const hoy = new Date();
  const [mes, setMes]   = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());

  const meses      = ['January','February','March','April','May','June',
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

  const anteriorMes  = () => {
    if (mes === 0) { setMes(11); setAnio(anio - 1); } else setMes(mes - 1);
  };
  const siguienteMes = () => {
    if (mes === 11) { setMes(0); setAnio(anio + 1); } else setMes(mes + 1);
  };

  const diaSeleccionado  = value ? Number(value.split('/')[0]) : null;
  const mesSeleccionado  = value ? Number(value.split('/')[1]) - 1 : null;
  const anioSeleccionado = value ? Number(value.split('/')[2]) : null;

  const celdas = [];
  for (let i = 0; i < primerDia; i++)
    celdas.push({ dia: diasAnteriores - primerDia + 1 + i, actual: false });
  for (let i = 1; i <= diasEnMes; i++)
    celdas.push({ dia: i, actual: true });
  for (let i = 1; i <= 42 - celdas.length; i++)
    celdas.push({ dia: i, actual: false });

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <div
        style={{
          ...styles.input,
          border: error ? '1px solid #E53E3E' : '1px solid #D0D0D0',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none',
        }}
        onClick={() => setAbierto(!abierto)}
      >
        <span style={{ color: value ? '#272525' : '#A3A3A3', fontSize: '13px' }}>
          {value || placeholder}
        </span>
        <Calendar size={16} color="#A3A3A3" />
      </div>
      {abierto && (
        <div style={styles.calendario}>
          <div style={styles.calHeader}>
            <button style={styles.calBtn} onClick={anteriorMes}>
              <ChevronLeft size={16} />
            </button>
            <span style={styles.calMes}>{meses[mes]} {anio}</span>
            <button style={styles.calBtn} onClick={siguienteMes}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div style={styles.calGrid}>
            {diasSemana.map((d, i) => (
              <div key={i} style={styles.calDiaSemana}>{d}</div>
            ))}
            {celdas.map((c, i) => {
              const esSeleccionado =
                c.actual && c.dia === diaSeleccionado &&
                mes === mesSeleccionado && anio === anioSeleccionado;
              const esHoy =
                c.actual && c.dia === hoy.getDate() &&
                mes === hoy.getMonth() && anio === hoy.getFullYear();
              return (
                <div
                  key={i}
                  onClick={() => c.actual && seleccionarDia(c.dia)}
                  style={{
                    ...styles.calDia,
                    color: !c.actual ? '#D0D0D0' : esSeleccionado ? '#fff' : '#272525',
                    backgroundColor: esSeleccionado ? '#0B662A' : 'transparent',
                    border: esHoy && !esSeleccionado
                      ? '1px solid #0B662A' : '1px solid transparent',
                    borderRadius: '50%',
                    cursor: c.actual ? 'pointer' : 'default',
                  }}
                >
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
        {options.map((o, i) => (
          <option key={o.value ?? i} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
    </div>
  );
}

const soloNumeros = (e) => {
  if (
    !/[0-9.,]/.test(e.key) &&
    !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)
  ) e.preventDefault();
};

const filaVaciaLicencia  = () => ({ concepNominaId: '', fechaInicio: '', fechaFin: '' });
const filaVaciaHoras     = () => ({ concepNominaId: '', fecha: '', cantidad: '' });
const filaVaciaPagos     = () => ({ concepNominaId: '', fecha: '', monto: '' });
const filaVaciaVacacion  = () => ({ concepNominaId: '', fechaInicio: '', fechaFin: '' });
const filaVaciaOtros     = () => ({ descripcion: '', monto: '', fecha: '', constituyeSalario: 'si' });
const filaVaciaReten     = () => ({ descripcion: '', monto: '', fecha: '' });

export default function NovedadesPage() {
  const navigate             = useNavigate();
  const { id, nominaId }     = useParams();
  const [searchParams]       = useSearchParams();
  const { usuario }          = useAuthStore();

  const empleadoId = searchParams.get('empleado');
  const novedadId  = searchParams.get('novedad');
  const tipoPre    = searchParams.get('tipo');

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  // Datos del empleado y conceptos
  const [empleado,    setEmpleado]    = useState(null);
  const [conceptoMap, setConceptoMap] = useState({});
  const [novedadEdit, setNovedadEdit] = useState(null);
  const [cargando,    setCargando]    = useState(false);

  // Estado del formulario
  const [diasLaborados, setDiasLaborados] = useState('');
  const [tiempoLic,     setTiempoLic]     = useState([filaVaciaLicencia()]);
  const [horasExtra,    setHorasExtra]    = useState([filaVaciaHoras()]);
  const [pagosExtra,    setPagosExtra]    = useState([filaVaciaPagos()]);
  const [vacaciones,    setVacaciones]    = useState([filaVaciaVacacion()]);
  const [otrosDeveng,   setOtrosDeveng]   = useState([filaVaciaOtros()]);
  const [retencion,     setRetencion]     = useState([filaVaciaReten()]);
  const [otrosDeducir,  setOtrosDeducir]  = useState([filaVaciaOtros()]);

  const [modal,           setModal]           = useState(null);
  const [confirmarGuardar,setConfirmarGuardar] = useState(false);
  const [hoverGuardar,    setHoverGuardar]    = useState(false);
  const [hoverRegresar,   setHoverRegresar]   = useState(false);
  const [mensajeError, setMensajeError] = useState(''); 

  // Grupos de conceptos por categoría para los selects
  const [opcionesLicencias,  setOpcionesLicencias]  = useState([]);
  const [opcionesHoras,      setOpcionesHoras]       = useState([]);
  const [opcionesPagos,      setOpcionesPagos]       = useState([]);
  const [opcionesVacaciones, setOpcionesVacaciones]  = useState([]);
  const [opcionesSalarial,   setOpcionesSalarial]    = useState([]);
  const [opcionesNoSalarial, setOpcionesNoSalarial]  = useState([]);

  const [procesoPeriodo, setProcesoPeriodo] = useState(null);
  

  useEffect(() => {
    if (!empleadoId || !id) return;
    setCargando(true);

    Promise.all([
      masterAxios.get('/api/master/empleados', {
        params: { empresaId: id, estado: 'ACTIVO' },
      }),
      payrollService.getConceptosNovedades(),
      payrollService.getProcesos(id),
    ])
      .then(([{ data: emps }, { data: conceptos }, { data: procesos }]) => {
        const encontrado = emps.find(
          e => String(e.empleadoId) === String(empleadoId)
        );
        setEmpleado(encontrado ?? null);

        console.log('Conceptos recibidos:', conceptos.map(c => c.nombreConcepNomina));

        // Construir mapa nombre -> id y agrupar por tipo
        const mapa = {};
        conceptos.forEach(c => { mapa[c.nombreConcepNomina] = c.concepNominaId; });
        setConceptoMap(mapa);

        const toOpcion = (c) => ({ value: c.concepNominaId, label: c.nombreConcepNomina });

        setOpcionesLicencias(conceptos.filter(c => [
          'Incapacidad por enfermedad general',
          'Incapacidad por origen laboral',
          'Licencia de maternidad',
          'Licencia de paternidad',
          'Licencia por calamidad doméstica',
          'Licencia por matrimonio',
          'Licencia Ley ISAAC',
          'Licencia por sufragio',
          'Cargos transitorios',
          'Citaciones judiciales',
          'Otros permisos remunerados pactados',
          'Licencias no remuneradas',
        ].includes(c.nombreConcepNomina)).map(toOpcion));


        setOpcionesHoras(conceptos.filter(c => [
          'Recargo nocturno lunes a sábado',
          'Recargo diurno domingo o festivo',
          'Recargo nocturno domingo o festivo',
          'Hora extra diurna lunes a sábado',
          'Hora extra nocturna lunes a sábado',
          'Hora extra diurna dominical o festivo',
          'Hora extra nocturna dominical o festivo',
        ].includes(c.nombreConcepNomina)).map(toOpcion));

        setOpcionesPagos(conceptos.filter(c => [
          'Comisiones',
          'Bonificaciones ocasionales o por mera liberalidad',
          'Beneficios o extralegales no salariales',
        ].includes(c.nombreConcepNomina)).map(toOpcion));

        setOpcionesVacaciones(conceptos.filter(c => [
          'Vacaciones disfrutadas',
          'Vacaciones compensadas en dinero',
        ].includes(c.nombreConcepNomina)).map(toOpcion));

        setOpcionesSalarial(conceptos.filter(c =>
          c.nombreConcepNomina.toLowerCase().includes('devenir salarial') ||
          c.nombreConcepNomina.toLowerCase().includes('constituyen salario')
        ).map(toOpcion));

        setOpcionesNoSalarial(conceptos.filter(c =>
          c.nombreConcepNomina.toLowerCase().includes('devenir no salarial') ||
          c.nombreConcepNomina.toLowerCase().includes('no constituyen salario')
        ).map(toOpcion));

        // Si viene con días pre-llenados desde el store
        if (tipoPre === 'dias') {
          const diasStore = useNominaStore.getState()
            .diasLaborados[Number(empleadoId)];
          if (diasStore) setDiasLaborados(String(diasStore));
        }

        const procesoEncontrado = procesos.find(
          p => String(p.procesoLiquiId) === String(nominaId)
        );
        setProcesoPeriodo(procesoEncontrado ?? null);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [empleadoId, id, tipoPre]);

  // Si es edición, cargar la novedad existente
  useEffect(() => {
    if (!novedadId) return;
    payrollAxios.get(`/api/payroll/novedades/${novedadId}`)
      .then(({ data }) => setNovedadEdit(data))
      .catch(() => {});
  }, [novedadId]);

  const updateFila = (setter, arr, i, campo, valor) => {
    const n = [...arr]; n[i] = { ...n[i], [campo]: valor }; setter(n);
  };
  const addFila    = (setter, arr, empty) => setter([...arr, empty()]);
  const removeFila = (setter, arr, i) =>
    arr.length > 1 && setter(arr.filter((_, idx) => idx !== i));

  const campo = (label, children, i) => (
    <div style={{
      flex: 1, minWidth: '160px',
      display: 'flex', flexDirection: 'column', gap: '6px',
    }}>
      {i === 0 && <label style={styles.label}>{label}</label>}
      {children}
    </div>
  );

  const iconos = (onAdd, onRemove, disabled, i) => (
    <div style={{ ...styles.iconosRow, marginTop: i === 0 ? '22px' : '0' }}>
      <button style={styles.btnIcono} onClick={onAdd}>
        <Plus size={16} color="#0B662A" />
      </button>
      <button
        style={{ ...styles.btnIcono, opacity: disabled ? 0.4 : 1 }}
        onClick={onRemove}
        disabled={disabled}
      >
        <Trash2 size={16} color="#A3A3A3" />
      </button>
    </div>
  );

  const fechaToISO = (fecha) => {
    if (!fecha) return null;
    const [d, m, a] = fecha.split('/');
    return `${a}-${m}-${d}`;
  };

  const fechaEstaEnPeriodo = (fechaStr) => {
    if (!fechaStr || !procesoPeriodo) return true;
    const [d, m, a] = fechaStr.split('/');
    const fecha = new Date(`${a}-${m}-${d}`);
    const inicio = new Date(procesoPeriodo.fechaInicioPeriodo);
    const fin = new Date(procesoPeriodo.fechaFinPeriodo);
    return fecha >= inicio && fecha <= fin;
  };

  const handleGuardar = async () => {
    setConfirmarGuardar(false);
    try {
      const { procesoActual } = useNominaStore.getState();
      const novedadesAGuardar = [];

      // Días laborados — se guardan en el store
      if (diasLaborados) {
        useNominaStore.getState().setDiasEmpleado(
          Number(empleadoId),
          Number(diasLaborados)
        );
      }

      // Tiempo y licencias
      for (const f of tiempoLic) {
        if (f.concepNominaId && f.fechaInicio && f.fechaFin) {
          if (!fechaEstaEnPeriodo(f.fechaInicio) || !fechaEstaEnPeriodo(f.fechaFin)) {
            throw new Error(`Las fechas de la licencia están fuera del periodo...`);
          }
          novedadesAGuardar.push({
            fkEmpleadoId:      Number(empleadoId),
            fkConcepNominaId:  Number(f.concepNominaId),
            procesoLiquid:     procesoActual?.procesoLiquiId,
            anio:              procesoActual?.anio,
            periodo:           procesoActual?.periodo,
            fechaInicioAusen:  fechaToISO(f.fechaInicio),
            fechaFinAusen:     fechaToISO(f.fechaFin),
            cantidadDiasNovedad: null,
            cantidadHorasNovedad: null,
            valorRefNovedad:   null,
          });
        }
      }

      // Horas extra y recargos
      for (const f of horasExtra){
        if (f.concepNominaId && f.cantidad) {
          if (!fechaEstaEnPeriodo(f.fecha)) {
            throw new Error(`La fecha ${f.fecha} está fuera del periodo del proceso (${procesoPeriodo.fechaInicioPeriodo} - ${procesoPeriodo.fechaFinPeriodo})`);
          }
          novedadesAGuardar.push({
            fkEmpleadoId:         Number(empleadoId),
            fkConcepNominaId:     Number(f.concepNominaId),
            procesoLiquid:        procesoActual?.procesoLiquiId,
            anio:                 procesoActual?.anio,
            periodo:              procesoActual?.periodo,
            fechaNovedad:         fechaToISO(f.fecha),
            cantidadHorasNovedad: Number(f.cantidad),
            cantidadDiasNovedad:  null,
            valorRefNovedad:      null,
          });
        }
      }

      // Pagos extralegales y compensaciones
      for (const f of pagosExtra) {
        if (f.concepNominaId && f.monto) {
          if (!fechaEstaEnPeriodo(f.fecha)) {
            throw new Error(`La fecha ${f.fecha} está fuera del periodo del proceso (${procesoPeriodo.fechaInicioPeriodo} - ${procesoPeriodo.fechaFinPeriodo})`);
          }
          novedadesAGuardar.push({
            fkEmpleadoId:         Number(empleadoId),
            fkConcepNominaId:     Number(f.concepNominaId),
            procesoLiquid:        procesoActual?.procesoLiquiId,
            anio:                 procesoActual?.anio,
            periodo:              procesoActual?.periodo,
            fechaNovedad:         fechaToISO(f.fecha),
            valorRefNovedad:      Number(f.monto),
            cantidadDiasNovedad:  null,
            cantidadHorasNovedad: null,
          });
        }
      }

      // Vacaciones
      for (const f of vacaciones) {
        if (f.concepNominaId && f.fechaInicio && f.fechaFin) {
          if (!fechaEstaEnPeriodo(f.fechaInicio) || !fechaEstaEnPeriodo(f.fechaFin)) {
            throw new Error(`Las fechas de la licencia están fuera del periodo...`);
          }
          novedadesAGuardar.push({
            fkEmpleadoId:         Number(empleadoId),
            fkConcepNominaId:     Number(f.concepNominaId),
            procesoLiquid:        procesoActual?.procesoLiquiId,
            anio:                 procesoActual?.anio,
            periodo:              procesoActual?.periodo,
            fechaInicioAusen:     fechaToISO(f.fechaInicio),
            fechaFinAusen:        fechaToISO(f.fechaFin),
            cantidadDiasNovedad:  null,
            cantidadHorasNovedad: null,
            valorRefNovedad:      null,
          });
        }
      }

      // Otros conceptos a devengar
      for (const f of otrosDeveng) {
        if (f.monto) {
          const nombreConcepto = f.constituyeSalario === 'si'
            ? 'Otro concepto a devenir salarial'
            : 'Otro concepto a devenir no salarial';
          const concepId = conceptoMap[nombreConcepto];
          if (concepId) {
            if (!fechaEstaEnPeriodo(f.fecha)) {
              throw new Error(`La fecha ${f.fecha} está fuera del periodo del proceso (${procesoPeriodo.fechaInicioPeriodo} - ${procesoPeriodo.fechaFinPeriodo})`);
            }
            novedadesAGuardar.push({
              fkEmpleadoId:         Number(empleadoId),
              fkConcepNominaId:     concepId,
              procesoLiquid:        procesoActual?.procesoLiquiId,
              anio:                 procesoActual?.anio,
              periodo:              procesoActual?.periodo,
              fechaNovedad:         fechaToISO(f.fecha),
              valorRefNovedad:      Number(f.monto),
              observaciones:        f.descripcion,
              cantidadDiasNovedad:  null,
              cantidadHorasNovedad: null,
            });
          }
        }
      }

      // Retención en la fuente
      for (const f of retencion) {
        if (f.monto) {
          const concepId = conceptoMap['Retención en la fuente'];
          if (concepId) {
            if (!fechaEstaEnPeriodo(f.fecha)) {
              throw new Error(`La fecha ${f.fecha} está fuera del periodo del proceso (${procesoPeriodo.fechaInicioPeriodo} - ${procesoPeriodo.fechaFinPeriodo})`);
            }
            novedadesAGuardar.push({
              fkEmpleadoId:         Number(empleadoId),
              fkConcepNominaId:     concepId,
              procesoLiquid:        procesoActual?.procesoLiquiId,
              anio:                 procesoActual?.anio,
              periodo:              procesoActual?.periodo,
              fechaNovedad:         fechaToISO(f.fecha),
              valorRefNovedad:      Number(f.monto),
              observaciones:        f.descripcion,
              cantidadDiasNovedad:  null,
              cantidadHorasNovedad: null,
            });
          }
        }
      }

      // Otros conceptos a deducir
      for (const f of otrosDeducir) {
        if (f.monto) {
          const nombreConcepto = f.constituyeSalario === 'si'
            ? 'Otros conceptos a deducir salariales'
            : 'Otros conceptos a deducir no salariales';
          const concepId = conceptoMap[nombreConcepto];
          if (concepId) {
            if (!fechaEstaEnPeriodo(f.fecha)) {
              throw new Error(`La fecha ${f.fecha} está fuera del periodo del proceso (${procesoPeriodo.fechaInicioPeriodo} - ${procesoPeriodo.fechaFinPeriodo})`);
            }
            novedadesAGuardar.push({
              fkEmpleadoId:         Number(empleadoId),
              fkConcepNominaId:     concepId,
              procesoLiquid:        procesoActual?.procesoLiquiId,
              anio:                 procesoActual?.anio,
              periodo:              procesoActual?.periodo,
              fechaNovedad:         fechaToISO(f.fecha),
              valorRefNovedad:      Number(f.monto),
              observaciones:        f.descripcion,
              cantidadDiasNovedad:  null,
              cantidadHorasNovedad: null,
            });
          }
        }
      }

      // Si es edición, hacer PUT; si es creación, hacer POST
      if (novedadId && novedadesAGuardar.length === 1) {
        await payrollAxios.put(
          `/api/payroll/novedades/${novedadId}`,
          novedadesAGuardar[0]
        );
      } else {
        await Promise.all(
          novedadesAGuardar.map(n =>
            payrollAxios.post('/api/payroll/novedades', n)
          )
        );
      }

      setModal('exito');
    } catch (err) {
      setMensajeError(err?.message ?? 'Ocurrió un error al guardar las novedades.');
      setModal('error');
    }
  };

  if (cargando) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: 'center', color: '#A3A3A3', marginTop: '40px' }}>
          Cargando...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Novedades</h2>
            <p style={styles.subtitulo}>
              {empleado
                ? `${empleado.nombresEmp} ${empleado.apellidosEmp} — ${empleado.documentoEmp}`
                : 'Cargando empleado...'}
            </p>
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

      {/* Card 1: Días laborados */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Novedades</h3>
        <p style={styles.seccionTitulo}>Base de Liquidación</p>
        <p style={styles.descripcion}>
          Ingrese el número de días efectivamente trabajados en el periodo (máximo 30).
        </p>
        <div style={{ maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={styles.label}>Días laborados</label>
          <input
            value={diasLaborados}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val > 30) return;
              setDiasLaborados(e.target.value);
            }}
            onKeyDown={soloNumeros}
            placeholder="Ingresar número"
            style={styles.input}
            max={30}
          />
        </div>
      </div>

      {/* Card 2: Tiempo y licencias */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Novedades de Tiempo y Licencias</p>
        <p style={styles.descripcion}>
          Registre situaciones que hayan afectado la jornada laboral del trabajador.
        </p>
        {tiempoLic.map((f, i) => (
          <div key={i} style={styles.filaRow}>
            {campo('Nombre de novedad',
              <SelectWrapper
                value={f.concepNominaId}
                onChange={(v) => updateFila(setTiempoLic, tiempoLic, i, 'concepNominaId', v)}
                options={opcionesLicencias}
              />, i)}
            {campo('Fecha de inicio',
              <CalendarioInput
                value={f.fechaInicio}
                onChange={(v) => updateFila(setTiempoLic, tiempoLic, i, 'fechaInicio', v)}
              />, i)}
            {campo('Fecha de fin',
              <CalendarioInput
                value={f.fechaFin}
                onChange={(v) => updateFila(setTiempoLic, tiempoLic, i, 'fechaFin', v)}
              />, i)}
            {iconos(
              () => addFila(setTiempoLic, tiempoLic, filaVaciaLicencia),
              () => removeFila(setTiempoLic, tiempoLic, i),
              tiempoLic.length === 1, i
            )}
          </div>
        ))}
      </div>

      {/* Card 3: Horas extra y recargos */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Horas Extra y Recargos</p>
        <p style={styles.descripcion}>
          Indique la cantidad de horas adicionales laboradas fuera de la jornada ordinaria.
        </p>
        {horasExtra.map((f, i) => (
          <div key={i} style={styles.filaRow}>
            {campo('Nombre de novedad',
              <SelectWrapper
                value={f.concepNominaId}
                onChange={(v) => updateFila(setHorasExtra, horasExtra, i, 'concepNominaId', v)}
                options={opcionesHoras}
              />, i)}
            {campo('Fecha de novedad',
              <CalendarioInput
                value={f.fecha}
                onChange={(v) => updateFila(setHorasExtra, horasExtra, i, 'fecha', v)}
              />, i)}
            {campo('Cantidad de horas',
              <input
                value={f.cantidad}
                onChange={(e) => updateFila(setHorasExtra, horasExtra, i, 'cantidad', e.target.value)}
                onKeyDown={soloNumeros}
                placeholder="Ingresar número"
                style={styles.input}
              />, i)}
            {iconos(
              () => addFila(setHorasExtra, horasExtra, filaVaciaHoras),
              () => removeFila(setHorasExtra, horasExtra, i),
              horasExtra.length === 1, i
            )}
          </div>
        ))}
      </div>

      {/* Card 4: Pagos extralegales */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Pagos Extralegales y Compensaciones</p>
        <p style={styles.descripcion}>
          Ingrese montos de incentivos, premios o beneficios adicionales del periodo.
        </p>
        {pagosExtra.map((f, i) => (
          <div key={i} style={styles.filaRow}>
            {campo('Nombre de novedad',
              <SelectWrapper
                value={f.concepNominaId}
                onChange={(v) => updateFila(setPagosExtra, pagosExtra, i, 'concepNominaId', v)}
                options={opcionesPagos}
              />, i)}
            {campo('Fecha de novedad',
              <CalendarioInput
                value={f.fecha}
                onChange={(v) => updateFila(setPagosExtra, pagosExtra, i, 'fecha', v)}
              />, i)}
            {campo('Monto',
              <input
                value={f.monto}
                onChange={(e) => updateFila(setPagosExtra, pagosExtra, i, 'monto', e.target.value)}
                onKeyDown={soloNumeros}
                placeholder="Ingresar monto"
                style={styles.input}
              />, i)}
            {iconos(
              () => addFila(setPagosExtra, pagosExtra, filaVaciaPagos),
              () => removeFila(setPagosExtra, pagosExtra, i),
              pagosExtra.length === 1, i
            )}
          </div>
        ))}
      </div>

      {/* Card 5: Vacaciones */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Vacaciones</p>
        <p style={styles.descripcion}>
          Reporte días de descanso remunerado o pago en dinero de vacaciones pendientes.
        </p>
        {vacaciones.map((f, i) => (
          <div key={i} style={styles.filaRow}>
            {campo('Tipo de vacación',
              <SelectWrapper
                value={f.concepNominaId}
                onChange={(v) => updateFila(setVacaciones, vacaciones, i, 'concepNominaId', v)}
                options={opcionesVacaciones}
              />, i)}
            {campo('Fecha de inicio',
              <CalendarioInput
                value={f.fechaInicio}
                onChange={(v) => updateFila(setVacaciones, vacaciones, i, 'fechaInicio', v)}
              />, i)}
            {campo('Fecha de fin',
              <CalendarioInput
                value={f.fechaFin}
                onChange={(v) => updateFila(setVacaciones, vacaciones, i, 'fechaFin', v)}
              />, i)}
            {iconos(
              () => addFila(setVacaciones, vacaciones, filaVaciaVacacion),
              () => removeFila(setVacaciones, vacaciones, i),
              vacaciones.length === 1, i
            )}
          </div>
        ))}
      </div>

      {/* Card 6: Otros conceptos a devengar */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Otros Conceptos a Devengar</p>
        <p style={styles.descripcion}>
          Registre cualquier otro ingreso a favor del trabajador no incluido anteriormente.
        </p>
        {otrosDeveng.map((f, i) => (
          <div key={i} style={styles.filaRow}>
            {campo('Descripción concepto',
              <input
                value={f.descripcion}
                onChange={(e) => updateFila(setOtrosDeveng, otrosDeveng, i, 'descripcion', e.target.value)}
                placeholder="Breve descripción"
                style={styles.input}
              />, i)}
            {campo('Monto',
              <input
                value={f.monto}
                onChange={(e) => updateFila(setOtrosDeveng, otrosDeveng, i, 'monto', e.target.value)}
                onKeyDown={soloNumeros}
                placeholder="Ingresar monto"
                style={styles.input}
              />, i)}
            {campo('Fecha',
              <CalendarioInput
                value={f.fecha}
                onChange={(v) => updateFila(setOtrosDeveng, otrosDeveng, i, 'fecha', v)}
              />, i)}
            <div style={{ flex: '0 0 160px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {i === 0 && <label style={styles.label}>¿Constituye salario?</label>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '43px' }}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name={`deveng-sal-${i}`}
                    value="si"
                    checked={f.constituyeSalario === 'si'}
                    onChange={() => updateFila(setOtrosDeveng, otrosDeveng, i, 'constituyeSalario', 'si')}
                    style={styles.radio}
                  /> Sí
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name={`deveng-sal-${i}`}
                    value="no"
                    checked={f.constituyeSalario === 'no'}
                    onChange={() => updateFila(setOtrosDeveng, otrosDeveng, i, 'constituyeSalario', 'no')}
                    style={styles.radio}
                  /> No
                </label>
              </div>
            </div>
            {iconos(
              () => addFila(setOtrosDeveng, otrosDeveng, filaVaciaOtros),
              () => removeFila(setOtrosDeveng, otrosDeveng, i),
              otrosDeveng.length === 1, i
            )}
          </div>
        ))}
      </div>

      {/* Card 7: Retención en la fuente */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Retención en la Fuente</p>
        <p style={styles.descripcion}>
          Monto calculado para el impuesto de renta según el procedimiento de ley.
        </p>
        {retencion.map((f, i) => (
          <div key={i} style={styles.filaRow}>
            {campo('Descripción',
              <input
                value={f.descripcion}
                onChange={(e) => updateFila(setRetencion, retencion, i, 'descripcion', e.target.value)}
                placeholder="Breve descripción"
                style={styles.input}
              />, i)}
            {campo('Monto de retención',
              <input
                value={f.monto}
                onChange={(e) => updateFila(setRetencion, retencion, i, 'monto', e.target.value)}
                onKeyDown={soloNumeros}
                placeholder="Ingresar monto"
                style={styles.input}
              />, i)}
            {campo('Fecha',
              <CalendarioInput
                value={f.fecha}
                onChange={(v) => updateFila(setRetencion, retencion, i, 'fecha', v)}
              />, i)}
            {iconos(
              () => addFila(setRetencion, retencion, filaVaciaReten),
              () => removeFila(setRetencion, retencion, i),
              retencion.length === 1, i
            )}
          </div>
        ))}
      </div>

      {/* Card 8: Otros conceptos a deducir */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Otros Conceptos a Deducir</p>
        <p style={styles.descripcion}>
          Descuentos como préstamos, fondos de empleados o ajustes negativos.
        </p>
        {otrosDeducir.map((f, i) => (
          <div key={i} style={styles.filaRow}>
            {campo('Descripción concepto',
              <input
                value={f.descripcion}
                onChange={(e) => updateFila(setOtrosDeducir, otrosDeducir, i, 'descripcion', e.target.value)}
                placeholder="Breve descripción"
                style={styles.input}
              />, i)}
            {campo('Monto',
              <input
                value={f.monto}
                onChange={(e) => updateFila(setOtrosDeducir, otrosDeducir, i, 'monto', e.target.value)}
                onKeyDown={soloNumeros}
                placeholder="Ingresar monto"
                style={styles.input}
              />, i)}
            {campo('Fecha',
              <CalendarioInput
                value={f.fecha}
                onChange={(v) => updateFila(setOtrosDeducir, otrosDeducir, i, 'fecha', v)}
              />, i)}
            <div style={{ flex: '0 0 160px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {i === 0 && <label style={styles.label}>¿Constituye salario?</label>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '43px' }}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name={`deducir-sal-${i}`}
                    value="si"
                    checked={f.constituyeSalario === 'si'}
                    onChange={() => updateFila(setOtrosDeducir, otrosDeducir, i, 'constituyeSalario', 'si')}
                    style={styles.radio}
                  /> Sí
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name={`deducir-sal-${i}`}
                    value="no"
                    checked={f.constituyeSalario === 'no'}
                    onChange={() => updateFila(setOtrosDeducir, otrosDeducir, i, 'constituyeSalario', 'no')}
                    style={styles.radio}
                  /> No
                </label>
              </div>
            </div>
            {iconos(
              () => addFila(setOtrosDeducir, otrosDeducir, filaVaciaOtros),
              () => removeFila(setOtrosDeducir, otrosDeducir, i),
              otrosDeducir.length === 1, i
            )}
          </div>
        ))}
      </div>

      {/* Botones */}
      <div style={styles.botonesRow}>
        <button
          style={{
            ...styles.btnGuardarCerrar,
            background: hoverGuardar
              ? 'linear-gradient(135deg, #0B662A, #1a9e45)'
              : '#0B662A',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverGuardar(true)}
          onMouseLeave={() => setHoverGuardar(false)}
          onClick={() => setConfirmarGuardar(true)}
        >
          Guardar
        </button>
        <button
          style={{
            ...styles.btnRegresar,
            background: hoverRegresar
              ? 'linear-gradient(135deg, #f0f0f0, #e0e0e0)'
              : '#fff',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverRegresar(true)}
          onMouseLeave={() => setHoverRegresar(false)}
          onClick={() => navigate(-1)}
        >
          Regresar
        </button>
      </div>

      <ConfirmarCambiosModal
        visible={confirmarGuardar}
        onCancelar={() => setConfirmarGuardar(false)}
        onConfirmar={handleGuardar}
        titulo="¿Deseas guardar las novedades?"
        descripcion="Las novedades registradas quedarán asociadas al proceso de liquidación."
      />

      <MensajeModal
        tipo={modal}
        mensaje={mensajeError || undefined}
        onClose={() => {
          setModal(null);
          setMensajeError('');
          if (modal === 'exito') navigate(-1);
        }}
      />
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
  filaRow:         { display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap' },
  iconosRow:       { display: 'flex', gap: '8px', flexShrink: 0 },
  btnIcono:        { width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #D0D0D0', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
  radioLabel:      { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#272525', cursor: 'pointer' },
  radio:           { accentColor: '#0B662A', width: '16px', height: '16px', cursor: 'pointer' },
  botonesRow:      { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px', flexWrap: 'wrap' },
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