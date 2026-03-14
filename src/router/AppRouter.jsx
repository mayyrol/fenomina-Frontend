import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import UsuariosPage from '../features/auth/pages/usuarios/UsuariosPage';
import CrearUsuarioPage from '../features/auth/pages/usuarios/CrearUsuarioPage';
import VerUsuarioPage from '../features/auth/pages/usuarios/VerUsuarioPage';
import EditarUsuarioPage from '../features/auth/pages/usuarios/EditarUsuarioPage';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute rolesPermitidos={['SUPER_ADMIN']} />}>
          <Route element={<MainLayout />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/usuarios/crear" element={<CrearUsuarioPage />} />
            <Route path="/usuarios/:id" element={<VerUsuarioPage />} />
            <Route path="/usuarios/:id/editar" element={<EditarUsuarioPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}