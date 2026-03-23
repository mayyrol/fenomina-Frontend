import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { FileText, Search, ChevronLeft } from 'lucide-react';

const MOCK_REPORTE = [
  { id: 1,  nombres: 'Abubakar',  apellidos: 'Alghazali',    periodo: '2025-06-03', documento: '10726589786', diasLab: 15, totalDevengSal: '$100.500,00', totalDevengNoSal: '₦224.000,00', otrosPagosNoSal: '₦224.000,00', totalVacaciones: '$200.000,00', totalLicRem: '$150.000', totalLicNoRem: '$150.000,00', totalIncap: '$0', totalDevengado: '$100.500,00', totalDedSeg: '₦224.000,00', retencionFuente: '₦224.000,00', otrosDeducibles: '$200.000,00', totalDeducciones: '$200.000,00', totalNeto: '$1.623.500,00' },
  { id: 2,  nombres: 'Fatima',    apellidos: 'Mohammed',     periodo: '2025-06-03', documento: '10726589786', diasLab: 15, totalDevengSal: '$100.500,00', totalDevengNoSal: '₦224.000,00', otrosPagosNoSal: '₦224.000,00', totalVacaciones: '$200.000,00', totalLicRem: '$150.000', totalLicNoRem: '$150.000,00', totalIncap: '$0', totalDevengado: '$100.500,00', totalDedSeg: '₦224.000,00', retencionFuente: '₦224.000,00', otrosDeducibles: '$200.000,00', totalDeducciones: '$200.000,00', totalNeto: '$1.623.500,00' },
  { id: 3,  nombres: 'Ibrahim',   apellidos: 'Bankole',      periodo: '2025-06-03', documento: '10726589786', diasLab: 15, totalDevengSal: '$100.500,00', totalDevengNoSal: '₦224.000,00', otrosPagosNoSal: '₦224.000,00', totalVacaciones: '$200.000,00', totalLicRem: '$150.000', totalLicNoRem: '$150.000,00', totalIncap: '$0', totalDevengado: '$100.500,00', totalDedSeg: '₦224.000,00', retencionFuente: '₦224.000,00', otrosDeducibles: '$200.000,00', totalDeducciones: '$200.000,00', totalNeto: '$1.623.500,00' },
  { id: 4,  nombres: 'Sadiq',     apellidos: 'Sadiq',        periodo: '2025-06-03', documento: '10726589786', diasLab: 15, totalDevengSal: '$100.500,00', totalDevengNoSal: '₦224.000,00', otrosPagosNoSal: '₦224.000,00', totalVacaciones: '$200.000,00', totalLicRem: '$150.000', totalLicNoRem: '$150.000,00', totalIncap: '$0', totalDevengado: '$100.500,00', totalDedSeg: '₦224.000,00', retencionFuente: '₦224.000,00', otrosDeducibles: '$200.000,00', totalDeducciones: '$200.000,00', totalNeto: '$1.623.500,00' },
  { id: 5,  nombres: 'James',     apellidos: 'Emmanuel',     periodo: '2025-06-03', documento: '10726589786', diasLab: 15, totalDevengSal: '$100.500,00', totalDevengNoSal: '₦224.000,00', otrosPagosNoSal: '₦224.000,00', totalVacaciones: '$200.000,00', totalLicRem: '$150.000', totalLicNoRem: '$150.000,00', totalIncap: '$0', totalDevengado: '$100.500,00', totalDedSeg: '₦224.000,00', retencionFuente: '₦224.000,00', otrosDeducibles: '$200.000,00', totalDeducciones: '$200.000,00', totalNeto: '$1.623.500,00' },
  { id: 6,  nombres: 'Ranky',     apellidos: 'Solomon',      periodo: '2025-06-03', documento: '10726589786', diasLab: 15, totalDevengSal: '$100.500,00', totalDevengNoSal: '₦224.000,00', otrosPagosNoSal: '₦224.000,00', totalVacaciones: '$200.000,00', totalLicRem: '$150.000', totalLicNoRem: '$150.000,00', totalIncap: '$0', totalDevengado: '$100.500,00', totalDedSeg: '₦224.000,00', retencionFuente: '₦224.000,00', otrosDeducibles: '$200.000,00', totalDeducciones: '$200.000,00', totalNeto: '$1.623.500,00' },
  { id: 7,  nombres: 'Otor',      apellidos: 'John',         periodo: '2025-06-03', documento: '10726589786', diasLab: 15, totalDevengSal: '$100.500,00', totalDevengNoSal: '₦224.000,00', otrosPagosNoSal: '₦224.000,00', totalVacaciones: '$200.000,00', totalLicRem: '$150.000', totalLicNoRem: '$150.000,00', totalIncap: '$0', totalDevengado: '$100.500,00', totalDedSeg: '₦224.000,00', retencionFuente: '₦224.000,00', otrosDeducibles: '$200.000,00', totalDeducciones: '$200.000,00', totalNeto: '$1.623.500,00' },
  { id: 8,  nombres: 'Charles',   apellidos: 'Wilson',       periodo: '2025-06-03', documento: '10726589786', diasLab: 15, totalDevengSal: '$100.500,00', totalDevengNoSal: '₦224.000,00', otrosPagosNoSal: '₦224.000,00', totalVacaciones: '$200.000,00', totalLicRem: '$150.000', totalLicNoRem: '$150.000,00', totalIncap: '$0', totalDevengado: '$100.500,00', totalDedSeg: '₦224.000,00', retencionFuente: '₦224.000,00', otrosDeducibles: '$200.000,00', totalDeducciones: '$200.000,00', totalNeto: '$1.623.500,00' },
  { id: 9,  nombres: 'Victoria',  apellidos: 'Imosemi',      periodo: '2025-06-03', documento: '10726589786', diasLab: 15, totalDevengSal: '$100.500,00', totalDevengNoSal: '₦224.000,00', otrosPagosNoSal: '₦224.000,00', totalVacaciones: '$200.000,00', totalLicRem: '$150.000', totalLicNoRem: '$150.000,00', totalIncap: '$0', totalDevengado: '$100.500,00', totalDedSeg: '₦224.000,00', retencionFuente: '₦224.000,00', otrosDeducibles: '$200.000,00', totalDeducciones: '$200.000,00', totalNeto: '$1.623.500,00' },
  { id: 10, nombres: 'Ifeanyi',   apellidos: 'Richardson',   periodo: '2025-06-03', documento: '10726589786', diasLab: 15, totalDevengSal: '$100.500,00', totalDevengNoSal: '₦224.000,00', otrosPagosNoSal: '₦224.000,00', totalVacaciones: '$200.000,00', totalLicRem: '$150.000', totalLicNoRem: '$150.000,00', totalIncap: '$0', totalDevengado: '$100.500,00', totalDedSeg: '₦224.000,00', retencionFuente: '₦224.000,00', otrosDeducibles: '$200.000,00', totalDeducciones: '$200.000,00', totalNeto: '$1.623.500,00' },
  { id: 11, nombres: 'Amoka',     apellidos: 'Mercy',        periodo: '2025-06-03', documento: '10726589786', diasLab: 15, totalDevengSal: '$100.500,00', totalDevengNoSal: '₦224.000,00', otrosPagosNoSal: '₦224.000,00', totalVacaciones: '$200.000,00', totalLicRem: '$150.000', totalLicNoRem: '$150.000,00', totalIncap: '$0', totalDevengado: '$100.500,00', totalDedSeg: '₦224.000,00', retencionFuente: '₦224.000,00', otrosDeducibles: '$200.000,00', totalDeducciones: '$200.000,00', totalNeto: '$1.623.500,00' },
];

