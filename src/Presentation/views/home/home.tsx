import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
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
import { esProductoNuevo } from '../../utils/producto';
import { colors, fonts, spacing, radius, shadow } from '../../theme/AppTheme';
import { Sidebar } from '../../components/Sidebar';
import { Footer } from '../../components/Footer';
import { QuickViewModal } from '../../components/QuickViewModal';
import { QuickViewButton } from '../../components/QuickViewButton';
import { TopNavbar } from '../../components/TopNavbar';
import { AgregarCarritoModal, ItemAgregado } from '../../components/AgregarCarritoModal';
import { AnimatedHeartButton } from '../../components/AnimatedHeartButton';
import { BadgeAcento } from '../../components/BadgeAcento';
import { BannerCategoria } from '../../components/BannerCategoria';
import { useCategoriasConImagen, useProductosConBanners } from '../../hooks/useCategoriaBanners';

const MAS_VENDIDOS_COUNT = 8;
const SKELETON_COUNT = 4;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 24 * 2 - CARD_GAP) / 2;

// Tratamiento editorial compartido por el hero y el banner "Colección 2026":
// foto + degradado a overlayStrong + texto en onPrimary.
const DEGRADADO_EDITORIAL = {
  colors: ['transparent', colors.overlayStrong] as const,
  locations: [0.35, 1] as const,
};

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
  const [confirmacion, setConfirmacion] = useState<ItemAgregado | null>(null);

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

  const categoriasConImagen = useCategoriasConImagen(categorias, productos);
  const productosConBanners = useProductosConBanners(productos, categoriasConImagen);

  function renderProducto(p: Producto, ancho: number, esMasVendido: boolean = false) {
    const esFavorito = favoritos.includes(p.id_producto);
    const imagen = obtenerImagenPrincipal(p.imagenes_producto);
    const esNuevo = !esMasVendido && esProductoNuevo(p.fecha_creacion);

    return (
      <TouchableOpacity
        key={p.id_producto}
        style={[styles.card, { width: ancho }]}
        activeOpacity={0.85}
        onPress={() => (navigation.navigate as any)('DetalleProductoScreen', { id_producto: p.id_producto })}
      >
        <View style={styles.cardBody}>
          <View style={styles.cardImgWrap}>
            {imagen ? (
              <Image source={{ uri: imagen }} style={styles.cardImg} resizeMode="cover" />
            ) : (
              <View style={styles.cardImgPlaceholder}>
                <Feather name="image" size={28} color={colors.textMuted} />
              </View>
            )}
            {esMasVendido && <BadgeAcento texto="Más vendido" style={styles.cardBadge} />}
            {esNuevo && <BadgeAcento texto="Nuevo" style={styles.cardBadge} />}
            <AnimatedHeartButton
              style={[styles.favBtn, esFavorito && styles.favBtnActive]}
              activo={esFavorito}
              onPress={() => toggleFavorito(p.id_producto)}
              size={16}
            />
          </View>
          <QuickViewButton onPress={() => setQuickViewId(p.id_producto)} />
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
                <Feather name="shopping-bag" size={12} color={colors.onPrimary} />
                <Text style={styles.cardBtnText}>Ver</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TopNavbar onAbrirMenu={() => setSidebarAbierto(true)} />

      <ScrollView>
        {/* HERO: foto + degradado + texto (mismo tratamiento que el banner "Colección 2026"). Sin monograma. */}
        <ImageBackground source={require('../../../../assets/modelo_home.jpg')} style={styles.hero} resizeMode="cover">
          <LinearGradient
            colors={DEGRADADO_EDITORIAL.colors}
            locations={DEGRADADO_EDITORIAL.locations}
            style={StyleSheet.absoluteFill}
          />
          <Text style={[styles.bannerEditorialTexto, styles.heroTitulo]}>Nueva colección 2026</Text>
          <TouchableOpacity style={styles.heroBtn} onPress={() => (navigation.navigate as any)('CatalogoScreen')}>
            <Text style={styles.heroBtnText}>Ver catálogo →</Text>
          </TouchableOpacity>
        </ImageBackground>

        {/* BANNER DE CARRITO PENDIENTE */}
        {itemsCarrito > 0 && (
          <TouchableOpacity style={styles.banner} onPress={() => navigation.navigate('CarritoScreen' as never)}>
            <Feather name="shopping-bag" size={16} color={colors.onPrimary} />
            <Text style={styles.bannerTexto}>
              Tienes {itemsCarrito} producto{itemsCarrito === 1 ? '' : 's'} en tu carrito
            </Text>
            <Feather name="arrow-right" size={16} color={colors.onPrimary} />
          </TouchableOpacity>
        )}

        {/* CATEGORÍAS */}
        {categorias.length > 0 && (
          <>
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitleCompacta}>Categorías</Text>
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
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitleDestacada}>Más vendidos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
              {masVendidos.map((p) => renderProducto(p, 150, true))}
            </ScrollView>
          </>
        )}

        {/* BANNER EDITORIAL */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => (navigation.navigate as any)('CatalogoScreen')}>
          <ImageBackground
            source={require('../../../../assets/coleccion_2026.avif')}
            style={styles.bannerEditorial}
            resizeMode="cover"
          >
            <LinearGradient
              colors={DEGRADADO_EDITORIAL.colors}
              locations={DEGRADADO_EDITORIAL.locations}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.bannerEditorialTexto}>Colección 2026</Text>
          </ImageBackground>
        </TouchableOpacity>

        {/* TODOS LOS PRODUCTOS */}
        <View style={styles.sectionDivider} />
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
          <View style={styles.grid}>
            {productosConBanners.map((item) => {
              if (item.tipo === 'producto') return renderProducto(item.producto, CARD_WIDTH);
              // El spacer solo sirve para emparejar filas en un FlatList numColumns=2;
              // en este grid flexWrap el banner ya ocupa la fila completa por su ancho.
              if (item.tipo === 'spacer') return null;
              return (
                <BannerCategoria
                  key={item.id}
                  imagen={item.imagen}
                  nombre={item.categoria.nombre_categoria}
                  onPress={() => (navigation.navigate as any)('CatalogoScreen', { categoria: item.categoria.id_categoria })}
                />
              );
            })}
          </View>
        )}

        <Footer />
      </ScrollView>

      <QuickViewModal idProducto={quickViewId} onClose={() => setQuickViewId(null)} onAgregado={setConfirmacion} />

      <AgregarCarritoModal
        item={confirmacion}
        onClose={() => setConfirmacion(null)}
        onIrCarrito={() => {
          setConfirmacion(null);
          (navigation as any).navigate('MainTabs', { screen: 'CarritoScreen' });
        }}
      />

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
  hero: { width: '100%', aspectRatio: 1080 / 1351, justifyContent: 'flex-end', overflow: 'hidden' },
  heroTitulo: { paddingBottom: spacing.sm },
  heroBtn: {
    alignSelf: 'flex-start',
    marginLeft: 24,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.onPrimary,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  heroBtnText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bannerEditorial: {
    height: 320,
    marginTop: spacing.xxxl,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bannerEditorialTexto: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.onPrimary,
    paddingHorizontal: 24,
    paddingBottom: spacing.xl,
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
  bannerTexto: { color: colors.onPrimary, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 24,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
    paddingHorizontal: 24,
  },
  // "Categorías"
  sectionTitleCompacta: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: 24,
  },
  // "Más vendidos"
  sectionTitleDestacada: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.text,
    marginTop: spacing.xxxl,
    marginBottom: spacing.xl,
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
    ...shadow.card,
  },
  cardBody: { borderRadius: 12, overflow: 'hidden' },
  cardImgWrap: { height: 160, backgroundColor: colors.backgroundInput },
  cardImg: { width: '100%', height: '100%' },
  cardImgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardBadge: { position: 'absolute', top: 8, left: 8 },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtnActive: { backgroundColor: colors.primary },
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
  cardBtnText: { color: colors.onPrimary, fontSize: 11, fontWeight: '600' },
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
