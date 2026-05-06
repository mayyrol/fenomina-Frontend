import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../../store/authStore';
import { FileText, ChevronLeft, UserRound, Search } from 'lucide-react';

const fmt = (v) => '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const NOMBRES_50 = [
  { nombres: 'Abubakar',   apellidos: 'Alghazali',   doc: '10726589786', estado: 'ACTIVO'   },
  { nombres: 'Fatima',     apellidos: 'Mohammed',     doc: '10726589787', estado: 'ACTIVO'   },
  { nombres: 'Ibrahim',    apellidos: 'Bankole',      doc: '10726589788', estado: 'ACTIVO'   },
  { nombres: 'Sadiq',      apellidos: 'Sadiq',        doc: '10726589789', estado: 'ACTIVO'   },
  { nombres: 'James',      apellidos: 'Emmanuel',     doc: '10726589790', estado: 'ACTIVO'   },
  { nombres: 'Ranky',      apellidos: 'Solomon',      doc: '10726589791', estado: 'ACTIVO'   },
  { nombres: 'Otor',       apellidos: 'John',         doc: '10726589792', estado: 'ACTIVO'   },
  { nombres: 'Charles',    apellidos: 'Wilson',       doc: '10726589793', estado: 'ACTIVO'   },
  { nombres: 'Victoria',   apellidos: 'Imosemi',      doc: '10726589794', estado: 'ACTIVO'   },
  { nombres: 'Ifeanyi',    apellidos: 'Richardson',   doc: '10726589795', estado: 'ACTIVO'   },
  { nombres: 'Amoka',      apellidos: 'Mercy',        doc: '10726589796', estado: 'ACTIVO'   },
  { nombres: 'David',      apellidos: 'Martínez',     doc: '10726589797', estado: 'ACTIVO'   },
  { nombres: 'Laura',      apellidos: 'González',     doc: '10726589798', estado: 'ACTIVO'   },
  { nombres: 'Carlos',     apellidos: 'Rodríguez',    doc: '10726589799', estado: 'ACTIVO'   },
  { nombres: 'Ana',        apellidos: 'López',        doc: '10726589800', estado: 'ACTIVO'   },
  { nombres: 'Pedro',      apellidos: 'García',       doc: '10726589801', estado: 'ACTIVO'   },
  { nombres: 'María',      apellidos: 'Hernández',    doc: '10726589802', estado: 'ACTIVO'   },
  { nombres: 'Luis',       apellidos: 'Díaz',         doc: '10726589803', estado: 'ACTIVO'   },
  { nombres: 'Elena',      apellidos: 'Torres',       doc: '10726589804', estado: 'ACTIVO'   },
  { nombres: 'Jorge',      apellidos: 'Ramírez',      doc: '10726589805', estado: 'ACTIVO'   },
  { nombres: 'Sofía',      apellidos: 'Flores',       doc: '10726589806', estado: 'ACTIVO'   },
  { nombres: 'Miguel',     apellidos: 'Morales',      doc: '10726589807', estado: 'ACTIVO'   },
  { nombres: 'Claudia',    apellidos: 'Jiménez',      doc: '10726589808', estado: 'ACTIVO'   },
  { nombres: 'Ricardo',    apellidos: 'Vargas',       doc: '10726589809', estado: 'ACTIVO'   },
  { nombres: 'Patricia',   apellidos: 'Castro',       doc: '10726589810', estado: 'ACTIVO'   },
  { nombres: 'Daniel',     apellidos: 'Ruiz',         doc: '10726589811', estado: 'ACTIVO'   },
  { nombres: 'Valentina',  apellidos: 'Moreno',       doc: '10726589812', estado: 'ACTIVO'   },
  { nombres: 'Andrés',     apellidos: 'Herrera',      doc: '10726589813', estado: 'ACTIVO'   },
  { nombres: 'Camila',     apellidos: 'Medina',       doc: '10726589814', estado: 'ACTIVO'   },
  { nombres: 'Sebastián',  apellidos: 'Gutiérrez',    doc: '10726589815', estado: 'ACTIVO'   },
  { nombres: 'Lucía',      apellidos: 'Reyes',        doc: '10726589816', estado: 'ACTIVO'   },
  { nombres: 'Felipe',     apellidos: 'Ortiz',        doc: '10726589817', estado: 'ACTIVO'   },
  { nombres: 'Isabella',   apellidos: 'Navarro',      doc: '10726589818', estado: 'ACTIVO'   },
  { nombres: 'Santiago',   apellidos: 'Rojas',        doc: '10726589819', estado: 'ACTIVO'   },
  { nombres: 'Mariana',    apellidos: 'Pérez',        doc: '10726589820', estado: 'ACTIVO'   },
  { nombres: 'Alejandro',  apellidos: 'Soto',         doc: '10726589821', estado: 'INACTIVO' },
  { nombres: 'Natalia',    apellidos: 'Mendoza',      doc: '10726589822', estado: 'INACTIVO' },
  { nombres: 'Mateo',      apellidos: 'Ríos',         doc: '10726589823', estado: 'INACTIVO' },
  { nombres: 'Valeria',    apellidos: 'Guerrero',     doc: '10726589824', estado: 'INACTIVO' },
  { nombres: 'Tomás',      apellidos: 'Silva',        doc: '10726589825', estado: 'INACTIVO' },
  { nombres: 'Catalina',   apellidos: 'Aguilar',      doc: '10726589826', estado: 'INACTIVO' },
  { nombres: 'Emilio',     apellidos: 'Vásquez',      doc: '10726589827', estado: 'INACTIVO' },
  { nombres: 'Carolina',   apellidos: 'Espinoza',     doc: '10726589828', estado: 'INACTIVO' },
  { nombres: 'Diego',      apellidos: 'Fuentes',      doc: '10726589829', estado: 'INACTIVO' },
  { nombres: 'Gabriela',   apellidos: 'Ramos',        doc: '10726589830', estado: 'INACTIVO' },
  { nombres: 'Mauricio',   apellidos: 'Cortés',       doc: '10726589831', estado: 'RETIRADO' },
  { nombres: 'Paula',      apellidos: 'Sandoval',     doc: '10726589832', estado: 'RETIRADO' },
  { nombres: 'Esteban',    apellidos: 'Delgado',      doc: '10726589833', estado: 'RETIRADO' },
  { nombres: 'Juliana',    apellidos: 'Parra',        doc: '10726589834', estado: 'RETIRADO' },
  { nombres: 'Roberto',    apellidos: 'Salinas',      doc: '10726589835', estado: 'RETIRADO' },
];

