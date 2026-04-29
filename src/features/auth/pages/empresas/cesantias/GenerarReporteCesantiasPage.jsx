import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { Coins, ChevronLeft, UserRound, ChevronDown } from 'lucide-react';
import MensajeModal from '../../../../../components/MensajeModal';
import { useCesantiaStore } from '../../../../../store/useCesantiaStore';
import payrollService from '../../../../../services/payrollService';

const AÑOS = ['2023', '2024', '2025', '2026', '2027'];

function SelectAño({ value, onChange }) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.select}>
        <option value="">Seleccionar opción</option>
        {AÑOS.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <ChevronDown size={16} color="#A3A3A3" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    </div>
  );
}


export default function GenerarReporteCesantiasPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [año, setAño]                         = useState('');
  const [seleccionados, setSeleccionados]     = useState([]);
  const [modal, setModal]                     = useState(null);
  const [hoverGenerar, setHoverGenerar]       = useState(false);

  const [empleados,   setEmpleados]   = useState([]);
  const [cargandoEmp, setCargandoEmp] = useState(false);

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

  const camposCompletos = año && seleccionados.length > 0;

  const handleGenerar = async () => {
    if (!camposCompletos) { setModal('error'); return; }

    try {
      const fechaInicio = `${año}-01-01`;
        const fechaFin    = `${año}-12-31`;

      const payloadCesantias = {
        empresaId:   Number(id),
        tipoProceso: 'CESANTIAS_ANUAL',
        anio:        Number(año),
        periodo:     1,
        fechaInicio,
        fechaFin,
      };

      const payloadIntereses = {
        empresaId:   Number(id),
        tipoProceso: 'INTERESES_CESANTIAS_ANUAL',
        anio:        Number(año),
        periodo:     1,
        fechaInicio,
        fechaFin,
      };

      const [{ data: dataCesantias }, { data: dataIntereses }] =
        await Promise.all([
          payrollService.crearProceso(payloadCesantias),
          payrollService.crearProceso(payloadIntereses),
        ]);

      useCesantiaStore.getState().setProcesosCesantiasActual(dataCesantias);
      useCesantiaStore.getState().setProcesosInteresesActual(dataIntereses);
      useCesantiaStore.getState().setEmpleadosSeleccionados(seleccionados);

      navigate(
        `/empresas/${id}/cesantias/${dataCesantias.procesoLiquiId}/desprendibles`
      );
    } catch {
      setModal('error');
    }
  };

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

      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Coins size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Generar Reporte Intereses de Cesantías</h2>
            <p style={styles.subtitulo}>Llena los datos que solicita el formulario para generar los desprendibles de cesantías e intereses de los empleados asociados a la empresa</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}><UserRound size={22} color="#A3A3A3" /></div>
          <div><p style={styles.perfilNombre}>{nombre}</p><p style={styles.perfilCargo}>{cargo}</p></div>
        </div>
      </div>

      <button style={styles.volverBtn} onClick={() => navigate(-1)}>
        <ChevronLeft size={16} color="#272525" /><span>Volver</span>
      </button>

      {/* Card 1 — Cabecera */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Generar Cabecera de Reporte Cesantías e Intereses</h3>
        <p style={styles.seccionTitulo}>Periodo de Liquidación</p>
        <div style={styles.filaFechas}>
          <div style={styles.campoBox}>
            <label style={styles.label}>Año <span style={styles.req}>*</span></label>
            <SelectAño value={año} onChange={setAño} />
          </div>
        </div>
      </div>

      {/* Card 2 — Empleados */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Intereses de Cesantías</h3>
        <p style={styles.descripcion}>
          Marque las casillas de los empleados a los que les liquidará los intereses de cesantías para la generación de sus respectivos desprendibles correspondientes al periodo de liquidación registrado.
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
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
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
          style={{ ...styles.btnGenerar, background: hoverGenerar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A', transition: 'background 0.3s ease', opacity: camposCompletos ? 1 : 0.7 }}
          onMouseEnter={() => setHoverGenerar(true)} onMouseLeave={() => setHoverGenerar(false)}
          onClick={handleGenerar}
        >
          Generar Desprendibles
        </button>
        <button style={styles.btnCancelar} onClick={() => navigate(-1)}>Regresar</button>
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
  campoBox:     { flex: 1, minWidth: '180px', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '6px' },
  label:        { fontSize: '13px', fontWeight: '600', color: '#272525' },
  req:          { color: '#E53E3E' },
  select:       { width: '100%', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '11px 36px 11px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', appearance: 'none', WebkitAppearance: 'none', backgroundColor: '#fff', color: '#272525', cursor: 'pointer', boxSizing: 'border-box' },
  tabla:        { width: '100%', borderCollapse: 'collapse', minWidth: '600px' },
  th:           { fontSize: '12px', fontWeight: '700', color: '#A3A3A3', padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:           { fontSize: '13px', color: '#272525', padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' },
  trPar:        { backgroundColor: '#fff' },
  trImpar:      { backgroundColor: '#FAFAFA' },
  checkbox:     { width: '16px', height: '16px', accentColor: '#0B662A', cursor: 'pointer' },
  botonesRow:   { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px', flexWrap: 'wrap' },
  btnGenerar:   { color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 40px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnCancelar:  { color: '#0B662A', border: '1px solid #0B662A', borderRadius: '8px', padding: '14px 40px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', backgroundColor: '#fff' },
};
