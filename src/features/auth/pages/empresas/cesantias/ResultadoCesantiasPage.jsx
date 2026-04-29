import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { Coins, ChevronLeft, UserRound } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import payrollService from '../../../../../services/payrollService';
import masterAxios from '../../../../../api/masterAxiosInstance';

const fmt = (v) => v != null ? '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

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

  const handleDescargar = () => {
    setDescargando(true);
    setTimeout(() => {
      const doc = new jsPDF('landscape');
      let y = 14;

      if (empresa?.logoEmpresaUrl) {
        doc.addImage(empresa.logoEmpresaUrl, 'PNG', 14, y, 20, 20);
      }

      doc.setFontSize(11); doc.setFont(undefined, 'bold');
      doc.text(empresa?.nombreEmpresa ?? '', 148, y + 4, { align: 'center' });
      doc.setFontSize(9); doc.setFont(undefined, 'normal');
      doc.text(`NIT: ${empresa?.empresaNit ?? ''}`, 148, y + 10, { align: 'center' });
      doc.text(
        `CESANTIAS E INTERESES DE LAS CESANTIAS ${proceso?.anio ?? ''}`,
        148, y + 16, { align: 'center' }
      );
      y += 26;

      autoTable(doc, {
        startY: y,
        head: [[
          'No', 'CC', 'NOMBRES Y APELLIDOS', 'DÍAS',
          'FECHA INGRESO', 'FECHA CORTE INICIO', 'FECHA CORTE FIN',
          'SALARIO BASE', 'AUX TRANSPORTE', 'SAL. LIQUIDACIÓN',
          'CESANTÍAS', 'INTERESES CESANTÍAS', 'FONDO PENSIONES',
        ]],
        body: [
          ...desprendibles.map((desp, i) => [
            i + 1,
            desp.documentoEmpleado,
            `${desp.nombresEmpleado} ${desp.apellidosEmpleado}`,
            desp.diasLiquidados,
            desp.fechaInicioCorte,
            desp.fechaInicioCorte,
            desp.fechaFinCorte,
            fmt(desp.salarioBase),
            fmt(desp.auxTransporte),
            fmt(desp.baseLiquidacion),
            fmt(desp.valorPrestacion),
            fmt(desp.valorInteresesCesantias),
            desp.fondoPension ?? '',
          ]),
          [{
            content: 'TOTAL', colSpan: 10,
            styles: { halign: 'right', fontStyle: 'bold' },
          },
          { content: fmt(totalCesantias), styles: { fontStyle: 'bold' } },
          { content: fmt(totalIntereses), styles: { fontStyle: 'bold' } },
          ''],
        ],
        styles: { fontSize: 6 },
        headStyles: {
          fillColor: [11, 102, 42], textColor: 255,
          fontStyle: 'bold', fontSize: 6,
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      desprendibles.forEach((desp) => {
        doc.addPage('portrait');
        let cy = 20;
        doc.setDrawColor(0); doc.rect(10, 10, 190, 165);

        if (empresa?.logoEmpresaUrl) {
          doc.addImage(empresa.logoEmpresaUrl, 'PNG', 14, cy, 20, 20);
        }

        doc.setFontSize(10); doc.setFont(undefined, 'bold');
        doc.text('Empleador:', 14, cy);
        doc.text(empresa?.nombreEmpresa ?? '', 60, cy);
        doc.setFont(undefined, 'normal');
        doc.text('NIT:', 14, cy + 6);
        doc.text(empresa?.empresaNit ?? '', 60, cy + 6);
        cy += 16;

        doc.setFont(undefined, 'bold');
        doc.text('Datos del trabajador:', 14, cy); cy += 6;
        doc.setFont(undefined, 'normal');
        doc.text('Nombre:', 14, cy);
        doc.text(`${desp.nombresEmpleado} ${desp.apellidosEmpleado}`, 60, cy);
        cy += 6;
        doc.text('Cédula:', 14, cy);
        doc.text(desp.documentoEmpleado, 60, cy);
        cy += 10;

        doc.setFont(undefined, 'bold');
        doc.text(
          `Liquidaciones de cesantías e intereses de cesantías ${proceso?.anio ?? ''}`,
          105, cy, { align: 'center' }
        );
        cy += 10;

        doc.setFont(undefined, 'normal');
        doc.text('Fecha inicial:', 14, cy);
        doc.text(desp.fechaInicioCorte ?? '', 80, cy); cy += 6;
        doc.text('Fecha final:', 14, cy);
        doc.text(desp.fechaFinCorte ?? '', 80, cy); cy += 6;
        doc.text('Días trabajados:', 14, cy);
        doc.text(String(desp.diasLiquidados ?? ''), 80, cy); cy += 10;

        doc.text('Salario Base:', 14, cy);
        doc.text(fmt(desp.salarioBase), 80, cy); cy += 6;
        doc.text('Auxilio de transporte:', 14, cy);
        doc.text(fmt(desp.auxTransporte), 80, cy); cy += 6;
        doc.text('Cesantías (informativo):', 14, cy);
        doc.text(fmt(desp.valorPrestacion), 80, cy); cy += 6;
        doc.text('Intereses de cesantías:', 14, cy);
        doc.text(fmt(desp.valorInteresesCesantias), 80, cy); cy += 10;

        doc.setFont(undefined, 'bold');
        doc.text('Valor a pagar intereses de cesantías:', 14, cy);
        doc.text(fmt(desp.valorInteresesCesantias), 80, cy); cy += 12;

        doc.text('Recibí conforme:', 14, cy); cy += 14;
        doc.line(14, cy, 80, cy); cy += 5;
        doc.text(
          `${desp.nombresEmpleado} ${desp.apellidosEmpleado}`,
          14, cy
        ); cy += 5;
        doc.text('Fecha de recibido:', 14, cy);
      });

      doc.save(`cesantias_${proceso?.anio ?? ''}.pdf`);
      setDescargando(false);
    }, 100);
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

      {/* Volver sticky */}
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
        <h3 style={styles.cardTitulo}>Desprendibles Cesantías e Intereses de Cesantías</h3>
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
      {cargando ? (
        <tr>
          <td colSpan={13} style={{ textAlign: 'center', padding: '20px' }}>
            Cargando...
          </td>
        </tr>
      ) : desprendibles.map((desp, i) => (
        <tr key={desp.empleadoId ?? i}
          style={i % 2 === 0 ? styles.trPar : styles.trImpar}>
          <td style={styles.td}>{i + 1}</td>
          <td style={styles.td}>{desp.documentoEmpleado}</td>
          <td style={{ ...styles.td, textAlign: 'left' }}>
            {desp.nombresEmpleado} {desp.apellidosEmpleado}
          </td>
          <td style={styles.td}>{desp.diasLiquidados}</td>
          <td style={styles.td}>{desp.fechaInicioCorte}</td>
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

      {/* Comprobantes individuales con logo */}
      {desprendibles.map((desp) => (
        <div key={desp.empleadoId} style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={styles.comprobante}>
            {empresa?.logoEmpresaUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <img
                  src={empresa.logoEmpresaUrl}
                  alt="logo"
                  style={{ width: '60px', objectFit: 'contain' }}
                />
              </div>
            )}

            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '2px' }}>
                <span style={{ ...styles.comprobanteLabel, fontWeight: '700', minWidth: '80px' }}>
                  Empleador:
                </span>
                <span style={{ ...styles.comprobanteValor, fontWeight: '700' }}>
                  {empresa?.nombreEmpresa ?? ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '80px' }}>NIT:</span>
                <span style={{ ...styles.comprobanteValor, fontWeight: '700' }}>
                  {empresa?.empresaNit ?? ''}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <p style={{ ...styles.comprobanteLabel, fontWeight: '700', margin: '0 0 4px 0' }}>
                Datos del trabajador:
              </p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '2px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '80px' }}>Nombre:</span>
                <span style={styles.comprobanteValor}>
                  {desp.nombresEmpleado} {desp.apellidosEmpleado}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '80px' }}>Cédula:</span>
                <span style={styles.comprobanteValor}>{desp.documentoEmpleado}</span>
              </div>
            </div>

            <p style={{
              fontSize: '11px', fontWeight: '700',
              textAlign: 'center', margin: '12px 0', color: '#272525',
            }}>
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
                <span style={{ ...styles.comprobanteLabel, minWidth: '200px' }}>
                  Auxilio de transporte:
                </span>
                <span style={styles.comprobanteValor}>{fmt(desp.auxTransporte)}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '200px' }}>
                  Cesantías (informativo):
                </span>
                <span style={styles.comprobanteValor}>{fmt(desp.valorPrestacion)}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ ...styles.comprobanteLabel, minWidth: '200px' }}>
                  Intereses de cesantías:
                </span>
                <span style={styles.comprobanteValor}>{fmt(desp.valorInteresesCesantias)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
                <span style={{ ...styles.comprobanteLabel, fontWeight: '700', minWidth: '200px' }}>
                  Valor a pagar intereses de cesantías:
                </span>
                <span style={{ ...styles.comprobanteValor, fontWeight: '700' }}>
                  {fmt(desp.valorInteresesCesantias)}
                </span>
              </div>
            </div>

            <p style={{ ...styles.comprobanteLabel, marginBottom: '20px' }}>Recibí conforme:</p>
            <div style={{
              borderTop: '1px solid #272525', width: '220px',
              paddingTop: '6px', marginTop: '8px',
            }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#272525', margin: '0 0 2px 0' }}>
                {desp.nombresEmpleado} {desp.apellidosEmpleado}
              </p>
              <p style={{ fontSize: '11px', color: '#272525', margin: 0 }}>
                Fecha de recibido:
              </p>
            </div>
          </div>
        </div>
      ))}

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
stickyBar: { position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'transparent', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },  volverBtn:          { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0 },
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
};
