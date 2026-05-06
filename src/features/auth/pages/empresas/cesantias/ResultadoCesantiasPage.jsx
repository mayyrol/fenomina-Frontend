import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { Coins, UserRound } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import payrollService from '../../../../../services/payrollService';
import masterAxios from '../../../../../api/masterAxiosInstance';

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
  if (n >= 1000) { r += (Math.floor(n/1000) === 1 ? 'MIL' : numLetras(Math.floor(n/1000)) + ' MIL') + ' '; n %= 1000; }
  if (n >= 100)  { r += (n === 100 ? 'CIEN' : centenas[Math.floor(n/100)]) + ' '; n %= 100; }
  if (n >= 20)   { r += decenas[Math.floor(n/10)] + (n%10 ? ' Y ' + unidades[n%10] : '') + ' '; }
  else if (n > 0){ r += unidades[n] + ' '; }
  return r.trim();
}

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

  const totalCesantias = desprendibles.reduce(
    (s, d) => s + (d.valorPrestacion ?? 0), 0
  );
  const totalIntereses = desprendibles.reduce(
    (s, d) => s + (d.valorInteresesCesantias ?? 0), 0
  );

  const handleDescargar = async () => {
    setDescargando(true);

    let logoBase64 = null;
    if (empresa?.logoEmpresaUrl) {
      try {
        const logoUrl = `${import.meta.env.VITE_MASTER_API_URL}/api/master/files/logos/${empresa.logoEmpresaUrl}`;
        const response = await fetch(logoUrl);
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
          img.src = url;
        });
      } catch {
        logoBase64 = null;
      }
    }

    const doc = new jsPDF('landscape');
    let y = 14;

    if (logoBase64) doc.addImage(logoBase64, 'JPEG', 14, y, 20, 20);
    doc.setFontSize(11); doc.setFont(undefined, 'bold');
    doc.text(empresa?.nombreEmpresa ?? '', 148, y + 4, { align: 'center' });
    doc.setFontSize(9); doc.setFont(undefined, 'normal');
    doc.text(`NIT: ${empresa?.empresaNit ?? ''}`, 148, y + 10, { align: 'center' });
    doc.text(`CESANTIAS E INTERESES DE LAS CESANTIAS ${proceso?.anio ?? ''}`, 148, y + 16, { align: 'center' });
    y += 26;

    autoTable(doc, {
      startY: y,
      head: [['No', 'CC', 'NOMBRES Y APELLIDOS', 'DÍAS', 'FECHA INICIO', 'FECHA FIN', 'SALARIO BASE', 'AUX TRANSPORTE', 'BASE LIQ.', 'CESANTÍAS', 'INTERESES', 'FONDO PENSIONES']],
      body: [
        ...desprendibles.map((desp, i) => [
          i + 1,
          desp.documentoEmpleado,
          `${desp.nombresEmpleado} ${desp.apellidosEmpleado}`,
          desp.diasLiquidados,
          desp.fechaInicioCorte,
          desp.fechaFinCorte,
          fmt(desp.salarioBase),
          fmt(desp.auxTransporte),
          fmt(desp.baseLiquidacion),
          fmt(desp.valorPrestacion),
          fmt(desp.valorInteresesCesantias),
          desp.fondoPension ?? '',
        ]),
        [{ content: 'TOTAL', colSpan: 9, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: fmt(totalCesantias), styles: { fontStyle: 'bold' } },
        { content: fmt(totalIntereses), styles: { fontStyle: 'bold' } },
        ''],
      ],
      styles: { fontSize: 6 },
      headStyles: { fillColor: [11, 102, 42], textColor: 255, fontStyle: 'bold', fontSize: 6 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Comprobantes individuales — original + copia por página
    const pageHeight = doc.internal.pageSize.getHeight();
    const mitad = pageHeight / 2;

    const renderComprobante = (desp, yInicio, mitadRef, pageHeightRef) => {
      let cy = yInicio + 8;

      const alturaComprobante = (yInicio === 0 ? mitadRef : pageHeightRef) - yInicio - 4;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(10, yInicio + 2, 190, alturaComprobante);

      doc.setFontSize(8); doc.setFont(undefined, 'normal');
      doc.text('Empleador:', 14, cy);
      doc.setFont(undefined, 'bold');
      doc.text(empresa?.nombreEmpresa ?? '', 55, cy); cy += 5;
      doc.setFont(undefined, 'normal');
      doc.text('NIT:', 14, cy);
      doc.text(empresa?.empresaNit ?? '', 55, cy); cy += 8;

      doc.setFont(undefined, 'bold');
      doc.text('Datos del trabajador:', 14, cy); cy += 5;
      doc.setFont(undefined, 'normal');
      doc.text('Nombre:', 14, cy);
      doc.text(`${desp.nombresEmpleado} ${desp.apellidosEmpleado}`, 55, cy); cy += 5;
      doc.text('Cédula:', 14, cy);
      doc.text(desp.documentoEmpleado, 55, cy); cy += 8;

      doc.setFont(undefined, 'bold');
      doc.text(`Liquidaciones de cesantías e intereses de cesantías ${proceso?.anio ?? ''}`, 105, cy, { align: 'center' });
      cy += 8;

      doc.setFont(undefined, 'normal');
      doc.text('Fecha inicial:', 14, cy);
      doc.text(desp.fechaInicioCorte ?? '', 70, cy); cy += 5;
      doc.text('Fecha final:', 14, cy);
      doc.text(desp.fechaFinCorte ?? '', 70, cy); cy += 5;
      doc.text('Días trabajados:', 14, cy);
      doc.text(String(desp.diasLiquidados ?? ''), 70, cy); cy += 8;

      doc.text('Salario Base:', 14, cy);
      doc.text(fmt(desp.salarioBase), 70, cy); cy += 5;
      doc.text('Auxilio de transporte:', 14, cy);
      doc.text(fmt(desp.auxTransporte), 70, cy); cy += 5;
      doc.setFont(undefined, 'bold');
      doc.text('Cesantías (informativo):', 14, cy);
      doc.text(fmt(desp.valorPrestacion), 70, cy); cy += 5;
      doc.text('Intereses de cesantías:', 14, cy);
      doc.text(fmt(desp.valorInteresesCesantias), 70, cy); cy += 8;

      doc.text('Valor a pagar intereses de cesantías:', 14, cy);
      doc.text(fmt(desp.valorInteresesCesantias), 70, cy); 
      const cyFirma = cy - 8;
      cy += 5;
      doc.setFont(undefined, 'normal');
      const letras = (() => {
        try { return numLetras(Math.round(desp.valorInteresesCesantias ?? 0)) + ' PESOS M/CTE'; }
        catch { return ''; }
      })();
      const split = doc.splitTextToSize(`En letras: ${letras}`, 160);
      doc.text(split, 14, cy); cy += split.length * 4 + 4;

      doc.text('_______________________', 130, cyFirma);
      doc.text('Firma del trabajador', 138, cyFirma + 5);
    };

    desprendibles.forEach((desp) => {
      doc.addPage('portrait');
      const phPortrait = doc.internal.pageSize.getHeight();
      const mitadPortrait = phPortrait / 2;
      renderComprobante(desp, 0, mitadPortrait, phPortrait);
      doc.setDrawColor(180, 180, 180);
      doc.setLineDashPattern([3, 3], 0);
      doc.line(14, mitadPortrait, 196, mitadPortrait);
      doc.setLineDashPattern([], 0);
      renderComprobante(desp, mitadPortrait, mitadPortrait, phPortrait);
    });

    doc.save(`cesantias_${proceso?.anio ?? ''}.pdf`);
    setDescargando(false);
  };

  useEffect(() => {
    if (!cesantiaId || !id) return;
    setCargando(true);

    Promise.all([
      payrollService.getDesprendiblesCesantias(cesantiaId),
      payrollService.getProcesosCesantias(id),
      masterAxios.get(`/api/master/empresas/${id}`),
    ])
      .then(([{ data: desps }, { data: procesos }, { data: emp }]) => {
        setDesprendibles(desps);
        setEmpresa(emp);
        const encontrado = procesos.find(
          p => String(p.procesoLiquiId) === String(cesantiaId)
        );
        setProceso(encontrado ?? null);
      })
      .catch(() => {})
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

      {/* Planilla resumen */}
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 4px 0' }}>
            {empresa?.nombreEmpresa ?? ''}
          </p>
          <p style={{ fontSize: '13px', color: '#272525', margin: '0 0 2px 0' }}>
            NIT: {empresa?.empresaNit ?? ''}
          </p>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#272525', margin: 0 }}>
            CESANTÍAS E INTERESES DE CESANTÍAS {proceso?.anio ?? ''}
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                <th style={styles.th}>No</th>
                <th style={styles.th}>CC</th>
                <th style={{ ...styles.th, textAlign: 'left' }}>Nombres y Apellidos</th>
                <th style={styles.th}>Días</th>
                <th style={styles.th}>Fecha inicio</th>
                <th style={styles.th}>Fecha fin</th>
                <th style={styles.th}>Salario Base</th>
                <th style={styles.th}>Aux. Transporte</th>
                <th style={styles.th}>Base Liquidación</th>
                <th style={styles.th}>Cesantías</th>
                <th style={styles.th}>Intereses Cesantías</th>
                <th style={styles.th}>Fondo Pensiones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '20px' }}>
                    Cargando...
                  </td>
                </tr>
              ) : desprendibles.map((desp, i) => (
                <tr key={desp.empleadoId ?? i} style={i % 2 === 0 ? styles.trPar : styles.trImpar}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>{desp.documentoEmpleado}</td>
                  <td style={{ ...styles.td, textAlign: 'left' }}>{desp.nombresEmpleado} {desp.apellidosEmpleado}</td>
                  <td style={styles.td}>{desp.diasLiquidados}</td>
                  <td style={styles.td}>{desp.fechaInicioCorte}</td>
                  <td style={styles.td}>{desp.fechaFinCorte}</td>
                  <td style={styles.td}>{fmt(desp.salarioBase)}</td>
                  <td style={styles.td}>{fmt(desp.auxTransporte)}</td>
                  <td style={styles.td}>{fmt(desp.baseLiquidacion)}</td>
                  <td style={styles.td}>{fmt(desp.valorPrestacion)}</td>
                  <td style={styles.td}>{fmt(desp.valorInteresesCesantias)}</td>
                  <td style={styles.td}>{desp.fondoPension ?? ''}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#E8F5EE' }}>
                <td colSpan={9} style={{ ...styles.td, fontWeight: '800', textAlign: 'right', color: '#0B662A' }}>TOTAL</td>
                <td style={{ ...styles.td, fontWeight: '800', color: '#0B662A' }}>{fmt(totalCesantias)}</td>
                <td style={{ ...styles.td, fontWeight: '800', color: '#0B662A' }}>{fmt(totalIntereses)}</td>
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

            {/* Logo */}
            {empresa?.logoEmpresaUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <img
                  src={`${import.meta.env.VITE_MASTER_API_URL}/api/master/files/logos/${empresa.logoEmpresaUrl}`}
                  alt="logo"
                  style={{ width: '60px', objectFit: 'contain', borderRadius: '0' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '2px' }}>
                <span style={{ ...styles.comprobanteLabel, fontWeight: '700', minWidth: '80px' }}>Empleador:</span>
                <span style={{ ...styles.comprobanteValor, fontWeight: '700' }}>{empresa?.nombreEmpresa ?? ''}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '80px' }}>NIT:</span>
                <span style={styles.comprobanteValor}>{empresa?.empresaNit ?? ''}</span>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <p style={{ ...styles.comprobanteLabel, fontWeight: '700', margin: '0 0 4px 0' }}>
                Datos del trabajador:
              </p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '2px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '80px' }}>Nombre:</span>
                <span style={styles.comprobanteValor}>{desp.nombresEmpleado} {desp.apellidosEmpleado}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '80px' }}>Cédula:</span>
                <span style={styles.comprobanteValor}>{desp.documentoEmpleado}</span>
              </div>
            </div>

            <p style={{ fontSize: '11px', fontWeight: '700', textAlign: 'center', margin: '12px auto', color: '#272525', width: '100%' }}>
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
                <span style={{ ...styles.comprobanteLabel, minWidth: '200px' }}>Auxilio de transporte:</span>
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ ...styles.comprobanteLabel, fontWeight: '700', minWidth: '200px' }}>
                  Valor a pagar intereses de cesantías:
                </span>
                <span style={{ ...styles.comprobanteValor, fontWeight: '700' }}>
                  {fmt(desp.valorInteresesCesantias)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ ...styles.comprobanteLabel, fontWeight: '700', minWidth: '200px' }}>
                Valor en letras:
              </span>
              <span style={{ ...styles.comprobanteValor, textTransform: 'uppercase' }}>
                {(() => {
                  try { return numLetras(Math.round(desp.valorInteresesCesantias ?? 0)) + ' PESOS M/CTE'; }
                  catch { return ''; }
                })()}
              </span>
            </div>

            <p style={{ ...styles.comprobanteLabel, marginBottom: '20px' }}>Recibí conforme:</p>
            <div style={{ borderTop: '1px solid #272525', width: '220px', paddingTop: '6px', marginTop: '8px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#272525', margin: '0 0 2px 0' }}>
                {desp.nombresEmpleado} {desp.apellidosEmpleado}
              </p>
              <p style={{ fontSize: '11px', color: '#272525', margin: 0 }}>Fecha de recibido:</p>
            </div>
          </div>
        </div>
      ))}

      {/* Botones inferiores */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <button
          style={{ background: '#fff', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '10px 28px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer', color: '#272525' }}
          onClick={() => navigate(`/empresas/${id}/cesantias`)}
        >
          Cancelar
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

      {/* Modal descarga */}
      {descargando && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '40px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '320px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={28} color="#0B662A" />
            </div>
            <p style={{ fontSize: '16px', fontWeight: '800', color: '#272525', margin: 0 }}>Descarga en curso</p>
            <p style={{ fontSize: '13px', color: '#A3A3A3', margin: 0 }}>La descarga de los desprendibles tomará unos segundos.</p>
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
  btnDescargarSticky: { color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  card:               { backgroundColor: '#fff', borderRadius: '16px', padding: '28px 32px' },
  cardTitulo:         { fontSize: '16px', fontWeight: '800', color: '#272525', margin: '0 0 12px 0' },
  infoGrid:           { display: 'flex', flexDirection: 'column', gap: '10px' },
  infoFila:           { display: 'flex', gap: '8px', alignItems: 'baseline' },
  infoLabel:          { fontSize: '13px', fontWeight: '700', color: '#272525', whiteSpace: 'nowrap' },
  infoValor:          { fontSize: '13px', color: '#272525' },
  divider:            { border: 'none', borderTop: '1px solid #E8E8E8', margin: '24px 0 0 0' },
  tableTitle:         { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 16px 0' },
  tabla:              { width: '100%', borderCollapse: 'collapse', minWidth: '1000px', fontSize: '11px' },
  th:                 { backgroundColor: '#F0F0F0', fontWeight: '700', color: '#272525', padding: '7px 8px', textAlign: 'center', border: '1px solid #E0E0E0', whiteSpace: 'nowrap', fontSize: '11px' },
  td:                 { padding: '6px 8px', textAlign: 'center', color: '#272525', border: '1px solid #E0E0E0', whiteSpace: 'nowrap', fontSize: '11px' },
  trPar:              { backgroundColor: '#fff' },
  trImpar:            { backgroundColor: '#FAFAFA' },
  comprobante:        { border: '1px solid #D0D0D0', borderRadius: '4px', padding: '24px 28px', width: '100%', maxWidth: '680px', boxSizing: 'border-box', backgroundColor: '#fff', marginBottom: '8px' },
  comprobanteLabel:   { fontSize: '11px', color: '#272525', margin: 0 },
  comprobanteValor:   { fontSize: '11px', color: '#272525', margin: 0 },
  exitoMsg: { fontSize: '14px', fontWeight: '700', color: '#0B662A', margin: '0 0 16px 0' },
};
