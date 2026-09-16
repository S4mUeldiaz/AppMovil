import { ApiDelivery } from './ApiDelivery';

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  descripcion: string;
  estado: string;
  orden: number;
}

export interface ImagenProducto {
  url_imagen: string;
  orden: number;
}

export interface Producto {
  id_producto: number;
  id_categoria: number;
  referencia: string;
  nombre: string;
  descripcion: string;
  marca: string;
  precio: number;
  genero: 'hombre' | 'mujer' | 'unisex';
  estado: string;
  total_ventas: number;
  fecha_creacion?: string;
  categorias?: { nombre_categoria: string };
  imagenes_producto?: ImagenProducto[];
}

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await ApiDelivery.get('/productos/categoria');
  return data;
}

export async function getProductos(): Promise<Producto[]> {
  const { data } = await ApiDelivery.get('/productos');
  return data;
}

export async function getProductoPorId(id: number) {
  const { data } = await ApiDelivery.get(`/productos/${id}`);
  return data;
}