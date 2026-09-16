import { ApiDelivery } from './ApiDelivery';
import { obtenerToken } from './Authapi';
import { ImagenProducto } from './ProductosApi';

export interface ItemPedidoPayload {
  id_stock: number;
  cantidad: number;
  precio_unitario: number;
}

export interface CrearPedidoPayload {
  numero_documento: string;
  metodo_pago: 'tarjeta' | 'pse' | 'transferencia' | 'contraentrega';
  costo_envio?: number;
  direccion: string;
  ciudad: string;
  departamento: string;
  codigo_postal: string;
  items: ItemPedidoPayload[];
}

export interface Pedido {
  id_pedido: number;
  referencia: string;
  fecha_pedido: string;
  costo_envio: number;
  precio_total: number;
  metodo_pago: string;
  estado_pago: string;
  estado_pedido: string;
}

export interface FacturaDetalle {
  id_detalle: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  stock?: {
    id_stock: number;
    color: string;
    tallas?: { talla: string };
    productos?: { nombre: string; imagenes_producto?: ImagenProducto[] };
  };
}

export interface PedidoConDetalle extends Pedido {
  factura: FacturaDetalle[];
}

export interface PedidoAdmin extends PedidoConDetalle {
  usuarios?: { numero_documento: string; nombre: string; apellido: string; correo: string };
}

/** Próximos estados válidos desde cada estado_pedido (misma regla que el panel admin web). */
export const ESTADOS_SIGUIENTES: Record<string, string[]> = {
  pendiente: ['confirmado', 'cancelado'],
  confirmado: ['preparacion', 'cancelado'],
  preparacion: ['enviado', 'cancelado'],
  enviado: ['entregado'],
  entregado: [],
  cancelado: [],
};

async function authHeaders() {
  const token = await obtenerToken();
  return { Authorization: `Bearer ${token}` };
}

export async function crearPedido(payload: CrearPedidoPayload): Promise<Pedido> {
  const { data } = await ApiDelivery.post(
    '/pedidos',
    { costo_envio: 0, ...payload },
    { headers: await authHeaders() }
  );
  return data.data;
}

export async function actualizarEstadoPedido(
  id_pedido: number,
  cambios: { estado_pago?: string; estado_pedido?: string }
): Promise<Pedido> {
  const { data } = await ApiDelivery.put(`/pedidos/${id_pedido}`, cambios, {
    headers: await authHeaders(),
  });
  return data;
}

export async function getPedidosPorUsuario(numero_documento: string): Promise<PedidoConDetalle[]> {
  const { data } = await ApiDelivery.get(`/pedidos/usuario/${numero_documento}`, {
    headers: await authHeaders(),
  });
  return data;
}

export async function getPedidos(): Promise<PedidoAdmin[]> {
  const { data } = await ApiDelivery.get('/pedidos', { headers: await authHeaders() });
  return data;
}
