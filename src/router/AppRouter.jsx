// --- TODOS LOS IMPORTS ARRIBA ---
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoginPage from '../features/auth/pages/LoginPage';
import UsuariosPage from '../features/auth/pages/usuarios/UsuariosPage';
import CrearUsuarioPage from '../features/auth/pages/usuarios/CrearUsuarioPage';
import VerUsuarioPage from '../features/auth/pages/usuarios/VerUsuarioPage';
import EditarUsuarioPage from '../features/auth/pages/usuarios/EditarUsuarioPage';
import InicioPage from '../features/inicio/pages/InicioPage';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import EmpresasPage from '../features/auth/pages/empresas/EmpresasPage';
import EmpresaModulosPage from '../features/auth/pages/empresas/EmpresaModulosPage';
import CrearEmpresaPage from '../features/auth/pages/empresas/CrearEmpresaPage';
import InfoEmpresaPage from '../features/auth/pages/empresas/InfoEmpresaPage';
import EditarEmpresaPage from '../features/auth/pages/empresas/EditarEmpresaPage';
import EmpleadosEmpresaPage from '../features/auth/pages/empresas/empleados/EmpleadosEmpresaPage';
import CrearEmpleadoPage from '../features/auth/pages/empresas/empleados/CrearEmpleadoPage';
import VerEmpleadoPage from '../features/auth/pages/empresas/empleados/VerEmpleadoPage';
import EditarEmpleadoPage from '../features/auth/pages/empresas/empleados/EditarEmpleadoPage';
import NominasPage from '../features/auth/pages/empresas/nominas/NominasPage';
import NovedadesPage from '../features/auth/pages/empresas/nominas/NovedadesPage';
import DesprendiblesNominaPage from '../features/auth/pages/empresas/nominas/DesprendiblesNominaPage';
import ParametrosGeneralesPage from '../features/auth/pages/parametros/ParametrosGeneralesPage';
import LiquidarNominaPage from '../features/auth/pages/empresas/nominas/LiquidarNominaPage';
import ResultadoLiquidacionPage from '../features/auth/pages/empresas/nominas/ResultadoLiquidacionPage';
import GenerarReportePage from "../features/auth/pages/empresas/nominas/GenerarReportePage";

import PrimasPage from "../features/auth/pages/empresas/primas/PrimasPage";
import GenerarReportePrimasPage from "../features/auth/pages/empresas/primas/GenerarReportePrimasPage";
import VerPrimaPage from "../features/auth/pages/empresas/primas/VerPrimaPage";
import DesprendiblesPrimaPage from "../features/auth/pages/empresas/primas/DesprendiblesPrimaPage";
import LiquidarPrimaPage from "../features/auth/pages/empresas/primas/LiquidarPrimaPage";
import ResultadoPrimaPage from "../features/auth/pages/empresas/primas/ResultadoPrimaPage";

import CesantiasPage from "../features/auth/pages/empresas/cesantias/CesantiasPage";
import GenerarReporteCesantiasPage from "../features/auth/pages/empresas/cesantias/GenerarReporteCesantiasPage";
import VerCesantiaPage from "../features/auth/pages/empresas/cesantias/VerCesantiaPage";
import DesprendiblesCesantiasPage from "../features/auth/pages/empresas/cesantias/DesprendiblesCesantiasPage";
import LiquidarCesantiasPage from "../features/auth/pages/empresas/cesantias/LiquidarCesantiasPage";
import ResultadoCesantiasPage from "../features/auth/pages/empresas/cesantias/ResultadoCesantiasPage";

// NUEVOS IMPORTS
import ReportesPage from "../features/auth/pages/empresas/reportes/ReportesPage";
import ProvisionesPage from "../features/auth/pages/empresas/reportes/ProvisionesPage";
import ReportesEmpleadosPage from "../features/auth/pages/empresas/reportes/empleados/ReportesEmpleadosPage";
import ReportesNominasPage from "../features/auth/pages/empresas/reportes/empleados/ReportesNominasPage";
import ReportesPrimasPage from "../features/auth/pages/empresas/reportes/empleados/ReportesPrimasPage";
import ReportesCesantiasPage from "../features/auth/pages/empresas/reportes/empleados/ReportesCesantiasPage";
import ReportesConceptosPage from "../features/auth/pages/empresas/reportes/empleados/ReportesConceptosPage";
import ReportesRetencionPage from "../features/auth/pages/empresas/reportes/empleados/ReportesRetencionPage";
import LogsPage from '../features/auth/pages/LogsPage';

