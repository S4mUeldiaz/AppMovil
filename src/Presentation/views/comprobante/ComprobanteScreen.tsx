import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../../App';
import { colors, fonts, radius, spacing } from '../../theme/AppTheme';

const ETIQUETAS_METODO_PAGO: Record<string, string> = {
  tarjeta: 'Tarjeta',
  pse: 'PSE',
  transferencia: 'Transferencia',
  contraentrega: 'Contraentrega',
};

type ComprobanteRoute = RouteProp<RootStackParamList, 'ComprobanteScreen'>;

export function ComprobanteScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<ComprobanteRoute>();
  const { referencias, items, metodoPago, direccionTexto, total } = params;

  const fecha = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

  function verPedidos() {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'PedidosScreen' as never }] })
    );
  }

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl }]}
    >
      <View style={styles.exito}>
        <Feather name="check-circle" size={48} color={colors.primary} />
        <Text style={styles.titulo}>Pago confirmado</Text>
        <Text style={styles.subtitulo}>
          Este es un pago simulado para fines de demostración del proyecto VELYSH — no se realizó ningún cargo real.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>Referencia(s) de pedido</Text>
          <Text style={styles.filaValor}>{referencias.join(', ')}</Text>
        </View>
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>Dirección de entrega</Text>
          <Text style={styles.filaValor}>{direccionTexto}</Text>
        </View>
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>Método de pago</Text>
          <Text style={styles.filaValor}>{ETIQUETAS_METODO_PAGO[metodoPago] ?? metodoPago}</Text>
        </View>
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>Fecha</Text>
          <Text style={styles.filaValor}>{fecha}</Text>
        </View>
      </View>

      <View style={styles.card}>
        {items.map((item) => (
          <View key={item.id_stock} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemNombre}>{item.nombre}</Text>
              <Text style={styles.itemDetalle}>
                {item.color} / {item.talla} · x{item.cantidad}
              </Text>
            </View>
            <Text style={styles.itemSubtotal}>${(item.precio * item.cantidad).toLocaleString()}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total pagado</Text>
          <Text style={styles.totalValor}>${total.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.btn} onPress={verPedidos}>
        <Text style={styles.btnText}>Ver mis pedidos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  exito: { alignItems: 'center', marginBottom: spacing.xxl },
  titulo: { fontFamily: fonts.display, fontSize: 24, color: colors.text, marginTop: spacing.md },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  fila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, gap: spacing.md },
  filaLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  filaValor: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.text, flexShrink: 1, textAlign: 'right' },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
  },
  itemNombre: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.text },
  itemDetalle: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  itemSubtotal: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.md },
  totalLabel: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  totalValor: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.primary },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  btnText: {
    color: colors.onPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
