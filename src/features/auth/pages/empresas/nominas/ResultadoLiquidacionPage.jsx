import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import payrollService from '../../../../../services/payrollService';
import axiosInstance from '../../../../../api/axiosInstance'; 
import { FileText, ChevronLeft, UserRound } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useImagenAutenticada } from '../../..//hooks/useImagenAutenticada';
import { exportarExcel } from '../../../../../utils/exportExcel';

function BarraAcciones({ children, justificar = 'center' }) {
  return (
    <div style={{
      position: 'sticky',
      bottom: '-24px',
      display: 'flex',
      justifyContent: justificar,
      gap: '16px',
      padding: '60px 32px 24px 32px',
      background: 'linear-gradient(to top, #F0F2F5 30%, transparent 100%)',
      zIndex: 100,
      flexWrap: 'wrap',
      marginTop: '-40px',
      boxSizing: 'border-box',
      pointerEvents: 'none',
    }}>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: justificar === 'space-between' ? '100%' : 'auto', justifyContent: justificar, pointerEvents: 'all' }}>
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

const fmt = (v) =>
  v != null
    ? '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    : '';

const NOMBRE_MES = [
  '','Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const CONCEPTOS_CON_DESCRIPCION = [
    'Otro concepto a devenir salarial',
    'Otro concepto a devenir no salarial',
    'Otros conceptos a deducir salariales',
    'Otros conceptos a deducir no salariales',
    'Comisiones',                                       
    'Bonificaciones ocasionales o por mera liberalidad', 
    'Beneficios o extralegales no salariales',
];

const nombreCompleto = (desp) =>
  `${desp.apellidosEmpleado ?? ''} ${desp.nombresEmpleado ?? ''}`.trim();

const NOMBRES_NO_SALARIALES_DEVENGO = [
  'Beneficios o extralegales no salariales',
  'Otro concepto a devenir no salarial',
  'Otros pagos que no constituyen salario permanente',
  'Bonificaciones ocasionales o por mera liberalidad',
];

const CONCEPTOS_EXCLUIDOS = [
  'Pensión empleador',
  'Aporte salud empleador',
  'ARL empleador',
  'Caja de compensación empleador',
  'SENA empleador',
  'ICBF empleador',
  'Prima de servicios',
  'Cesantías',
  'Intereses sobre las cesantías',
];

const calcularResumenFila = (desp) => {
  const conceptos = desp.conceptos ?? [];

  const auxTransporte = conceptos.find(c => c.nombreConcepto === 'Auxilio de transporte');

  const devengadoSalarial = conceptos
    .filter(c => c.categoria === 'DEVENGO')
    .filter(c => c.nombreConcepto !== 'Auxilio de transporte')
    .filter(c => !NOMBRES_NO_SALARIALES_DEVENGO.includes(c.nombreConcepto))
    .reduce((s, c) => s + (Number(c.valorResultado) || 0), 0);

  const devengadoNoSalarial = conceptos
    .filter(c => c.categoria === 'DEVENGO')
    .filter(c => NOMBRES_NO_SALARIALES_DEVENGO.includes(c.nombreConcepto))
    .reduce((s, c) => s + (Number(c.valorResultado) || 0), 0);

  const totalDeducciones = conceptos
    .filter(c => c.categoria === 'DEDUCCION')
    .reduce((s, c) => s + (Number(c.valorResultado) || 0), 0);

  return {
    auxTransporteValor: auxTransporte?.valorResultado ?? null,
    devengadoSalarial,
    devengadoNoSalarial,
    totalDeducciones,
  };
};

