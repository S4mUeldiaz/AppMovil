import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Image, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  obtenerCarrito,
  actualizarCantidad,
  eliminarItem,
  vaciarCarrito,
  ItemCarrito,
} from '../../../Data/sources/local/CarritoStorage';
import { crearPedido, actualizarEstadoPedido } from '../../../Data/sources/remote/api/PedidosApi';
import { Sidebar } from '../../components/Sidebar';
import { useSidebar } from '../../hooks/useSidebar';
import { colors, fonts, radius, spacing } from '../../theme/AppTheme';

type Paso = 1 | 2;

const METODOS_PAGO: { value: string; label: string }[] = [
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'pse', label: 'PSE' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'contraentrega', label: 'Contraentrega' },
];

export function CarritoScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { abierto, abrir, cerrar, usuario, cerrarSesion } = useSidebar();
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [paso, setPaso] = useState<Paso>(1);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    direccion: '',
    ciudad: 'Bogotá',
    departamento: 'Cundinamarca',
    codigo_postal: '',
    metodo_pago: 'tarjeta',
  });

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      (async () => {
        setCargando(true);
        const carrito = await obtenerCarrito();
        if (activo) {
          setItems(carrito);
          setCargando(false);
        }
      })();
      return () => {
        activo = false;
      };
    }, [])
  );

  async function cambiarCantidad(id_stock: number, delta: number) {
    const item = items.find((i) => i.id_stock === id_stock);
    if (!item) return;
    const nuevos = await actualizarCantidad(id_stock, item.cantidad + delta);
    setItems(nuevos);
  }

  async function quitar(id_stock: number) {
    const nuevos = await eliminarItem(id_stock);
    setItems(nuevos);
  }

  function irAPagar() {
    if (!usuario) {
      navigation.navigate('LoginScreen' as never);
      return;
    }
    setError('');
    setPaso(2);
  }

  async function handlePagar() {
    if (!usuario) return;
    if (!form.direccion.trim()) {
      setError('Ingresa una dirección');
      return;
    }
    setProcesando(true);
    setError('');
    try {
      const pedidosCreados = [];
      for (const item of items) {
        const pedido = await crearPedido({
          numero_documento: usuario.numero_documento,
          metodo_pago: form.metodo_pago as any,
          costo_envio: 0,
          direccion: form.direccion,
          ciudad: form.ciudad,
          departamento: form.departamento,
          codigo_postal: form.codigo_postal,
          items: [{ id_stock: item.id_stock, cantidad: item.cantidad, precio_unitario: item.precio }],
        });
        pedidosCreados.push(pedido);
      }

      for (const pedido of pedidosCreados) {
        await actualizarEstadoPedido(pedido.id_pedido, { estado_pago: 'pagado' });
      }

      await vaciarCarrito();

      (navigation.navigate as any)('ComprobanteScreen', {
        referencias: pedidosCreados.map((p) => p.referencia),
        items,
        metodoPago: form.metodo_pago,
        direccionTexto: `${form.direccion}, ${form.ciudad}, ${form.departamento}`,
        total: subtotal,
      });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo confirmar el pedido, intenta de nuevo.');
    } finally {
      setProcesando(false);
    }
  }

  const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  function renderItem({ item }: { item: ItemCarrito }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardImgWrap}>
          {item.imagen ? (
            <Image source={{ uri: item.imagen }} style={styles.cardImg} resizeMode="contain" />
          ) : (
            <Feather name="image" size={22} color={colors.textMuted} />
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNombre} numberOfLines={1}>
            {item.nombre}
          </Text>
          <Text style={styles.cardVariante}>
            {item.color} · Talla {item.talla}
          </Text>
          <Text style={styles.cardPrecio}>${item.precio.toLocaleString()}</Text>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => cambiarCantidad(item.id_stock, -1)}>
              <Feather name="minus" size={14} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{item.cantidad}</Text>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => cambiarCantidad(item.id_stock, 1)}>
              <Feather name="plus" size={14} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.eliminarBtn} onPress={() => quitar(item.id_stock)}>
          <Feather name="trash-2" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={[styles.menuBtn, { top: insets.top + spacing.sm }]} onPress={abrir}>
        <Feather name="menu" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.titulo, { marginTop: insets.top + spacing.xxl }]}>
        {paso === 1 ? 'Mi carrito' : 'Pago'}
      </Text>

      {paso === 1 ? (
        <>
          {!cargando && items.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="shopping-bag" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('HomeScreen' as never)}>
                <Text style={styles.emptyBtnText}>Ir al catálogo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(i) => String(i.id_stock)}
              renderItem={renderItem}
              contentContainerStyle={styles.lista}
            />
          )}

          {items.length > 0 && (
            <View style={styles.footer}>
              <View>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalValor}>${subtotal.toLocaleString()}</Text>
              </View>
              <TouchableOpacity style={styles.confirmarBtn} onPress={irAPagar}>
                <Text style={styles.confirmarBtnText}>Ir a pagar</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <View style={styles.formWrap}>
          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={styles.input}
            placeholder="Calle, número, apto"
            placeholderTextColor={colors.textMuted}
            value={form.direccion}
            onChangeText={(v) => setForm((p) => ({ ...p, direccion: v }))}
          />
          <Text style={styles.label}>Ciudad</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            value={form.ciudad}
            onChangeText={(v) => setForm((p) => ({ ...p, ciudad: v }))}
          />
          <Text style={styles.label}>Departamento</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            value={form.departamento}
            onChangeText={(v) => setForm((p) => ({ ...p, departamento: v }))}
          />
          <Text style={styles.label}>Código postal</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            value={form.codigo_postal}
            onChangeText={(v) => setForm((p) => ({ ...p, codigo_postal: v }))}
          />

          <Text style={styles.label}>Método de pago</Text>
          <View style={styles.metodosRow}>
            {METODOS_PAGO.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[styles.metodoBtn, form.metodo_pago === m.value && styles.metodoBtnActivo]}
                onPress={() => setForm((p) => ({ ...p, metodo_pago: m.value }))}
              >
                <Text style={[styles.metodoBtnText, form.metodo_pago === m.value && styles.metodoBtnTextActivo]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {!!error && <Text style={styles.errorTexto}>{error}</Text>}

          <View style={styles.footerForm}>
            <Text style={styles.subtotalLabel}>Total a pagar</Text>
            <Text style={styles.subtotalValor}>${subtotal.toLocaleString()}</Text>
          </View>

          <TouchableOpacity
            style={[styles.confirmarBtnAncho, procesando && styles.confirmarBtnDisabled]}
            onPress={handlePagar}
            disabled={procesando}
          >
            <Text style={styles.confirmarBtnText}>{procesando ? 'Procesando...' : 'Confirmar pedido'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.volverBtn} onPress={() => setPaso(1)} disabled={procesando}>
            <Text style={styles.volverBtnText}>Volver</Text>
          </TouchableOpacity>
        </View>
      )}

      <Sidebar abierto={abierto} onCerrar={cerrar} usuario={usuario} onLogout={cerrarSesion} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  menuBtn: {
    position: 'absolute',
    left: spacing.xl,
    zIndex: 10,
  },
  titulo: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  lista: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.md },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  cardImgWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImg: { width: '80%', height: '80%' },
  cardInfo: { flex: 1, gap: 4 },
  cardNombre: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.text },
  cardVariante: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  cardPrecio: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 14, minWidth: 16, textAlign: 'center' },
  eliminarBtn: { padding: spacing.sm },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: spacing.xxl },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptyBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  emptyBtnText: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  subtotalLabel: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 },
  subtotalValor: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 18 },
  confirmarBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  confirmarBtnAncho: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  confirmarBtnDisabled: { opacity: 0.6 },
  confirmarBtnText: {
    color: colors.background,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  volverBtn: { alignItems: 'center', marginTop: spacing.md, paddingVertical: spacing.sm },
  volverBtnText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13 },
  formWrap: { paddingHorizontal: spacing.xl, flex: 1 },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  metodosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metodoBtn: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  metodoBtnActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  metodoBtnText: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 13 },
  metodoBtnTextActivo: { color: colors.background },
  errorTexto: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginTop: spacing.lg, textAlign: 'center' },
  footerForm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
