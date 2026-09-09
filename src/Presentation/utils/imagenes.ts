import { ImagenProducto } from '../../Data/sources/remote/api/ProductosApi';

export function obtenerImagenPrincipal(imagenes?: ImagenProducto[]): string | null {
  if (!imagenes || imagenes.length === 0) return null;
  const ordenadas = [...imagenes].sort((a, b) => a.orden - b.orden);
  return ordenadas[0].url_imagen;
}