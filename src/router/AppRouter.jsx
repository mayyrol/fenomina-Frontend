import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import UsuariosPage from '../features/auth/pages/usuarios/UsuariosPage';
import CrearUsuarioPage from '../features/auth/pages/usuarios/CrearUsuarioPage';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import EmpresasPage from '../features/auth/pages/empresas/EmpresasPage';
import EmpresasModuloOpUno from '../features/auth/pages/empresas/EmpresasModuloOpUno';
import EmpresasModuloOpDos from '../features/auth/pages/empresas/EmpresasModuloOpDos';
import EmpresasModuloOpTres from '../features/auth/pages/empresas/EmpresasModuloOpTres';
import CrearEmpresaPage from '../features/auth/pages/empresas/CrearEmpresaPage';
import InfoEmpresaPage from '../features/auth/pages/empresas/InfoEmpresaPage';
import EditarEmpresaPage from '../features/auth/pages/empresas/EditarEmpresaPage';
import EmpleadosEmpresaPage from '../features/auth/pages/empresas/EmpleadosEmpresaPage';




export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute rolesPermitidos={['SUPER_ADMIN']} />}>
          <Route element={<MainLayout />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/usuarios/crear" element={<CrearUsuarioPage />} />
            <Route path="/empresas" element={<EmpresasPage />} />
            <Route path="/empresas/crear" element={<CrearEmpresaPage />} />
            <Route path="/empresas/:id" element={<EmpresasModuloOpUno />} />
            <Route path="/empresas/:id/modulo-uno" element={<EmpresasModuloOpUno />} />
            <Route path="/empresas/:id/modulo-dos" element={<EmpresasModuloOpDos />} />
            <Route path="/empresas/:id/modulo-tres" element={<EmpresasModuloOpTres />} />
            <Route path="/empresas/:id/info" element={<InfoEmpresaPage />} />
            <Route path="/empresas/:id/info/editar" element={<EditarEmpresaPage />} />
            <Route path="/empresas/:id/empleados" element={<EmpleadosEmpresaPage />} />
          </Route>
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}