const PAGE_SIZE = 10;

const COLUMNAS = [
  { key: '#',               label: '#' },
  { key: 'nombres',         label: 'Nombre(s)' },
  { key: 'apellidos',       label: 'Apellidos' },
  { key: 'periodo',         label: 'Período' },
  { key: 'documento',       label: 'Número de documento' },
  { key: 'diasLab',         label: 'Días laborados' },
  { key: 'totalDevengSal',  label: 'Total devenga. variables salariales' },
  { key: 'totalDevengNoSal',label: 'Total devenga. no const. salario' },
  { key: 'otrosPagosNoSal', label: 'Otros pagos perm. no const. salario' },
  { key: 'totalVacaciones', label: 'Total vacaciones' },
  { key: 'totalLicRem',     label: 'Total licenc. remuneradas' },
  { key: 'totalLicNoRem',   label: 'Total licenc. no remuneradas' },
  { key: 'totalIncap',      label: 'Total incapacidades' },
  { key: 'totalDevengado',  label: 'Total devengado' },
  { key: 'totalDedSeg',     label: 'Total deduc. de seg. social' },
  { key: 'retencionFuente', label: 'Retención en la fuente' },
  { key: 'otrosDeducibles', label: 'Total de otros deducibles' },
  { key: 'totalDeducciones',label: 'Total deducciones' },
  { key: 'totalNeto',       label: 'Total neto a pagar' },
];

