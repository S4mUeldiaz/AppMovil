import { useMemo } from 'react';
import { Producto, Categoria } from '../../Data/sources/remote/api/ProductosApi';
import { obtenerImagenPrincipal } from '../utils/imagenes';

export type CategoriaConImagen = { categoria: Categoria; imagen: string };

export type ListItemConBanner =
  | { tipo: 'producto'; producto: Producto }
  | { tipo: 'bannerCategoria'; id: string; categoria: Categoria; imagen: string }
  | { tipo: 'spacer'; id: string };

// Intervalo (en cantidad de productos) entre banners — 10, 8, 12 en ciclo,
// siempre dentro del rango 8-12, sin aleatoriedad para que el layout no
// "salte" entre renders.
const INTERVALOS_BANNER = [10, 8, 12];

// Categorías elegibles para banners: cualquiera con al menos un producto que
// tenga imagen real. Se deriva de los datos ya cargados (nada hardcodeado).
export function useCategoriasConImagen(categorias: Categoria[], productos: Producto[]): CategoriaConImagen[] {
  return useMemo(() => {
    return categorias
      .map((categoria) => {
        const productoConImagen = productos.find(
          (p) => p.id_categoria === categoria.id_categoria && obtenerImagenPrincipal(p.imagenes_producto)
        );
        const imagen = productoConImagen ? obtenerImagenPrincipal(productoConImagen.imagenes_producto) : null;
        return imagen ? { categoria, imagen } : null;
      })
      .filter((item): item is CategoriaConImagen => item !== null);
  }, [categorias, productos]);
}

// Intercala banners de ancho completo en un grid de 2 columnas: cada banner se
// inserta junto a un "spacer" (que ocupa el 2º slot de esa fila en un FlatList
// numColumns=2), y el par solo se agrega al cerrar una fila de 2 productos.
export function useProductosConBanners(
  productos: Producto[],
  categoriasConImagen: CategoriaConImagen[]
): ListItemConBanner[] {
  return useMemo(() => {
    const resultado: ListItemConBanner[] = [];
    let totalProductos = 0;
    let productosDesdeBanner = 0;
    let intervaloIdx = 0;

    productos.forEach((producto) => {
      resultado.push({ tipo: 'producto', producto });
      totalProductos++;
      productosDesdeBanner++;

      const filaCompleta = totalProductos % 2 === 0;
      const umbral = INTERVALOS_BANNER[intervaloIdx % INTERVALOS_BANNER.length];
      if (filaCompleta && productosDesdeBanner >= umbral && categoriasConImagen.length > 0) {
        const { categoria, imagen } = categoriasConImagen[intervaloIdx % categoriasConImagen.length];
        resultado.push({ tipo: 'bannerCategoria', id: `banner-${resultado.length}`, categoria, imagen });
        resultado.push({ tipo: 'spacer', id: `spacer-${resultado.length}` });
        productosDesdeBanner = 0;
        intervaloIdx++;
      }
    });

    return resultado;
  }, [productos, categoriasConImagen]);
}