const MOCK_NOMINAS = NOMBRES_50.map((emp, i) => ({
  id: i + 1, ...emp,
  periodo: '2025-06-03', diasLaborados: 15, devengoVar: 100500, devengoNoConst: 224000,
  otrosPagos: 200000, totalVac: 150000, licencRem: 150000, licencNoRem: 150000,
  incapacidades: 0, totalDevengado: 100500, deducSegSocial: 224000, retencion: 0,
  otrosDeducibles: 200000, totalDeducciones: 200000, totalNeto: 1623500,
}));

const MOCK_PERIODOS = [
  { id: 1, periodo: '2025-01-15', devengoVar: 3015000, devengoNoConst: 6720000, otrosPagos: 6000000, totalVac: 4500000, licencRem: 4500000, licencNoRem: 4500000, incapacidades: 0,      deducSegSocial: 6720000, totalNeto: 48705000 },
  { id: 2, periodo: '2025-01-30', devengoVar: 3015000, devengoNoConst: 6720000, otrosPagos: 6000000, totalVac: 4500000, licencRem: 4500000, licencNoRem: 4500000, incapacidades: 0,      deducSegSocial: 6720000, totalNeto: 48705000 },
  { id: 3, periodo: '2025-02-15', devengoVar: 3015000, devengoNoConst: 6720000, otrosPagos: 6000000, totalVac: 4500000, licencRem: 4500000, licencNoRem: 4500000, incapacidades: 150000, deducSegSocial: 6720000, totalNeto: 48555000 },
  { id: 4, periodo: '2025-02-28', devengoVar: 3015000, devengoNoConst: 6720000, otrosPagos: 6000000, totalVac: 4500000, licencRem: 4500000, licencNoRem: 4500000, incapacidades: 0,      deducSegSocial: 6720000, totalNeto: 48705000 },
  { id: 5, periodo: '2025-03-15', devengoVar: 3015000, devengoNoConst: 6720000, otrosPagos: 6000000, totalVac: 4500000, licencRem: 4500000, licencNoRem: 4500000, incapacidades: 0,      deducSegSocial: 6720000, totalNeto: 48705000 },
  { id: 6, periodo: '2025-03-31', devengoVar: 3015000, devengoNoConst: 6720000, otrosPagos: 6000000, totalVac: 4500000, licencRem: 4500000, licencNoRem: 4500000, incapacidades: 0,      deducSegSocial: 6720000, totalNeto: 48705000 },
  { id: 7, periodo: '2025-04-15', devengoVar: 3015000, devengoNoConst: 6720000, otrosPagos: 6000000, totalVac: 4500000, licencRem: 4500000, licencNoRem: 4500000, incapacidades: 0,      deducSegSocial: 6720000, totalNeto: 48705000 },
  { id: 8, periodo: '2025-04-30', devengoVar: 3015000, devengoNoConst: 6720000, otrosPagos: 6000000, totalVac: 4500000, licencRem: 4500000, licencNoRem: 4500000, incapacidades: 0,      deducSegSocial: 6720000, totalNeto: 48705000 },
];