const normalizar = (s) =>
  (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const esConceptoBase          = (n) => n === 'Salario días trabajados' || n === 'Auxilio de transporte';
const esConceptoHorasExtra    = (n) => { const x = normalizar(n); return x.includes('hora extra') || x.includes('recargo'); };
const esConceptoVacaciones    = (n) => normalizar(n).includes('vacacion');
const esConceptoLicenciaGeneral = (n) => normalizar(n).includes('licencia'); // incluye remuneradas y no remuneradas
const esConceptoLicenciaNoRem = (n) => n === 'Licencias no remuneradas';
const esConceptoLicenciaRem   = (n) => esConceptoLicenciaGeneral(n) && !esConceptoLicenciaNoRem(n);
const esConceptoIncapacidad   = (n) => normalizar(n).includes('incapacidad');
const esConceptoRetefuente    = (n) => normalizar(n).includes('retencion en la fuente');
const esConceptoSaludPension  = (n) => { const x = normalizar(n); return x.includes('salud') || x.includes('pension'); };

const obtenerEtiquetaConcepto = (c) =>
  CONCEPTOS_CON_DESCRIPCION.includes(c.nombreConcepto) && c.observacion ? c.observacion : c.nombreConcepto;

const calcularNovedades = (desp) => {
  const conceptos = (desp.conceptos ?? []).filter(c => !CONCEPTOS_EXCLUIDOS.includes(c.nombreConcepto));

  const sumaCantidad = (arr) => arr.reduce((s, c) => s + (Number(c.cantidad) || 0), 0);
  const sumaValor     = (arr) => arr.reduce((s, c) => s + (Number(c.valorResultado) || 0), 0);

  const diasLaboradosConcepto = conceptos.find(c => c.nombreConcepto === 'Salario días trabajados');
  const diasLaborados = diasLaboradosConcepto?.cantidad ?? '-';

  const horas               = conceptos.filter(c => esConceptoHorasExtra(c.nombreConcepto));
  const vacaciones           = conceptos.filter(c => esConceptoVacaciones(c.nombreConcepto));
  const licenciasRem         = conceptos.filter(c => esConceptoLicenciaRem(c.nombreConcepto));
  const licenciasNoRem       = conceptos.filter(c => esConceptoLicenciaNoRem(c.nombreConcepto));
  const incapacidades        = conceptos.filter(c => esConceptoIncapacidad(c.nombreConcepto));
  const retefuente           = conceptos.filter(c => esConceptoRetefuente(c.nombreConcepto));

  const otros = conceptos.filter(c =>
    !esConceptoBase(c.nombreConcepto) &&
    !esConceptoHorasExtra(c.nombreConcepto) &&
    !esConceptoVacaciones(c.nombreConcepto) &&
    !esConceptoLicenciaGeneral(c.nombreConcepto) &&
    !esConceptoIncapacidad(c.nombreConcepto) &&
    !esConceptoRetefuente(c.nombreConcepto) &&
    !esConceptoSaludPension(c.nombreConcepto)
  );

  return {
    diasLaborados,
    horasValor: sumaValor(horas),
    horasCantidad: sumaCantidad(horas),
    hayHoras: horas.length > 0,
    vacacionesDias: sumaCantidad(vacaciones),
    vacacionesValor: sumaValor(vacaciones),
    hayVacaciones: vacaciones.length > 0,
    licenciasDias: sumaCantidad(licenciasRem),
    licenciasValor: sumaValor(licenciasRem),
    hayLicencias: licenciasRem.length > 0,
    licenciasNoRemDias: sumaCantidad(licenciasNoRem),
    licenciasNoRemValor: sumaValor(licenciasNoRem),
    hayLicenciasNoRem: licenciasNoRem.length > 0,
    incapacidadesDias: sumaCantidad(incapacidades),
    incapacidadesValor: sumaValor(incapacidades),
    hayIncapacidades: incapacidades.length > 0,
    retefuenteValor: sumaValor(retefuente),
    hayRetefuente: retefuente.length > 0,
    otros,
  };
};

const obtenerConceptosOtrosUnicos = (desprendibles) => {
  const etiquetas = new Set();
  desprendibles.forEach(d => {
    calcularNovedades(d).otros.forEach(c => etiquetas.add(obtenerEtiquetaConcepto(c)));
  });
  return Array.from(etiquetas).sort((a, b) => a.localeCompare(b, 'es'));
};

const hayDevengoNoSalarial = (desprendibles) =>
  desprendibles.some(d => calcularResumenFila(d).devengadoNoSalarial > 0);


export default function ResultadoLiquidacionPage() {
  const navigate         = useNavigate();
  const { id, nominaId } = useParams();
  const { usuario }      = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [proceso,       setProceso]       = useState(null);
  const [empresa,       setEmpresa]       = useState(null);
  const [desprendibles, setDesprendibles] = useState([]);
  const [cargando,      setCargando]      = useState(false);
  const [hoverDescargar,setHoverDescargar] = useState(false);
  const [descargando,   setDescargando]   = useState(false);

  const logoSrc = useImagenAutenticada(empresa?.logoEmpresaUrl);

  useEffect(() => {
    if (!nominaId || !id) return;
    setCargando(true);

    Promise.all([
      payrollService.getDesprendiblesNomina(nominaId),
      payrollService.getProcesos(id),
      axiosInstance.get(`/api/master/empresas/${id}`),
    ])
      .then(([{ data: desps }, { data: procesos }, { data: emp }]) => {
        const ordenados = [...desps].sort((a, b) =>
          (a.apellidosEmpleado ?? '').localeCompare(b.apellidosEmpleado ?? '', 'es')
        );
        setDesprendibles(ordenados);
        setEmpresa(emp);
        const encontrado = procesos.find(
          p => String(p.procesoLiquiId) === String(nominaId)
        );
        setProceso(encontrado ?? null);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [nominaId, id]);

  const calcularTotales = (desp) => ({
    totalDevengos:    desp.totalDevengado   ?? 0,
    totalDeducciones: desp.totalDeducciones ?? 0,
    neto:             desp.netoAPagar       ?? 0,
  });

  const mostrarColumnaNoSalarial = hayDevengoNoSalarial(desprendibles);

  const handleDescargar = async () => {
    setDescargando(true);

    let logoBase64 = null;
    if (empresa?.logoEmpresaUrl) {
      try {
        const logoUrl = `${import.meta.env.VITE_GATEWAY_URL}/api/master/files/logos/${empresa.logoEmpresaUrl}`;
        const token = useAuthStore.getState().accessToken;
        const response = await fetch(logoUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const blob = await response.blob();
 
        logoBase64 = await new Promise((resolve) => {
          const img = new Image();
          const url = URL.createObjectURL(blob);
          img.onload = () => {
            const canvas = document.createElement('canvas');
            // Limitar tamaño máximo a 100x100px
            const maxSize = 100;
            const ratio = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Comprimir al 60% de calidad en JPEG
            resolve(canvas.toDataURL('image/jpeg', 0.6));
            URL.revokeObjectURL(url);
          };
          img.src = url;
        });
      } catch {
        logoBase64 = null;
      }
    }

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const mitad = pageHeight / 2;

    const renderDesprendible = (desp, yInicio, mitad, pageHeight, conceptosFiltrados) => {
      let y = yInicio + 6;

      if (logoBase64) {
        doc.addImage(logoBase64, 'JPEG', 14, y, 20, 20);
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(empresa?.nombreEmpresa ?? '', 105, y + 6, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(`NIT. ${empresa?.empresaNit ?? ''}`, 105, y + 11, { align: 'center' });
      y += 24;

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('DESPRENDIBLE PAGO DE NÓMINA', 105, y, { align: 'center' });
      y += 7;

      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 14, y);
      y += 5;
      const fechaFinMostrar = (proceso?.fechaFinPeriodo ?? '').replace(/-31$/, '-30');
      doc.text(`Periodo: ${desp.fechaInicioCorteEmpleado ?? proceso?.fechaInicioPeriodo ?? ''} - ${fechaFinMostrar}`, 14, y); y += 5;
      doc.text(`Apellidos y Nombres: ${nombreCompleto(desp)}`, 14, y); y += 5;
      doc.text(`Doc. Identidad: ${desp.documentoEmpleado}`, 14, y); y += 5;
      doc.text(`Mes: ${NOMBRE_MES[proceso?.periodo] ?? ''}`, 14, y); y += 5;
      doc.text(`Salario base  ${fmt(desp.salarioBasico)}`, 196, y - 15, { align: 'right' });

      const { totalDevengos, totalDeducciones, neto } = calcularTotales(desp);

      
      const body = conceptosFiltrados.map(c => [
          CONCEPTOS_CON_DESCRIPCION.includes(c.nombreConcepto) && c.observacion
              ? c.observacion
              : c.nombreConcepto,
          c.cantidad != null
              ? `${Number.isInteger(Number(c.cantidad))
                  ? Math.floor(c.cantidad)
                  : c.cantidad} ${c.unidadCantidad ?? ''}`.trim()
              : '',
          c.categoria === 'DEVENGO' && c.valorResultado != null ? fmt(c.valorResultado) : '',
          c.categoria === 'DEDUCCION' && c.valorResultado != null ? fmt(c.valorResultado) : '',
        ]);

      body.push(
        [{ content: 'SUBTOTAL', styles: { fontStyle: 'bold' } }, '', fmt(totalDevengos), fmt(totalDeducciones)],
        [{ content: 'NETO A PAGAR', styles: { fontStyle: 'bold', textColor: [11, 102, 42] } }, '', fmt(neto), ''],
      );

      autoTable(doc, {
        startY: y,
        head: [['CONCEPTO', 'CANTIDAD', 'DEVENGOS', 'DEDUCCIONES']],
        body,
        styles: { fontSize: 7, lineColor: [224, 224, 224], lineWidth: 0.1 },
        headStyles: {
          fillColor: [11, 102, 42],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: {
          0: { halign: 'left' },
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'right' },
        },
        margin: { left: 14, right: 14 },
        didParseCell: (data) => {
          const lastRow = data.table.body.length - 1;
          const secondLast = data.table.body.length - 2;
          if (data.row.index === secondLast) {
            data.cell.styles.fillColor = [240, 240, 240];
            data.cell.styles.fontStyle = 'bold';
          }
          if (data.row.index === lastRow) {
            data.cell.styles.fillColor = [232, 245, 238];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [11, 102, 42];
          }
        },
      });

      if (desp.advertenciaNoSalarial) {
          const finalY = doc.lastAutoTable.finalY + 4;
    
          // Fondo amarillo
          doc.setFillColor(254, 243, 199);
          doc.setDrawColor(217, 119, 6);
          doc.setLineWidth(0.3);
          doc.roundedRect(14, finalY, 182, 10, 2, 2, 'FD');
    
          doc.setFontSize(7);
          doc.setTextColor(146, 64, 14);
          doc.text(
              ` ${desp.advertenciaNoSalarial}`,
              18,
              finalY + 6,
              { maxWidth: 174 }
          );
          doc.setTextColor(0, 0, 0);
          doc.setDrawColor(0, 0, 0);
      }
      
      const firmaY = doc.lastAutoTable.finalY + (desp.advertenciaNoSalarial ? 28 : 18);
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.3);
      doc.line(116, firmaY, 196, firmaY);
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text('Firma del trabajador', 196, firmaY + 4, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(0, 0, 0);
    
      const limiteInferior = yInicio === 0 ? mitad - 12 : pageHeight - 8;
      doc.setTextColor(163, 163, 163);
      doc.setTextColor(0, 0, 0);
    };

    let y = 14;
    if (logoBase64) doc.addImage(logoBase64, 'JPEG', 14, y, 20, 20);
    doc.setFontSize(12); doc.setFont(undefined, 'bold');
    doc.text(empresa?.nombreEmpresa ?? '', 105, y + 6, { align: 'center' });
    doc.setFontSize(9); doc.setFont(undefined, 'normal');
    doc.text(`NIT: ${empresa?.empresaNit ?? ''}`, 105, y + 12, { align: 'center' });
    doc.setFontSize(10); doc.setFont(undefined, 'bold');
    doc.text(
      `PLANILLA NÓMINA — ${NOMBRE_MES[proceso?.periodo] ?? ''} ${proceso?.anio ?? ''}`,
      105, y + 20, { align: 'center' }
    );

    const totalNeto = desprendibles.reduce((s, d) => s + (d.netoAPagar ?? 0), 0);

    const columnasResumen = ['No', 'CC', 'APELLIDOS Y NOMBRES', 'SALARIO BÁSICO MENSUAL', 'TOTAL DEVENGADO'];
    if (mostrarColumnaNoSalarial) columnasResumen.push('TOTAL DEVENGADO NO SALARIAL');
    columnasResumen.push('AUX. TRANSPORTE', 'TOTAL DEDUCCIONES', 'NETO A PAGAR');

    autoTable(doc, {
      startY: y + 28,
      head: [columnasResumen],
      body: [
        ...desprendibles.map((desp, i) => {
          const r = calcularResumenFila(desp);
          const fila = [
            i + 1,
            desp.documentoEmpleado,
            nombreCompleto(desp),
            fmt(desp.salarioBasico),
            fmt(r.devengadoSalarial),
          ];
          if (mostrarColumnaNoSalarial) {
            fila.push(r.devengadoNoSalarial > 0 ? fmt(r.devengadoNoSalarial) : '-');
          }
          fila.push(
            r.auxTransporteValor ? fmt(r.auxTransporteValor) : '-',
            fmt(r.totalDeducciones),
            fmt(desp.netoAPagar),
          );
          return fila;
        }),
        [
          {
            content: 'TOTAL',
            colSpan: mostrarColumnaNoSalarial ? 7 : 6,
            styles: { halign: 'right', fontStyle: 'bold' }
          },
          { content: fmt(totalNeto), styles: { fontStyle: 'bold' } },
        ],
      ],
      styles: { fontSize: 6 },
      headStyles: {
        fillColor: [11, 102, 42],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 6,
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'left' },
      },
      margin: { left: 10, right: 10 },
      didParseCell: (data) => {
        const lastRow = data.table.body.length - 1;
        if (data.row.index === lastRow) {
          data.cell.styles.fillColor = [232, 245, 238];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [11, 102, 42];
        }
      },
    });

    doc.addPage();

    desprendibles.forEach((desp, idx) => {
      //doc.addPage();
      if (idx > 0) doc.addPage();

      const conceptosFiltrados = (desp.conceptos ?? [])
        .filter(c => !CONCEPTOS_EXCLUIDOS.includes(c.nombreConcepto))
        .filter(c => {
            const esConceptoOcultable = 
                c.nombreConcepto === 'Salario días trabajados' ||
                c.nombreConcepto === 'Auxilio de transporte';
            if (esConceptoOcultable && (!c.valorResultado || Number(c.valorResultado) === 0)) {
                return false;
            }
            return true;
        })

      renderDesprendible(desp, 0, mitad, pageHeight, conceptosFiltrados);
  
      doc.setDrawColor(180, 180, 180);
      doc.setLineDashPattern([3, 3], 0);
      doc.line(14, mitad, 196, mitad);
      doc.setLineDashPattern([], 0);

      renderDesprendible(desp, mitad, mitad, pageHeight, conceptosFiltrados);
    });

    const nombreArchivo = `${empresa?.nombreEmpresa ?? 'NOMINA'} ${NOMBRE_MES[proceso?.periodo] ?? ''} ${proceso?.anio ?? ''}`.trim();
    doc.save(`${nombreArchivo}.pdf`)
    setDescargando(false);
  };

  const hayHorasExtra       = desprendibles.some(d => calcularNovedades(d).hayHoras);
  const hayVacaciones       = desprendibles.some(d => calcularNovedades(d).hayVacaciones);
  const hayLicencias        = desprendibles.some(d => calcularNovedades(d).hayLicencias);
  const hayLicenciasNoRem   = desprendibles.some(d => calcularNovedades(d).hayLicenciasNoRem);
  const hayIncapacidades    = desprendibles.some(d => calcularNovedades(d).hayIncapacidades);
  const hayRetefuente       = desprendibles.some(d => calcularNovedades(d).hayRetefuente);
  const conceptosOtros      = obtenerConceptosOtrosUnicos(desprendibles);

  const EXCEL_HEADERS_NOMINA = [
    '#', 'CC', 'Apellidos y Nombres', 'Días laborados', 'Salario básico mensual', 'Total devengado',
    ...(mostrarColumnaNoSalarial ? ['Total devengado no salarial'] : []),
    ...(hayHorasExtra     ? ['Horas extra/recargos', '# Horas/recargos'] : []),
    ...(hayVacaciones     ? ['Días vacaciones', 'Valor vacaciones'] : []),
    ...(hayLicencias      ? ['Días licencias', 'Valor licencias'] : []),
    ...(hayLicenciasNoRem ? ['Días licencia no remunerada', 'Valor descontado licencia no remunerada'] : []),
    ...(hayIncapacidades  ? ['Días incapacidades', 'Valor incapacidades'] : []),
    'Aux. transporte', 'Total deducciones',
    ...(hayRetefuente ? ['Retención en la fuente'] : []),
    ...conceptosOtros,
    'Neto a pagar',
  ];

  const handleDescargarExcel = () => {
    const filas = desprendibles.map((desp, i) => {
      const r   = calcularResumenFila(desp);
      const nov = calcularNovedades(desp);

      const fila = [i + 1, desp.documentoEmpleado, nombreCompleto(desp), nov.diasLaborados, desp.salarioBasico ?? 0, r.devengadoSalarial ?? 0];
      if (mostrarColumnaNoSalarial) fila.push(r.devengadoNoSalarial ?? 0);
      if (hayHorasExtra)     fila.push(nov.horasValor, nov.horasCantidad);
      if (hayVacaciones)     fila.push(nov.vacacionesDias, nov.vacacionesValor);
      if (hayLicencias)      fila.push(nov.licenciasDias, nov.licenciasValor);
      if (hayLicenciasNoRem) fila.push(nov.licenciasNoRemDias, nov.licenciasNoRemValor);
      if (hayIncapacidades)  fila.push(nov.incapacidadesDias, nov.incapacidadesValor);
      fila.push(r.auxTransporteValor ?? 0, r.totalDeducciones ?? 0);
      if (hayRetefuente) fila.push(nov.retefuenteValor);

      conceptosOtros.forEach((nombreCol) => {
        const encontrado = nov.otros.find(c => obtenerEtiquetaConcepto(c) === nombreCol);
        fila.push(encontrado ? (encontrado.valorResultado ?? 0) : '-');
      });

      fila.push(desp.netoAPagar ?? 0);
      return fila;
    });

    const nombreArchivo = `${empresa?.nombreEmpresa ?? 'NOMINA'} ${NOMBRE_MES[proceso?.periodo] ?? ''} ${proceso?.anio ?? ''}`.trim();
    exportarExcel(EXCEL_HEADERS_NOMINA, filas, nombreArchivo, 'Nómina');
  };

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Desprendibles Nómina</h2>
            <p style={styles.subtitulo}>Resultado de liquidación</p>
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


      {/* Info proceso */}
      <div style={styles.card}>
        {cargando ? (
          <p style={{ color: '#A3A3A3' }}>Cargando información...</p>
        ) : (
          <>
            <p style={styles.exitoMsg}>¡Nómina liquidada exitosamente!</p>
            <div style={styles.infoGrid}>
              <div style={styles.infoFila}>
                <span style={styles.infoLabel}>Nombre Empresa:</span>
                <span style={styles.infoValor}>{empresa?.nombreEmpresa ?? ''}</span>
              </div>
              <div style={styles.infoFila}>
                <span style={styles.infoLabel}>Nit:</span>
                <span style={styles.infoValor}>{empresa?.empresaNit ?? ''}</span>
              </div>
              <div style={styles.infoFila}>
                <span style={styles.infoLabel}>Fecha de Generación:</span>
                <span style={styles.infoValor}>
                  {new Date().toLocaleDateString('es-CO')}
                </span>
              </div>
              <div style={styles.infoFila}>
                <span style={styles.infoLabel}>Periodo:</span>
                <span style={styles.infoValor}>
                  {proceso?.fechaInicioPeriodo} - {proceso?.fechaFinPeriodo?.replace(/-31$/, '-30')}
                </span>
              </div>
              <div style={styles.infoFila}>
                <span style={styles.infoLabel}>Estado:</span>
                <span style={styles.infoValor}>
                  {proceso?.estadoProcNomina ?? ''}
                </span>
              </div>
            </div>
            <hr style={styles.divider} />
          </>
        )}
      </div>

      {/* Planilla resumen nómina */}
      {!cargando && desprendibles.length > 0 && (
        <div style={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 4px 0' }}>
              {empresa?.nombreEmpresa ?? ''}
            </p>
            <p style={{ fontSize: '13px', color: '#272525', margin: '0 0 2px 0' }}>
              NIT: {empresa?.empresaNit ?? ''}
            </p>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#272525', margin: 0 }}>
              PLANILLA NÓMINA — {NOMBRE_MES[proceso?.periodo] ?? ''} {proceso?.anio ?? ''}
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ ...styles.tabla, fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={styles.th}>No</th>
                  <th style={styles.th}>CC</th>
                  <th style={{ ...styles.th, textAlign: 'left' }}>Apellidos y Nombres</th>
                  <th style={styles.th}>Salario básico mensual</th>
                  <th style={styles.th}>Total devengado</th>
                  {mostrarColumnaNoSalarial && <th style={styles.th}>Total devengado no salarial</th>}
                  <th style={styles.th}>Auxilio de transporte</th>
                  <th style={styles.th}>Total deducciones</th>
                  <th style={styles.th}>Neto a pagar</th>
                </tr>
              </thead>
              <tbody>
                {desprendibles.map((desp, i) => {
                  const r = calcularResumenFila(desp);
                  return (
                    <tr key={desp.cabecNominaId} style={i % 2 === 0 ? styles.trPar : styles.trImpar}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={styles.td}>{desp.documentoEmpleado}</td>
                      <td style={{ ...styles.td, textAlign: 'left' }}>{nombreCompleto(desp)}</td>
                      <td style={styles.td}>{fmt(desp.salarioBasico)}</td>
                      <td style={styles.td}>{fmt(r.devengadoSalarial)}</td>
                      {mostrarColumnaNoSalarial && (
                        <td style={styles.td}>{r.devengadoNoSalarial > 0 ? fmt(r.devengadoNoSalarial) : '-'}</td>
                      )}
                      <td style={styles.td}>{r.auxTransporteValor ? fmt(r.auxTransporteValor) : '-'}</td>
                      <td style={styles.td}>{fmt(r.totalDeducciones)}</td>
                      <td style={{ ...styles.td, fontWeight: '700', color: '#0B662A' }}>{fmt(desp.netoAPagar)}</td>
                    </tr>
                  );
                })}
                <tr style={{ backgroundColor: '#E8F5EE' }}>
                  <td colSpan={mostrarColumnaNoSalarial ? 7 : 6} style={{ ...styles.td, fontWeight: '800', textAlign: 'right', color: '#0B662A' }}>
                    TOTAL
                  </td>
                  <td style={{ ...styles.td, fontWeight: '800', color: '#0B662A' }}>
                    {fmt(desprendibles.reduce((s, d) => s + (d.netoAPagar ?? 0), 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Desprendibles por empleado */}
      {cargando ? (
        <p style={{ textAlign: 'center', color: '#A3A3A3', marginTop: '20px' }}>
          Cargando desprendibles...
        </p>
      ) : desprendibles.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#A3A3A3', marginTop: '20px' }}>
          No hay desprendibles disponibles para este proceso.
        </p>
      ) : (
        desprendibles.map((desp) => {
          const { totalDevengos, totalDeducciones, neto } = calcularTotales(desp);
          return (
            <div key={desp.cabecNominaId} style={styles.desprendibleCard}>

              {/* Encabezado desprendible */}
              <div style={styles.desprendibleHeader}>
                <div style={styles.logoBox}>
                  {empresa?.logoEmpresaUrl
                    ? (
                      <img
                        src={logoSrc}
                        alt="logo"
                        style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '0' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={styles.logoPlaceholder}>
                        <span style={{ fontSize: '10px', color: '#A3A3A3' }}>LOGO</span>
                      </div>
                    )
                  }
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={styles.empresaNombre}>{empresa?.nombreEmpresa ?? ''}</p>
                  <p style={styles.empresaNit}>NIT. {empresa?.empresaNit ?? ''}</p>
                </div>
                <div style={{ width: '60px' }} />
              </div>

              <p style={styles.desprendibleTitulo}>DESPRENDIBLE PAGO DE NÓMINA</p>

              {/* Info empleado */}
              <div style={styles.empInfoGrid}>
                <div>
                  <p style={styles.empInfoFila}>
                    <strong>Fecha de generación</strong> &nbsp;
                    {new Date().toLocaleDateString('es-CO')}
                  </p>
                  <p style={styles.empInfoFila}>
                    <strong>Periodo</strong> &nbsp;
                    {desp.fechaInicioCorteEmpleado ?? proceso?.fechaInicioPeriodo} - {proceso?.fechaFinPeriodo?.replace(/-31$/, '-30')}
                  </p>
                  <p style={styles.empInfoFila}>
                    <strong>Apellidos y Nombres</strong> &nbsp;
                    {nombreCompleto(desp)}
                  </p>
                  <p style={styles.empInfoFila}>
                    <strong>Doc. Identidad</strong> &nbsp; {desp.documentoEmpleado}
                  </p>
                  <p style={styles.empInfoFila}>
                    <strong>Mes</strong> &nbsp; {NOMBRE_MES[proceso?.periodo] ?? ''}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={styles.empInfoFila}>
                    <strong>Salario base</strong> &nbsp; {fmt(desp.salarioBasico)}
                  </p>
                  <p style={{
                    ...styles.empInfoFila,
                    marginTop: '32px',
                    color: '#A3A3A3',
                    fontSize: '11px',
                  }}>
                  </p>
                </div>
              </div>

              {/* Tabla conceptos */}
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.tabla}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, textAlign: 'left' }}>CONCEPTO</th>
                      <th style={styles.th}>CANTIDAD</th>
                      <th style={styles.th}>DEVENGOS</th>
                      <th style={styles.th}>DEDUCCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(desp.conceptos ?? [])
                      .filter(c => !CONCEPTOS_EXCLUIDOS.includes(c.nombreConcepto))
                      .filter(c => {
                          if (c.nombreConcepto === 'Licencias no remuneradas') {
                              console.log('LNR concepto:', c);
                          }
                          const esConceptoOcultable = 
                              c.nombreConcepto === 'Salario días trabajados' ||
                              c.nombreConcepto === 'Auxilio de transporte';
                          if (esConceptoOcultable && (!c.valorResultado || Number(c.valorResultado) === 0)) {
                              return false;
                          }
                          return true;
                      })
                      .map((c, i) => (
                      <tr key={i} style={i % 2 === 0 ? styles.trPar : styles.trImpar}>
                        <td style={{ ...styles.td, textAlign: 'left' }}>
                            {CONCEPTOS_CON_DESCRIPCION.includes(c.nombreConcepto) && c.observacion
                                ? c.observacion
                                : c.nombreConcepto}
                        </td>
                        <td style={styles.td}>
                            {c.cantidad != null
                                ? `${Number.isInteger(Number(c.cantidad))
                                    ? Math.floor(c.cantidad)
                                    : c.cantidad} ${c.unidadCantidad ?? ''}`.trim()
                                : ''}
                        </td>
                        <td style={styles.td}>
                          {c.categoria === 'DEVENGO' && c.valorResultado != null
                            ? fmt(c.valorResultado) : ''}
                        </td>
                        <td style={styles.td}>
                          {c.categoria === 'DEDUCCION' && c.valorResultado != null
                            ? fmt(c.valorResultado) : ''}
                        </td>
                      </tr>
                    ))}

                    {/* Subtotal */}
                    <tr style={{ backgroundColor: '#F0F0F0' }}>
                      <td style={{ ...styles.td, fontWeight: '700', textAlign: 'left' }}>
                        SUBTOTAL
                      </td>
                      <td style={styles.td} />
                      <td style={{ ...styles.td, fontWeight: '700' }}>
                        {fmt(totalDevengos)}
                      </td>
                      <td style={{ ...styles.td, fontWeight: '700' }}>
                        {fmt(totalDeducciones)}
                      </td>
                    </tr>

                    {/* Neto */}
                    <tr style={{ backgroundColor: '#E8F5EE' }}>
                      <td style={{
                        ...styles.td,
                        fontWeight: '800',
                        color: '#0B662A',
                        textAlign: 'left',
                      }}>
                        NETO A PAGAR
                      </td>
                      <td style={styles.td} />
                      <td style={{ ...styles.td, fontWeight: '800', color: '#0B662A' }}>
                        {fmt(neto)}
                      </td>
                      <td style={styles.td} />
                    </tr>
                  </tbody>
                </table>
              </div>
              {desp.advertenciaNoSalarial && (
                <div style={{
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #D97706',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginTop: '12px',
                  fontSize: '12px',
                  color: '#92400E',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                }}>
                  <span>⚠️</span>
                  <span>{desp.advertenciaNoSalarial}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #272525', width: '180px', marginBottom: '4px' }} />
                  <p style={{ fontSize: '11px', color: '#A3A3A3', margin: 0 }}>Firma del trabajador</p>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Botones inferiores */}
      
      <BarraAcciones justificar="space-between">
        <button style={btnSecundario} onClick={() => navigate(`/empresas/${id}/nominas`)}>
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


      {/* Modal descarga */}
      {descargando && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 999,
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px',
            padding: '40px 48px', display: 'flex',
            flexDirection: 'column', alignItems: 'center',
            gap: '16px', maxWidth: '320px', textAlign: 'center',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              backgroundColor: '#E8F5EE', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={28} color="#0B662A" />
            </div>
            <p style={{ fontSize: '16px', fontWeight: '800', color: '#272525', margin: 0 }}>
              Descarga en curso
            </p>
            <p style={{ fontSize: '13px', color: '#A3A3A3', margin: 0 }}>
              La descarga de los desprendibles tomará unos segundos.
            </p>
          </div>
        </div>
      )}

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
  volverBtn:    { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0, width: 'fit-content' },
  btnDescargarSticky: { color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  card:               { backgroundColor: '#fff', borderRadius: '16px', padding: '28px 32px' },
  exitoMsg:           { fontSize: '14px', fontWeight: '700', color: '#0B662A', margin: '0 0 16px 0' },
  infoGrid:           { display: 'flex', flexDirection: 'column', gap: '10px' },
  infoFila:           { display: 'flex', gap: '8px', alignItems: 'baseline' },
  infoLabel:          { fontSize: '13px', fontWeight: '700', color: '#272525', whiteSpace: 'nowrap' },
  infoValor:          { fontSize: '13px', color: '#272525' },
  divider:            { border: 'none', borderTop: '1px solid #E8E8E8', margin: '24px 0 0 0' },
  desprendibleCard:   { backgroundColor: '#fff', borderRadius: '16px', padding: '28px 32px', border: '1px solid #E8E8E8' },
  desprendibleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  logoBox: { width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0', overflow: 'hidden' },
  logoPlaceholder: { width: '60px', height: '60px', border: '1px dashed #D0D0D0', borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  empresaNombre:      { fontSize: '16px', fontWeight: '800', color: '#272525', margin: 0 },
  empresaNit:         { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  desprendibleTitulo: { fontSize: '13px', fontWeight: '800', color: '#272525', textAlign: 'center', margin: '0 0 16px 0', letterSpacing: '0.5px' },
  empInfoGrid:        { display: 'flex', justifyContent: 'space-between', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' },
  empInfoFila:        { fontSize: '12px', color: '#272525', margin: '0 0 4px 0' },
  tabla:              { width: '100%', borderCollapse: 'collapse', minWidth: '500px', fontSize: '12px' },
  th:                 { backgroundColor: '#F0F0F0', fontWeight: '700', color: '#272525', padding: '8px 12px', textAlign: 'center', border: '1px solid #E0E0E0' },
  td:                 { padding: '7px 12px', textAlign: 'center', color: '#272525', border: '1px solid #E0E0E0' },
  trPar:              { backgroundColor: '#fff' },
  trImpar:            { backgroundColor: '#FAFAFA' },
};
