import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../store/authStore';
import { Building2 } from 'lucide-react';
import empresasService from '../../../../services/empresasService';

export default function InfoEmpresaPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { usuario } = useAuthStore();

  const [empresa, setEmpresa]   = useState(null);
  const [cargando, setCargando] = useState(true);
  const [hoverEditar,   setHoverEditar]   = useState(false);
  const [hoverRegresar, setHoverRegresar] = useState(false);

  useEffect(() => {
    empresasService.getEmpresaById(id)
      .then(({ data }) => setEmpresa(data))
      .catch(() => setEmpresa(null))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <p>Cargando...</p>;
  if (!empresa) return <p>Empresa no encontrada.</p>;

  const inicial = usuario?.nombresUsuario?.charAt(0).toUpperCase() ?? 'U';
  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Información empresa</h2>
            <p style={styles.subtitulo}>Ver información registrada de la empresa y/o editar información</p>
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

      {/* ── Sección 1: Información Básica ── */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Información empresa</h3>
        <p style={styles.seccionTitulo}>Información Básica</p>
        <div style={styles.fila3}>
          <div style={styles.campo}>
            <label style={styles.label}>NIT Empresa<span style={styles.req}>*</span></label>
            <input readOnly value={empresa.empresaNit ?? ''} style={styles.inputReadOnly} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Razón Social<span style={styles.req}>*</span></label>
            <input readOnly value={empresa.razonSocial ?? ''} style={styles.inputReadOnly} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Nombre Empresa<span style={styles.req}>*</span></label>
            <input readOnly value={empresa.nombreEmpresa ?? ''} style={styles.inputReadOnly} />
          </div>
        </div>
      </div>

      {/* ── Sección 2: Ley 1607 + Logo ── */}
      <div style={styles.fila2}>

        {/* Ley 1607 */}
        <div style={styles.card}>
          <p style={styles.seccionTitulo}>Ley 1607 de 2012</p>
          <p style={styles.textoDescripcion}>
            Indique si el aportante ha sido marcado como exonerado de pago de aporte de parafiscales
            y salud conforme a la Ley 1607 de 2012 (campo 33 del archivo tipo 1 de la PILA)<span style={styles.req}>*</span>
          </p>
          {/* ── CAMBIO: input readOnly en vez de select disabled ── */}
          <input readOnly value={empresa.esExoneradaLey1607 ? 'SI' : 'NO'} style={styles.inputReadOnly} />
        </div>

        {/* Logo Empresa */}
        <div style={styles.card}>
          <p style={styles.seccionTitulo}>Logo Empresa</p>
          <div style={styles.logoBox}>
            <div style={styles.fotoCirculo}>
              {empresa.logo
                ? <img src={`${import.meta.env.VITE_MASTER_API_URL}${empresa.logoEmpresaUrl}`} alt="logo" style={styles.fotoImg} />
                : <Building2 size={32} color="#A3A3A3" />
              }
            </div>
            <div style={styles.fotoInfo}>
              <p style={styles.fotoInfoTitulo}>Formato permitido</p>
              <p style={styles.fotoInfoTexto}>JPG, WEBP, y PNG</p>
              <p style={styles.fotoInfoTitulo}>Max peso del archivo</p>
              <p style={styles.fotoInfoTexto}>2MB</p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Sección 3: Servicios ── */}
      <div style={styles.card}>
        <p style={styles.seccionTitulo}>Servicios de Liquidación de Nómina a Prestación</p>
        <p style={styles.textoDescripcion}>
          A continuación, marque las opciones que correspondan a los servicios de gestión administrativa
          que Función Empresarial SAS le estará prestando a la empresa inscrita:
        </p>
        <div style={styles.fila3}>
          <div style={styles.campo}>
            <label style={styles.label}>Reportes de Nómina Empleados (Desprendibles)<span style={styles.req}>*</span></label>
            {/* ── CAMBIO: input readOnly en vez de select disabled ── */}
            <input readOnly value={empresa.aplicaNomina ? 'SI' : 'NO'} style={styles.inputReadOnly} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Reportes de Primas Empleados (Desprendibles)<span style={styles.req}>*</span></label>
            {/* ── CAMBIO: input readOnly en vez de select disabled ── */}
            <input readOnly value={empresa.aplicaPrima ? 'SI' : 'NO'} style={styles.inputReadOnly} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Reportes de Cesantías e Intereses Empleados (Desprendibles)<span style={styles.req}>*</span></label>
            {/* ── CAMBIO: input readOnly en vez de select disabled ── */}
            <input readOnly value={empresa.aplicaCesantias ? 'SI' : 'NO'} style={styles.inputReadOnly} />
          </div>
        </div>
      </div>

      {/* ── Botones ── */}
      <div style={styles.botonesRow}>
        <button
          style={{
            ...styles.btnRegresar,
            background: hoverRegresar ? 'linear-gradient(135deg, #f0f0f0, #e0e0e0)' : '#fff',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverRegresar(true)}
          onMouseLeave={() => setHoverRegresar(false)}
          onClick={() => navigate(-1)}
        >
          Regresar
        </button>
        <button
          style={{
            ...styles.btnEditar,
            background: hoverEditar ? 'linear-gradient(135deg, #0B662A, #1a9e45)' : '#0B662A',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverEditar(true)}
          onMouseLeave={() => setHoverEditar(false)}
          onClick={() => navigate(`/empresas/${id}/info/editar`)}
        >
          Editar Información
        </button>
      </div>

    </div>
  );
}

const styles = {
  container:       { padding: '0', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '100%' },
  header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titulo:          { fontSize: '18px', fontWeight: '800', color: '#272525', margin: 0 },
  subtitulo:       { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  perfilBox:       { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:          { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D0D0D0', color: '#272525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  perfilNombre:    { fontSize: '13px', fontWeight: '700', color: '#272525', margin: 0, lineHeight: 1.3 },
  perfilCargo:     { fontSize: '11px', color: '#A3A3A3', fontWeight: '400', margin: 0 },
  cardTitulo:      { fontSize: '20px', fontWeight: '800', color: '#272525', margin: '0 0 40px 0' },
  card:            { backgroundColor: '#fff', borderRadius: '16px', padding: '55px 55px' },
  seccionTitulo:   { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 20px 0' },
  textoDescripcion:{ fontSize: '13px', color: '#555', margin: '0 0 20px 0', lineHeight: 1.7 },
  fila3:           { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' },
  fila2:           { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
  campo:           { display: 'flex', flexDirection: 'column', gap: '8px' },
  label:           { fontSize: '13px', fontWeight: '600', color: '#272525' },
  req:             { color: '#E53E3E', marginLeft: '2px' },
  // ── CAMBIO: fondo gris claro y cursor default para indicar que es solo lectura ──
  inputReadOnly:   { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', color: '#272525', width: '100%', boxSizing: 'border-box', backgroundColor: '#F7F7F7', cursor: 'default' },
  logoBox:         { display: 'flex', alignItems: 'center', gap: '24px' },
  fotoCirculo:     { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#EFEFEF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', flexShrink: 0 },
  fotoImg:         { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' },
  fotoInfo:        { display: 'flex', flexDirection: 'column', gap: '2px' },
  fotoInfoTitulo:  { fontSize: '12px', fontWeight: '700', color: '#272525', margin: 0 },
  fotoInfoTexto:   { fontSize: '12px', color: '#A3A3A3', margin: '0 0 8px 0' },
  botonesRow:      { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px' },
  btnEditar:       { color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnRegresar:     { color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
};
