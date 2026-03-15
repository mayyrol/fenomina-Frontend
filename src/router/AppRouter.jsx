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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RutaRaiz />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas — todos los roles */}
        <Route element={<ProtectedRoute rolesPermitidos={['SUPER_ADMIN', 'RRHH', 'AUDITOR', 'CLIENTE_EMPRESA']} />}>
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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}