const MOCK_SEG_SOCIAL = NOMBRES_50.map((emp, i) => ({
  id: i + 1, ...emp,
  periodo: '2025-01-15', fechaIngreso: '2025-01-02',
  salud: 224000, pension: 224000, totalSegSocial: 200000,
}));

const TABS_PRINCIPAL = [
  { id: 'nominas',   label: 'Nóminas de empleados'      },
  { id: 'periodo',   label: 'Total nóminas por periodo'  },
  { id: 'segSocial', label: 'Seguridad social empleados' },
];

const TABS_ESTADO = [
  { label: 'Activos',   value: 'ACTIVO'   },
  { label: 'Inactivos', value: 'INACTIVO' },
  { label: 'Retirados', value: 'RETIRADO' },
];

const OPCIONES_PAGINA = [10, 25, 50];

export default function ReportesNominasPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [tabPrincipal, setTabPrincipal] = useState('nominas');
  const [tabEstado,    setTabEstado]    = useState('ACTIVO');
  const [busqueda,     setBusqueda]     = useState('');
  const [pagina,       setPagina]       = useState(0);
  const [porPagina,    setPorPagina]    = useState(10);

  const handleTabPrincipal = (t) => { setTabPrincipal(t); setBusqueda(''); setPagina(0); };
  const handleTabEstado    = (v) => { setTabEstado(v);    setBusqueda(''); setPagina(0); };
  const handlePorPagina    = (v) => { setPorPagina(v);   setPagina(0); };

  const datosFiltradosNominas = MOCK_NOMINAS
    .filter(r => r.estado === tabEstado)
    .filter(r => busqueda === '' || `${r.nombres} ${r.apellidos} ${r.doc} ${r.periodo}`.toLowerCase().includes(busqueda.toLowerCase()));

  const datosFiltradosPeriodo = MOCK_PERIODOS
    .filter(r => busqueda === '' || r.periodo.includes(busqueda));

  const datosFiltradosSegSocial = MOCK_SEG_SOCIAL
    .filter(r => r.estado === tabEstado)
    .filter(r => busqueda === '' || `${r.nombres} ${r.apellidos} ${r.doc}`.toLowerCase().includes(busqueda.toLowerCase()));

  const datosActivos =
    tabPrincipal === 'nominas'   ? datosFiltradosNominas   :
    tabPrincipal === 'periodo'   ? datosFiltradosPeriodo   :
                                   datosFiltradosSegSocial;

  const totalPaginas = Math.max(1, Math.ceil(datosActivos.length / porPagina));
  const datosPagina  = datosActivos.slice(pagina * porPagina, pagina * porPagina + porPagina);

  const tituloTabla =
    tabPrincipal === 'nominas'   ? 'Histórico Detalles de Nómina por Empleado'                :
    tabPrincipal === 'periodo'   ? 'Histórico Total de Nóminas por Periodo'                   :
                                   'Histórico Detalles Seguridad Social (Deducción Empleado)';

  const mostrarEstadoTabs = tabPrincipal === 'nominas' || tabPrincipal === 'segSocial';

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Reportes Nóminas de Empleados</h2>
            <p style={styles.subtitulo}>Gestiona los reportes de nómina de los empleados asociados a la empresa</p>
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
      <button style={styles.volverBtn} onClick={() => navigate(`/empresas/${id}/reportes/empleados`)}>
        <ChevronLeft size={16} color="#272525" />
        <span>Volver</span>
      </button>

      {/* Toolbar: total + búsqueda */}
      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>{MOCK_NOMINAS.length}</p>
          <p style={styles.totalLabel}>Total empleados</p>
        </div>
        <div style={styles.searchBox}>
          <Search size={14} color="#A3A3A3" />
          <input
            style={styles.searchInput}
            placeholder="Ingresa palabra de búsqueda"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
          />
        </div>
      </div>

      {/* Tabs principales + resultados por página a la derecha */}
      <div style={styles.tabsRow}>
        <div style={styles.tabsBox}>
          {TABS_PRINCIPAL.map((t) => (
            <button
              key={t.id}
              style={{ ...styles.tab, ...(tabPrincipal === t.id ? styles.tabActivo : {}) }}
              onClick={() => handleTabPrincipal(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={styles.porPaginaBox}>
          <span style={styles.porPaginaLabel}>Resultados por página:</span>
          <select
            value={porPagina}
            onChange={(e) => handlePorPagina(Number(e.target.value))}
            style={styles.porPaginaSelect}
          >
            {OPCIONES_PAGINA.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div style={styles.card}>

        {/* Estado-tabs dentro del card, alineados a la derecha */}
        {mostrarEstadoTabs && (
          <div style={styles.estadoTabsRow}>
            {TABS_ESTADO.map((t) => (
              <button
                key={t.value}
                style={{ ...styles.estadoTab, ...(tabEstado === t.value ? styles.estadoTabActivo : {}) }}
                onClick={() => handleTabEstado(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <p style={styles.tableTitle}>{tituloTabla}</p>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              {tabPrincipal === 'nominas' && (
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Nombre(s)</th>
                  <th style={styles.th}>Apellidos</th>
                  <th style={styles.th}>Periodo</th>
                  <th style={styles.th}>Número de documento</th>
                  <th style={styles.th}>Días laborados</th>
                  <th style={styles.th}>Total devengos variables salariales</th>
                  <th style={styles.th}>Total devengos no const. salario</th>
                  <th style={styles.th}>Otros pagos perm. no const. salario</th>
                  <th style={styles.th}>Total vacaciones</th>
                  <th style={styles.th}>Total licenc. remuneradas</th>
                  <th style={styles.th}>Total licenc. no remuneradas</th>
                  <th style={styles.th}>Total incapacidades</th>
                  <th style={styles.th}>Total devengado</th>
                  <th style={styles.th}>Total deduc. de seg. social</th>
                  <th style={styles.th}>Retención en la fuente</th>
                  <th style={styles.th}>Total de otros deducibles</th>
                  <th style={styles.th}>Total deducciones</th>
                  <th style={styles.th}>Total neto a pagar</th>
                </tr>
              )}
              {tabPrincipal === 'periodo' && (
                <tr>
                  <th style={styles.th}>Periodo</th>
                  <th style={styles.th}>Total devengos variables salariales</th>
                  <th style={styles.th}>Total devengos no const. salario</th>
                  <th style={styles.th}>Otros pagos perm. no const. salario</th>
                  <th style={styles.th}>Total vacaciones</th>
                  <th style={styles.th}>Total licenc. remuneradas</th>
                  <th style={styles.th}>Total licenc. no remuneradas</th>
                  <th style={styles.th}>Total incapacidades</th>
                  <th style={styles.th}>Total deduc. de seg. social</th>
                  <th style={styles.th}>Total neto a pagar</th>
                </tr>
              )}
              {tabPrincipal === 'segSocial' && (
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Nombre(s)</th>
                  <th style={styles.th}>Apellidos</th>
                  <th style={styles.th}>Número de documento</th>
                  <th style={styles.th}>Periodo</th>
                  <th style={styles.th}>Fecha de ingreso</th>
                  <th style={styles.th}>Salud</th>
                  <th style={styles.th}>Pensión</th>
                  <th style={styles.th}>Total seguridad social</th>
                </tr>
              )}
            </thead>
            <tbody>
              {datosPagina.length === 0 ? (
                <tr><td colSpan={20} style={{ textAlign: 'center', padding: '20px', color: '#A3A3A3' }}>Sin resultados</td></tr>
              ) : datosPagina.map((r, index) => (
                <tr key={r.id} style={index % 2 === 0 ? styles.trPar : styles.trImpar}>
                  {tabPrincipal === 'nominas' && <>
                    <td style={styles.td}>{String(index + 1 + pagina * porPagina).padStart(2, '0')}</td>
                    <td style={styles.td}>{r.nombres}</td>
                    <td style={styles.td}>{r.apellidos}</td>
                    <td style={styles.td}>{r.periodo}</td>
                    <td style={styles.td}>{r.doc}</td>
                    <td style={styles.td}>{r.diasLaborados}</td>
                    <td style={styles.td}>{fmt(r.devengoVar)}</td>
                    <td style={styles.td}>{fmt(r.devengoNoConst)}</td>
                    <td style={styles.td}>{fmt(r.otrosPagos)}</td>
                    <td style={styles.td}>{fmt(r.totalVac)}</td>
                    <td style={styles.td}>{fmt(r.licencRem)}</td>
                    <td style={styles.td}>{fmt(r.licencNoRem)}</td>
                    <td style={styles.td}>{fmt(r.incapacidades)}</td>
                    <td style={styles.td}>{fmt(r.totalDevengado)}</td>
                    <td style={styles.td}>{fmt(r.deducSegSocial)}</td>
                    <td style={styles.td}>{fmt(r.retencion)}</td>
                    <td style={styles.td}>{fmt(r.otrosDeducibles)}</td>
                    <td style={styles.td}>{fmt(r.totalDeducciones)}</td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalNeto)}</td>
                  </>}
                  {tabPrincipal === 'periodo' && <>
                    <td style={styles.td}>{r.periodo}</td>
                    <td style={styles.td}>{fmt(r.devengoVar)}</td>
                    <td style={styles.td}>{fmt(r.devengoNoConst)}</td>
                    <td style={styles.td}>{fmt(r.otrosPagos)}</td>
                    <td style={styles.td}>{fmt(r.totalVac)}</td>
                    <td style={styles.td}>{fmt(r.licencRem)}</td>
                    <td style={styles.td}>{fmt(r.licencNoRem)}</td>
                    <td style={styles.td}>{fmt(r.incapacidades)}</td>
                    <td style={styles.td}>{fmt(r.deducSegSocial)}</td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalNeto)}</td>
                  </>}
                  {tabPrincipal === 'segSocial' && <>
                    <td style={styles.td}>{String(index + 1 + pagina * porPagina).padStart(2, '0')}</td>
                    <td style={styles.td}>{r.nombres}</td>
                    <td style={styles.td}>{r.apellidos}</td>
                    <td style={styles.td}>{r.doc}</td>
                    <td style={styles.td}>{r.periodo}</td>
                    <td style={styles.td}>{r.fechaIngreso}</td>
                    <td style={styles.td}>{fmt(r.salud)}</td>
                    <td style={styles.td}>{fmt(r.pension)}</td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{fmt(r.totalSegSocial)}</td>
                  </>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.paginacion}>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button key={i} onClick={() => setPagina(i)}
              style={{ ...styles.pageBtn, ...(pagina === i ? styles.pageBtnActivo : {}) }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPagina(totalPaginas - 1)} style={styles.pageBtn}
            disabled={pagina === totalPaginas - 1}>{'>>'}</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container:       { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' },
  header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:          { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:       { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:       { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:          { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  perfilNombre:    { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:     { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  volverBtn:       { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0 },
  toolbarCard:     { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalNum:        { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:      { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  searchBox:       { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '320px' },
  searchInput:     { border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  tabsRow:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E8E8' },
  tabsBox:         { display: 'flex' },
  tab:             { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px 20px', fontSize: '14px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  tabActivo:       { color: '#0B662A', borderBottom: '2px solid #0B662A' },
  porPaginaBox:    { display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '4px' },
  porPaginaLabel:  { fontSize: '13px', color: '#A3A3A3', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' },
  porPaginaSelect: { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '6px 28px 6px 12px', fontSize: '13px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23272525\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundColor: '#fff' },
  estadoTabsRow:   { display: 'flex', justifyContent: 'flex-end', gap: '4px', marginBottom: '16px' },
  estadoTab:       { background: 'none', border: '1px solid #D0D0D0', borderRadius: '20px', padding: '4px 16px', fontSize: '13px', fontWeight: '600', color: '#A3A3A3', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  estadoTabActivo: { backgroundColor: '#0B662A', borderColor: '#0B662A', color: '#fff' },
  card:            { backgroundColor: '#fff', borderRadius: '16px', padding: '24px' },
  tableTitle:      { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tableWrapper:    { overflowX: 'auto', width: '100%' },
  table:           { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  th:              { fontSize: '11px', fontWeight: '700', color: '#A3A3A3', padding: '10px 10px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:              { fontSize: '12px', color: '#272525', padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' },
  trPar:           { backgroundColor: '#fff' },
  trImpar:         { backgroundColor: '#FAFAFA' },
  paginacion:      { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' },
  pageBtn:         { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif' },
  pageBtnActivo:   { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
};
