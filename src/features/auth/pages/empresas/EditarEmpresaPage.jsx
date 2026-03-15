import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../store/authStore';
import { useEmpresas } from '../../hooks/useEmpresas';
import { Building2, Camera, ChevronDown } from 'lucide-react';
import MensajeModal from '../../../../components/MensajeModal';
import ConfirmarCambiosModal from '../../../../components/ConfirmarCambiosModal';

export default function EditarEmpresaPage() {
  const navigate           = useNavigate();
  const { id }             = useParams();
  const { usuario }        = useAuthStore();
  const { getEmpresaById } = useEmpresas();

  const empresa = getEmpresaById(id);

  const inicial = usuario?.nombresUsuario?.charAt(0).toUpperCase() ?? 'U';
  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

  const [fotoPreview, setFotoPreview]   = useState(empresa?.logo ?? null);
  const [foto, setFoto]                 = useState(null);
  const [modal, setModal]               = useState(null);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [errores, setErrores]           = useState({});
  const [form, setForm]                 = useState({
    nitEmpresa:        empresa?.nitEmpresa        ?? '',
    razonSocial:       empresa?.razonSocial       ?? '',
    nombreEmpresa:     empresa?.nombre            ?? '',
    ley1607:           empresa?.ley1607           ?? '',
    reportesNomina:    empresa?.reportesNomina    ?? '',
    reportesPrimas:    empresa?.reportesPrimas    ?? '',
    reportesCesantias: empresa?.reportesCesantias ?? '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: '' });
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const validar = () => {
    const nuevosErrores = {};
    const textoCampos  = ['nitEmpresa', 'razonSocial', 'nombreEmpresa'];
    const selectCampos = ['ley1607', 'reportesNomina', 'reportesPrimas', 'reportesCesantias'];

    textoCampos.forEach((campo) => {
      if (!form[campo].trim()) nuevosErrores[campo] = 'Este campo es obligatorio.';
    });
    selectCampos.forEach((campo) => {
      if (!form[campo]) nuevosErrores[campo] = 'Debes seleccionar una opción.';
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    setModalConfirmar(true);
  };

  const handleConfirmar = () => {
    setModalConfirmar(false);
    // Reemplazar con llamada real al backend
    setModal('exito');
  };

  if (!empresa) return <p>Empresa no encontrada.</p>;

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
        <h3 style={styles.cardTitulo}>Editar información empresa</h3>
        <p style={styles.seccionTitulo}>Información Básica</p>
        <div style={styles.fila3}>
          <div style={styles.campo}>
            <label style={styles.label}>NIT Empresa<span style={styles.req}>*</span></label>
            <input
              name="nitEmpresa"
              value={form.nitEmpresa}
              onChange={handleChange}
              style={{ ...styles.input, ...(errores.nitEmpresa ? styles.inputError : {}) }}
            />
            {errores.nitEmpresa && <p style={styles.errorMsg}>{errores.nitEmpresa}</p>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Razón Social<span style={styles.req}>*</span></label>
            <input
              name="razonSocial"
              value={form.razonSocial}
              onChange={handleChange}
              style={{ ...styles.input, ...(errores.razonSocial ? styles.inputError : {}) }}
            />
            {errores.razonSocial && <p style={styles.errorMsg}>{errores.razonSocial}</p>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Nombre Empresa<span style={styles.req}>*</span></label>
            <input
              name="nombreEmpresa"
              value={form.nombreEmpresa}
              onChange={handleChange}
              style={{ ...styles.input, ...(errores.nombreEmpresa ? styles.inputError : {}) }}
            />
            {errores.nombreEmpresa && <p style={styles.errorMsg}>{errores.nombreEmpresa}</p>}
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
          <div style={styles.selectWrapper}>
            <select
              name="ley1607"
              value={form.ley1607}
              onChange={handleChange}
              style={{ ...styles.select, ...(errores.ley1607 ? styles.inputError : {}) }}
            >
              <option value="">Seleccionar opción</option>
              <option value="SI">SI</option>
              <option value="NO">NO</option>
            </select>
            <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
          </div>
          {errores.ley1607 && <p style={styles.errorMsg}>{errores.ley1607}</p>}
        </div>

        {/* Logo Empresa */}
        <div style={styles.card}>
          <p style={styles.seccionTitulo}>Logo Empresa</p>
          <div style={styles.logoBox}>
            <label htmlFor="fotoInput" style={styles.fotoCirculo}>
              {fotoPreview && (
                <img src={fotoPreview} alt="logo" style={styles.fotoImgOverlay} />
              )}
              <div style={styles.fotoOverlay}>
                <Camera size={28} color="#fff" />
                <span style={styles.fotoLabel}>Subir foto</span>
              </div>
              <input
                id="fotoInput"
                type="file"
                accept=".jpg,.webp,.png"
                onChange={handleFoto}
                style={{ display: 'none' }}
              />
            </label>
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
            <div style={styles.selectWrapper}>
              <select
                name="reportesNomina"
                value={form.reportesNomina}
                onChange={handleChange}
                style={{ ...styles.select, ...(errores.reportesNomina ? styles.inputError : {}) }}
              >
                <option value="">Seleccionar opción</option>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
            {errores.reportesNomina && <p style={styles.errorMsg}>{errores.reportesNomina}</p>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Reportes de Primas Empleados (Desprendibles)<span style={styles.req}>*</span></label>
            <div style={styles.selectWrapper}>
              <select
                name="reportesPrimas"
                value={form.reportesPrimas}
                onChange={handleChange}
                style={{ ...styles.select, ...(errores.reportesPrimas ? styles.inputError : {}) }}
              >
                <option value="">Seleccionar opción</option>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
            {errores.reportesPrimas && <p style={styles.errorMsg}>{errores.reportesPrimas}</p>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Reportes de Cesantías e Intereses Empleados (Desprendibles)<span style={styles.req}>*</span></label>
            <div style={styles.selectWrapper}>
              <select
                name="reportesCesantias"
                value={form.reportesCesantias}
                onChange={handleChange}
                style={{ ...styles.select, ...(errores.reportesCesantias ? styles.inputError : {}) }}
              >
                <option value="">Seleccionar opción</option>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
              </select>
              <ChevronDown size={16} color="#A3A3A3" style={styles.selectIcon} />
            </div>
            {errores.reportesCesantias && <p style={styles.errorMsg}>{errores.reportesCesantias}</p>}
          </div>
        </div>
      </div>

      {/* ── Botones ── */}
      <div style={styles.botonesRow}>
        <button style={styles.btnRegresar} onClick={() => navigate(-1)}>Regresar</button>
        <button style={styles.btnGuardar} onClick={handleSubmit}>Guardar Cambios</button>
      </div>

      {/* Modal confirmación */}
      <ConfirmarCambiosModal
        visible={modalConfirmar}
        onCancelar={() => setModalConfirmar(false)}
        onConfirmar={handleConfirmar}
      />

      {/* Modal éxito/error */}
      <MensajeModal tipo={modal} onClose={() => { setModal(null); navigate(-1); }} />

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
  card:            { backgroundColor: '#fff', borderRadius: '16px', padding: '55px 55px' },
  cardTitulo:      { fontSize: '20px', fontWeight: '800', color: '#272525', margin: '0 0 40px 0' },
  seccionTitulo:   { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 20px 0' },
  textoDescripcion:{ fontSize: '13px', color: '#555', margin: '0 0 20px 0', lineHeight: 1.7 },
  fila3:           { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' },
  fila2:           { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
  campo:           { display: 'flex', flexDirection: 'column', gap: '8px' },
  label:           { fontSize: '13px', fontWeight: '600', color: '#272525' },
  req:             { color: '#E53E3E', marginLeft: '2px' },
  input:           { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', color: '#272525', width: '100%', boxSizing: 'border-box', textAlign: 'center' },
  inputError:      { border: '1px solid #E53E3E' },
  errorMsg:        { fontSize: '12px', color: '#E53E3E', margin: '2px 0 0 0' },
  selectWrapper:   { position: 'relative' },
  select:          { width: '100%', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px 40px 12px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', appearance: 'none', backgroundColor: '#fff', color: '#272525', cursor: 'pointer', boxSizing: 'border-box' },
  selectIcon:      { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  logoBox:         { display: 'flex', alignItems: 'center', gap: '24px' },
  fotoCirculo:     { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#EFEFEF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden', flexShrink: 0 },
  fotoImgOverlay:  { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 },
  fotoOverlay:     { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  fotoLabel:       { fontSize: '11px', color: '#fff', fontWeight: '600' },
  fotoInfo:        { display: 'flex', flexDirection: 'column', gap: '2px' },
  fotoInfoTitulo:  { fontSize: '12px', fontWeight: '700', color: '#272525', margin: 0 },
  fotoInfoTexto:   { fontSize: '12px', color: '#A3A3A3', margin: '0 0 8px 0' },
  botonesRow:      { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px' },
  btnRegresar:     { backgroundColor: '#fff', color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnGuardar:      { backgroundColor: '#0B662A', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
};