import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  Animated,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { obtenerUsuarioActual, logout, UsuarioSesion } from '../../../Data/sources/remote/api/Authapi';
import { getProductos, getCategorias, Producto, Categoria } from '../../../Data/sources/remote/api/ProductosApi';
import { getFavoritos, agregarFavorito, eliminarFavorito } from '../../../Data/sources/remote/api/FavoritosApi';
import { obtenerCarrito } from '../../../Data/sources/local/CarritoStorage';
import { obtenerImagenPrincipal } from '../../utils/imagenes';
import { colors, fonts, spacing, radius } from '../../theme/AppTheme';
import { Sidebar } from '../../components/Sidebar';
import { Footer } from '../../components/Footer';
import { QuickViewModal } from '../../components/QuickViewModal';
import { TopNavbar } from '../../components/TopNavbar';

const HERO_SCROLL_RANGE = 240;
const MAS_VENDIDOS_COUNT = 8;
const SKELETON_COUNT = 4;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 24 * 2 - CARD_GAP) / 2;
const AnimatedScrollView = Animated.ScrollView;

const ICONOS_CATEGORIA: Record<string, keyof typeof Feather.glyphMap> = {
  deportivo: 'activity',
  casual: 'smile',
  formal: 'briefcase',
  botas: 'shield',
  guayos: 'target',
  sandalias: 'sun',
  baloncesto: 'circle',
  outdoor: 'compass',
};

function iconoParaCategoria(nombre: string): keyof typeof Feather.glyphMap {
  return ICONOS_CATEGORIA[nombre.toLowerCase().trim()] ?? 'tag';
}

