import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { CreditCard, ChevronLeft, UserRound } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import payrollService from '../../../../../services/payrollService';
import { exportarExcel } from '../../../../../utils/exportExcel';

import axiosInstance from '../../../../../api/axiosInstance';
import { useImagenAutenticada } from '../../../hooks/useImagenAutenticada';


function BarraAcciones({ children }) {
  return (
    <div
      style={{
        position: 'sticky',
        bottom: '-24px', 
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        padding: '60px 32px 24px 32px',
        background: 'linear-gradient(to top, #F0F2F5 30%, transparent 100%)',
        zIndex: 100,
        flexWrap: 'wrap',
        marginTop: '-40px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', gap: '16px', pointerEvents: 'all' }}>
        {children}
      </div>
    </div>
  );
}
const btnSecundario = {
  color: '#272525',
  border: '1px solid #D0D0D0',
  borderRadius: '8px',
  padding: '14px 40px',
  fontSize: '14px',
  fontWeight: '700',
  fontFamily: 'Nunito, sans-serif',
  cursor: 'pointer',
  backgroundColor: '#fff',
};

const calcularNeto = (desp) => desp.valorPrestacion ?? 0;
const fmt = (v) => '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const unidades = ['','UN','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE','DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE'];
const decenas  = ['','','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
const centenas = ['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];

function numLetras(n) {
  if (n === 0) return 'CERO';
  if (n < 0) return 'MENOS ' + numLetras(-n);
  let r = '';
  if (n >= 1000000) {
    const millones = Math.floor(n / 1000000);
    r += (millones === 1 ? 'UN MILLÓN' : numLetras(millones) + ' MILLONES');
    n %= 1000000;
    r += n === 0 ? ' DE ' : ' ';
  }
  if (n >= 1000) { r += (Math.floor(n/1000) === 1 ? 'MIL' : numLetras(Math.floor(n/1000)) + ' MIL') + ' ';
    n %= 1000; }
  if (n >= 100)  { r += (n === 100 ? 'CIEN' : centenas[Math.floor(n/100)]) + ' ';
    n %= 100; }
  if (n >= 20)   { r += decenas[Math.floor(n/10)] + (n%10 ? ' Y ' + unidades[n%10] : '') + ' ';
  }
  else if (n > 0){ r += unidades[n] + ' '; }
  return r.trim();
}

const nombreCompleto = (desp) =>
  `${desp.apellidosEmpleado ?? ''} ${desp.nombresEmpleado ?? ''}`.trim();

const CARGOS_OCULTABLES = ['POR DEFINIR', 'SIN DEFINIR', 'N/A'];

const tieneCargoValido = (desp) => {
  const cargo = desp.cargoEmpleado;
  if (cargo == null) return false;
  const cargoNormalizado = cargo.trim().toUpperCase();
  return cargoNormalizado !== '' && !CARGOS_OCULTABLES.includes(cargoNormalizado);
};

export default function ResultadoPrimaPage() {
  const navigate        = useNavigate();
  const { id, primaId } = useParams();
  const { usuario }     = useAuthStore();
  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';
  
  const [hoverDescargar, setHoverDescargar] = useState(false);
  const [descargando, setDescargando]       = useState(false);
  const [proceso,       setProceso]       = useState(null);
  const [empresa,       setEmpresa]       = useState(null);
  const [desprendibles, setDesprendibles] = useState([]);
  const [cargando,      setCargando]      = useState(false);
  const [errorDesp,     setErrorDesp]     = useState(false);

  const calcularFechaInicio = (desp) => {
    if (!desp.fechaInicioCorte || !proceso?.anio) return desp.fechaInicioCorte ?? '';
    const fechaCorte    = new Date(desp.fechaInicioCorte + 'T00:00:00');
    const inicioPeriodo = proceso.periodo === 1
      ? new Date(`${proceso.anio}-01-01`)
      : new Date(`${proceso.anio}-07-01`);
    if (isNaN(inicioPeriodo.getTime())) return desp.fechaInicioCorte;
    return fechaCorte > inicioPeriodo
      ? desp.fechaInicioCorte
      : inicioPeriodo.toISOString().split('T')[0];
  };

  const totalGeneral = desprendibles.reduce((s, d) => s + (d.valorPrestacion ?? 0), 0);

  // Hook restaurado de V1
  const logoSrc = useImagenAutenticada(empresa?.logoEmpresaUrl);

  const handleDescargar = async () => {
    setDescargando(true);
    let logoBase64 = null;
    
    // Lógica restaurada de V1 para el Logo
    if (empresa?.logoEmpresaUrl) {
      try {
        const logoUrl = `${import.meta.env.VITE_GATEWAY_URL}/api/master/files/logos/${empresa.logoEmpresaUrl}`;
        const token = useAuthStore.getState().accessToken;
        const response = await fetch(logoUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const blob = await response.blob();
        logoBase64 = await new Promise((resolve) => {
          const img = new Image();
          const url = URL.createObjectURL(blob);
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxSize = 100;
            const ratio = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
            URL.revokeObjectURL(url);
          };
          img.onerror = () => resolve(null);
          img.src = url;
        });
      } catch {
        logoBase64 = null;
      }
    }

    const doc = new jsPDF();
    const semestre = proceso?.periodo === 1 ? 'Primer semestre' : 'Segundo semestre';
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const mitad = pageHeight / 2;
    
    // Página 1 — planilla resumen (Diseño Vertical V2)
    const M = 14; 
    let y = M;
    if (logoBase64) doc.addImage(logoBase64, 'JPEG', M, y, 20, 20);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(empresa?.nombreEmpresa ?? '', pageWidth / 2, y + 6, { align: 'center' });
    doc.setFontSize(9); doc.setFont(undefined, 'normal');
    doc.text(`NIT: ${empresa?.empresaNit ?? ''}`, pageWidth / 2, y + 12, { align: 'center' });
    doc.text('INGRESO / PAGOS', pageWidth / 2, y + 18, { align: 'center' });
    doc.text(`PLANILLA PRIMA ${semestre.toUpperCase()} ${proceso?.anio ?? ''}`, pageWidth / 2, y + 24, { align: 'center' });
    y += 30;

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, bottom: M },
      tableWidth: pageWidth - M * 2,
      head: [['No', 'CC', 'APELLIDOS Y NOMBRES', 'CARGO', 'F. INICIO', 'F. FIN', 'DÍAS', 'SAL. BASE', 'AUX. TRANSP.', 'NETO', 'FIRMA']],
      body: [
        ...desprendibles.map((desp, i) => [
          i + 1,
          desp.documentoEmpleado,
          `${nombreCompleto(desp)}`,
          tieneCargoValido(desp) ? desp.cargoEmpleado : '',
          desp.fechaInicioCorte,
          desp.fechaFinCorte,
          desp.diasLiquidados,
          fmt(desp.salarioBase),
          fmt(desp.auxTransporte),
          fmt(desp.valorPrestacion),
          '',
        ]),
        [{ content: 'TOTAL', colSpan: 9, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: fmt(totalGeneral), styles: { fontStyle: 'bold' } },
        { content: '' }],
      ],
      styles: { fontSize: 6, cellPadding: 1 },
      headStyles: { fillColor: [11, 102, 42], textColor: 255, fontStyle: 'bold', fontSize: 6, halign: 'center', valign: 'middle' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      bodyStyles: { minCellHeight: 12, valign: 'middle' },
      columnStyles: {
        0:  { cellWidth: 7,  halign: 'center' },
        1:  { cellWidth: 15, halign: 'center' },
        2:  { cellWidth: 27 },
        3:  { cellWidth: 15 },
        4:  { cellWidth: 15, halign: 'center' },
        5:  { cellWidth: 15, halign: 'center' },
        6:  { cellWidth: 8,  halign: 'center' },
        7:  { cellWidth: 18, halign: 'right' },
        8:  { cellWidth: 20, halign: 'right' },
        9:  { cellWidth: 17, halign: 'right' },
        10: { cellWidth: 25, halign: 'center' },
      },
    });

    // Páginas individuales — original + copia por página (Diseño V2)
    const renderComprobante = (desp, yInicio, mitadRef, pageHeightRef) => {
      const neto = desp.valorPrestacion ?? 0;
      const margenSuperior = yInicio === 0 ? M : yInicio + 2;
      const rectBottom     = yInicio === 0 ? mitadRef - 2 : pageHeightRef - M;
      const alturaComprobante = rectBottom - margenSuperior;
      
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(M, margenSuperior, pageWidth - M * 2, alturaComprobante);
      let cy = margenSuperior + 8;

      if (logoBase64) doc.addImage(logoBase64, 'JPEG', M + 4, cy - 1, 14, 14);
      doc.setFontSize(9); doc.setFont(undefined, 'bold');
      doc.text(empresa?.nombreEmpresa ?? '', pageWidth - M - 4, cy + 2, { align: 'right' });
      doc.setFontSize(8); doc.setFont(undefined, 'normal');
      doc.text(`NIT: ${empresa?.empresaNit ?? ''}`, pageWidth - M - 4, cy + 8, { align: 'right' });
      cy += 16;

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(M + 4, cy, pageWidth - M - 4, cy);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      cy += 4;

      doc.setFontSize(8); doc.setFont(undefined, 'bold');
      doc.text('Datos del trabajador:', M + 4, cy); cy += 5;
      doc.setFont(undefined, 'normal');
      doc.text('Nombre:', M + 4, cy); doc.text(`${nombreCompleto(desp)}`, M + 36, cy); cy += 5;
      doc.text('Cédula:', M + 4, cy); doc.text(desp.documentoEmpleado, M + 36, cy); cy += 5;
      if (tieneCargoValido(desp)) {
        doc.text('Cargo:', M + 4, cy); doc.text(desp.cargoEmpleado, M + 36, cy); cy += 6;
      } else {
        cy += 1; 
      }

      doc.setFont(undefined, 'bold');
      doc.text(`Comprobante del pago de la prima de servicios correspondiente al ${semestre}`, pageWidth / 2, cy, { align: 'center' });
      cy += 7;

      doc.setFont(undefined, 'normal');
      doc.text('Fecha inicial:', M + 4, cy); doc.text(desp.fechaInicioCorte ?? '', M + 52, cy); cy += 5;
      doc.text('Fecha final:', M + 4, cy); doc.text(desp.fechaFinCorte ?? '', M + 52, cy); cy += 5;
      doc.text('Días trabajados en el semestre:', M + 4, cy); doc.text(String(desp.diasLiquidados ?? ''), M + 52, cy); cy += 6;

      doc.text('Salario Base:', M + 4, cy); doc.text(fmt(desp.salarioBase), M + 52, cy); cy += 5;
      doc.text('Base Aux. de Transporte:', M + 4, cy); doc.text(fmt(desp.auxTransporte), M + 52, cy); cy += 6;

      doc.setFont(undefined, 'bold');
      doc.text('Valor de la prima de servicios:', M + 4, cy); doc.text(fmt(neto), M + 52, cy); cy += 5;
      doc.text('Valor en letras:', M + 4, cy); doc.setFont(undefined, 'normal');
      
      const letras = (() => { try { return numLetras(Math.round(neto)) + ' PESOS M/CTE'; } catch { return ''; } })();
      const split = doc.splitTextToSize(letras, pageWidth - M * 2 - 44);
      doc.text(split, M + 36, cy); cy += split.length * 4 + 6;

      doc.text('Recibí conforme:', M + 4, cy); cy += 10;
      doc.line(M + 4, cy, M + 80, cy); cy += 4;
      doc.text(`${nombreCompleto(desp)}`, M + 4, cy); cy += 5;
      doc.text('Fecha de recibido:', M + 4, cy);
    };

    desprendibles.forEach((desp) => {
      doc.addPage();
      renderComprobante(desp, 0, mitad, pageHeight);
      doc.setDrawColor(180, 180, 180);
      doc.setLineDashPattern([3, 3], 0);
      doc.line(14, mitad, 196, mitad);
      doc.setLineDashPattern([], 0);
      renderComprobante(desp, mitad, mitad, pageHeight);
    });

    const nombreArchivo = `${empresa?.nombreEmpresa ?? 'PRIMA'} ${semestre} ${proceso?.anio ?? ''}`.trim();
    doc.save(`${nombreArchivo}.pdf`);
    setDescargando(false);
  };

  const EXCEL_HEADERS_PRIMA = ['#','CC','Apellidos y Nombres','Cargo','Fecha inicio','Fecha fin','Días','Salario base','Aux. transporte','Neto'];

  const handleDescargarExcel = () => {
    const filas = desprendibles.map((desp, i) => [
      i + 1,
      desp.documentoEmpleado,
      nombreCompleto(desp),
      tieneCargoValido(desp) ? desp.cargoEmpleado : '-',
      desp.fechaInicioCorte ?? '-',
      desp.fechaFinCorte ?? '-',
      desp.diasLiquidados,
      desp.salarioBase ?? 0,
      desp.auxTransporte ?? 0,
      desp.valorPrestacion ?? 0,
    ]);
    const semestre = proceso?.periodo === 1 ? 'Primer semestre' : 'Segundo semestre';
    const nombreArchivo = `${empresa?.nombreEmpresa ?? 'PRIMA'} ${semestre} ${proceso?.anio ?? ''}`.trim();
    exportarExcel(EXCEL_HEADERS_PRIMA, filas, nombreArchivo, 'Prima');
  };

  useEffect(() => {
    if (!primaId || !id) return;
    setCargando(true);

    // Promise.allSettled y axiosInstance combinados
    Promise.allSettled([
      payrollService.getDesprendiblesPrima(primaId),
      payrollService.getProcesosPrima(id),
      axiosInstance.get(`/api/master/empresas/${id}`),
    ])
      .then(([despsResult, procesosResult, empResult]) => {
        if (despsResult.status === 'fulfilled') {
          const ordenados = [...despsResult.value.data].sort((a, b) =>
            (a.apellidosEmpleado ?? '').localeCompare(b.apellidosEmpleado ?? '', 'es')
          );
          setDesprendibles(ordenados);
        }
        else setErrorDesp(true); // Lógica de control de errores conservada

        if (empResult.status === 'fulfilled') setEmpresa(empResult.value.data);

        if (procesosResult.status === 'fulfilled') {
          const encontrado = procesosResult.value.data.find(
            p => String(p.procesoLiquiId) === String(primaId)
          );
          setProceso(encontrado ?? null);
        }
      })
      .finally(() => setCargando(false));
  }, [primaId, id]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Desprendibles Prima</h2>
            <p style={styles.subtitulo}>Ver desprendibles de Prima</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}><UserRound size={22} color="#A3A3A3" /></div>
          <div><p style={styles.perfilNombre}>{nombre}</p><p style={styles.perfilCargo}>{cargo}</p></div>
        </div>
      </div>

      {/* Info proceso */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Desprendibles Prima</h3>
        <p style={styles.exitoMsg}>¡Prima liquidada exitosamente!</p>
        <div style={styles.infoGrid}>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Nombre Empresa:</span><span style={styles.infoValor}>{empresa?.nombreEmpresa ?? ''}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Nit:</span><span style={styles.infoValor}>{empresa?.empresaNit ?? ''}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Fecha de Generación de Reporte:</span><span style={styles.infoValor}>{new Date().toLocaleDateString('es-CO')}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Periodo:</span><span style={styles.infoValor}>{proceso?.fechaInicioPeriodo} - {proceso?.fechaFinPeriodo}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Semestre:</span><span style={styles.infoValor}>{proceso?.periodo === 1 ? 'Primer semestre' : 'Segundo semestre'}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Estado:</span><span style={styles.infoValor}>{proceso?.estadoProcNomina ?? ''}</span></div>
        </div>
        <hr style={styles.divider} />
      </div>

      {/* Planilla resumen con validaciones y campos V2 */}
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 4px 0' }}>{empresa?.nombreEmpresa ?? ''}</p>
          <p style={{ fontSize: '13px', color: '#272525', margin: '0 0 2px 0' }}>NIT: {empresa?.empresaNit ?? ''}</p>
          <p style={{ fontSize: '12px', color: '#272525', margin: '0 0 2px 0' }}>INGRESO / PAGOS</p>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#272525', margin: 0 }}>PLANILLA PRIMA — {proceso?.periodo === 1 ? 'PRIMER SEMESTRE' : 'SEGUNDO SEMESTRE'} {proceso?.anio ?? ''}</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.tabla}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, minWidth: '36px'  }}>No</th>
                  <th style={{ ...styles.th, minWidth: '80px'  }}>CC</th>
                  <th style={{ ...styles.th, textAlign: 'left', minWidth: '150px' }}>Nombres y Apellidos</th>
                  <th style={{ ...styles.th, textAlign: 'left', minWidth: '80px'  }}>Cargo</th>
                  <th style={{ ...styles.th, minWidth: '95px'  }}>Fecha inicio</th>
                  <th style={{ ...styles.th, minWidth: '95px'  }}>Fecha fin</th>
                  <th style={{ ...styles.th, minWidth: '48px'  }}>Días</th>
                  <th style={{ ...styles.th, minWidth: '100px' }}>Salario Base</th>
                  <th style={{ ...styles.th, minWidth: '130px' }}>Base Aux. Transporte</th>
                  <th style={{ ...styles.th, minWidth: '100px' }}>Neto</th>
                  <th style={{ ...styles.th, minWidth: '130px' }}>Firma Empleado</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td>
                  </tr>
                ) : errorDesp ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '20px', color: '#E53E3E', fontWeight: '700' }}>
                      No se pudieron cargar los desprendibles. Es posible que la liquidación no se haya completado correctamente.
                    </td>
                  </tr>
                ) : desprendibles.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '20px', color: '#A3A3A3' }}>
                      Sin desprendibles disponibles.
                    </td>
                  </tr>
                ) : desprendibles.map((desp, i) => (
                  <tr key={desp.cabeLiquiPrestacionId ?? i} style={i % 2 === 0 ? styles.trPar : styles.trImpar}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>{desp.documentoEmpleado}</td>
                    <td style={{ ...styles.td, textAlign: 'left' }}>{nombreCompleto(desp)}</td>
                    <td style={{ ...styles.td, textAlign: 'left' }}>
                      {tieneCargoValido(desp) ? desp.cargoEmpleado : ''}
                    </td>
                    <td style={styles.td}>{calcularFechaInicio(desp)}</td>
                    <td style={styles.td}>{desp.fechaFinCorte}</td>
                    <td style={styles.td}>{desp.diasLiquidados}</td>
                    <td style={styles.td}>{fmt(desp.salarioBase)}</td>
                    <td style={styles.td}>{fmt(desp.auxTransporte)}</td>
                    <td style={styles.td}>{fmt(desp.valorPrestacion)}</td>
                    <td style={{ ...styles.td, minWidth: '120px', height: '40px' }}></td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#E8F5EE' }}>
                  <td colSpan={9} style={{ ...styles.td, fontWeight: '800', textAlign: 'right', color: '#0B662A' }}>TOTAL</td>
                  <td style={{ ...styles.td, fontWeight: '800', color: '#0B662A' }}>{fmt(totalGeneral)}</td>
                  <td style={styles.td}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Comprobantes individuales */}
      {desprendibles.map((desp) => {
        const neto = desp.valorPrestacion ?? 0;
        const semestre = proceso?.periodo === 1 ? 'Primer semestre' : 'Segundo semestre';
        return (
          <div key={desp.empleadoId} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={styles.comprobante}>
              <div style={{ display: 'flex', justifyContent: logoSrc ? 'space-between' : 'flex-end', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #E8E8E8' }}>
                {logoSrc && (
                  <img src={logoSrc} alt="Logo" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
                )}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#272525', margin: '0 0 2px 0' }}>{empresa?.nombreEmpresa ?? ''}</p>
                  <p style={{ fontSize: '11px', color: '#272525', margin: 0 }}>NIT: {empresa?.empresaNit ?? ''}</p>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <p style={{ ...styles.comprobanteLabel, fontWeight: '700', margin: '0 0 4px 0' }}>Datos del trabajador:</p>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                  <span style={styles.comprobanteLabel}>Nombre:</span>
                  <span style={styles.comprobanteValor}>{nombreCompleto(desp)}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={styles.comprobanteLabel}>Cédula:</span>
                  <span style={styles.comprobanteValor}>{desp.documentoEmpleado}</span>
                </div>
                {tieneCargoValido(desp) && (
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={styles.comprobanteLabel}>Cargo:</span>
                    <span style={styles.comprobanteValor}>{desp.cargoEmpleado}</span>
                  </div>
                )}
              </div>

              <p style={{ fontSize: '11px', fontWeight: '700', textAlign: 'center', margin: '12px auto', color: '#272525', width: '100%' }}>
                Comprobante del pago de la prima de servicios correspondiente al {semestre}
              </p>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                  <span style={styles.comprobanteLabel}>Fecha inicial:</span>
                  <span style={styles.comprobanteValor}>{calcularFechaInicio(desp)}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                  <span style={styles.comprobanteLabel}>Fecha final:</span>
                  <span style={styles.comprobanteValor}>{desp.fechaFinCorte}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={styles.comprobanteLabel}>Días trabajados en el semestre:</span>
                  <span style={styles.comprobanteValor}>{desp.diasLiquidados}</span>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                  <span style={{ ...styles.comprobanteLabel, width: '160px' }}>Salario Base:</span>
                  <span style={styles.comprobanteValor}>{fmt(desp.salarioBase)}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                  <span style={{ ...styles.comprobanteLabel, width: '160px' }}>Base Aux. de Transporte:</span>
                  <span style={styles.comprobanteValor}>{fmt(desp.auxTransporte)}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                  <span style={{ ...styles.comprobanteLabel, fontWeight: '700', width: '160px' }}>Valor de la prima de servicios:</span>
                  <span style={{ ...styles.comprobanteValor, fontWeight: '700' }}>{fmt(neto)}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ ...styles.comprobanteLabel, fontWeight: '700' }}>Valor en letras:</span>
                  <span style={{ ...styles.comprobanteValor, textTransform: 'uppercase' }}>
                    {(() => {
                      try { return numLetras(Math.round(neto)) + ' PESOS M/CTE'; }
                      catch { return ''; }
                    })()}
                  </span>
                </div>
              </div>

              <p style={{ ...styles.comprobanteLabel, marginBottom: '24px' }}>Recibí conforme:</p>
              <div style={{ borderTop: '1px solid #272525', width: '220px', paddingTop: '6px', marginTop: '8px' }}>
                <p style={{ fontSize: '11px', color: '#272525', margin: '0 0 2px 0', fontWeight: '600' }}>{nombreCompleto(desp)}</p>
                <p style={{ fontSize: '11px', color: '#272525', margin: 0 }}>Fecha de recibido:</p>
              </div>
            </div>
          </div>
        );
      })}

      <BarraAcciones justificar="space-between">
        <button
          style={btnSecundario}
          onClick={() => navigate(`/empresas/${id}/primas`)} 
        >
          Volver al inicio
        </button>
        <div style={{ display: 'flex', gap: '12px', pointerEvents: 'all' }}>
          <button
            style={{ background: '#fff', border: '1px solid #0B662A', borderRadius: '8px', padding: '10px 28px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', color: '#0B662A' }}
            onClick={handleDescargarExcel}
            disabled={cargando || desprendibles.length === 0}
          >
            Descargar en Excel
          </button>
          <button
            style={{ background: hoverDescargar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', color: '#fff', transition: 'background 0.3s ease' }}
            onMouseEnter={() => setHoverDescargar(true)}
            onMouseLeave={() => setHoverDescargar(false)}
            onClick={handleDescargar}
            disabled={cargando || desprendibles.length === 0}
          >
            Descargar Reportes en PDF
          </button>
        </div>
      </BarraAcciones>

    </div>
  );
}

const styles = {
  container:          { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' },
  header:             { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:             { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:          { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:          { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:             { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  perfilNombre:       { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:        { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  stickyBar:          { position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'transparent', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  volverBtn:          { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0, width: 'fit-content' },
  btnDescargarSticky: { color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  card:               { backgroundColor: '#fff', borderRadius: '16px', padding: '28px 32px' },
  cardTitulo:         { fontSize: '16px', fontWeight: '800', color: '#272525', margin: '0 0 12px 0' },
  exitoMsg:           { fontSize: '14px', fontWeight: '700', color: '#0B662A', margin: '0 0 16px 0' },
  infoGrid:           { display: 'flex', flexDirection: 'column', gap: '10px' },
  infoFila:           { display: 'flex', gap: '8px', alignItems: 'baseline' },
  infoLabel:          { fontSize: '13px', fontWeight: '700', color: '#272525', whiteSpace: 'nowrap' },
  infoValor:          { fontSize: '13px', color: '#272525' },
  divider:            { border: 'none', borderTop: '1px solid #E8E8E8', margin: '24px 0 0 0' },
  tableTitle:         { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tabla:              { width: '100%', borderCollapse: 'collapse', minWidth: '1050px', fontSize: '12px' },
  th:                 { backgroundColor: '#F0F0F0', fontWeight: '700', color: '#272525', padding: '8px 12px', textAlign: 'center', border: '1px solid #E0E0E0', whiteSpace: 'nowrap' },
  td:                 { padding: '7px 12px', textAlign: 'center', color: '#272525', border: '1px solid #E0E0E0', whiteSpace: 'nowrap' },
  trPar:              { backgroundColor: '#fff' },
  trImpar:            { backgroundColor: '#FAFAFA' },
  comprobante:        { border: '1px solid #D0D0D0', borderRadius: '4px', padding: '28px 32px', width: '100%', maxWidth: '680px', boxSizing: 'border-box', backgroundColor: '#fff' },
  comprobanteLabel:   { fontSize: '11px', color: '#272525', margin: 0, minWidth: '120px' },
  comprobanteValor:   { fontSize: '11px', color: '#272525', margin: 0 },
};