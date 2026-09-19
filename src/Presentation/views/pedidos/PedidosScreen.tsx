import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPedidosPorUsuario, PedidoConDetalle } from '../../../Data/sources/remote/api/PedidosApi';
import { obtenerImagenPrincipal } from '../../utils/imagenes';
import { Sidebar } from '../../components/Sidebar';
import { useSidebar } from '../../hooks/useSidebar';
import { colors, fonts, radius, spacing } from '../../theme/AppTheme';

const ETIQUETAS_ESTADO: Record<string, string> = {
  pendiente: 'PENDIENTE',
  confirmado: 'CONFIRMADO',
  preparacion: 'EN PREPARACIÓN',
  enviado: 'ENVIADO',
  entregado: 'ENTREGADO',
  cancelado: 'CANCELADO',
};

function colorEstado(estado: string) {
  if (estado === 'entregado') return colors.primary;
  if (estado === 'cancelado') return colors.error;
  if (estado === 'enviado') return colors.warning;
  return colors.textMuted;
}

export function PedidosScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { abierto, abrir, cerrar, usuario, cerrarSesion } = useSidebar();
  const [pedidos, setPedidos] = useState<PedidoConDetalle[]>([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      (async () => {
        if (!usuario) {
          if (activo) setCargando(false);
          return;
        }
        setCargando(true);
        try {
          const data = await getPedidosPorUsuario(usuario.numero_documento);
          if (activo) setPedidos(data);
        } catch {
          if (activo) setPedidos([]);
        } finally {
          if (activo) setCargando(false);
        }
      })();
      return () => {
        activo = false;
      };
    }, [usuario])
  );

  function renderItem({ item }: { item: PedidoConDetalle }) {
    const primerDetalle = item.factura?.[0];
    const imagen = obtenerImagenPrincipal(primerDetalle?.stock?.productos?.imagenes_producto);
    const nombres = item.factura?.map((d) => d.stock?.productos?.nombre).filter(Boolean).join(', ') || 'Producto';
    const fecha = new Date(item.fecha_pedido).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
      <View style={styles.card}>
        <View style={styles.cardImgWrap}>
          {imagen ? (
            <Image source={{ uri: imagen }} style={styles.cardImg} resizeMode="contain" />
          ) : (
            <Feather name="package" size={22} color={colors.textMuted} />
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNombre} numberOfLines={1}>
            {nombres}
          </Text>
          <Text style={styles.cardFecha}>{fecha}</Text>
          {primerDetalle && (
            <Text style={styles.cardDetalle}>
              {primerDetalle.stock?.color} · Talla {primerDetalle.stock?.tallas?.talla}
            </Text>
          )}
          <View style={styles.cardFooter}>
            <Text style={styles.cardTotal}>${Number(item.precio_total).toLocaleString()}</Text>
            <View style={[styles.estadoBadge, { borderColor: colorEstado(item.estado_pedido) }]}>
              <Text style={[styles.estadoTexto, { color: colorEstado(item.estado_pedido) }]}>
                {ETIQUETAS_ESTADO[item.estado_pedido] ?? item.estado_pedido.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={[styles.menuBtn, { top: insets.top + spacing.sm }]} onPress={abrir}>
        <Feather name="menu" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.titulo, { marginTop: insets.top + spacing.xxl }]}>Mis pedidos</Text>

      {!usuario ? (
        <View style={styles.emptyState}>
          <Feather name="package" size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Inicia sesión para ver tus pedidos</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('LoginScreen' as never)}>
            <Text style={styles.emptyBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      ) : cargando ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Cargando...</Text>
        </View>
      ) : pedidos.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="package" size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No tienes pedidos aún</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => (navigation as any).navigate('MainTabs', { screen: 'HomeScreen' })}
          >
            <Text style={styles.emptyBtnText}>Ver catálogo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(p) => String(p.id_pedido)}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
        />
      )}

      <Sidebar abierto={abierto} onCerrar={cerrar} usuario={usuario} onLogout={cerrarSesion} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  menuBtn: { position: 'absolute', left: spacing.xl, zIndex: 10 },
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
    gap: spacing.md,
  },
  cardImgWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImg: { width: '80%', height: '80%' },
  cardInfo: { flex: 1, gap: 2 },
  cardNombre: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.text },
  cardFecha: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  cardDetalle: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  cardTotal: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  estadoBadge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
  },
  estadoTexto: { fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.5 },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: spacing.xxl },
  emptyTitle: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 15, textAlign: 'center', marginTop: spacing.md },
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
});
