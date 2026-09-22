import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getPedidos,
  actualizarEstadoPedido,
  PedidoAdmin,
  ESTADOS_SIGUIENTES,
} from '../../../../Data/sources/remote/api/PedidosApi';
import { AdminHeader } from '../../../components/AdminHeader';
import { colors, fonts, radius, spacing } from '../../../theme/AppTheme';

const ESTADOS_EN_PROCESO = ['pendiente', 'confirmado', 'preparacion', 'enviado'];

const ETIQUETAS_ESTADO: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  preparacion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

function colorEstado(estado: string) {
  if (estado === 'entregado') return colors.primary;
  if (estado === 'cancelado') return colors.error;
  if (estado === 'enviado') return colors.text;
  return colors.warning;
}

type Tab = 'todos' | 'proceso' | 'completado';

export function AdminPedidosScreen() {
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab] = useState<Tab>('todos');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cambiandoId, setCambiandoId] = useState<number | null>(null);
  const [pedidoDetalle, setPedidoDetalle] = useState<PedidoAdmin | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await getPedidos();
      setPedidos(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudieron cargar los pedidos');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const enProceso = useMemo(
    () => pedidos.filter((p) => ESTADOS_EN_PROCESO.includes(p.estado_pedido)).length,
    [pedidos]
  );

  async function cambiarEstado(id_pedido: number, nuevoEstado: string) {
    setCambiandoId(id_pedido);
    try {
      await actualizarEstadoPedido(id_pedido, { estado_pedido: nuevoEstado });
      setPedidos((prev) => prev.map((p) => (p.id_pedido === id_pedido ? { ...p, estado_pedido: nuevoEstado } : p)));
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'No se pudo cambiar el estado');
    } finally {
      setCambiandoId(null);
    }
  }

  const pedidosFiltrados = pedidos.filter((p) => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      p.referencia?.toLowerCase().includes(texto) || p.usuarios?.correo?.toLowerCase().includes(texto);
    const coincideTab =
      tab === 'todos' ? true : tab === 'proceso' ? ESTADOS_EN_PROCESO.includes(p.estado_pedido) : p.estado_pedido === 'entregado';
    return coincideBusqueda && coincideTab;
  });

  function renderItem({ item: p }: { item: PedidoAdmin }) {
    const siguientes = ESTADOS_SIGUIENTES[p.estado_pedido] ?? [];
    const cantidadItems = p.factura?.length ?? 0;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.referencia}>#{p.referencia}</Text>
          <View style={[styles.badge, { borderColor: colorEstado(p.estado_pedido) }]}>
            <Text style={[styles.badgeText, { color: colorEstado(p.estado_pedido) }]}>
              {ETIQUETAS_ESTADO[p.estado_pedido] ?? p.estado_pedido}
            </Text>
          </View>
        </View>

        <Text style={styles.cliente} numberOfLines={1}>
          {p.usuarios?.nombre} {p.usuarios?.apellido}
        </Text>
        <Text style={styles.correo} numberOfLines={1}>
          {p.usuarios?.correo}
        </Text>

        <View style={styles.cardMeta}>
          <TouchableOpacity
            style={styles.verDetalleBtn}
            onPress={() => setPedidoDetalle(p)}
            disabled={cantidadItems === 0}
          >
            <Text style={styles.metaTexto}>{cantidadItems} producto(s)</Text>
            {cantidadItems > 0 && <Feather name="chevron-right" size={13} color={colors.textMuted} />}
          </TouchableOpacity>
          <Text style={styles.metaTotal}>${Number(p.precio_total).toLocaleString()}</Text>
        </View>
        <Text style={styles.fecha}>{new Date(p.fecha_pedido).toLocaleDateString('es-CO')}</Text>

        {siguientes.length > 0 && (
          <View style={styles.accionesWrap}>
            <Text style={styles.accionesLabel}>Cambiar a:</Text>
            <View style={styles.accionesRow}>
              {siguientes.map((estado) => (
                <TouchableOpacity
                  key={estado}
                  style={styles.accionBtn}
                  onPress={() => cambiarEstado(p.id_pedido, estado)}
                  disabled={cambiandoId === p.id_pedido}
                >
                  <Text style={styles.accionBtnText}>
                    {cambiandoId === p.id_pedido ? '...' : ETIQUETAS_ESTADO[estado] ?? estado}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <AdminHeader titulo="Pedidos" />

      <View style={styles.tabs}>
        {(
          [
            { key: 'todos', label: 'Todos' },
            { key: 'proceso', label: `En proceso (${enProceso})` },
            { key: 'completado', label: 'Completado' },
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <TouchableOpacity key={t.key} style={[styles.tab, tab === t.key && styles.tabActivo]} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActivo]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buscador}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.buscadorInput}
          placeholder="Buscar por referencia o correo..."
          placeholderTextColor={colors.textMuted}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={cargando ? [] : pedidosFiltrados}
        keyExtractor={(p) => String(p.id_pedido)}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          !cargando ? (
            <View style={styles.emptyState}>
              <Feather name="package" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTexto}>No se encontraron pedidos</Text>
            </View>
          ) : null
        }
      />

      {/* DETALLE DE PRODUCTOS DEL PEDIDO — mismo dato que ya trae getPedidos()
          (factura[].stock.productos/color/tallas), antes sin usar en esta
          pantalla; solo se mostraba la cantidad de ítems. */}
      <Modal visible={!!pedidoDetalle} transparent animationType="fade" onRequestClose={() => setPedidoDetalle(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setPedidoDetalle(null)} />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Pedido #{pedidoDetalle?.referencia}</Text>
              <TouchableOpacity onPress={() => setPedidoDetalle(null)}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={pedidoDetalle?.factura ?? []}
              keyExtractor={(item) => String(item.id_detalle)}
              contentContainerStyle={styles.modalLista}
              renderItem={({ item }) => (
                <View style={styles.modalItem}>
                  <View style={styles.modalItemInfo}>
                    <Text style={styles.modalItemNombre} numberOfLines={2}>
                      {item.stock?.productos?.nombre ?? 'Producto'}
                    </Text>
                    <Text style={styles.modalItemVariante}>
                      {item.stock?.color}
                      {item.stock?.color && item.stock?.tallas?.talla ? ' · ' : ''}
                      {item.stock?.tallas?.talla ? `Talla ${item.stock.tallas.talla}` : ''}
                      {' · '}Cant. {item.cantidad}
                    </Text>
                  </View>
                  <View style={styles.modalItemPrecios}>
                    <Text style={styles.modalItemUnitario}>${Number(item.precio_unitario).toLocaleString()} c/u</Text>
                    <Text style={styles.modalItemSubtotal}>${Number(item.subtotal).toLocaleString()}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  tab: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tabActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 11 },
  tabTextActivo: { color: colors.onPrimary },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 50,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.lg,
    height: 44,
    marginBottom: spacing.lg,
  },
  buscadorInput: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 14 },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 13, textAlign: 'center', marginBottom: spacing.md },
  lista: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.md },
  card: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  referencia: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 14 },
  badge: { borderRadius: radius.pill, borderWidth: 1, paddingVertical: 3, paddingHorizontal: spacing.sm },
  badgeText: { fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.5 },
  cliente: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  correo: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, marginBottom: spacing.sm },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  verDetalleBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  metaTexto: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 },
  metaTotal: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 14 },
  fecha: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  accionesWrap: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  accionesLabel: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginBottom: spacing.sm },
  accionesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  accionBtn: {
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  accionBtnText: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 12 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyTexto: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.xl },
  modalCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.lg,
    padding: spacing.xl,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitulo: { fontFamily: fonts.display, fontSize: 17, color: colors.text, flex: 1, marginRight: spacing.md },
  modalLista: { gap: spacing.sm },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.backgroundInput,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  modalItemInfo: { flex: 1 },
  modalItemNombre: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.text },
  modalItemVariante: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  modalItemPrecios: { alignItems: 'flex-end' },
  modalItemUnitario: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  modalItemSubtotal: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text, marginTop: 2 },
});
