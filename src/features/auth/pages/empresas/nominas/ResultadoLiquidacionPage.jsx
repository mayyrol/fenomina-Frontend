import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import payrollService from '../../../../../services/payrollService';
import masterAxios from '../../../../../api/masterAxiosInstance';
import { FileText, ChevronLeft, UserRound } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const fmt = (v) =>
  v != null
    ? '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    : '';

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

  useEffect(() => {
    if (!nominaId || !id) return;
    setCargando(true);

    Promise.all([
      payrollService.getDesprendiblesNomina(nominaId),
      payrollService.getProcesos(id),
      masterAxios.get(`/api/master/empresas/${id}`),
    ])
      .then(([{ data: desps }, { data: procesos }, { data: emp }]) => {
        setDesprendibles(desps);
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

  const handleDescargar = () => {
    setDescargando(true);
    setTimeout(() => {
      const doc = new jsPDF();

      desprendibles.forEach((desp, idx) => {
        if (idx > 0) doc.addPage();
        let y = 14;

        if (empresa?.logoEmpresaUrl) {
          doc.addImage(empresa.logoEmpresaUrl, 'PNG', 14, y, 25, 25);
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(empresa?.nombreEmpresa ?? '', 105, y + 8, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`NIT. ${empresa?.empresaNit ?? ''}`, 105, y + 14, { align: 'center' });
        y += 30;

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('DESPRENDIBLE PAGO DE NÓMINA', 105, y, { align: 'center' });
        y += 10;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(
          `Periodo: ${proceso?.fechaInicioPeriodo ?? ''} - ${proceso?.fechaFinPeriodo ?? ''}`,
          14, y
        ); y += 6;
        doc.text(
          `Nombre: ${desp.nombresEmpleado} ${desp.apellidosEmpleado}`,
          14, y
        ); y += 6;
        doc.text(`Doc. Identidad: ${desp.documentoEmpleado}`, 14, y); y += 6;
        doc.text(`Salario básico: ${fmt(desp.salarioBasico)}`, 140, y); y += 8;

        const { totalDevengos, totalDeducciones, neto } = calcularTotales(desp);

        const body = (desp.conceptos ?? []).map(c => [
          c.nombreConcepto,
          c.cantidad != null ? String(c.cantidad) : '',
          c.categoria === 'DEVENGO' && c.valorResultado != null
            ? fmt(c.valorResultado) : '',
          c.categoria === 'DEDUCCION' && c.valorResultado != null
            ? fmt(c.valorResultado) : '',
        ]);

        body.push(
          [
            { content: 'SUBTOTAL', styles: { fontStyle: 'bold' } },
            '', fmt(totalDevengos), fmt(totalDeducciones),
          ],
          [
            {
              content: 'NETO A PAGAR',
              styles: { fontStyle: 'bold', textColor: [11, 102, 42] },
            },
            '', fmt(neto), '',
          ],
        );

        autoTable(doc, {
          startY: y,
          head: [['CONCEPTO', 'DÍAS', 'DEVENGOS', 'DEDUCCIONES']],
          body,
          styles: { fontSize: 8 },
          headStyles: {
            fillColor: [11, 102, 42], textColor: 255, fontStyle: 'bold',
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right' },
          },
        });

        const finalY = doc.lastAutoTable.finalY + 16;
        doc.setFontSize(9);
        doc.text('_______________________', 140, finalY);
        doc.text('Firma del trabajador', 148, finalY + 6);
      });

      doc.save(`desprendibles_nomina_${nominaId}.pdf`);
      setDescargando(false);
    }, 100);
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

      {/* Barra sticky */}
      <div style={styles.stickyBar}>
        <button style={styles.volverBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={16} color="#272525" />
          <span>Volver</span>
        </button>
        <button
          style={{
            ...styles.btnDescargarSticky,
            background: hoverDescargar
              ? 'linear-gradient(135deg, #0B662A, #1a9e45)'
              : '#0B662A',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverDescargar(true)}
          onMouseLeave={() => setHoverDescargar(false)}
          onClick={handleDescargar}
          disabled={cargando || desprendibles.length === 0}
        >
          Descargar Reportes en PDF
        </button>
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
                  {proceso?.fechaInicioPeriodo} - {proceso?.fechaFinPeriodo}
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
          const NOMBRE_MES = [
            '','Enero','Febrero','Marzo','Abril','Mayo','Junio',
            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
          ];
          return (
            <div key={desp.cabecNominaId} style={styles.desprendibleCard}>

              {/* Encabezado desprendible */}
              <div style={styles.desprendibleHeader}>
                <div style={styles.logoBox}>
                  {empresa?.logoEmpresaUrl
                    ? (
                      <img
                        src={empresa.logoEmpresaUrl}
                        alt="logo"
                        style={{ width: '60px', height: '60px', objectFit: 'contain' }}
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
                    <strong>Periodo</strong> &nbsp;
                    {proceso?.fechaInicioPeriodo} - {proceso?.fechaFinPeriodo}
                  </p>
                  <p style={styles.empInfoFila}>
                    <strong>Nombre</strong> &nbsp;
                    {desp.nombresEmpleado} {desp.apellidosEmpleado}
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
                    <strong>Salario básico</strong> &nbsp; {fmt(desp.salarioBasico)}
                  </p>
                  <p style={{
                    ...styles.empInfoFila,
                    marginTop: '32px',
                    color: '#A3A3A3',
                    fontSize: '11px',
                  }}>
                    Firma del trabajador
                  </p>
                </div>
              </div>

              {/* Tabla conceptos */}
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.tabla}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, textAlign: 'left' }}>CONCEPTO</th>
                      <th style={styles.th}>DÍAS</th>
                      <th style={styles.th}>DEVENGOS</th>
                      <th style={styles.th}>DEDUCCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(desp.conceptos ?? []).map((c, i) => (
                      <tr key={i} style={i % 2 === 0 ? styles.trPar : styles.trImpar}>
                        <td style={{ ...styles.td, textAlign: 'left' }}>
                          {c.nombreConcepto}
                        </td>
                        <td style={styles.td}>
                          {c.cantidad != null ? c.cantidad : ''}
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
            </div>
          );
        })
      )}

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
  volverBtn:          { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0 },
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
  logoBox:            { width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoPlaceholder:    { width: '60px', height: '60px', border: '1px dashed #D0D0D0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
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