function RutaRaiz() {
  const { accessToken } = useAuthStore();
  return accessToken ? <Navigate to="/inicio" replace /> : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RutaRaiz />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute rolesPermitidos={['SUPER_ADMIN', 'RRHH', 'AUDITOR', 'CLIENTE_EMPRESA']} />}>
          <Route element={<MainLayout />}>

            <Route path="/inicio" element={<InicioPage />} />

            {/* Solo SUPER_ADMIN */}
            <Route element={<ProtectedRoute rolesPermitidos={['SUPER_ADMIN']} />}>
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/usuarios/crear" element={<CrearUsuarioPage />} />
              <Route path="/usuarios/:id" element={<VerUsuarioPage />} />
              <Route path="/usuarios/:id/editar" element={<EditarUsuarioPage />} />
              {/* Parámetros */}
              <Route path="/parametros" element={<ParametrosGeneralesPage />} />
            </Route>

            {/* Empresas */}
            <Route path="/empresas" element={<EmpresasPage />} />
            <Route path="/empresas/crear" element={<CrearEmpresaPage />} />
            <Route path="/empresas/:id" element={<EmpresaModulosPage />} />
            <Route path="/empresas/:id/info" element={<InfoEmpresaPage />} />
            <Route path="/empresas/:id/info/editar" element={<EditarEmpresaPage />} />

            {/* Empleados */}
            <Route path="/empresas/:id/empleados" element={<EmpleadosEmpresaPage />} />
            <Route path="/empresas/:id/empleados/crear" element={<CrearEmpleadoPage />} />
            <Route path="/empresas/:id/empleados/:empleadoId" element={<VerEmpleadoPage />} />
            <Route path="/empresas/:id/empleados/:empleadoId/editar" element={<EditarEmpleadoPage />} />

            {/* Nóminas */}
            <Route path="/empresas/:id/nominas" element={<NominasPage />} />
            <Route path="/empresas/:id/nominas/:nominaId/novedades" element={<NovedadesPage />} />
            <Route path="/empresas/:id/nominas/:nominaId/desprendibles" element={<DesprendiblesNominaPage />} />
            <Route path="/empresas/:id/nominas/:nominaId/liquidar" element={<LiquidarNominaPage />} />
            <Route path="/empresas/:id/nominas/:nominaId/resultado" element={<ResultadoLiquidacionPage />} />
            <Route path="/empresas/:id/nominas/generar-reporte" element={<GenerarReportePage />} />

            {/* Primas */}
            <Route path="/empresas/:id/primas" element={<PrimasPage />} />
            <Route path="/empresas/:id/primas/generar-reporte" element={<GenerarReportePrimasPage />} />
            <Route path="/empresas/:id/primas/ver-prima/:empleadoId" element={<VerPrimaPage />} />
            <Route path="/empresas/:id/primas/:primaId/desprendibles" element={<DesprendiblesPrimaPage />} />
            <Route path="/empresas/:id/primas/:primaId/liquidar" element={<LiquidarPrimaPage />} />
            <Route path="/empresas/:id/primas/:primaId/resultado" element={<ResultadoPrimaPage />} />

            {/* Cesantías */}
            <Route path="/empresas/:id/cesantias" element={<CesantiasPage />} />
            <Route path="/empresas/:id/cesantias/generar-reporte" element={<GenerarReporteCesantiasPage />} />
            <Route path="/empresas/:id/cesantias/ver-cesantia/:empleadoId" element={<VerCesantiaPage />} />
            <Route path="/empresas/:id/cesantias/:cesantiaId/desprendibles" element={<DesprendiblesCesantiasPage />} />
            <Route path="/empresas/:id/cesantias/:cesantiaId/liquidar" element={<LiquidarCesantiasPage />} />
            <Route path="/empresas/:id/cesantias/:cesantiaId/resultado" element={<ResultadoCesantiasPage />} />

            {/* Reportes */}
            <Route path="/empresas/:id/reportes" element={<ReportesPage />} />
            <Route path="/empresas/:id/reportes/provisiones" element={<ProvisionesPage />} />
            <Route path="/empresas/:id/reportes/empleados" element={<ReportesEmpleadosPage />} />
            <Route path="/empresas/:id/reportes/empleados/nominas" element={<ReportesNominasPage />} />
            <Route path="/empresas/:id/reportes/empleados/primas" element={<ReportesPrimasPage />} />
            <Route path="/empresas/:id/reportes/empleados/cesantias" element={<ReportesCesantiasPage />} />
            <Route path="/empresas/:id/reportes/empleados/conceptos" element={<ReportesConceptosPage />} />
            <Route path="/empresas/:id/reportes/empleados/retencion" element={<ReportesRetencionPage />} />

            {/* Logs */}
            <Route path="/logs" element={<LogsPage />} />

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}