export function HomeScreen() {
  const navigation = useNavigation();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [itemsCarrito, setItemsCarrito] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      (async () => {
        const [u, carrito] = await Promise.all([obtenerUsuarioActual(), obtenerCarrito()]);
        if (!activo) return;
        setUsuario(u);
        setItemsCarrito(carrito.reduce((acc, i) => acc + i.cantidad, 0));
        if (u) {
          try {
            const favs = await getFavoritos(u.numero_documento);
            setFavoritos(favs.map((f) => f.productos?.id_producto).filter(Boolean) as number[]);
          } catch {
            setFavoritos([]);
          }
        } else {
          setFavoritos([]);
        }
      })();
      return () => {
        activo = false;
      };
    }, [])
  );

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorCarga(false);
    try {
      const [prods, cats] = await Promise.all([getProductos(), getCategorias()]);
      setProductos(prods);
      setCategorias(cats);
    } catch {
      setErrorCarga(true);
    } finally {
      setCargando(false);
    }
  }, []);

  React.useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  async function toggleFavorito(id_producto: number) {
    if (!usuario) {
      navigation.navigate('LoginScreen' as never);
      return;
    }
    const esFav = favoritos.includes(id_producto);
    try {
      if (esFav) {
        await eliminarFavorito(usuario.numero_documento, id_producto);
        setFavoritos((prev) => prev.filter((id) => id !== id_producto));
      } else {
        await agregarFavorito(usuario.numero_documento, id_producto);
        setFavoritos((prev) => [...prev, id_producto]);
      }
    } catch {
      // silencioso: un fallo de favoritos no debe bloquear la navegación de Home
    }
  }

  async function handleLogout() {
    await logout();
    setUsuario(null);
    setFavoritos([]);
  }

  const masVendidos = React.useMemo(
    () => [...productos].sort((a, b) => b.total_ventas - a.total_ventas).slice(0, MAS_VENDIDOS_COUNT),
    [productos]
  );

  const heroOpacity = scrollY.interpolate({ inputRange: [0, HERO_SCROLL_RANGE], outputRange: [1, 0], extrapolate: 'clamp' });
  const heroScale = scrollY.interpolate({ inputRange: [0, HERO_SCROLL_RANGE], outputRange: [1, 0.6], extrapolate: 'clamp' });
  const heroTranslateY = scrollY.interpolate({ inputRange: [0, HERO_SCROLL_RANGE], outputRange: [0, -30], extrapolate: 'clamp' });

  function renderProducto(p: Producto, ancho: number) {
    const esFavorito = favoritos.includes(p.id_producto);
    const imagen = obtenerImagenPrincipal(p.imagenes_producto);

    return (
      <TouchableOpacity
        key={p.id_producto}
        style={[styles.card, { width: ancho }]}
        activeOpacity={0.85}
        onPress={() => (navigation.navigate as any)('DetalleProductoScreen', { id_producto: p.id_producto })}
      >
        <View style={styles.cardImgWrap}>
          {imagen ? (
            <Image source={{ uri: imagen }} style={styles.cardImg} resizeMode="contain" />
          ) : (
            <View style={styles.cardImgPlaceholder}>
              <Feather name="image" size={28} color={colors.textMuted} />
            </View>
          )}
          <TouchableOpacity
            style={[styles.favBtn, esFavorito && styles.favBtnActive]}
            onPress={() => toggleFavorito(p.id_producto)}
          >
            <Feather name="heart" size={16} color={esFavorito ? colors.background : colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickViewBtn} onPress={() => setQuickViewId(p.id_producto)}>
            <Feather name="eye" size={14} color={colors.text} />
            <Text style={styles.quickViewText}>Vista rápida</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardCategoria} numberOfLines={1}>
            {p.categorias?.nombre_categoria ?? ''}
          </Text>
          <Text style={styles.cardNombre} numberOfLines={1}>
            {p.nombre}
          </Text>
          <Text style={styles.cardMarca} numberOfLines={1}>
            {p.marca}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrecio}>${Number(p.precio).toLocaleString()}</Text>
            <TouchableOpacity
              style={styles.cardBtn}
              onPress={() => (navigation.navigate as any)('DetalleProductoScreen', { id_producto: p.id_producto })}
            >
              <Feather name="shopping-bag" size={12} color={colors.background} />
              <Text style={styles.cardBtnText}>Ver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TopNavbar onAbrirMenu={() => setSidebarAbierto(true)} usuario={usuario} />

      <AnimatedScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* HERO */}
        <ImageBackground source={require('../../../../assets/zapato_home.webp')} style={styles.hero} resizeMode="cover">
          <LinearGradient
            colors={['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.55)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Animated.Text
            style={[styles.heroLogo, { opacity: heroOpacity, transform: [{ translateY: heroTranslateY }, { scale: heroScale }] }]}
          >
            VELYSH
          </Animated.Text>
          <Animated.Text style={[styles.heroSub, { opacity: heroOpacity }]}>Nueva colección 2026</Animated.Text>
          <Animated.View style={{ opacity: heroOpacity }}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => (navigation.navigate as any)('CatalogoScreen')}>
              <Text style={styles.heroBtnText}>Ver catálogo →</Text>
            </TouchableOpacity>
          </Animated.View>
        </ImageBackground>

        {/* BANNER DE CARRITO PENDIENTE */}
        {itemsCarrito > 0 && (
          <TouchableOpacity style={styles.banner} onPress={() => navigation.navigate('CarritoScreen' as never)}>
            <Feather name="shopping-bag" size={16} color={colors.background} />
            <Text style={styles.bannerTexto}>
              Tienes {itemsCarrito} producto{itemsCarrito === 1 ? '' : 's'} en tu carrito
            </Text>
            <Feather name="arrow-right" size={16} color={colors.background} />
          </TouchableOpacity>
        )}

        {/* CATEGORÍAS */}
        {categorias.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Categorías</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriasRow}>
              {categorias.map((c) => (
                <TouchableOpacity
                  key={c.id_categoria}
                  style={styles.categoriaChip}
                  onPress={() => (navigation.navigate as any)('CatalogoScreen', { categoria: c.id_categoria })}
                >
                  <View style={styles.categoriaCirculo}>
                    <Feather name={iconoParaCategoria(c.nombre_categoria)} size={22} color={colors.text} />
                  </View>
                  <Text style={styles.categoriaTexto} numberOfLines={1}>
                    {c.nombre_categoria}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* MÁS VENDIDOS */}
        {!cargando && masVendidos.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Más vendidos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
              {masVendidos.map((p) => renderProducto(p, 150))}
            </ScrollView>
          </>
        )}

        {/* TODOS LOS PRODUCTOS */}
        <Text style={styles.sectionTitle}>Todos los productos</Text>
        {cargando ? (
          <View style={styles.grid}>
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <View key={i} style={styles.skeletonCard} />
            ))}
          </View>
        ) : errorCarga ? (
          <View style={styles.emptyState}>
            <Feather name="wifi-off" size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No se pudieron cargar los productos</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={cargarDatos}>
              <Text style={styles.emptyBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>{productos.map((p) => renderProducto(p, CARD_WIDTH))}</View>
        )}

        <Footer />
      </AnimatedScrollView>

      <QuickViewModal idProducto={quickViewId} onClose={() => setQuickViewId(null)} />

      <Sidebar
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
        usuario={usuario}
        onLogout={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  hero: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroLogo: {
    fontFamily: fonts.display,
    fontSize: 48,
    letterSpacing: 6,
    color: colors.text,
  },
  heroSub: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.text,
  },
  heroBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.text,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  heroBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    marginHorizontal: 24,
    marginTop: spacing.lg,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
  },
  bannerTexto: { color: colors.background, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
    paddingHorizontal: 24,
  },
  categoriasRow: { paddingHorizontal: 24, gap: spacing.lg },
  categoriaChip: { alignItems: 'center', width: 72 },
  categoriaCirculo: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  categoriaTexto: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.body, textAlign: 'center' },
  horizontalRow: { paddingHorizontal: 24, gap: CARD_GAP },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    paddingHorizontal: 24,
    paddingBottom: spacing.xl,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    height: 260,
    borderRadius: 12,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImgWrap: { height: 160, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  cardImg: { width: '80%', height: '80%' },
  cardImgPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtnActive: { backgroundColor: colors.primary },
  quickViewBtn: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickViewText: { color: colors.text, fontSize: 11, fontWeight: '500' },
  cardInfo: { padding: 12 },
  cardCategoria: { fontSize: 10, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  cardNombre: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2 },
  cardMarca: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardPrecio: { fontSize: 15, fontWeight: '700', color: colors.primary },
  cardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cardBtnText: { color: colors.background, fontSize: 11, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32 },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '600', textAlign: 'center', marginTop: 12 },
  emptyBtn: {
    marginTop: 16,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  emptyBtnText: { color: colors.text, fontSize: 13, fontWeight: '600' },
});
