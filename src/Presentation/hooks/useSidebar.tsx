import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerUsuarioActual, logout, UsuarioSesion } from '../../Data/sources/remote/api/Authapi';

export function useSidebar() {
  const [abierto, setAbierto] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      obtenerUsuarioActual().then((u) => {
        if (activo) setUsuario(u);
      });
      return () => {
        activo = false;
      };
    }, [])
  );

  const abrir = () => setAbierto(true);
  const cerrar = () => setAbierto(false);

  const cerrarSesion = async () => {
    await logout();
    setUsuario(null);
  };

  return { abierto, abrir, cerrar, usuario, setUsuario, cerrarSesion };
}
