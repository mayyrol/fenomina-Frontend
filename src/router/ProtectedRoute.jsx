import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function ProtectedRoute({ rolesPermitidos }) {
  const { accessToken, refreshToken, usuario, setTokens } = useAuthStore();
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const verificarAutenticacion = async () => {
      if (accessToken) {
        if (rolesPermitidos && !rolesPermitidos.includes(usuario?.rolUsuario)) {
          setAutorizado(false);
        } else {
          setAutorizado(true);
        }
        setVerificando(false);
        return;
      }

      if (!accessToken && refreshToken) {
        try {
          const { data } = await axiosInstance.post('/auth/refresh', {
            refreshToken,
          });

          setTokens(data.accessToken, data.refreshToken, data.expiresIn);

          if (rolesPermitidos && !rolesPermitidos.includes(data.usuario?.rolUsuario)) {
            setAutorizado(false);
          } else {
            setAutorizado(true);
          }
        } catch (error) {
          console.error('Error al renovar token:', error);
          setAutorizado(false);
        }
      } else {
        setAutorizado(false);
      }

      setVerificando(false);
    };

    verificarAutenticacion();
  }, [accessToken, refreshToken, rolesPermitidos, usuario, setTokens]);

  if (verificando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#A3A3A3'
      }}>
        Verificando autenticación...
      </div>
    );
  }

  if (!autorizado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}