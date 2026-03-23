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

function RutaRaiz() {
  const { accessToken } = useAuthStore();
  return accessToken ? <Navigate to="/inicio" replace /> : <Navigate to="/login" replace />;
}
import EmpresasPage from '../features/auth/pages/empresas/EmpresasPage';
import EmpresasModuloOpUno from '../features/auth/pages/empresas/EmpresasModuloOpUno';
import EmpresasModuloOpDos from '../features/auth/pages/empresas/EmpresasModuloOpDos';
import EmpresasModuloOpTres from '../features/auth/pages/empresas/EmpresasModuloOpTres';
import CrearEmpresaPage from '../features/auth/pages/empresas/CrearEmpresaPage';
import InfoEmpresaPage from '../features/auth/pages/empresas/InfoEmpresaPage';
import EditarEmpresaPage from '../features/auth/pages/empresas/EditarEmpresaPage';
import EmpleadosEmpresaPage from '../features/auth/pages/empresas/empleados/EmpleadosEmpresaPage';
import CrearEmpleadoPage from '../features/auth/pages/empresas/empleados/CrearEmpleadoPage';
import VerEmpleadoPage from '../features/auth/pages/empresas/empleados/VerEmpleadoPage';
import EditarEmpleadoPage from '../features/auth/pages/empresas/empleados/EditarEmpleadoPage';
import NominasPage from '../features/auth/pages/empresas/nominas/NominasPage';
import LiquidarNominasPage from '../features/auth/pages/empresas/nominas/LiquidarNominasPage';
import ReporteLiquidacionPage from '../features/auth/pages/empresas/nominas/ReporteLiquidacionPage';
import NovedadesPage from '../features/auth/pages/empresas/nominas/NovedadesPage';
import GenerarReportePage from '../features/auth/pages/empresas/nominas/GenerarReportePage';
import DesprendiblesPage from '../features/auth/pages/empresas/nominas/DesprendiblesPage';


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RutaRaiz />} />
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas — todos los roles */}
        <Route element={<ProtectedRoute rolesPermitidos={['SUPER_ADMIN', 'RRHH', 'AUDITOR', 'CLIENTE_EMPRESA']} />}>

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute rolesPermitidos={['SUPER_ADMIN']} />}>
          <Route element={<MainLayout />}>
            <Route path="/inicio" element={<InicioPage />} />

            {/* Solo SUPER_ADMIN */}
            <Route element={<ProtectedRoute rolesPermitidos={['SUPER_ADMIN']} />}>
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/usuarios/crear" element={<CrearUsuarioPage />} />
              <Route path="/usuarios/:id" element={<VerUsuarioPage />} />
              <Route path="/usuarios/:id/editar" element={<EditarUsuarioPage />} />
            </Route>
          </Route>
        </Route>


            {/* Usuarios */}
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/usuarios/crear" element={<CrearUsuarioPage />} />

            {/* Empresas */}
            <Route path="/empresas" element={<EmpresasPage />} />
            <Route path="/empresas/crear" element={<CrearEmpresaPage />} />
            <Route path="/empresas/:id" element={<EmpresasModuloOpUno />} />
            <Route path="/empresas/:id/modulo-uno" element={<EmpresasModuloOpUno />} />
            <Route path="/empresas/:id/modulo-dos" element={<EmpresasModuloOpDos />} />
            <Route path="/empresas/:id/modulo-tres" element={<EmpresasModuloOpTres />} />
            
            {/* Información y edición empresa */}
            <Route path="/empresas/:id/info" element={<InfoEmpresaPage />} />
            <Route path="/empresas/:id/info/editar" element={<EditarEmpresaPage />} />

            {/* Empleados */}
            <Route path="/empresas/:id/empleados" element={<EmpleadosEmpresaPage />} />
            <Route path="/empresas/:id/empleados/crear" element={<CrearEmpleadoPage />} />
            <Route path="/empresas/:id/empleados/:empleadoId" element={<VerEmpleadoPage />} />
            <Route path="/empresas/:id/empleados/:empleadoId/editar" element={<EditarEmpleadoPage />} />

            {/* Nóminas */}
            <Route path="/empresas/:id/nominas" element={<NominasPage />} />
            <Route path="/empresas/:id/nominas/liquidar" element={<LiquidarNominasPage />} />
            <Route path="/empresas/:id/nominas/reporte" element={<ReporteLiquidacionPage />} />
            <Route path="/empresas/:id/nominas/:nominaId/novedades" element={<NovedadesPage />} />
            <Route path="/empresas/:id/nominas/generar-reporte" element={<GenerarReportePage />} />
            <Route path="/empresas/:id/nominas/desprendibles" element={<DesprendiblesPage />} />



          </Route>
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}