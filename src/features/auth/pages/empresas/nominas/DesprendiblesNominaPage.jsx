import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/authStore';
import { useNominaStore } from '../../../../../store/useNominaStore';
import payrollService from '../../../../../services/payrollService';
import payrollAxios from '../../../../../api/payrollAxiosInstance';
import masterAxios from '../../../../../api/masterAxiosInstance';
import {
  FileText, ChevronLeft, UserRound, Search,
  Plus, Pencil, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import ConfirmarCambiosModal from '../../../../../components/ConfirmarCambiosModal';
import MensajeModal from '../../../../../components/MensajeModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const formatMiles = (valor) => {
  const str = String(Math.round(valor));
  return '$' + str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function DesprendiblesNominaPage() {
  const navigate         = useNavigate();
  const { id, nominaId } = useParams();
  const { usuario }      = useAuthStore();

  const nombre = `${usuario?.nombresUsuario ?? ''} ${usuario?.apellidosUsuario ?? ''}`.trim();
  const cargo  = usuario?.cargoUsuario ?? '';

  const [proceso,      setProceso]      = useState(null);
  const [empresa,      setEmpresa]      = useState(null);
  const [empleados,    setEmpleados]    = useState([]);
  const [novedades,    setNovedades]    = useState({});
  const [cargando,     setCargando]     = useState(false);
  const [busqueda,     setBusqueda]     = useState('');
  const [expandidos,   setExpandidos]   = useState({});
  const [modal,        setModal]        = useState(null);
  const [novedadEliminar,          setNovedadEliminar]          = useState(null);
  const [confirmarEliminarNovedad, setConfirmarEliminarNovedad] = useState(false);
  const [confirmarCerrar,          setConfirmarCerrar]          = useState(false);
  const [confirmarAnular,          setConfirmarAnular]          = useState(false);
  const [confirmarEliminar,        setConfirmarEliminar]        = useState(false);
  const [hoverCerrar,   setHoverCerrar]   = useState(false);
  const [hoverAnular,   setHoverAnular]   = useState(false);
  const [hoverEliminar, setHoverEliminar] = useState(false);
  const [hoverPDF,      setHoverPDF]      = useState(false);
  const [descargando,   setDescargando]   = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    if (!nominaId || !id) return;
    setCargando(true);

    Promise.all([
      payrollService.getProcesos(id),
      payrollService.getEmpleadosActivos(id),
      masterAxios.get(`/api/master/empresas/${id}`),
    ])
      .then(([{ data: procesos }, { data: emps }, { data: emp }]) => {
        const encontrado = procesos.find(
          p => String(p.procesoLiquiId) === String(nominaId)
        );
        setProceso(encontrado ?? null);
        setEmpresa(emp);

        const seleccionados = useNominaStore.getState().empleadosSeleccionados;
        const empsAMostrar  = emps.filter(e =>
          seleccionados.includes(e.empleadoId)
        );
        setEmpleados(empsAMostrar);

        return Promise.all(
          empsAMostrar.map(e =>
            payrollAxios
              .get(`/api/payroll/novedades/proceso/${nominaId}/empleado/${e.empleadoId}`)
              .then(({ data }) => ({ empleadoId: e.empleadoId, data }))
              .catch(() => ({ empleadoId: e.empleadoId, data: [] }))
          )
        );
      })
      .then((resultados) => {
        const mapa = {};
        resultados.forEach(({ empleadoId, data }) => {
          mapa[empleadoId] = data;
        });
        setNovedades(mapa);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [nominaId, id]);

  const toggleExpandido = (empId) =>
    setExpandidos(prev => ({ ...prev, [empId]: !prev[empId] }));

  const handleEliminarNovedad = (empId, novedadId) => {
    setNovedadEliminar({ empId, novedadId });
    setConfirmarEliminarNovedad(true);
  };

  const handleConfirmarEliminarNovedad = async () => {
    try {
      await payrollAxios.delete(`/api/payroll/novedades/${novedadEliminar.novedadId}`);
      setNovedades(prev => ({
        ...prev,
        [novedadEliminar.empId]: prev[novedadEliminar.empId]
          .filter(n => n.novedadId !== novedadEliminar.novedadId),
      }));
      setConfirmarEliminarNovedad(false);
      setModal('exito');
    } catch {
      setConfirmarEliminarNovedad(false);
      setModal('error');
    }
  };

  const handleEditarDias = (empId) =>
    navigate(`/empresas/${id}/nominas/${nominaId}/novedades?empleado=${empId}&tipo=dias`);

  const handleEditarNovedad = (empId, novId) =>
    navigate(`/empresas/${id}/nominas/${nominaId}/novedades?empleado=${empId}&novedad=${novId}`);

  const handleAgregarNovedad = (empId) =>
    navigate(`/empresas/${id}/nominas/${nominaId}/novedades?empleado=${empId}`);

  const empleadosFiltrados = empleados.filter(e =>
    `${e.nombresEmp} ${e.apellidosEmp}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.documentoEmp.includes(busqueda)
  );

  const handleDescargarExcel = () => {
    setDescargando(true);

    const filas = empleados.flatMap(emp => {
      const novsEmp = novedades[emp.empleadoId] ?? [];
      const dias = useNominaStore.getState().diasLaborados[emp.empleadoId] ?? 30;

      if (novsEmp.length === 0) {
        return [{
          'Nombre': `${emp.nombresEmp} ${emp.apellidosEmp}`,
          'Documento': emp.documentoEmp,
          'Cargo': emp.cargoEmp,
          'Salario': emp.salarioBascMensual,
          'Días laborados': dias,
          'Tipo novedad': '-',
          'Detalle': '-',
        }];
      }

      return novsEmp.map(n => ({
        'Nombre': `${emp.nombresEmp} ${emp.apellidosEmp}`,
        'Documento': emp.documentoEmp,
        'Cargo': emp.cargoEmp,
        'Salario': emp.salarioBascMensual,
        'Días laborados': dias,
        'Tipo novedad': n.observaciones ?? n.nombreConcepto ?? `Novedad ${n.novedadId}`,
        'Detalle': n.cantidadDiasNovedad
          ? `${n.cantidadDiasNovedad} días`
          : n.cantidadHorasNovedad
          ? `${n.cantidadHorasNovedad} horas`
          : n.valorRefNovedad
          ? formatMiles(n.valorRefNovedad)
          : '-',
      }));
    });

    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Novedades');
    XLSX.writeFile(wb, `novedades_nomina_${nominaId}.xlsx`);

    setTimeout(() => setDescargando(false), 500);
  };

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#0B662A" />
          <div>
            <h2 style={styles.titulo}>Desprendibles Nómina</h2>
            <p style={styles.subtitulo}>Gestión de novedades del proceso</p>
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

      {/* Info del proceso */}
      <div style={styles.card}>
        <h3 style={styles.cardTitulo}>Desprendibles Nómina</h3>
        {cargando ? (
          <p style={{ color: '#A3A3A3' }}>Cargando información del proceso...</p>
        ) : (
          <div style={styles.infoGrid}>
            <div style={styles.infoFila}>
              <span style={styles.infoLabel}>Nombre Empresa:</span>
              <span style={styles.infoValor}>{empresa?.nombreEmpresa ?? ''}</span>
            </div>
            <div style={styles.infoFila}>
              <span style={styles.infoLabel}>NIT:</span>
              <span style={styles.infoValor}>{empresa?.empresaNit ?? ''}</span>
            </div>
            <div style={styles.infoFila}>
              <span style={styles.infoLabel}>Fecha de generación:</span>
              <span style={styles.infoValor}>{new Date().toLocaleDateString('es-CO')}</span>
            </div>
            <div style={styles.infoFila}>
              <span style={styles.infoLabel}>Periodo:</span>
              <span style={styles.infoValor}>
                {proceso?.fechaInicioPeriodo} - {proceso?.fechaFinPeriodo}
              </span>
            </div>
            <div style={styles.infoFila}>
              <span style={styles.infoLabel}>Estado proceso:</span>
              <span style={styles.infoValor}>{proceso?.estadoProcNomina ?? ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* Buscador */}
      <div style={styles.searchCard}>
        <div style={styles.searchBox}>
          <Search size={14} color="#A3A3A3" />
          <input
            style={styles.searchInput}
            placeholder="Buscar empleado por nombre o documento"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Cards empleados */}
      <div style={styles.empleadosBox}>
        {cargando ? (
          <p style={{ textAlign: 'center', color: '#A3A3A3' }}>Cargando empleados...</p>
        ) : empleadosFiltrados.map((emp) => {
          const expandido = expandidos[emp.empleadoId] ?? true;
          const novsEmp   = novedades[emp.empleadoId] ?? [];
          const dias      = useNominaStore.getState().diasLaborados[emp.empleadoId] ?? 30;

          return (
            <div key={emp.empleadoId} style={styles.empCard}>
              <div style={styles.empHeader}>
                <div>
                  <span style={styles.empNombre}>
                    {emp.nombresEmp} {emp.apellidosEmp}
                  </span>
                  <span style={styles.empDoc}> ({emp.documentoEmp})</span>
                </div>
                <button style={styles.iconBtn} onClick={() => toggleExpandido(emp.empleadoId)}>
                  {expandido
                    ? <ChevronUp size={16} color="#A3A3A3" />
                    : <ChevronDown size={16} color="#A3A3A3" />}
                </button>
              </div>

              {expandido && (
                <>
                  <div style={styles.empInfo}>
                    <span style={styles.empDetalle}>Cargo: {emp.cargoEmp}</span>
                    <span style={styles.empSeparador}>|</span>
                    <span style={styles.empDetalle}>
                      Salario: {formatMiles(emp.salarioBascMensual)}
                    </span>
                  </div>

                  <div style={styles.diasRow}>
                    <span style={styles.empDetalle}>
                      Días laborados: <strong>{dias}</strong>
                    </span>
                    <button
                      style={styles.btnIconoVerde}
                      onClick={() => handleEditarDias(emp.empleadoId)}
                      title="Editar días laborados"
                    >
                      <Pencil size={13} color="#0B662A" />
                    </button>
                  </div>

                  <div style={styles.novedadesBox}>
                    <p style={styles.novedadesTitulo}>
                      Novedades registradas ({novsEmp.length})
                    </p>
                    {novsEmp.length === 0 ? (
                      <p style={styles.sinNovedades}>No hay novedades registradas</p>
                    ) : (
                      novsEmp.map((nov) => (
                        <div key={nov.novedadId} style={styles.novedadFila}>
                          <div style={{ flex: 1 }}>
                            <p style={styles.novedadTipo}>
                              ✓ {nov.observaciones ?? nov.nombreConcepto ?? `Novedad ${nov.novedadId}`}
                            </p>
                            <p style={styles.novedadDetalle}>
                              {nov.cantidadDiasNovedad
                                ? `${nov.cantidadDiasNovedad} días`
                                : nov.cantidadHorasNovedad
                                ? `${nov.cantidadHorasNovedad} horas`
                                : nov.valorRefNovedad
                                ? formatMiles(nov.valorRefNovedad)
                                : ''}
                              {nov.fechaInicioAusen && nov.fechaFinAusen
                                ? ` — Del ${nov.fechaInicioAusen} al ${nov.fechaFinAusen}`
                                : ''}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              style={styles.btnAccionNovedad}
                              onClick={() => handleEditarNovedad(emp.empleadoId, nov.novedadId)}
                            >
                              Editar
                            </button>
                            <button
                              style={{ ...styles.btnAccionNovedad, ...styles.btnEliminarNovedad }}
                              onClick={() => handleEliminarNovedad(emp.empleadoId, nov.novedadId)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    style={styles.btnAgregarNovedad}
                    onClick={() => handleAgregarNovedad(emp.empleadoId)}
                  >
                    <Plus size={13} color="#0B662A" />
                    <span>Agregar novedad</span>
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Descargar excel borrador */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <button
          style={{
            ...styles.btnPDF,
            background: hoverPDF
              ? 'linear-gradient(135deg, #0B662A, #1a9e45)'
              : '#0B662A',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverPDF(true)}
          onMouseLeave={() => setHoverPDF(false)}
          onClick={handleDescargarExcel}
        >
          Descargar reporte en Excel
        </button>
      </div>

      {/* Acciones */}
      <div style={styles.accionesBar}>
        <button
          style={{
            ...styles.btnCerrar,
            background: hoverCerrar
              ? 'linear-gradient(135deg, #0B662A, #1a9e45)'
              : '#0B662A',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={() => setHoverCerrar(true)}
          onMouseLeave={() => setHoverCerrar(false)}
          onClick={() => setConfirmarCerrar(true)}
        >
          Cerrar proceso
        </button>
        <button
          style={{
            ...styles.btnAnular,
            transition: 'background 0.3s ease',
            ...(hoverAnular ? { backgroundColor: '#f5f5f5' } : {}),
          }}
          onMouseEnter={() => setHoverAnular(true)}
          onMouseLeave={() => setHoverAnular(false)}
          onClick={() => setConfirmarAnular(true)}
        >
          Anular
        </button>
        <button
          style={{
            ...styles.btnEliminar,
            transition: 'background 0.3s ease',
            ...(hoverEliminar ? { backgroundColor: '#FFF5F5' } : {}),
          }}
          onMouseEnter={() => setHoverEliminar(true)}
          onMouseLeave={() => setHoverEliminar(false)}
          onClick={() => setConfirmarEliminar(true)}
        >
          Eliminar
        </button>
        <button
          style={styles.btnAnular}
          onClick={() => navigate(`/empresas/${id}/nominas`)}
        >
          Cancelar
        </button>
      </div>

      {/* Modales */}
      <ConfirmarCambiosModal
        visible={confirmarEliminarNovedad}
        onCancelar={() => setConfirmarEliminarNovedad(false)}
        onConfirmar={handleConfirmarEliminarNovedad}
        titulo="¿Deseas eliminar esta novedad?"
        descripcion="La novedad será removida del proceso."
      />

      <ConfirmarCambiosModal
        visible={confirmarCerrar}
        onCancelar={() => setConfirmarCerrar(false)}
        onConfirmar={async () => {
          const diasStore = useNominaStore.getState().diasLaborados;

          // Validar días laborados vs días reales del periodo
          const fechaInicioPeriodo = new Date(proceso.fechaInicioPeriodo);
          const fechaFinPeriodo = new Date(proceso.fechaFinPeriodo);
          const diasDelPeriodo = Math.round(
            (fechaFinPeriodo - fechaInicioPeriodo) / (1000 * 60 * 60 * 24)
          ) + 1;

          console.log('diasStore al cerrar:', diasStore);
          console.log('diasDelPeriodo:', diasDelPeriodo);

          for (const emp of empleados) {
            const diasIngresados = diasStore[emp.empleadoId];
            if (!diasIngresados) continue;

            if (Number(diasIngresados) > diasDelPeriodo) {
              setMensajeError(
                `${emp.nombresEmp} ${emp.apellidosEmp} tiene ${diasIngresados} días laborados pero el periodo solo cubre ${diasDelPeriodo} días (${proceso.fechaInicioPeriodo} - ${proceso.fechaFinPeriodo}).`
              );
              setModal('error');
              setConfirmarCerrar(false);
              return;
            }
          }
          // Validar días laborados vs fecha ingreso de cada empleado
  
          for (const emp of empleados) {
            const diasIngresados = diasStore[emp.empleadoId];
            if (!diasIngresados) continue;

            if (emp.fechaIngresoEmp) {
              const fechaIngreso  = new Date(emp.fechaIngresoEmp);
              const fechaInicio   = new Date(proceso.fechaInicioPeriodo);
              const fechaFin      = new Date(proceso.fechaFinPeriodo);

              // Si el empleado ingresó dentro del periodo, calcular días válidos
              if (fechaIngreso > fechaInicio && fechaIngreso <= fechaFin) {
                const diasValidos = Math.round(
                  (fechaFin - fechaIngreso) / (1000 * 60 * 60 * 24)
                ) + 1;

                if (Number(diasIngresados) > diasValidos) {
                  setMensajeError(
                    `${emp.nombresEmp} ${emp.apellidosEmp} ingresó el ${emp.fechaIngresoEmp}. Los días laborados no pueden superar ${diasValidos} días válidos del periodo.`
                  );
                  setModal('error');
                  setConfirmarCerrar(false);
                  return;
                }
              }
            }

            // Validar máximo según tipo de proceso
            const esQuincenal = proceso?.tipoProceso === 'NOMINA_QUINCENAL';
            const maxDias = esQuincenal ? 15 : 30;
            if (Number(diasIngresados) > maxDias) {
              setMensajeError(
                `Un empleado tiene más de ${maxDias} días laborados, que es el máximo para nómina ${esQuincenal ? 'quincenal' : 'mensual'}.`
              );
              setModal('error');
              setConfirmarCerrar(false);
              return;
            }
          }

          try {
            await payrollService.cambiarEstado(nominaId, 'CERRADO');
            setConfirmarCerrar(false);
            navigate(`/empresas/${id}/nominas/${nominaId}/liquidar`);
          } catch {
            setConfirmarCerrar(false);
            setModal('error');
          }
        }}
        titulo="¿Deseas cerrar este proceso de nómina?"
        descripcion="Al cerrar el proceso, el estado cambiará a Cerrado y no podrá editarse."
      />

      <ConfirmarCambiosModal
        visible={confirmarAnular}
        onCancelar={() => setConfirmarAnular(false)}
        onConfirmar={async () => {
          try {
            await payrollService.cambiarEstado(nominaId, 'ANULADO');
            useNominaStore.getState().limpiarProceso();
            setConfirmarAnular(false);
            navigate(-1);
          } catch {
            setConfirmarAnular(false);
            setModal('error');
          }
        }}
        titulo="¿Estás seguro de que deseas anular este proceso?"
        descripcion="Esta acción es irreversible. Una vez anulado, el proceso no podrá volver a un estado activo."
        tipo="error"
      />

      <ConfirmarCambiosModal
        visible={confirmarEliminar}
        onCancelar={() => setConfirmarEliminar(false)}
        onConfirmar={async () => {
          try {
            await payrollService.eliminarProceso(nominaId);
            useNominaStore.getState().limpiarProceso();
            setConfirmarEliminar(false);
            navigate(-1);
          } catch {
            setConfirmarEliminar(false);
            setModal('error');
          }
        }}
        titulo="¿Deseas eliminar este proceso de nómina?"
        descripcion="Esta acción eliminará el proceso y todas sus novedades asociadas."
      />

      <MensajeModal
        tipo={modal}
        mensaje={mensajeError || undefined}
        onClose={() => { setModal(null); setMensajeError(''); }}
      />

      {/* Modal descarga */}
      {descargando && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', padding: '40px 48px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
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
              La descarga tomará unos segundos.
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
  volverBtn:    { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#272525', fontFamily: 'Nunito, sans-serif', padding: 0, width: 'fit-content' },
  card:               { backgroundColor: '#fff', borderRadius: '16px', padding: '28px 32px' },
  cardTitulo:         { fontSize: '16px', fontWeight: '800', color: '#272525', margin: '0 0 20px 0' },
  infoGrid:           { display: 'flex', flexDirection: 'column', gap: '10px' },
  infoFila:           { display: 'flex', gap: '8px', alignItems: 'baseline' },
  infoLabel:          { fontSize: '13px', fontWeight: '700', color: '#272525', whiteSpace: 'nowrap' },
  infoValor:          { fontSize: '13px', color: '#272525' },
  searchCard:         { backgroundColor: '#fff', borderRadius: '12px', padding: '14px 24px', maxWidth: '900px', margin: '0 auto', width: '100%' },
  searchBox:          { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #0B662A', borderRadius: '8px', padding: '8px 14px', backgroundColor: '#fff', width: '100%' },
  searchInput:        { border: 'none', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'Nunito, sans-serif' },
  empleadosBox:       { display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '900px', margin: '0 auto', width: '100%' },
  empCard:            { backgroundColor: '#fff', borderRadius: '12px', padding: '20px 24px', border: '1px solid #F0F0F0' },
  empHeader:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  empNombre:          { fontSize: '14px', fontWeight: '800', color: '#272525' },
  empDoc:             { fontSize: '13px', color: '#A3A3A3', fontWeight: '400' },
  empInfo:            { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
  empDetalle:         { fontSize: '13px', color: '#272525' },
  empSeparador:       { color: '#D0D0D0', fontSize: '13px' },
  diasRow:            { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' },
  novedadesBox:       { backgroundColor: '#FAFAFA', borderRadius: '8px', padding: '14px 16px', marginBottom: '12px', border: '1px solid #F0F0F0' },
  novedadesTitulo:    { fontSize: '12px', fontWeight: '700', color: '#272525', margin: '0 0 10px 0' },
  sinNovedades:       { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  novedadFila:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F0F0F0' },
  novedadTipo:        { fontSize: '12px', fontWeight: '700', color: '#272525', margin: '0 0 2px 0' },
  novedadDetalle:     { fontSize: '12px', color: '#A3A3A3', margin: 0 },
  btnAccionNovedad:   { fontSize: '11px', fontWeight: '700', color: '#0B662A', backgroundColor: '#F0FAF4', border: '1px solid #C3E6CC', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },
  btnEliminarNovedad: { color: '#E53E3E', backgroundColor: '#FFF5F5', border: '1px solid #FEB2B2' },
  btnAgregarNovedad:  { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px dashed #0B662A', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#0B662A', fontFamily: 'Nunito, sans-serif' },
  btnIconoVerde:      { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  iconBtn:            { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' },
  btnPDF:             { color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  accionesBar:        { display: 'flex', gap: '12px', justifyContent: 'center', paddingBottom: '16px', flexWrap: 'wrap' },
  btnCerrar:          { flex: 1, maxWidth: '220px', backgroundColor: '#0B662A', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnAnular:          { flex: 1, maxWidth: '220px', backgroundColor: '#fff', color: '#272525', border: '1px solid #D0D0D0', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
  btnEliminar:        { flex: 1, maxWidth: '220px', backgroundColor: '#fff', color: '#E53E3E', border: '1px solid #E53E3E', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: '700', fontFamily: 'Nunito, sans-serif', cursor: 'pointer' },
};
