import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { FileText, ChevronLeft, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import MensajeModal from '../../../../../components/MensajeModal';
import { UserCircle } from 'lucide-react';

function DescargaModal({ visible }) {
  if (!visible) return null;
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.iconoCirculo}>
          <Download size={40} color="#0B662A" strokeWidth={1.5} />
        </div>
        <p style={modalStyles.titulo}>Descarga en curso</p>
        <p style={modalStyles.descripcion}>La descarga de los desprendibles tomará unos segundos.</p>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay:      { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal:        { backgroundColor: '#fff', borderRadius: '20px', padding: '40px 48px', width: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' },
  iconoCirculo: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  titulo:       { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  descripcion:  { fontSize: '13px', color: '#555', margin: 0, lineHeight: 1.7 },
};

function PlantillaDesprendible({ empresa = 'PRIIGO SAS', nit = '901.331.853-4', empleado = {}, periodo = '', mes = '' }) {
  return (
    <div style={plantillaStyles.wrapper}>
      <div style={plantillaStyles.header}>
        <div style={plantillaStyles.logoBox}>
          <div style={plantillaStyles.logoPlaceholder}>LOGO</div>
        </div>
        <div style={plantillaStyles.empresaInfo}>
          <p style={plantillaStyles.empresaNombre}>{empresa}</p>
          <p style={plantillaStyles.empresaNit}>NIT. {nit}</p>
        </div>
      </div>

      <p style={plantillaStyles.tituloDesprendible}>DESPRENDIBLE PAGO DE NÓMINA</p>

      <div style={plantillaStyles.datosRow}>
        <div style={plantillaStyles.datosCol}>
          <p style={plantillaStyles.datoFila}><strong>Fecha</strong> {new Date().toLocaleDateString('es-CO')}</p>
          <p style={plantillaStyles.datoFila}><strong>Período</strong> {periodo || 'Del 01 al 15 de diciembre de 2025'}</p>
          <p style={plantillaStyles.datoFila}><strong>Nombre</strong> {empleado.nombre || '—'}</p>
          <p style={plantillaStyles.datoFila}><strong>Doc. Identidad</strong> {empleado.documento || '—'}</p>
          <p style={plantillaStyles.datoFila}><strong>Mes</strong> {mes || 'DICIEMBRE'}</p>
        </div>
        <div style={plantillaStyles.datosCol}>
          <p style={plantillaStyles.datoFila}><strong>Salario básico</strong> $ {empleado.salario || '—'}</p>
        </div>
      </div>

      <table style={plantillaStyles.tabla}>
        <thead>
          <tr>
            <th style={plantillaStyles.thConcepto}>CONCEPTO</th>
            <th style={plantillaStyles.thNumero}>DÍAS/HORAS</th>
            <th style={plantillaStyles.thNumero}>DEVENGOS</th>
            <th style={plantillaStyles.thNumero}>DEDUCCIONES</th>
          </tr>
        </thead>
        <tbody>
          {[
            'SALARIO BÁSICO','INCAPACIDAD','AUXILIO DE TRANSPORTE',
            'HORAS EXTRA Y RECARGOS','BONIFICACIONES SALARIALES',
            'OTROS PAGOS QUE CONSTITUYEN SALARIO',
            'OTROS PAGOS QUE NO CONSTITUYEN SALARIO',
            'PRIMAS, BENEFICIOS O AUXILIOS EXTRALEGALES',
            'SALUD TRABAJADOR','PENSIÓN TRABAJADOR','OTROS CONCEPTOS A DEDUCIR',
          ].map((concepto, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
              <td style={plantillaStyles.tdConcepto}>{concepto}</td>
              <td style={plantillaStyles.tdNumero}></td>
              <td style={plantillaStyles.tdNumero}></td>
              <td style={plantillaStyles.tdNumero}></td>
            </tr>
          ))}
          <tr style={{ backgroundColor: '#F0F0F0' }}>
            <td style={{ ...plantillaStyles.tdConcepto, fontWeight: '700' }}>SUBTOTAL</td>
            <td style={plantillaStyles.tdNumero}></td>
            <td style={{ ...plantillaStyles.tdNumero, fontWeight: '700' }}>$ —</td>
            <td style={{ ...plantillaStyles.tdNumero, fontWeight: '700' }}>$ —</td>
          </tr>
          <tr style={{ backgroundColor: '#0B662A' }}>
            <td style={{ ...plantillaStyles.tdConcepto, color: '#fff', fontWeight: '700' }}>NETO A PAGAR</td>
            <td style={plantillaStyles.tdNumero}></td>
            <td style={{ ...plantillaStyles.tdNumero, color: '#fff', fontWeight: '700' }} colSpan={2}>$ —</td>
          </tr>
        </tbody>
      </table>

      <div style={plantillaStyles.firmas}>
        <div style={plantillaStyles.firmaBox}>
          <div style={plantillaStyles.firmaLinea} />
          <p style={plantillaStyles.firmaLabel}>Firma del empleador</p>
        </div>
        <div style={plantillaStyles.firmaBox}>
          <div style={plantillaStyles.firmaLinea} />
          <p style={plantillaStyles.firmaLabel}>Firma del trabajador</p>
        </div>
      </div>
    </div>
  );
}

const plantillaStyles = {
  wrapper:            { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '24px', backgroundColor: '#fff', maxWidth: '700px', margin: '0 auto' },
  header:             { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' },
  logoBox:            { flexShrink: 0 },
  logoPlaceholder:    { width: '70px', height: '70px', border: '1px dashed #D0D0D0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#A3A3A3', fontWeight: '700' },
  empresaInfo:        { textAlign: 'center', flex: 1 },
  empresaNombre:      { fontSize: '18px', fontWeight: '800', color: '#272525', margin: '0 0 4px 0' },
  empresaNit:         { fontSize: '13px', color: '#555', margin: 0 },
  tituloDesprendible: { textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#272525', margin: '12px 0', letterSpacing: '0.5px' },
  datosRow:           { display: 'flex', justifyContent: 'space-between', marginBottom: '16px', gap: '24px' },
  datosCol:           { flex: 1 },
  datoFila:           { fontSize: '12px', color: '#272525', margin: '0 0 4px 0' },
  tabla:              { width: '100%', borderCollapse: 'collapse', marginBottom: '20px' },
  thConcepto:         { fontSize: '11px', fontWeight: '700', color: '#fff', backgroundColor: '#272525', padding: '8px 12px', textAlign: 'left' },
  thNumero:           { fontSize: '11px', fontWeight: '700', color: '#fff', backgroundColor: '#272525', padding: '8px 12px', textAlign: 'right' },
  tdConcepto:         { fontSize: '11px', color: '#272525', padding: '6px 12px', textAlign: 'left', borderBottom: '1px solid #F0F0F0' },
  tdNumero:           { fontSize: '11px', color: '#272525', padding: '6px 12px', textAlign: 'right', borderBottom: '1px solid #F0F0F0' },
  firmas:             { display: 'flex', justifyContent: 'space-around', marginTop: '24px' },
  firmaBox:           { textAlign: 'center' },
  firmaLinea:         { width: '180px', height: '1px', backgroundColor: '#272525', marginBottom: '6px' },
  firmaLabel:         { fontSize: '11px', color: '#555', margin: 0 },
};

export default function DesprendiblesPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const inicial = usuario?.nombresUsuario?.charAt(0).toUpperCase() ?? 'U';
  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

  const desprendibleRef               = useRef(null);
  const [descargando, setDescargando] = useState(false);
  const [confirmarCancelar, setConfirmarCancelar] = useState(false);
  const [modal, setModal]             = useState(null);
  const [hoverSubir, setHoverSubir]   = useState(false);
  const [hoverCancelar, setHoverCancelar] = useState(false);

  const infoReporte = {
    empresa: 'PRIIGO SAS',
    nit:     '1.001.023.958',
    fecha:   '03-12-2026',
    periodo: '1 al 15 de Diciembre de 2026',
    mes:     'Diciembre',
    estado:  'Borrador',
  };

  const handleSubirDescargar = async () => {
    setDescargando(true);
    try {
      const elemento = desprendibleRef.current;
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData   = canvas.toDataURL('image/png');
      const pdf       = new jsPDF('p', 'mm', 'a4');
      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const altoPagina = pdf.internal.pageSize.getHeight();

      if (pdfHeight <= altoPagina) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        let posicion = 0;
        while (posicion < pdfHeight) {
          pdf.addImage(imgData, 'PNG', 0, -posicion, pdfWidth, pdfHeight);
          posicion += altoPagina;
          if (posicion < pdfHeight) pdf.addPage();
        }
      }

      pdf.save(`desprendibles_nomina_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Desprendibles Nómina</h2>
            <p style={styles.subtitulo}>Ver desprendibles de nómina</p>
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

      {/* Volver */}
      <button style={styles.volverBtn} onClick={() => navigate(-1)}>
        <ChevronLeft size={16} color="#272525" />
        <span>Volver</span>
      </button>

      {/* ── Card info + desprendibles ── */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Desprendibles Nómina</h3>
        <p style={styles.infoFila}><strong>Nombre Empresa:</strong> {infoReporte.empresa}</p>
        <p style={styles.infoFila}><strong>Nit:</strong> {infoReporte.nit}</p>
        <p style={styles.infoFila}><strong>Fecha de Generación de Reporte:</strong> {infoReporte.fecha}</p>
        <p style={styles.infoFila}><strong>Período:</strong> {infoReporte.periodo}</p>
        <p style={styles.infoFila}><strong>Mes:</strong> {infoReporte.mes}</p>
        <p style={styles.infoFila}><strong>Estado:</strong> {infoReporte.estado}</p>

        <div style={styles.divisor} />

        {/* Zona que se captura para el PDF */}
        <div ref={desprendibleRef} style={{ display: 'flex', flexDirection: 'column', gap: '32px', backgroundColor: '#fff', padding: '8px' }}>
          <PlantillaDesprendible
            empresa={infoReporte.empresa}
            nit={infoReporte.nit}
            periodo={infoReporte.periodo}
            mes={infoReporte.mes.toUpperCase()}
          />
          <PlantillaDesprendible
            empresa={infoReporte.empresa}
            nit={infoReporte.nit}
            periodo={infoReporte.periodo}
            mes={infoReporte.mes.toUpperCase()}
          />
        </div>
      </div>

      {/* ── Botones ── */}
      <div style={styles.botonesRow}>
        <button
          style={{
            ...styles.btnSubir,
            background: hoverSubir ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverSubir(true)}
          onMouseLeave={() => setHoverSubir(false)}
          onClick={handleSubirDescargar}
        >
          Subir y Descargar Reportes
        </button>
        <button
          style={{
            ...styles.btnCancelar,
            background: hoverCancelar ? 'linear-gradient(135deg, #f0f0f0, #e0e0e0)' : '#fff',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverCancelar(true)}
          onMouseLeave={() => setHoverCancelar(false)}
          onClick={() => setConfirmarCancelar(true)}
        >
          Cancelar Proceso
        </button>
      </div>

      <DescargaModal visible={descargando} />

      <ConfirmarCambiosModal
        visible={confirmarCancelar}
        onCancelar={() => setConfirmarCancelar(false)}
        onConfirmar={() => { setConfirmarCancelar(false); setModal('exito'); }}
        titulo="¿Deseas cancelar el proceso?"
        descripcion="Una vez confirmes, el proceso será cancelado y no se generarán los desprendibles."
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
  volverBtn:    { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0 },
  card:         { backgroundColor: '#fff', borderRadius: '16px', padding: '36px 40px' },
  cardTitulo:   { fontSize: '20px', fontWeight: '800', color: '#272525', margin: '0 0 20px 0' },
  infoFila:     { fontSize: '13px', color: '#272525', margin: '0 0 8px 0' },
  divisor:      { height: '1px', backgroundColor: '#E8E8E8', margin: '24px 0' },
  botonesRow:   { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px' },
  btnSubir:     { color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 48px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnCancelar:  { color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '14px 48px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
};