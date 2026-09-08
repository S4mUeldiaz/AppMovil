import { ApiDelivery } from './ApiDelivery';

export interface RegistroPayload {
  numero_documento: string;
  id_tipo_documento: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  password: string;
  id_rol: number;
}

export async function registrar(datos: RegistroPayload) {
  const { data } = await ApiDelivery.post('/auth/registro', datos);
  return data;
}