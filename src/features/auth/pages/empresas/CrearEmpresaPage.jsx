import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../store/authStore';
import { Building2, Camera, ChevronDown } from 'lucide-react';
import MensajeModal from '../../../../components/MensajeModal';

export default function CrearEmpresaPage() {
  const navigate    = useNavigate();
  const { usuario } = useAuthStore();

  const inicial = usuario?.nombresUsuario?.charAt(0).toUpperCase() ?? 'U';
  const nombre  = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo   = usuario?.cargoUsuario ?? '';

  const [foto, setFoto]               = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [modal, setModal]             = useState(null);
  const [errores, setErrores]         = useState({});
  const [hoverCrear, setHoverCrear]   = useState(false);
  const [hoverRegresar, setHoverRegresar] = useState(false);

  const [form, setForm] = useState({
    nitEmpresa:        '',
    razonSocial:       '',
    nombreEmpresa:     '',
    ley1607:           '',
    reportesNomina:    '',
    reportesPrimas:    '',
    reportesCesantias: '',
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
    console.log('Form:', form);
    console.log('Foto:', foto);
    setModal('exito');
  };

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Crear empresa</h2>
            <p style={styles.subtitulo}>Llena los datos que solicita el formulario para crear una nueva empresa</p>
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
        <h3 style={styles.formTitulo}>Crear empresa</h3>
        <p style={styles.seccionTitulo}>Información Básica</p>
        <div style={styles.fila3}>
          <div style={styles.campo}>
            <label style={styles.label}>NIT Empresa<span style={styles.req}>*</span></label>
            <input
              name="nitEmpresa"
              value={form.nitEmpresa}
              onChange={handleChange}
              placeholder="Ingresar número"
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
              placeholder="Ingresar nombre"
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
              placeholder="Ingresar nombre"
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
            <label style={styles.fotoCirculo} htmlFor="fotoInput">
              {fotoPreview
                ? <img src={fotoPreview} alt="logo" style={styles.fotoImg} />
                : <>
                    <Camera size={32} color="#A3A3A3" />
                    <span style={styles.fotoLabel}>Subir foto</span>
                  </>
              }
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

      {/* ── Sección 3: Servicios de Liquidación ── */}
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
        <button
          style={{
            ...styles.btnCrear,
            background: hoverCrear
              ? 'linear-gradient(135deg, #0B662A, #1a9e45)'
              : '#0B662A',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverCrear(true)}
          onMouseLeave={() => setHoverCrear(false)}
          onClick={handleSubmit}
        >
          Crear Empresa
        </button>
        <button
          style={{
            ...styles.btnRegresar,
            background: hoverRegresar
              ? 'linear-gradient(135deg, #f0f0f0, #e0e0e0)'
              : '#fff',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverRegresar(true)}
          onMouseLeave={() => setHoverRegresar(false)}
          onClick={() => navigate('/empresas')}
        >
          Regresar
        </button>
      </div>

      {/* Modal */}
      <MensajeModal tipo={modal} onClose={() => setModal(null)} />

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
  formTitulo:      { fontSize: '20px', fontWeight: '800', color: '#272525', margin: '0 0 40px 0' },
  card:            { backgroundColor: '#fff', borderRadius: '16px', padding: '55px 55px' },
  seccionTitulo:   { fontSize: '15px', fontWeight: '800', color: '#272525', margin: '0 0 20px 0' },
  textoDescripcion:{ fontSize: '13px', color: '#555', margin: '0 0 20px 0', lineHeight: 1.7 },
  fila3:           { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' },
  fila2:           { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
  campo:           { display: 'flex', flexDirection: 'column', gap: '8px' },
  label:           { fontSize: '13px', fontWeight: '600', color: '#272525' },
  req:             { color: '#E53E3E', marginLeft: '2px' },
  input:           { border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', color: '#272525', width: '100%', boxSizing: 'border-box' },
  inputError:      { border: '1px solid #E53E3E' },
  errorMsg:        { fontSize: '12px', color: '#E53E3E', margin: '2px 0 0 0' },
  selectWrapper:   { position: 'relative' },
  select:          { width: '100%', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px 40px 12px 16px', fontSize: '13px', fontFamily: 'Nunito, sans-serif', outline: 'none', appearance: 'none', backgroundColor: '#fff', color: '#A3A3A3', cursor: 'pointer', boxSizing: 'border-box' },
  selectIcon:      { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  logoBox:         { display: 'flex', alignItems: 'center', gap: '24px' },
  fotoCirculo:     { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#EFEFEF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '6px', flexShrink: 0 },
  fotoImg:         { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' },
  fotoLabel:       { fontSize: '11px', color: '#A3A3A3', fontWeight: '600' },
  fotoInfo:        { display: 'flex', flexDirection: 'column', gap: '2px' },
  fotoInfoTitulo:  { fontSize: '12px', fontWeight: '700', color: '#272525', margin: 0 },
  fotoInfoTexto:   { fontSize: '12px', color: '#A3A3A3', margin: '0 0 8px 0' },
  botonesRow:      { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '16px' },
  btnCrear:        { color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnRegresar:     { color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '14px 60px', fontSize: '14px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
};