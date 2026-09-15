import AsyncStorage from '@react-native-async-storage/async-storage';

const CARRITO_KEY = '@velysh_carrito';

export interface ItemCarrito {
  id_stock: number;
  id_producto: number;
  nombre: string;
  precio: number;
  color: string;
  talla: string;
  imagen: string | null;
  cantidad: number;
}

async function leer(): Promise<ItemCarrito[]> {
  const raw = await AsyncStorage.getItem(CARRITO_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function guardar(items: ItemCarrito[]): Promise<ItemCarrito[]> {
  await AsyncStorage.setItem(CARRITO_KEY, JSON.stringify(items));
  return items;
}

export async function obtenerCarrito(): Promise<ItemCarrito[]> {
  return leer();
}

export async function agregarItem(
  item: Omit<ItemCarrito, 'cantidad'>,
  cantidad: number = 1
): Promise<ItemCarrito[]> {
  const items = await leer();
  const existente = items.find((i) => i.id_stock === item.id_stock);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    items.push({ ...item, cantidad });
  }
  return guardar(items);
}

export async function actualizarCantidad(id_stock: number, cantidad: number): Promise<ItemCarrito[]> {
  let items = await leer();
  if (cantidad <= 0) {
    items = items.filter((i) => i.id_stock !== id_stock);
  } else {
    items = items.map((i) => (i.id_stock === id_stock ? { ...i, cantidad } : i));
  }
  return guardar(items);
}

export async function eliminarItem(id_stock: number): Promise<ItemCarrito[]> {
  const items = (await leer()).filter((i) => i.id_stock !== id_stock);
  return guardar(items);
}

export async function vaciarCarrito(): Promise<void> {
  await AsyncStorage.removeItem(CARRITO_KEY);
}
