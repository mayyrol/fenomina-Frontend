import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { Coins, UserRound } from 'lucide-react';
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

const fmt = (v) => v != null ? '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

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

export default function ResultadoCesantiasPage() {
  const navigate             = useNavigate();
  const { id, cesantiaId }   = useParams();
  const { usuario }          = useAuthStore();
  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';
  
  const [hoverDescargar, setHoverDescargar] = useState(false);
  const [descargando, setDescargando]       = useState(false);
  const [proceso,       setProceso]       = useState(null);
  const [empresa,       setEmpresa]       = useState(null);
  const [desprendibles, setDesprendibles] = useState([]);
  const [cargando,      setCargando]      = useState(false);

  const totalCesantias = desprendibles.reduce((s, d) => s + (d.valorPrestacion ?? 0), 0);
  const totalIntereses = desprendibles.reduce((s, d) => s + (d.valorInteresesCesantias ?? 0), 0);

  // Hook restaurado de V1
  const logoSrc = useImagenAutenticada(empresa?.logoEmpresaUrl);

  const handleDescargar = async () => {
    setDescargando(true);
    let logoBase64 = null;
    
    // Lógica restaurada de V1 para obtener el logo con Bearer token
    if (empresa?.logoEmpresaUrl) {
      try {
        const logoUrl = `${import.meta.env.VITE_GATEWAY_URL}/api/master/files/logos/${empresa.logoEmpresaUrl}`;
        const token = useAuthStore.getState().accessToken;
        const response = await fetch(logoUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
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
            img.onerror = () => { resolve(null); URL.revokeObjectURL(url); };
            img.src = url;
          });
        }
      } catch {
        logoBase64 = null;
      }
    }

    // Diseño vertical PDF nuevo
    const doc = new jsPDF(); 
    const M = 14;
    const pageWidth  = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const mitad = pageHeight / 2;
    let y = M;

    // ─── Página 1: planilla resumen ───
    if (logoBase64) doc.addImage(logoBase64, 'JPEG', M, y, 20, 20);
    doc.setFontSize(12); doc.setFont(undefined, 'bold');
    doc.text(empresa?.nombreEmpresa ?? '', pageWidth / 2, y + 6, { align: 'center' });
    doc.setFontSize(9); doc.setFont(undefined, 'normal');
    doc.text(`NIT: ${empresa?.empresaNit ?? ''}`, pageWidth / 2, y + 12, { align: 'center' });
    doc.setFont(undefined, 'bold');
    doc.text(`PLANILLA CESANTÍAS E INTERESES ${proceso?.anio ?? ''}`, pageWidth / 2, y + 18, { align: 'center' });
    doc.setFont(undefined, 'normal');
    y += 28;

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, bottom: M },
      tableWidth: pageWidth - M * 2,
      head: [['No', 'CC', 'NOMBRE EMPLEADO', 'DÍAS', 'F. INICIO', 'F. FIN', 'SAL. BASE', 'AUX. TRANSP.', 'BASE LIQ.', 'CESANTÍAS', 'INT. CES.', 'FONDO CES.', 'FIRMA']],
      body: [
        ...desprendibles.map((desp, i) => [
          i + 1,
          desp.documentoEmpleado,
          `${nombreCompleto(desp)}`,
          desp.diasLiquidados,
          desp.fechaInicioCorte,
          desp.fechaFinCorte,
          fmt(desp.salarioBase),
          fmt(desp.auxTransporte),
          fmt(desp.baseLiquidacion),
          fmt(desp.valorPrestacion),
          fmt(desp.valorInteresesCesantias),
          desp.fondoCesantias ?? '',
          '',
        ]),
        [
          { content: 'TOTAL', colSpan: 9, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: fmt(totalCesantias), styles: { fontStyle: 'bold', halign: 'right' } },
          { content: fmt(totalIntereses), styles: { fontStyle: 'bold', halign: 'right' } },
          '',
          '',
        ],
      ],
      styles: { fontSize: 6, cellPadding: 1 },
      headStyles: { fillColor: [11, 102, 42], textColor: 255, fontStyle: 'bold', fontSize: 6, halign: 'center', valign: 'middle' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      bodyStyles: { minCellHeight: 12, valign: 'middle' },
      columnStyles: {
        0:  { cellWidth: 5,  halign: 'center' },
        1:  { cellWidth: 11, halign: 'center' },
        2:  { cellWidth: 19, halign: 'center' },
        3:  { cellWidth: 8,  halign: 'center' },
        4:  { cellWidth: 15, halign: 'center' },
        5:  { cellWidth: 15, halign: 'center' },
        6:  { cellWidth: 16, halign: 'right'  },
        7:  { cellWidth: 18, halign: 'right'  },
        8:  { cellWidth: 14, halign: 'right'  },
        9:  { cellWidth: 16, halign: 'right'  },
        10: { cellWidth: 15, halign: 'right'  },
        11: { cellWidth: 14, halign: 'center' },
        12: { cellWidth: 16, halign: 'center' },
      },
    });

    // ─── Comprobantes: original + copia por página (portrait) ───
    const renderComprobante = (desp, yInicio) => {
      const margenSup  = yInicio === 0 ? M : yInicio + 2;
      const rectBottom = yInicio === 0 ? mitad - 2 : pageHeight - M;
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(M, margenSup, pageWidth - M * 2, rectBottom - margenSup);
      let cy = margenSup + 7;

      // Cabecera: logo izq — empresa der
      if (logoBase64) doc.addImage(logoBase64, 'JPEG', M + 4, cy - 1, 13, 13);
      doc.setFontSize(9); doc.setFont(undefined, 'bold');
      doc.text(empresa?.nombreEmpresa ?? '', pageWidth - M - 4, cy + 2, { align: 'right' });
      doc.setFontSize(8); doc.setFont(undefined, 'normal');
      doc.text(`NIT: ${empresa?.empresaNit ?? ''}`, pageWidth - M - 4, cy + 8, { align: 'right' });
      cy += 14;

      doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.2);
      doc.line(M + 4, cy, pageWidth - M - 4, cy);
      doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.3);
      cy += 4;

      // Datos del trabajador
      doc.setFontSize(8); doc.setFont(undefined, 'bold');
      doc.text('Datos del trabajador:', M + 4, cy); cy += 4;
      doc.setFont(undefined, 'normal');
      doc.text('Nombre:', M + 4, cy);
      doc.text(`${nombreCompleto(desp)}`, M + 36, cy); cy += 4;
      doc.text('Cédula:', M + 4, cy);
      doc.text(String(desp.documentoEmpleado), M + 36, cy); cy += 6;

      // Título centrado
      doc.setFont(undefined, 'bold');
      doc.text(`Liquidación de cesantías e intereses ${proceso?.anio ?? ''}`, pageWidth / 2, cy, { align: 'center' });
      cy += 6;

      // Fechas
      doc.setFont(undefined, 'normal');
      doc.text('Fecha inicial:', M + 4, cy); doc.text(desp.fechaInicioCorte ?? '', M + 52, cy); cy += 4;
      doc.text('Fecha final:', M + 4, cy); doc.text(desp.fechaFinCorte ?? '', M + 52, cy); cy += 4;
      doc.text('Días trabajados:', M + 4, cy); doc.text(String(desp.diasLiquidados ?? ''), M + 52, cy); cy += 6;
      
      const VC = M + 65;
      doc.text('Salario Base:', M + 4, cy); doc.text(fmt(desp.salarioBase), VC, cy); cy += 4;
      doc.text('Base Aux. de Transporte:', M + 4, cy); doc.text(fmt(desp.auxTransporte), VC, cy); cy += 4;
      doc.text('Cesantías (informativo):', M + 4, cy); doc.text(fmt(desp.valorPrestacion), VC, cy); cy += 4;
      doc.text('Intereses de cesantías:', M + 4, cy); doc.text(fmt(desp.valorInteresesCesantias), VC, cy); cy += 6;
      
      doc.setFont(undefined, 'bold');
      doc.text('Valor a pagar intereses de cesantías:', M + 4, cy);
      doc.text(fmt(desp.valorInteresesCesantias), VC, cy); cy += 5;
      doc.text('Valor en letras:', M + 4, cy);
      doc.setFont(undefined, 'normal');
      const letras = (() => {
        try { return numLetras(Math.round(desp.valorInteresesCesantias ?? 0)) + ' PESOS M/CTE'; }
        catch { return ''; }
      })();
      const split = doc.splitTextToSize(letras, pageWidth - M * 2 - 69);
      doc.text(split, VC, cy); cy += split.length * 4 + 6;

      // Recibí conforme
      doc.text('Recibí conforme:', M + 4, cy); cy += 8;
      doc.line(M + 4, cy, M + 80, cy); cy += 4;
      doc.text(`${nombreCompleto(desp)}`, M + 4, cy); cy += 4;
      doc.text('Fecha de recibido:', M + 4, cy);
    };
    
    desprendibles.forEach((desp) => {
      doc.addPage();
      renderComprobante(desp, 0);
      doc.setDrawColor(180, 180, 180);
      doc.setLineDashPattern([3, 3], 0);
      doc.line(M, mitad, pageWidth - M, mitad);
      doc.setLineDashPattern([], 0);
      renderComprobante(desp, mitad);
    });
    
    const nombreArchivo = `${empresa?.nombreEmpresa ?? ''} CESANTIAS ${proceso?.anio ?? ''}`.trim();
    doc.save(`${nombreArchivo}.pdf`);
    setDescargando(false);
  };

  const EXCEL_HEADERS_CESANTIAS = ['#','CC','Nombre empleado','Días','Fecha inicio','Fecha fin','Salario Base','Aux. Transporte','Base Liquidación','Cesantías','Intereses Cesantías','Fondo de Cesantías'];

  const handleDescargarExcel = () => {
    const filas = desprendibles.map((desp, i) => [
      i + 1,
      desp.documentoEmpleado,
      nombreCompleto(desp),
      desp.diasLiquidados,
      desp.fechaInicioCorte ?? '-',
      desp.fechaFinCorte ?? '-',
      desp.salarioBase ?? 0,
      desp.auxTransporte ?? 0,
      desp.baseLiquidacion ?? 0,
      desp.valorPrestacion ?? 0,
      desp.valorInteresesCesantias ?? 0,
      desp.fondoCesantias ?? '-',
    ]);
    const nombreArchivo = `${empresa?.nombreEmpresa ?? ''} CESANTIAS ${proceso?.anio ?? ''}`.trim();
    exportarExcel(EXCEL_HEADERS_CESANTIAS, filas, nombreArchivo, 'Cesantías');
  };

  useEffect(() => {
    if (!cesantiaId || !id) return;
    setCargando(true);

    // Promise.allSettled implementado (nuevo ajuste), pero usando axiosInstance (restaurado de V1)
    Promise.allSettled([
      payrollService.getDesprendiblesCesantias(cesantiaId),
      payrollService.getProcesosCesantias(id),
      axiosInstance.get(`/api/master/empresas/${id}`),
    ])
      .then(([despsResult, procesosResult, empResult]) => {
        if (despsResult.status === 'fulfilled') {
          const ordenados = [...despsResult.value.data].sort((a, b) =>
            (a.apellidosEmpleado ?? '').localeCompare(b.apellidosEmpleado ?? '', 'es')
          );
          setDesprendibles(ordenados);
        }
        if (empResult.status === 'fulfilled') setEmpresa(empResult.value.data);
        if (procesosResult.status === 'fulfilled') {
          const encontrado = procesosResult.value.data.find(
            p => String(p.procesoLiquiId) === String(cesantiaId)
          );
          setProceso(encontrado ?? null);
        }
      })
      .finally(() => setCargando(false));
  }, [cesantiaId, id]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Coins size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Desprendibles Cesantías e Intereses</h2>
            <p style={styles.subtitulo}>Ver desprendibles de cesantías e intereses</p>
          </div>
        </div>
        <div style={styles.perfilBox}>
          <div style={styles.avatar}><UserRound size={22} color="#A3A3A3" /></div>
          <div><p style={styles.perfilNombre}>{nombre}</p><p style={styles.perfilCargo}>{cargo}</p></div>
        </div>
      </div>

      {/* Info proceso */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Desprendibles Cesantías e Intereses de Cesantías</h3>
        <p style={styles.exitoMsg}>¡Cesantías e intereses liquidados exitosamente!</p>
        <div style={styles.infoGrid}>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Nombre Empresa:</span><span style={styles.infoValor}>{empresa?.nombreEmpresa ?? ''}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Nit:</span><span style={styles.infoValor}>{empresa?.empresaNit ?? ''}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Fecha de Generación de Reporte:</span><span style={styles.infoValor}>{new Date().toLocaleDateString('es-CO')}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Periodo:</span><span style={styles.infoValor}>{proceso?.anio ?? ''}</span></div>
          <div style={styles.infoFila}><span style={styles.infoLabel}>Estado:</span><span style={styles.infoValor}>{proceso?.estadoProcNomina ?? ''}</span></div>
        </div>
        <hr style={styles.divider} />
      </div>

      {/* Planilla resumen con mejoras visuales pero logoSrc de V1 */}
      <div style={styles.card}>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #E8E8E8', minHeight: '52px' }}>
          {logoSrc && (
            <img src={logoSrc} alt="Logo" style={{ position: 'absolute', left: 0, width: '52px', height: '52px', objectFit: 'contain' }} />
          )}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 2px 0' }}>{empresa?.nombreEmpresa ?? ''}</p>
            <p style={{ fontSize: '13px', color: '#272525', margin: '0 0 2px 0' }}>NIT: {empresa?.empresaNit ?? ''}</p>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#272525', margin: 0 }}>CESANTÍAS E INTERESES DE CESANTÍAS {proceso?.anio ?? ''}</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                <th style={styles.th}>No</th>
                <th style={styles.th}>CC</th>
                <th style={styles.th}>Nombre empleado</th>
                <th style={styles.th}>Días</th>
                <th style={styles.th}>Fecha inicio</th>
                <th style={styles.th}>Fecha fin</th>
                <th style={styles.th}>Salario Base</th>
                <th style={styles.th}>Base Aux. Transp.</th>
                <th style={styles.th}>Base Liquidación</th>
                <th style={styles.th}>Cesantías</th>
                <th style={styles.th}>Intereses Cesantías</th>
                <th style={styles.th}>Fondo de Cesantías</th>
                <th style={{ ...styles.th, minWidth: '120px' }}>Firma Empleado</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={13} style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
              ) : desprendibles.map((desp, i) => (
                <tr key={desp.empleadoId ?? i} style={i % 2 === 0 ? styles.trPar : styles.trImpar}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>{desp.documentoEmpleado}</td>
                  <td style={styles.td}>{nombreCompleto(desp)}</td>
                  <td style={styles.td}>{desp.diasLiquidados}</td>
                  <td style={styles.td}>{desp.fechaInicioCorte}</td>
                  <td style={styles.td}>{desp.fechaFinCorte}</td>
                  <td style={styles.td}>{fmt(desp.salarioBase)}</td>
                  <td style={styles.td}>{fmt(desp.auxTransporte)}</td>
                  <td style={styles.td}>{fmt(desp.baseLiquidacion)}</td>
                  <td style={styles.td}>{fmt(desp.valorPrestacion)}</td>
                  <td style={styles.td}>{fmt(desp.valorInteresesCesantias)}</td>
                  <td style={styles.td}>{desp.fondoCesantias ?? ''}</td>
                  <td style={{ ...styles.td, minWidth: '120px', height: '40px' }}></td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#E8F5EE' }}>
                <td colSpan={9} style={{ ...styles.td, fontWeight: '800', textAlign: 'right', color: '#0B662A' }}>TOTAL</td>
                <td style={{ ...styles.td, fontWeight: '800', color: '#0B662A' }}>{fmt(totalCesantias)}</td>
                <td style={{ ...styles.td, fontWeight: '800', color: '#0B662A' }}>{fmt(totalIntereses)}</td>
                <td style={styles.td} />
                <td style={styles.td} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprobantes individuales */}
      {desprendibles.map((desp) => (
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

            <div style={{ marginBottom: '10px' }}>
              <p style={{ ...styles.comprobanteLabel, fontWeight: '700', margin: '0 0 4px 0' }}>Datos del trabajador:</p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '2px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '80px' }}>Nombre:</span>
                <span style={styles.comprobanteValor}>{nombreCompleto(desp)}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '80px' }}>Cédula:</span>
                <span style={styles.comprobanteValor}>{desp.documentoEmpleado}</span>
              </div>
            </div>

            <p style={{ fontSize: '11px', fontWeight: '700', textAlign: 'center', margin: '12px auto', color: '#272525' }}>
              Liquidaciones de cesantías e intereses de cesantías {proceso?.anio ?? ''}
            </p>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '2px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '160px' }}>Fecha inicial:</span>
                <span style={styles.comprobanteValor}>{desp.fechaInicioCorte}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '2px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '160px' }}>Fecha final:</span>
                <span style={styles.comprobanteValor}>{desp.fechaFinCorte}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '160px' }}>Días trabajados:</span>
                <span style={styles.comprobanteValor}>{desp.diasLiquidados}</span>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '200px' }}>Salario Base:</span>
                <span style={styles.comprobanteValor}>{fmt(desp.salarioBase)}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '200px' }}>Base Aux. de transporte:</span>
                <span style={styles.comprobanteValor}>{fmt(desp.auxTransporte)}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '200px' }}>Cesantías (informativo):</span>
                <span style={styles.comprobanteValor}>{fmt(desp.valorPrestacion)}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '200px' }}>Intereses de cesantías:</span>
                <span style={styles.comprobanteValor}>{fmt(desp.valorInteresesCesantias)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                <span style={{ ...styles.comprobanteLabel, fontWeight: '700', minWidth: '200px' }}>Valor a pagar intereses de cesantías:</span>
                <span style={{ ...styles.comprobanteValor, fontWeight: '700' }}>{fmt(desp.valorInteresesCesantias)}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ ...styles.comprobanteLabel, fontWeight: '700', minWidth: '200px' }}>Valor en letras:</span>
                <span style={{ ...styles.comprobanteValor, textTransform: 'uppercase' }}>
                  {(() => {
                    try { return numLetras(Math.round(desp.valorInteresesCesantias ?? 0)) + ' PESOS M/CTE'; }
                    catch { return ''; }
                  })()}
                </span>
              </div>
            </div>

            <p style={{ ...styles.comprobanteLabel, marginBottom: '20px' }}>Recibí conforme:</p>
            <div style={{ borderTop: '1px solid #272525', width: '220px', paddingTop: '6px', marginTop: '8px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#272525', margin: '0 0 2px 0' }}>{nombreCompleto(desp)}</p>
              <p style={{ fontSize: '11px', color: '#272525', margin: 0 }}>Fecha de recibido:</p>
            </div>
          </div>
        </div>
      ))}

      {/* Botones inferiores */}

      <BarraAcciones justificar="space-between">
        <button
          style={btnSecundario}
          onClick={() => navigate(`/empresas/${id}/cesantias`)} 
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
  container:        { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' },
  header:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:           { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:        { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:        { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:           { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  perfilNombre:     { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:      { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  card:             { backgroundColor: '#fff', borderRadius: '16px', padding: '28px 32px' },
  cardTitulo:       { fontSize: '16px', fontWeight: '800', color: '#272525', margin: '0 0 12px 0' },
  exitoMsg:         { fontSize: '14px', fontWeight: '700', color: '#0B662A', margin: '0 0 16px 0' },
  infoGrid:         { display: 'flex', flexDirection: 'column', gap: '10px' },
  infoFila:         { display: 'flex', gap: '8px', alignItems: 'baseline' },
  infoLabel:        { fontSize: '13px', fontWeight: '700', color: '#272525', whiteSpace: 'nowrap' },
  infoValor:        { fontSize: '13px', color: '#272525' },
  divider:          { border: 'none', borderTop: '1px solid #E8E8E8', margin: '24px 0 0 0' },
  tabla:            { width: '100%', borderCollapse: 'collapse', minWidth: '1000px', fontSize: '11px' },
  th:               { backgroundColor: '#F0F0F0', fontWeight: '700', color: '#272525', padding: '7px 8px', textAlign: 'center', border: '1px solid #E0E0E0', whiteSpace: 'nowrap', fontSize: '11px' },
  td:               { padding: '6px 8px', textAlign: 'center', color: '#272525', border: '1px solid #E0E0E0', whiteSpace: 'nowrap', fontSize: '11px' },
  trPar:            { backgroundColor: '#fff' },
  trImpar:          { backgroundColor: '#FAFAFA' },
  comprobante:      { border: '1px solid #D0D0D0', borderRadius: '4px', padding: '24px 28px', width: '100%', maxWidth: '680px', boxSizing: 'border-box', backgroundColor: '#fff', marginBottom: '8px' },
  comprobanteLabel: { fontSize: '11px', color: '#272525', margin: 0 },
  comprobanteValor: { fontSize: '11px', color: '#272525', margin: 0 },
};