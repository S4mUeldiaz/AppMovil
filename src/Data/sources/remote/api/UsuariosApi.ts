import { ApiDelivery } from './ApiDelivery';
import { obtenerToken } from './Authapi';

export interface ActualizarUsuarioPayload {
  nombre: string;
  apellido: string;
  telefono: string;
}

export interface UsuarioAdmin {
  numero_documento: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  estado: string;
  fecha_registro: string;
  fecha_ultima_actividad: string | null;
  roles?: { nombre_rol: string };
}

export interface CambiarPasswordPayload {
  password_actual: string;
  password_nueva: string;
}

async function authHeaders() {
  const token = await obtenerToken();
  return { Authorization: `Bearer ${token}` };
}

export async function getUsuarios(): Promise<UsuarioAdmin[]> {
  const { data } = await ApiDelivery.get('/usuarios', { headers: await authHeaders() });
  return data;
}

export async function cambiarEstadoUsuario(numero_documento: string, estado: 'activo' | 'inactivo') {
  const { data } = await ApiDelivery.patch(
    `/usuarios/${numero_documento}/estado`,
    { estado },
    { headers: await authHeaders() }
  );
  return data;
}

export async function actualizarUsuario(numero_documento: string, datos: ActualizarUsuarioPayload) {
  const { data } = await ApiDelivery.put(`/usuarios/${numero_documento}`, datos, {
    headers: await authHeaders(),
  });
  return data;
}

export async function cambiarPassword(numero_documento: string, datos: CambiarPasswordPayload) {
  const { data } = await ApiDelivery.patch(`/usuarios/${numero_documento}/password`, datos, {
    headers: await authHeaders(),
  });
  return data;
}

export async function eliminarCuenta(numero_documento: string, password: string) {
  const { data } = await ApiDelivery.delete(`/usuarios/${numero_documento}/cuenta`, {
    headers: await authHeaders(),
    data: { password },
  });
  return data;
}
