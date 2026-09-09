import { ApiDelivery } from './ApiDelivery';

export interface Stock {
  id_stock: number;
  id_producto: number;
  id_talla: number;
  color: string;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  estado: string;
  productos?: { nombre: string; referencia: string; precio: number; id_categoria: number };
  tallas?: { talla: string };
}

export async function getStock(): Promise<Stock[]> {
  const { data } = await ApiDelivery.get('/stock');
  return data;
}

export async function getStockPorProducto(idProducto: number): Promise<Stock[]> {
  const { data } = await ApiDelivery.get(`/stock/producto/${idProducto}`);
  return data;
}