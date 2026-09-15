import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../../App';
import { obtenerUsuarioActual } from '../../../Data/sources/remote/api/Authapi';
import { getProductoPorId, Producto } from '../../../Data/sources/remote/api/ProductosApi';
import { getStockPorProducto, Stock } from '../../../Data/sources/remote/api/StockApi';
import { getFavoritos, agregarFavorito, eliminarFavorito } from '../../../Data/sources/remote/api/FavoritosApi';
import { agregarItem as agregarItemCarrito } from '../../../Data/sources/local/CarritoStorage';
import { obtenerImagenPrincipal } from '../../utils/imagenes';
import { getColorHex } from '../../utils/colores';
import { colors, fonts, radius, spacing } from '../../theme/AppTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DetalleRoute = RouteProp<RootStackParamList, 'DetalleProductoScreen'>;

export function DetalleProductoScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<DetalleRoute>();
  const { id_producto } = params;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [stock, setStock] = useState<Stock[]>([]);
  const [colorSelec, setColorSelec] = useState<string | null>(null);
  const [tallaSelec, setTallaSelec] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [imagenIndex, setImagenIndex] = useState(0);
  const [esFavorito, setEsFavorito] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      setCargando(true);
      const usuario = await obtenerUsuarioActual();
      const [prod, st] = await Promise.all([getProductoPorId(id_producto), getStockPorProducto(id_producto)]);
      let favorito = false;
      if (usuario) {
        try {
          const favs = await getFavoritos(usuario.numero_documento);
          favorito = favs.some((f) => f.productos?.id_producto === id_producto);
        } catch {
          favorito = false;
        }
      }
      if (!activo) return;
      setProducto(prod);
      setStock(st);
      if (st.length > 0) setColorSelec(st[0].color);
      setEsFavorito(favorito);
      setCargando(false);
    })();
    return () => {
      activo = false;
    };
  }, [id_producto]);

  useEffect(() => {
    setCantidad(1);
  }, [colorSelec, tallaSelec]);

  const coloresUnicos = [...new Set(stock.map((s) => s.color))].filter(Boolean);
  const tallasPorColor = stock.filter((s) => s.color === colorSelec);
  const stockSelec = stock.find((s) => s.color === colorSelec && s.tallas?.talla === tallaSelec);
  const stockBajo = stockSelec ? stockSelec.stock_actual > 0 && stockSelec.stock_actual <= stockSelec.stock_minimo : false;
  const agotado = stockSelec ? stockSelec.stock_actual <= 0 : false;

  const imagenes = producto?.imagenes_producto?.length
    ? [...producto.imagenes_producto].sort((a, b) => a.orden - b.orden)
    : [];
  const imagenActual = imagenes[imagenIndex]?.url_imagen ?? obtenerImagenPrincipal(producto?.imagenes_producto);

  function cambiarCantidad(delta: number) {
    if (!stockSelec) return;
    setCantidad((prev) => {
      const nuevo = prev + delta;
      if (nuevo < 1) return 1;
      if (nuevo > stockSelec.stock_actual) return stockSelec.stock_actual;
      return nuevo;
    });
  }

  async function toggleFavorito() {
    const usuario = await obtenerUsuarioActual();
    if (!usuario) {
      navigation.navigate('LoginScreen' as never);
      return;
    }
    try {
      if (esFavorito) {
        await eliminarFavorito(usuario.numero_documento, id_producto);
        setEsFavorito(false);
      } else {
        await agregarFavorito(usuario.numero_documento, id_producto);
        setEsFavorito(true);
      }
    } catch {
      Alert.alert('Error', 'No se pudo actualizar favoritos, intenta de nuevo.');
    }
  }

  async function agregarAlCarrito() {
    if (!colorSelec || !tallaSelec || !stockSelec || !producto) {
      Alert.alert('Selecciona una opción', 'Elige color y talla antes de añadir al carrito.');
      return;
    }
    if (cantidad < 1 || cantidad > stockSelec.stock_actual) return;

    await agregarItemCarrito(
      {
        id_stock: stockSelec.id_stock,
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: Number(producto.precio),
        color: colorSelec,
        talla: tallaSelec,
        imagen: obtenerImagenPrincipal(producto.imagenes_producto),
      },
      cantidad
    );
    Alert.alert('Listo', 'Producto añadido al carrito.');
  }

  if (cargando || !producto) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.cargandoWrap}>
          <Text style={styles.cargandoTexto}>Cargando...</Text>
        </View>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]} pointerEvents="box-none">
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.imgWrap}>
          {imagenActual ? (
            <Image source={{ uri: imagenActual }} style={styles.img} resizeMode="contain" />
          ) : (
            <Feather name="image" size={48} color={colors.textMuted} />
          )}
        </View>

        {imagenes.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbsRow}>
          {imagenes.map((img, i) => (
            <TouchableOpacity key={img.url_imagen} onPress={() => setImagenIndex(i)}>
              <Image
                source={{ uri: img.url_imagen }}
                style={[styles.thumb, i === imagenIndex && styles.thumbActivo]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.info}>
        <Text style={styles.nombre}>{producto.nombre}</Text>
        <Text style={styles.marca}>{producto.marca}</Text>
        <Text style={styles.precio}>${Number(producto.precio).toLocaleString()}</Text>

        {!!producto.descripcion && <Text style={styles.descripcion}>{producto.descripcion}</Text>}

        {coloresUnicos.length > 0 && (
          <>
            <Text style={styles.label}>Color</Text>
            <View style={styles.wrapRow}>
              {coloresUnicos.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorBtn, { backgroundColor: getColorHex(c) }, colorSelec === c && styles.colorBtnActivo]}
                  onPress={() => {
                    setColorSelec(c);
                    setTallaSelec(null);
                  }}
                />
              ))}
            </View>
          </>
        )}

        {tallasPorColor.length > 0 && (
          <>
            <Text style={styles.label}>Talla</Text>
            <View style={styles.wrapRow}>
              {tallasPorColor.map((s) => (
                <TouchableOpacity
                  key={s.id_stock}
                  style={[styles.tallaBtn, tallaSelec === s.tallas?.talla && styles.tallaBtnActivo]}
                  onPress={() => setTallaSelec(s.tallas?.talla ?? null)}
                >
                  <Text style={[styles.tallaBtnText, tallaSelec === s.tallas?.talla && styles.tallaBtnTextActivo]}>
                    {s.tallas?.talla}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {stockSelec && agotado && (
          <View style={styles.stockRow}>
            <Feather name="x-circle" size={14} color={colors.error} />
            <Text style={[styles.stockTexto, { color: colors.error }]}>Sin stock disponible</Text>
          </View>
        )}
        {stockSelec && !agotado && stockBajo && (
          <View style={styles.stockRow}>
            <Feather name="alert-triangle" size={14} color={colors.warning} />
            <Text style={[styles.stockTexto, { color: colors.warning }]}>
              ¡Solo quedan {stockSelec.stock_actual} unidades!
            </Text>
          </View>
        )}

        {stockSelec && !agotado && (
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => cambiarCantidad(-1)}>
              <Feather name="minus" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{cantidad}</Text>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => cambiarCantidad(1)}>
              <Feather name="plus" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.agregarBtn, (!stockSelec || agotado) && styles.agregarBtnDisabled]}
          onPress={agregarAlCarrito}
          disabled={!stockSelec || agotado}
        >
          <Feather name="shopping-bag" size={16} color={colors.background} />
          <Text style={styles.agregarBtnText}>Añadir al carrito</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]} pointerEvents="box-none">
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.headerBtn, esFavorito && styles.favBtnActive]} onPress={toggleFavorito}>
          <Feather name="heart" size={18} color={esFavorito ? colors.background : colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.xxxl },
  cargandoWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cargandoTexto: { color: colors.textMuted, fontFamily: fonts.body },
  imgWrap: {
    height: SCREEN_WIDTH,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: '85%', height: '85%' },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    zIndex: 20,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtnActive: { backgroundColor: colors.primary },
  thumbsRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbActivo: { borderColor: colors.primary },
  info: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  nombre: { fontFamily: fonts.display, fontSize: 24, color: colors.text },
  marca: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  precio: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.primary, marginTop: spacing.sm },
  descripcion: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.lg,
    lineHeight: 20,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  colorBtn: { width: 36, height: 36, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.border },
  colorBtnActivo: { borderColor: colors.primary },
  tallaBtn: {
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  tallaBtnActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tallaBtnText: { color: colors.text, fontFamily: fonts.body, fontSize: 14 },
  tallaBtnTextActivo: { color: colors.background },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl },
  stockTexto: { fontFamily: fonts.bodySemiBold, fontSize: 13 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginTop: spacing.xl,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 16, minWidth: 20, textAlign: 'center' },
  agregarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.lg,
    marginTop: spacing.xxl,
  },
  agregarBtnDisabled: { opacity: 0.5 },
  agregarBtnText: {
    color: colors.background,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
