import { ApiDelivery } from './ApiDelivery';
import { obtenerToken } from './Authapi';
import { ImagenProducto } from './ProductosApi';

export interface FavoritoProducto {
  id_producto: number;
  nombre: string;
  precio: number;
  referencia: string;
  imagenes_producto?: ImagenProducto[];
}

export interface Favorito {
  id_favorito: number;
  fecha_agregado: string;
  productos: FavoritoProducto;
}

async function authHeaders() {
  const token = await obtenerToken();
  return { Authorization: `Bearer ${token}` };
}

export async function getFavoritos(numero_documento: string): Promise<Favorito[]> {
  const { data } = await ApiDelivery.get(`/favoritos/${numero_documento}`, {
    headers: await authHeaders(),
  });
  return data;
}

export async function agregarFavorito(numero_documento: string, id_producto: number) {
  const { data } = await ApiDelivery.post(
    '/favoritos',
    { numero_documento, id_producto },
    { headers: await authHeaders() }
  );
  return data;
}

export async function eliminarFavorito(numero_documento: string, id_producto: number) {
  const { data } = await ApiDelivery.delete(`/favoritos/${numero_documento}/${id_producto}`, {
    headers: await authHeaders(),
  });
  return data;
}