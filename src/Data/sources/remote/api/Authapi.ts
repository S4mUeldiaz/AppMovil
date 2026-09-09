import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiDelivery } from './ApiDelivery';

const TOKEN_KEY = '@velysh_token';
const USUARIO_KEY = '@velysh_usuario';

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

export interface UsuarioSesion {
  numero_documento: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  estado: string;
  roles?: { nombre_rol: string };
  nombre_rol?: string;
}

interface LoginResponse {
  usuario: UsuarioSesion;
  token: string;
}

export async function registrar(datos: RegistroPayload) {
  const { data } = await ApiDelivery.post('/auth/registro', datos);
  return data;
}

export async function login(correo: string, password: string): Promise<UsuarioSesion> {
  const { data } = await ApiDelivery.post<LoginResponse>('/auth/login', { correo, password });

  const usuario: UsuarioSesion = {
    ...data.usuario,
    nombre_rol: data.usuario.roles?.nombre_rol ?? '',
  };

  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  await AsyncStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));

  return usuario;
}

export async function logout() {
  try {
    await ApiDelivery.post('/auth/logout');
  } catch {
  }
  await AsyncStorage.multiRemove([TOKEN_KEY, USUARIO_KEY]);
}

export async function obtenerToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function obtenerUsuarioActual(): Promise<UsuarioSesion | null> {
  const raw = await AsyncStorage.getItem(USUARIO_KEY);
  return raw ? JSON.parse(raw) : null;
}