export default function ReporteLiquidacionPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const inicial = usuario?.nombresUsuario?.charAt(0).toUpperCase() ?? 'U';
  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

  const [busqueda, setBusqueda]   = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [pagina, setPagina]       = useState(0);
  const [hoverDescargar, setHoverDescargar] = useState(false);

  const reporteFiltrado = MOCK_REPORTE.filter(r =>
    r.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.documento.includes(busqueda)
  );

  const totalPaginas  = Math.max(1, Math.ceil(reporteFiltrado.length / PAGE_SIZE));
  const reportePagina = reporteFiltrado.slice(pagina * PAGE_SIZE, pagina * PAGE_SIZE + PAGE_SIZE);

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Reporte Liquidación Nómina</h2>
            <p style={styles.subtitulo}>Revisa los reportes que se liquidarán para cada uno de los empleados asociados</p>
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

      {/* Volver */}
      <button style={styles.volverBtn} onClick={() => navigate(-1)}>
        <ChevronLeft size={16} color="#272525" />
        <span>Volver</span>
      </button>

      {/* Toolbar card */}
      <div style={styles.toolbarCard}>
        <div>
          <p style={styles.totalNum}>{MOCK_REPORTE.length}</p>
          <p style={styles.totalLabel}>Total employees</p>
        </div>
        <div style={styles.filtrosBox}>
          <div style={styles.searchBox}>
            <Search size={14} color="#A3A3A3" />
            <input
              style={styles.searchInput}
              placeholder="Enter search word"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
            />
          </div>
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            style={styles.dateInput}
          />
          <button
            style={{
              ...styles.btnDescargar,
              background: hoverDescargar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={() => setHoverDescargar(true)}
            onMouseLeave={() => setHoverDescargar(false)}
          >
            Descargar reporte en Excel
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={styles.card}>
        <p style={styles.tableTitle}>Detalles de Nómina por Empleado</p>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {COLUMNAS.map((col) => (
                  <th key={col.key} style={styles.th}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportePagina.length === 0 ? (
                <tr><td colSpan={COLUMNAS.length} style={{ textAlign: 'center', padding: '20px', color: '#A3A3A3' }}>Sin resultados</td></tr>
              ) : (
                reportePagina.map((r, index) => (
                  <tr key={r.id} style={index % 2 === 0 ? styles.trPar : styles.trImpar}>
                    <td style={styles.td}>{String(pagina * PAGE_SIZE + index + 1).padStart(2, '0')}</td>
                    <td style={styles.td}>{r.nombres}</td>
                    <td style={styles.td}>{r.apellidos}</td>
                    <td style={styles.td}>{r.periodo}</td>
                    <td style={styles.td}>{r.documento}</td>
                    <td style={styles.td}>{r.diasLab}</td>
                    <td style={styles.td}>{r.totalDevengSal}</td>
                    <td style={styles.td}>{r.totalDevengNoSal}</td>
                    <td style={styles.td}>{r.otrosPagosNoSal}</td>
                    <td style={styles.td}>{r.totalVacaciones}</td>
                    <td style={styles.td}>{r.totalLicRem}</td>
                    <td style={styles.td}>{r.totalLicNoRem}</td>
                    <td style={styles.td}>{r.totalIncap}</td>
                    <td style={styles.td}>{r.totalDevengado}</td>
                    <td style={styles.td}>{r.totalDedSeg}</td>
                    <td style={styles.td}>{r.retencionFuente}</td>
                    <td style={styles.td}>{r.otrosDeducibles}</td>
                    <td style={styles.td}>{r.totalDeducciones}</td>
                    <td style={styles.tdNeto}>{r.totalNeto}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div style={styles.paginacion}>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => setPagina(i)}
              style={{ ...styles.pageBtn, ...(pagina === i ? styles.pageBtnActivo : {}) }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPagina(totalPaginas - 1)}
            style={styles.pageBtn}
            disabled={pagina === totalPaginas - 1}
          >
            {'>>'}
          </button>
        </div>
      </div>

    </div>
  );
}

const styles = {
  container:     { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:        { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:     { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:     { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:        { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', color: '#272525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  perfilNombre:  { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:   { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  volverBtn:     { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0 },
  toolbarCard:   { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalNum:      { fontSize: '28px', fontWeight: '800', color: '#272525', margin: 0 },
  totalLabel:    { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  filtrosBox:    { display: 'flex', alignItems: 'center', gap: '12px' },
  searchBox:     { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '280px' },
  searchInput:   { border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  dateInput:     { border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', cursor: 'pointer', color: '#272525' },
  btnDescargar:  { color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' },
  card:          { backgroundColor: '#fff', borderRadius: '16px', padding: '24px' },
  tableTitle:    { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tableWrapper:  { overflowX: 'auto', width: '100%' },
  table:         { width: '100%', borderCollapse: 'collapse', minWidth: '2000px' },
  th:            { fontSize: '11px', fontWeight: '700', color: '#A3A3A3', padding: '20x 64px', textAlign: 'center', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' },
  td:            { fontSize: '12px', color: '#272525', padding: '22px 64px', textAlign: 'center', whiteSpace: 'nowrap'  },
  tdNeto:        { fontSize: '12px', color: '#0B662A', fontWeight: '800', padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' },
  trPar:         { backgroundColor: '#fff' },
  trImpar:       { backgroundColor: '#FAFAFA' },
  paginacion:    { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' },
  pageBtn:       { width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #D0D0D0', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: '#fff', color: '#272525', fontFamily: 'Nunito, sans-serif' },
  pageBtnActivo: { backgroundColor: '#0B662A', color: '#fff', border: '1px solid #0B662A' },
};