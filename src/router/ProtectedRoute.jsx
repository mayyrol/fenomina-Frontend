import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ rolesPermitidos }) {
  const { accessToken, refreshToken, usuario } = useAuthStore();

  if (!accessToken && !refreshToken) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario?.rolUsuario)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <Outlet />;
}