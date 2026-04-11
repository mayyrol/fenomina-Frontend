import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { FileText, ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import MensajeModal from '../../../../../components/MensajeModal';
import { UserCircle } from 'lucide-react';


const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const MOCK_EMPLEADOS = [
  { id: 1,  nombres: 'Pepito',         apellidos: 'Martinez Rodriguez',  fechaIngreso: '30/01/2023', documento: '10528967' },
  { id: 2,  nombres: 'Carlos Andres',  apellidos: 'Rodriguez Ochoa',     fechaIngreso: '30/12/2023', documento: '10528967' },
  { id: 3,  nombres: 'Alejandra Maria',apellidos: 'Anibal Leon',          fechaIngreso: '30/11/2022', documento: '10528967' },
  { id: 4,  nombres: 'Carlos Alberto', apellidos: 'Domingo Rodriguez',    fechaIngreso: '30/01/2023', documento: '10528967' },
  { id: 5,  nombres: 'Samuel',         apellidos: 'Martinez Ramos',       fechaIngreso: '30/01/2023', documento: '10528967' },
  { id: 6,  nombres: 'Maria Alexandra',apellidos: 'Caicedo Jimenez',      fechaIngreso: '30/01/2023', documento: '10528967' },
  { id: 7,  nombres: 'Ramiro',         apellidos: 'Martinez Rativa',      fechaIngreso: '30/01/2023', documento: '10528967' },
  { id: 8,  nombres: 'Andres',         apellidos: 'Jimenez Ochoa',        fechaIngreso: '30/01/2023', documento: '10528967' },
  { id: 9,  nombres: 'Carlos Andres',  apellidos: 'Rubio Giraldo',        fechaIngreso: '30/01/2023', documento: '10528967' },
  { id: 10, nombres: 'Yeimy',          apellidos: 'Castañeda Rodriguez',  fechaIngreso: '30/01/2023', documento: '10528967' },
  { id: 11, nombres: 'Ana Maria',      apellidos: 'Rodriguez Rodriguez',  fechaIngreso: '30/01/2023', documento: '10528967' },
];

function CalendarioInput({ value, onChange, placeholder = 'DD/MM/YYYY' }) {
  const [abierto, setAbierto] = useState(false);
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());

  const mesesNombres = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];
  const diasSemana   = ['S','M','T','W','T','F','S'];
  const primerDia      = new Date(anio, mes, 1).getDay();
  const diasEnMes      = new Date(anio, mes + 1, 0).getDate();
  const diasAnteriores = new Date(anio, mes, 0).getDate();

  const seleccionarDia = (dia) => {
    onChange(`${String(dia).padStart(2,'0')}/${String(mes+1).padStart(2,'0')}/${anio}`);
    setAbierto(false);
  };

  const anteriorMes  = () => { if (mes === 0) { setMes(11); setAnio(anio-1); } else setMes(mes-1); };
  const siguienteMes = () => { if (mes === 11) { setMes(0); setAnio(anio+1); } else setMes(mes+1); };

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
        style={{ ...styles.input, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setAbierto(!abierto)}
      >
        <span style={{ color: value ? '#272525' : '#A3A3A3', fontSize: '13px' }}>{value || placeholder}</span>
        <Calendar size={16} color="#A3A3A3" />
      </div>
      {abierto && (
        <div style={styles.calendario}>
          <div style={styles.calHeader}>
            <button style={styles.calBtn} onClick={anteriorMes}><ChevronLeft size={16} /></button>
            <span style={styles.calMes}>{mesesNombres[mes]} {anio}</span>
            <button style={styles.calBtn} onClick={siguienteMes}><ChevronRight size={16} /></button>
          </div>
          <div style={styles.calGrid}>
            {diasSemana.map((d, i) => <div key={i} style={styles.calDiaSemana}>{d}</div>)}
            {celdas.map((c, i) => {
              const esSel = c.actual && c.dia === diaSeleccionado && mes === mesSeleccionado && anio === anioSeleccionado;
              const esHoy = c.actual && c.dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();
              return (
                <div key={i} onClick={() => c.actual && seleccionarDia(c.dia)}
                  style={{ ...styles.calDia, color: !c.actual ? '#D0D0D0' : esSel ? '#fff' : '#272525', backgroundColor: esSel ? '#0B662A' : 'transparent', border: esHoy && !esSel ? '1px solid #0B662A' : '1px solid transparent', borderRadius: '50%', cursor: c.actual ? 'pointer' : 'default' }}>
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

export default function GenerarReportePage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const inicial = usuario?.nombresUsuario?.charAt(0).toUpperCase() ?? 'U';
  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

  const [fechaInicio, setFechaInicio]   = useState('');
  const [fechaFin, setFechaFin]         = useState('');
  const [mesLiquidar, setMesLiquidar]   = useState('');
  const [seleccionados, setSeleccionados] = useState([]);
  const [modal, setModal]               = useState(null);
  const [confirmar, setConfirmar]       = useState(false);
  const [hoverGenerar, setHoverGenerar] = useState(false);
  const [hoverRegresar, setHoverRegresar] = useState(false);

  const todosSeleccionados = seleccionados.length === MOCK_EMPLEADOS.length;

  const toggleTodos = () => {
    if (todosSeleccionados) setSeleccionados([]);
    else setSeleccionados(MOCK_EMPLEADOS.map(e => e.id));
  };

  const toggleEmpleado = (empId) => {
    setSeleccionados(prev =>
      prev.includes(empId) ? prev.filter(i => i !== empId) : [...prev, empId]
    );
  };

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Generar reporte nómina</h2>
            <p style={styles.subtitulo}>Llena los datos que solicita el formulario para generar los desprendibles de nómina de los empleados asociados a la empresa</p>
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

      {/* ── Card 1: Cabecera ── */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Generar Cabecera de Reporte Nómina</h3>
        <p style={styles.seccionTitulo}>Periodo de Liquidación</p>
        <div style={styles.fila3}>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha de inicio de corte<span style={styles.req}>*</span></label>
            <CalendarioInput value={fechaInicio} onChange={setFechaInicio} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha de fin de corte<span style={styles.req}>*</span></label>
            <CalendarioInput value={fechaFin} onChange={setFechaFin} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Mes a liquidar nómina<span style={styles.req}>*</span></label>
            <div style={{ position: 'relative' }}>
              <select
                value={mesLiquidar}
                onChange={(e) => setMesLiquidar(e.target.value)}
                style={styles.select}
              >
                <option value="">Seleccionar opción</option>
                {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Card 2: Tabla empleados ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Nóminas</p>
        <p style={styles.descripcion}>
          Marque las casillas de los empleados a los que les liquidará la nómina para la generación de sus respectivos desprendibles correspondientes al periodo seleccionado.
        </p>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Empleados</th>
                <th style={styles.th}></th>
                <th style={styles.th}></th>
                <th style={styles.th}></th>
                <th style={{ ...styles.th, textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#272525' }}>Seleccionar todos</span>
                    <input
                      type="checkbox"
                      checked={todosSeleccionados}
                      onChange={toggleTodos}
                      style={{ width: '18px', height: '18px', accentColor: '#0B662A', cursor: 'pointer' }}
                    />
                  </div>
                </th>
              </tr>
              <tr>
                {['Nombre(s)', 'Apellidos', 'Fecha de ingreso', 'Número de documento', 'Seleccionar'].map((col) => (
                  <th key={col} style={styles.thSub}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_EMPLEADOS.map((emp, index) => (
                <tr key={emp.id} style={index % 2 === 0 ? styles.trPar : styles.trImpar}>
                  <td style={styles.td}>{emp.nombres}</td>
                  <td style={styles.td}>{emp.apellidos}</td>
                  <td style={styles.td}>{emp.fechaIngreso}</td>
                  <td style={styles.td}>{emp.documento}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(emp.id)}
                      onChange={() => toggleEmpleado(emp.id)}
                      style={{ width: '18px', height: '18px', accentColor: '#0B662A', cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Botones ── */}
      <div style={styles.botonesRow}>
        <button
          style={{
            ...styles.btnGenerar,
            background: hoverGenerar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverGenerar(true)}
          onMouseLeave={() => setHoverGenerar(false)}
          onClick={() => setConfirmar(true)}
        >
          Generar Desprendibles
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

      <ConfirmarCambiosModal
        visible={confirmar}
        onCancelar={() => setConfirmar(false)}
        onConfirmar={() => { setConfirmar(false); navigate(`/empresas/${id}/nominas/desprendibles`); }}
        titulo="¿Deseas generar los desprendibles?"
        descripcion="Una vez confirmes, se generarán los desprendibles de nómina para los empleados seleccionados."
      />
      <MensajeModal tipo={modal} onClose={() => { setModal(null); if (modal === 'exito') navigate(-1); }} />

    </div>
  );
}

const styles = {
  container:    { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '20px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:       { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:    { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:    { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:       { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', color: '#272525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  perfilNombre: { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:  { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  card:         { backgroundColor: '#fff', borderRadius: '16px', padding: '36px 40px' },
  cardTitulo:   { fontSize: '20px', fontWeight: '800', color: '#272525', margin: '0 0 28px 0' },
  seccionTitulo:{ fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  descripcion:  { fontSize: '13px', color: '#555', margin: '0 0 24px 0', lineHeight: 1.7 },
  fila3:        { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' },
  campo:        { display: 'flex', flexDirection: 'column', gap: '8px' },
  label:        { fontSize: '13px', fontWeight: '600', color: '#272525' },
  req:          { color: '#E53E3E', marginLeft: '2px' },
  input:        { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '11px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', color: '#272525', width: '100%', boxSizing: 'border-box' },
  select:       { width: '100%', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '11px 36px 11px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundColor: '#fff', color: '#272525', cursor: 'pointer', backgroundImage: 'none', boxSizing: 'border-box' },
  selectIcon:   { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  tableWrapper: { overflowX: 'auto', width: '100%' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { fontSize: '13px', fontWeight: '700', color: '#272525', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #F0F0F0' },
  thSub:        { fontSize: '12px', fontWeight: '700', color: '#A3A3A3', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:           { fontSize: '13px', color: '#272525', padding: '14px 16px', textAlign: 'left', whiteSpace: 'nowrap' },
  trPar:        { backgroundColor: '#fff' },
  trImpar:      { backgroundColor: '#FAFAFA' },
  botonesRow:   { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px' },
  btnGenerar:   { color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnRegresar:  { color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  calendario:   { position: 'absolute', top: '110%', left: 0, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', padding: '16px', zIndex: 100, width: '280px' },
  calHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  calMes:       { fontSize: '14px', fontWeight: '700', color: '#272525' },
  calBtn:       { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' },
  calGrid:      { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' },
  calDiaSemana: { fontSize: '11px', fontWeight: '700', color: '#A3A3A3', padding: '4px 0' },
  calDia:       { fontSize: '12px', padding: '6px 2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', margin: '0 auto' },
};