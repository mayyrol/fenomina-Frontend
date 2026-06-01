import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore'; 

export function useImagenAutenticada(rutaRelativa) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!rutaRelativa) {
      setSrc(null);
      return;
    }

    const url = `${import.meta.env.VITE_GATEWAY_URL}/api/master/files/logos/${rutaRelativa}`;
    const token = useAuthStore.getState().accessToken;

    let objectUrl = null;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar la imagen');
        return res.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(null));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [rutaRelativa]);

  return src;
}