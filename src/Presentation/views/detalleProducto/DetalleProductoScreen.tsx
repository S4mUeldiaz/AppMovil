import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BackButton } from '../../components/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../../App';
import { obtenerUsuarioActual, logout } from '../../../Data/sources/remote/api/Authapi';
import { getProductoPorId, getProductos, ImagenProducto, Producto } from '../../../Data/sources/remote/api/ProductosApi';
import { getStockPorProducto, Stock } from '../../../Data/sources/remote/api/StockApi';
import { getFavoritos, agregarFavorito, eliminarFavorito } from '../../../Data/sources/remote/api/FavoritosApi';
import { agregarItem as agregarItemCarrito } from '../../../Data/sources/local/CarritoStorage';
import { obtenerImagenPrincipal } from '../../utils/imagenes';
import { getColorHex } from '../../utils/colores';
import { colors, fonts, radius, spacing } from '../../theme/AppTheme';
import { AgregarCarritoModal, ItemAgregado } from '../../components/AgregarCarritoModal';
import { AnimatedHeartButton } from '../../components/AnimatedHeartButton';

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
  const [recomendados, setRecomendados] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [confirmacion, setConfirmacion] = useState<ItemAgregado | null>(null);
  const agregarBtnScale = useRef(new Animated.Value(1)).current;
  const galleryRef = useRef<FlatList<ImagenProducto>>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      setCargando(true);
      const usuario = await obtenerUsuarioActual();
      const [prod, st, todos] = await Promise.all([
        getProductoPorId(id_producto),
        getStockPorProducto(id_producto),
        getProductos(),
      ]);
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
      setRecomendados(
        todos
          .filter((p: Producto) => p.id_categoria === prod.id_categoria && p.id_producto !== prod.id_producto)
          .slice(0, 4)
      );
      setCargando(false);
    })();
    return () => {
      activo = false;
    };
  }, [id_producto]);

  useEffect(() => {
    setCantidad(1);
  }, [colorSelec, tallaSelec]);

  useEffect(() => {
    setImagenIndex(0);
    galleryRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [colorSelec]);

  const coloresUnicos = [...new Set(stock.map((s) => s.color))].filter(Boolean);
  const tallasPorColor = stock.filter((s) => s.color === colorSelec);
  const stockSelec = stock.find((s) => s.color === colorSelec && s.tallas?.talla === tallaSelec);
  const stockBajo = stockSelec ? stockSelec.stock_actual > 0 && stockSelec.stock_actual <= stockSelec.stock_minimo : false;
  const agotado = stockSelec ? stockSelec.stock_actual <= 0 : false;

  const imagenesGenericas = (producto?.imagenes_producto ?? []).filter((img) => img.color === '');
  const imagenesDelColor = colorSelec
    ? (producto?.imagenes_producto ?? []).filter((img) => img.color === colorSelec)
    : [];
  const imagenes = [...(imagenesDelColor.length > 0 ? imagenesDelColor : imagenesGenericas)].sort(
    (a, b) => a.orden - b.orden
  );
  const imagenIndexSeguro = imagenes.length > 0 ? Math.min(imagenIndex, imagenes.length - 1) : 0;
  const imagenActual = imagenes[imagenIndexSeguro]?.url_imagen ?? obtenerImagenPrincipal(producto?.imagenes_producto);

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
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        await logout();
        Alert.alert('Sesión expirada', 'Inicia sesión de nuevo para continuar.');
        navigation.navigate('LoginScreen' as never);
        return;
      }
      Alert.alert('Error', 'No se pudo actualizar favoritos, intenta de nuevo.');
    }
  }

  async function agregarAlCarrito() {
    if (!colorSelec || !tallaSelec || !stockSelec || !producto) {
      Alert.alert('Selecciona una opción', 'Elige color y talla antes de añadir al carrito.');
      return;
    }
    if (cantidad < 1 || cantidad > stockSelec.stock_actual) return;

    const imagen = imagenActual;
    await agregarItemCarrito(
      {
        id_stock: stockSelec.id_stock,
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: Number(producto.precio),
        color: colorSelec,
        talla: tallaSelec,
        imagen,
      },
      cantidad
    );
    Animated.sequence([
      Animated.timing(agregarBtnScale, { toValue: 0.94, duration: 90, useNativeDriver: true }),
      Animated.spring(agregarBtnScale, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true }),
    ]).start();
    setConfirmacion({ imagen, nombre: producto.nombre, color: colorSelec, talla: tallaSelec, cantidad });
  }

  if (cargando || !producto) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.cargandoWrap}>
          <Text style={styles.cargandoTexto}>Cargando...</Text>
        </View>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]} pointerEvents="box-none">
          <BackButton variant="overlay" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
      >
        <View style={styles.imgWrap}>
          {imagenes.length > 0 ? (
            <FlatList
              ref={galleryRef}
              data={imagenes}
              keyExtractor={(img) => img.url_imagen}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.gallery}
              getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
              onMomentumScrollEnd={(e) => {
                const nuevoIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setImagenIndex(nuevoIndex);
              }}
              renderItem={({ item }) => (
                <View style={styles.gallerySlide}>
                  <Image source={{ uri: item.url_imagen }} style={styles.img} resizeMode="cover" />
                </View>
              )}
            />
          ) : (
            <View style={styles.imgPlaceholder}>
              <Feather name="image" size={48} color={colors.textMuted} />
            </View>
          )}
        </View>

        {imagenes.length > 1 && (
          <View style={styles.dotsRow}>
            {imagenes.map((img, i) => (
              <View key={img.url_imagen} style={[styles.dot, i === imagenIndexSeguro && styles.dotActivo]} />
            ))}
          </View>
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
            {!!colorSelec && (
              <Text style={styles.colorSeleccionado}>
                Color: {colorSelec.charAt(0).toUpperCase() + colorSelec.slice(1)}
              </Text>
            )}
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

        <Animated.View style={{ transform: [{ scale: agregarBtnScale }] }}>
          <TouchableOpacity
            style={[styles.agregarBtn, (!stockSelec || agotado) && styles.agregarBtnDisabled]}
            onPress={agregarAlCarrito}
            disabled={!stockSelec || agotado}
          >
            <Feather name="shopping-bag" size={16} color={colors.onPrimary} />
            <Text style={styles.agregarBtnText}>Añadir al carrito</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {recomendados.length > 0 && (
        <View style={styles.recomendados}>
          <Text style={styles.recomendadosTitulo}>También te puede interesar</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recomendadosLista}
          >
            {recomendados.map((p) => {
              const imagenRec = obtenerImagenPrincipal(p.imagenes_producto);
              return (
                <TouchableOpacity
                  key={p.id_producto}
                  style={styles.recomendadoCard}
                  activeOpacity={0.85}
                  onPress={() => (navigation as any).push('DetalleProductoScreen', { id_producto: p.id_producto })}
                >
                  <View style={styles.recomendadoImgWrap}>
                    {imagenRec ? (
                      <Image source={{ uri: imagenRec }} style={styles.recomendadoImg} resizeMode="cover" />
                    ) : (
                      <View style={styles.recomendadoImgPlaceholder}>
                        <Feather name="image" size={22} color={colors.textMuted} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.recomendadoNombre} numberOfLines={1}>
                    {p.nombre}
                  </Text>
                  <Text style={styles.recomendadoPrecio}>${Number(p.precio).toLocaleString()}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
      </ScrollView>

      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]} pointerEvents="box-none">
        <BackButton variant="overlay" />
        <AnimatedHeartButton
          style={[styles.headerBtn, esFavorito && styles.favBtnActive]}
          activo={esFavorito}
          onPress={toggleFavorito}
          size={18}
        />
      </View>

      <AgregarCarritoModal
        item={confirmacion}
        onClose={() => setConfirmacion(null)}
        onIrCarrito={() => {
          setConfirmacion(null);
          (navigation as any).navigate('MainTabs', { screen: 'CarritoScreen' });
        }}
      />
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
    backgroundColor: colors.backgroundInput,
    overflow: 'hidden',
  },
  imgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%' },
  gallery: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  gallerySlide: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
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
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtnActive: { backgroundColor: colors.primary },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  dot: { width: 6, height: 6, borderRadius: radius.pill, backgroundColor: colors.border },
  dotActivo: { width: 18, backgroundColor: colors.primary },
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
  colorSeleccionado: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.sm,
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
  tallaBtnTextActivo: { color: colors.onPrimary },
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
    color: colors.onPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  recomendados: { marginTop: spacing.xxl, paddingLeft: spacing.xl },
  recomendadosTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
  recomendadosLista: { gap: spacing.md, paddingRight: spacing.xl },
  recomendadoCard: { width: 140 },
  recomendadoImgWrap: {
    width: 140,
    height: 140,
    borderRadius: radius.card,
    backgroundColor: colors.backgroundInput,
    overflow: 'hidden',
  },
  recomendadoImg: { width: '100%', height: '100%' },
  recomendadoImgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  recomendadoNombre: { fontFamily: fonts.body, fontSize: 12, color: colors.text, marginTop: spacing.sm },
  recomendadoPrecio: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text, marginTop: 2 },
});
