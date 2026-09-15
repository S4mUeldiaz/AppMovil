import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getProductoPorId, Producto } from '../../Data/sources/remote/api/ProductosApi';
import { getStockPorProducto, Stock } from '../../Data/sources/remote/api/StockApi';
import { agregarItem as agregarItemCarrito } from '../../Data/sources/local/CarritoStorage';
import { obtenerImagenPrincipal } from '../utils/imagenes';
import { getColorHex } from '../utils/colores';
import { colors, fonts, radius, spacing } from '../theme/AppTheme';

interface QuickViewModalProps {
  idProducto: number | null;
  onClose: () => void;
}

export function QuickViewModal({ idProducto, onClose }: QuickViewModalProps) {
  const navigation = useNavigation();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [stockVariantes, setStockVariantes] = useState<Stock[]>([]);
  const [colorSelec, setColorSelec] = useState<string | null>(null);
  const [tallaSelec, setTallaSelec] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (idProducto == null) {
      setProducto(null);
      setStockVariantes([]);
      setColorSelec(null);
      setTallaSelec(null);
      return;
    }
    setCargando(true);
    Promise.all([getProductoPorId(idProducto), getStockPorProducto(idProducto)])
      .then(([prod, stockData]) => {
        setProducto(prod);
        setStockVariantes(stockData);
      })
      .finally(() => setCargando(false));
  }, [idProducto]);

  if (idProducto == null) return null;

  const coloresVariante = [...new Set(stockVariantes.map((s) => s.color))].filter(Boolean);
  const tallasVariante = [...new Set(stockVariantes.map((s) => s.tallas?.talla))].filter(Boolean) as string[];
  const stockSelec = stockVariantes.find((s) => s.color === colorSelec && s.tallas?.talla === tallaSelec);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Feather name="x" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {cargando || !producto ? (
            <Text style={styles.loading}>Cargando...</Text>
          ) : (
            <>
              <View style={styles.imgWrap}>
                {obtenerImagenPrincipal(producto.imagenes_producto) ? (
                  <Image
                    source={{ uri: obtenerImagenPrincipal(producto.imagenes_producto)! }}
                    style={styles.img}
                    resizeMode="contain"
                  />
                ) : (
                  <Feather name="image" size={32} color={colors.textMuted} />
                )}
              </View>
              <Text style={styles.nombre}>{producto.nombre}</Text>
              <Text style={styles.precio}>${Number(producto.precio).toLocaleString()}</Text>

              {coloresVariante.length > 0 && (
                <>
                  <Text style={styles.label}>Color</Text>
                  <View style={styles.wrapRow}>
                    {coloresVariante.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.colorBtn, { backgroundColor: getColorHex(c) }, colorSelec === c && styles.colorBtnActivo]}
                        onPress={() => setColorSelec(c)}
                      />
                    ))}
                  </View>
                </>
              )}

              {tallasVariante.length > 0 && (
                <>
                  <Text style={styles.label}>Talla</Text>
                  <View style={styles.wrapRow}>
                    {tallasVariante.map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.tallaBtn, tallaSelec === t && styles.tallaBtnActivo]}
                        onPress={() => setTallaSelec(t)}
                      >
                        <Text style={[styles.tallaBtnText, tallaSelec === t && styles.tallaBtnTextActivo]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {stockSelec && stockSelec.stock_actual <= stockSelec.stock_minimo && stockSelec.stock_actual > 0 && (
                <View style={styles.stockBajoRow}>
                  <Feather name="alert-triangle" size={14} color={colors.warning} />
                  <Text style={styles.stockBajoText}>¡Solo quedan {stockSelec.stock_actual} unidades!</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.cartBtn}
                onPress={async () => {
                  if (!colorSelec || !tallaSelec || !stockSelec) {
                    Alert.alert('Selecciona una opción', 'Elige color y talla antes de añadir al carrito.');
                    return;
                  }
                  await agregarItemCarrito({
                    id_stock: stockSelec.id_stock,
                    id_producto: producto.id_producto,
                    nombre: producto.nombre,
                    precio: Number(producto.precio),
                    color: colorSelec,
                    talla: tallaSelec,
                    imagen: obtenerImagenPrincipal(producto.imagenes_producto),
                  });
                  Alert.alert('Listo', 'Producto añadido al carrito.');
                  onClose();
                }}
              >
                <Text style={styles.cartBtnText}>Añadir al carrito</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const id = producto.id_producto;
                  onClose();
                  (navigation.navigate as any)('DetalleProductoScreen', { id_producto: id });
                }}
              >
                <Text style={styles.detalleLink}>Ver detalle completo</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    maxHeight: '85%',
  },
  close: { alignSelf: 'flex-end', marginBottom: spacing.sm },
  imgWrap: {
    height: 200,
    backgroundColor: '#111',
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  img: { width: '80%', height: '80%' },
  loading: { color: colors.textMuted, textAlign: 'center', paddingVertical: 40 },
  nombre: { color: colors.text, fontSize: 18, fontWeight: '700', fontFamily: fonts.display },
  precio: { color: colors.primary, fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.sm },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  colorBtn: { width: 32, height: 32, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.border },
  colorBtnActivo: { borderColor: colors.error },
  tallaBtn: {
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tallaBtnActivo: { backgroundColor: colors.error, borderColor: colors.error },
  tallaBtnText: { color: colors.text, fontSize: 13 },
  tallaBtnTextActivo: { color: colors.text },
  stockBajoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  stockBajoText: { color: colors.warning, fontSize: 12, fontWeight: '600' },
  cartBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  cartBtnText: { color: colors.background, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  detalleLink: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: spacing.md,
  },
});
