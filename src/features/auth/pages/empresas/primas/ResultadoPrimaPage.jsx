import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { CreditCard, ChevronLeft, UserRound } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import payrollService from '../../../../../services/payrollService';
import masterAxios from '../../../../../api/masterAxiosInstance';

const calcularNeto = (desp) => desp.valorPrestacion ?? 0;
const fmt = (v) => '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const unidades = ['','UN','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE','DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE'];
const decenas  = ['','','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
const centenas = ['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];

function numLetras(n) {
  if (n === 0) return 'CERO';
  if (n < 0) return 'MENOS ' + numLetras(-n);
  let r = '';
  if (n >= 1000000) { r += numLetras(Math.floor(n/1000000)) + ' MILLÓN '; n %= 1000000; }
  if (n >= 1000)    { r += (Math.floor(n/1000) === 1 ? 'MIL' : numLetras(Math.floor(n/1000)) + ' MIL') + ' '; n %= 1000; }
  if (n >= 100)     { r += (n === 100 ? 'CIEN' : centenas[Math.floor(n/100)]) + ' '; n %= 100; }
  if (n >= 20)      { r += decenas[Math.floor(n/10)] + (n%10 ? ' Y ' + unidades[n%10] : '') + ' '; }
  else if (n > 0)   { r += unidades[n] + ' '; }
  return r.trim();
}

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

  const totalGeneral = desprendibles.reduce(
    (s, d) => s + (d.valorPrestacion ?? 0), 0
  );

  const handleDescargar = () => {
    setDescargando(true);
    setTimeout(() => {
      const doc = new jsPDF();
      let y = 14;

      if (empresa?.logoEmpresaUrl) {
        doc.addImage(empresa.logoEmpresaUrl, 'PNG', 14, y, 25, 25);
      }

      const semestre = proceso?.periodo === 1
        ? 'Primer semestre' : 'Segundo semestre';

      doc.setFontSize(12); doc.setFont(undefined, 'bold');
      doc.text(empresa?.nombreEmpresa ?? '', 105, y + 6, { align: 'center' });
      doc.setFontSize(9); doc.setFont(undefined, 'normal');
      doc.text(`NIT: ${empresa?.empresaNit ?? ''}`, 105, y + 12, { align: 'center' });
      doc.text('INGRESO / PAGOS', 105, y + 18, { align: 'center' });
      doc.text(`PLANILLA PRIMA ${semestre.toUpperCase()} ${proceso?.anio ?? ''}`,
        105, y + 24, { align: 'center' });
      y += 34;

      autoTable(doc, {
        startY: y,
        head: [[
          'No', 'CC', 'NOMBRES Y APELLIDOS',
          'FECHA INICIO', 'FECHA FIN', 'DÍAS',
          'SALARIO BASE', 'AUX. TRANSPORTE', 'NETO'
        ]],
        body: [
          ...desprendibles.map((desp, i) => [
            i + 1,
            desp.documentoEmpleado,
            `${desp.nombresEmpleado} ${desp.apellidosEmpleado}`,
            desp.fechaInicioCorte,
            desp.fechaFinCorte,
            desp.diasLiquidados,
            fmt(desp.salarioBase),
            fmt(desp.auxTransporte),
            fmt(desp.valorPrestacion),
          ]),
          [{
            content: 'TOTAL',
            colSpan: 8,
            styles: { halign: 'right', fontStyle: 'bold' },
          }, {
            content: fmt(totalGeneral),
            styles: { fontStyle: 'bold' },
          }],
        ],
        styles: { fontSize: 7 },
        headStyles: {
          fillColor: [11, 102, 42], textColor: 255,
          fontStyle: 'bold', fontSize: 7,
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      desprendibles.forEach((desp) => {
        doc.addPage();
        const neto = desp.valorPrestacion ?? 0;
        let cy = 20;
        doc.setDrawColor(0); doc.rect(10, 10, 190, cy + 130);

        if (empresa?.logoEmpresaUrl) {
          doc.addImage(empresa.logoEmpresaUrl, 'PNG', 14, cy, 20, 20);
        }

        doc.setFontSize(10); doc.setFont(undefined, 'bold');
        doc.text('Empleador:', 14, cy + 6);
        doc.text(empresa?.nombreEmpresa ?? '', 60, cy + 6);
        doc.setFont(undefined, 'normal');
        doc.text('NIT:', 14, cy + 12);
        doc.text(empresa?.empresaNit ?? '', 60, cy + 12);
        cy += 20;

        doc.setFont(undefined, 'bold');
        doc.text('Datos del trabajador:', 14, cy); cy += 6;
        doc.setFont(undefined, 'normal');
        doc.text('Nombre:', 14, cy);
        doc.text(`${desp.nombresEmpleado} ${desp.apellidosEmpleado}`, 60, cy);
        cy += 6;
        doc.text('Cédula:', 14, cy);
        doc.text(desp.documentoEmpleado, 60, cy);
        cy += 10;

        doc.setFontSize(9); doc.setFont(undefined, 'bold');
        doc.text(
          `Comprobante del pago de la prima de servicios correspondiente al ${semestre}`,
          105, cy, { align: 'center' }
        );
        cy += 10;

        doc.setFont(undefined, 'normal'); doc.setFontSize(9);
        doc.text('Fecha inicial:', 14, cy);
        doc.text(desp.fechaInicioCorte ?? '', 80, cy); cy += 6;
        doc.text('Fecha final:', 14, cy);
        doc.text(desp.fechaFinCorte ?? '', 80, cy); cy += 6;
        doc.text('Días trabajados en el semestre:', 14, cy);
        doc.text(String(desp.diasLiquidados ?? ''), 80, cy); cy += 10;

        doc.text('Salario Base:', 14, cy);
        doc.text(fmt(desp.salarioBase), 80, cy); cy += 6;
        doc.text('Auxilio de transporte:', 14, cy);
        doc.text(fmt(desp.auxTransporte), 80, cy); cy += 10;

        doc.setFont(undefined, 'bold');
        doc.text('Valor de la prima de servicios:', 14, cy);
        doc.text(fmt(neto), 80, cy); cy += 6;
        doc.text('Valor en letras:', 14, cy);
        doc.setFont(undefined, 'normal');
        const letras = (() => {
          try { return numLetras(neto) + ' PESOS M/CTE'; } catch { return ''; }
        })();
        const split = doc.splitTextToSize(letras, 120);
        doc.text(split, 55, cy); cy += split.length * 5 + 6;

        doc.text('Recibí conforme:', 14, cy); cy += 14;
        doc.line(14, cy, 80, cy); cy += 5;
        doc.text(
          `${desp.nombresEmpleado} ${desp.apellidosEmpleado}`,
          14, cy
        ); cy += 5;
        doc.text('Fecha de recibido:', 14, cy);
      });

      doc.save(`prima_${semestre.replace(/ /g, '_')}_${proceso?.anio ?? ''}.pdf`);
      setDescargando(false);
    }, 100);
  };

  useEffect(() => {
    if (!primaId || !id) return;
    setCargando(true);

    Promise.all([
      payrollService.getDesprendiblesPrima(primaId),
      payrollService.getProcesosPrima(id),
      masterAxios.get(`/api/master/empresas/${id}`),
    ])
      .then(([{ data: desps }, { data: procesos }, { data: emp }]) => {
        setDesprendibles(desps);
        setEmpresa(emp);
        const encontrado = procesos.find(
          p => String(p.procesoLiquiId) === String(primaId)
        );
        setProceso(encontrado ?? null);
      })
      .catch(() => {})
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

      {/* Barra sticky */}
      <div style={styles.stickyBar}>
        <button style={styles.volverBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={16} color="#272525" /><span>Volver</span>
        </button>
        <button
          style={{ ...styles.btnDescargarSticky, background: hoverDescargar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A', transition: 'background 0.3s ease' }}
          onMouseEnter={() => setHoverDescargar(true)}
          onMouseLeave={() => setHoverDescargar(false)}
          onClick={handleDescargar}
        >
          Descargar Reportes en PDF
        </button>
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

      {/* Planilla resumen */}
      <div style={styles.card}>
        <p style={styles.tableTitle}>
          Planilla Prima — {proceso?.periodo === 1 ? 'Primer semestre' : 'Segundo semestre'}
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                <th style={styles.th}>No</th>
                <th style={styles.th}>CC</th>
                <th style={{ ...styles.th, textAlign: 'left' }}>Nombres y Apellidos</th>
                <th style={styles.th}>Fecha inicio</th>
                <th style={styles.th}>Fecha fin</th>
                <th style={styles.th}>Días</th>
                <th style={styles.th}>Salario Base</th>
                <th style={styles.th}>Aux. Transporte</th>
                <th style={styles.th}>Neto</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>
                    Cargando...
                  </td>
                </tr>
              ) : desprendibles.map((desp, i) => (
                <tr key={desp.cabeLiquiPrestacionId ?? i}
                  style={i % 2 === 0 ? styles.trPar : styles.trImpar}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>{desp.documentoEmpleado}</td>
                  <td style={{ ...styles.td, textAlign: 'left' }}>
                    {desp.nombresEmpleado} {desp.apellidosEmpleado}
                  </td>
                  <td style={styles.td}>{desp.fechaInicioCorte}</td>
                  <td style={styles.td}>{desp.fechaFinCorte}</td>
                  <td style={styles.td}>{desp.diasLiquidados}</td>
                  <td style={styles.td}>{fmt(desp.salarioBase)}</td>
                  <td style={styles.td}>{fmt(desp.auxTransporte)}</td>
                  <td style={styles.td}>{fmt(desp.valorPrestacion)}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#E8F5EE' }}>
                <td colSpan={8} style={{ ...styles.td, fontWeight: '800', textAlign: 'right', color: '#0B662A' }}>TOTAL</td>
                <td style={{ ...styles.td, fontWeight: '800', color: '#0B662A' }}>{fmt(totalGeneral)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprobantes individuales */}
      {desprendibles.map((desp) => {
        const neto = desp.valorPrestacion ?? 0;
        const semestre = proceso?.periodo === 1
          ? 'Primer semestre' : 'Segundo semestre';
        return (
          <div key={desp.empleadoId} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={styles.comprobante}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                  <span style={styles.comprobanteLabel}>Empleador:</span>
                  <span style={{ ...styles.comprobanteValor, fontWeight: '700' }}>
                    {empresa?.nombreEmpresa ?? ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={styles.comprobanteLabel}>NIT:</span>
                  <span style={styles.comprobanteValor}>{empresa?.empresaNit ?? ''}</span>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <p style={{ ...styles.comprobanteLabel, fontWeight: '700', margin: '0 0 4px 0' }}>
                  Datos del trabajador:
                </p>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                  <span style={styles.comprobanteLabel}>Nombre:</span>
                  <span style={styles.comprobanteValor}>
                    {desp.nombresEmpleado} {desp.apellidosEmpleado}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={styles.comprobanteLabel}>Cédula:</span>
                  <span style={styles.comprobanteValor}>{desp.documentoEmpleado}</span>
                </div>
              </div>

              <p style={{
                fontSize: '11px', fontWeight: '700',
                textAlign: 'center', margin: '12px 0', color: '#272525',
              }}>
                Comprobante del pago de la prima de servicios
                correspondiente al {semestre}
              </p>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                  <span style={styles.comprobanteLabel}>Fecha inicial:</span>
                  <span style={styles.comprobanteValor}>{desp.fechaInicioCorte}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                  <span style={styles.comprobanteLabel}>Fecha final:</span>
                  <span style={styles.comprobanteValor}>{desp.fechaFinCorte}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={styles.comprobanteLabel}>
                    Días trabajados en el semestre:
                  </span>
                  <span style={styles.comprobanteValor}>{desp.diasLiquidados}</span>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                  <span style={{ ...styles.comprobanteLabel, width: '160px' }}>
                    Salario Base:
                  </span>
                  <span style={styles.comprobanteValor}>{fmt(desp.salarioBase)}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                  <span style={{ ...styles.comprobanteLabel, width: '160px' }}>
                    Auxilio de transporte:
                  </span>
                  <span style={styles.comprobanteValor}>{fmt(desp.auxTransporte)}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                  <span style={{ ...styles.comprobanteLabel, fontWeight: '700', width: '160px' }}>
                    Valor de la prima de servicios:
                  </span>
                  <span style={{ ...styles.comprobanteValor, fontWeight: '700' }}>
                    {fmt(neto)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ ...styles.comprobanteLabel, fontWeight: '700' }}>
                    Valor en letras:
                  </span>
                  <span style={{ ...styles.comprobanteValor, textTransform: 'uppercase' }}>
                    {(() => {
                      try { return numLetras(neto) + ' PESOS M/CTE'; }
                      catch { return ''; }
                    })()}
                  </span>
                </div>
              </div>

              <p style={{ ...styles.comprobanteLabel, marginBottom: '24px' }}>
                Recibí conforme:
              </p>
              <div style={{
                borderTop: '1px solid #272525', width: '220px',
                paddingTop: '6px', marginTop: '8px',
              }}>
                <p style={{ fontSize: '11px', color: '#272525', margin: '0 0 2px 0', fontWeight: '600' }}>
                  {desp.nombresEmpleado} {desp.apellidosEmpleado}
                </p>
                <p style={{ fontSize: '11px', color: '#272525', margin: 0 }}>
                  Fecha de recibido:
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal descarga */}
      {descargando && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '40px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '320px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={28} color="#0B662A" />
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
  stickyBar:          { position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'transparent', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  volverBtn:          { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0 },
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
  tabla:              { width: '100%', borderCollapse: 'collapse', minWidth: '700px', fontSize: '12px' },
  th:                 { backgroundColor: '#F0F0F0', fontWeight: '700', color: '#272525', padding: '8px 12px', textAlign: 'center', border: '1px solid #E0E0E0', whiteSpace: 'nowrap' },
  td:                 { padding: '7px 12px', textAlign: 'center', color: '#272525', border: '1px solid #E0E0E0', whiteSpace: 'nowrap' },
  trPar:              { backgroundColor: '#fff' },
  trImpar:            { backgroundColor: '#FAFAFA' },
  comprobante:        { border: '1px solid #D0D0D0', borderRadius: '4px', padding: '28px 32px', width: '100%', maxWidth: '680px', boxSizing: 'border-box', backgroundColor: '#fff' },
  comprobanteLabel:   { fontSize: '11px', color: '#272525', margin: 0, minWidth: '120px' },
  comprobanteValor:   { fontSize: '11px', color: '#272525', margin: 0 },
};
