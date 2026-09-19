import React, { useEffect, useMemo, useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, StyleSheet, Dimensions, Alert} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../../App';
import { obtenerUsuarioActual, UsuarioSesion } from '../../../Data/sources/remote/api/Authapi';
import { getProductos, getCategorias, Producto, Categoria } from '../../../Data/sources/remote/api/ProductosApi';
import { getStock, Stock } from '../../../Data/sources/remote/api/StockApi';
import { getFavoritos, agregarFavorito, eliminarFavorito } from '../../../Data/sources/remote/api/FavoritosApi';
import { obtenerImagenPrincipal } from '../../utils/imagenes';
import { getColorHex } from '../../utils/colores';
import { esProductoNuevo } from '../../utils/producto';
import { colors, fonts, spacing, radius, shadow } from '../../theme/AppTheme';
import { Sidebar } from '../../components/Sidebar';
import { useSidebar } from '../../hooks/useSidebar';
import { useCategoriasConImagen } from '../../hooks/useCategoriaBanners';
import { QuickViewModal } from '../../components/QuickViewModal';
import { AgregarCarritoModal, ItemAgregado } from '../../components/AgregarCarritoModal';
import { AnimatedHeartButton } from '../../components/AnimatedHeartButton';
import { BadgeAcento } from '../../components/BadgeAcento';

const SKELETON_COUNT = 8;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 24 * 2 - CARD_GAP) / 2;

type CatalogoRoute = RouteProp<RootStackParamList, 'CatalogoScreen'>;

export function CatalogoScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<CatalogoRoute>();
  const { abierto, abrir, cerrar, cerrarSesion } = useSidebar();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);
  const [generoActivo, setGeneroActivo] = useState<string | null>(null);
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const [coloresSelec, setColoresSelec] = useState<string[]>([]);
  const [tallasSelec, setTallasSelec] = useState<string[]>([]);
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const [confirmacion, setConfirmacion] = useState<ItemAgregado | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let activo = true;
      (async () => {
        const u = await obtenerUsuarioActual();
        if (!activo) return;
        setUsuario(u);
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

  const cargarDatos = React.useCallback(async () => {
    setCargando(true);
    setErrorCarga(false);
    try {
      const [prods, cats, st] = await Promise.all([getProductos(), getCategorias(), getStock()]);
      setProductos(prods);
      setCategorias(cats);
      setStock(st);
      if (prods.length > 0) {
        const precios = prods.map((p) => Number(p.precio));
        setPrecioMin(Math.min(...precios));
        setPrecioMax(Math.max(...precios));
      }
    } catch {
      setErrorCarga(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Preselecciona la categoría recibida por parámetro (ej. desde el Footer o el Sidebar),
  // aceptando id numérico o nombre de texto (case-insensitive), igual que en el web.
  useEffect(() => {
    if (!route.params?.categoria || categorias.length === 0) return;
    const param = route.params.categoria;
    const encontrada = categorias.find(
      (c) => String(c.id_categoria) === String(param) || c.nombre_categoria.toLowerCase() === String(param).toLowerCase()
    );
    if (encontrada) setCategoriaActiva(encontrada.id_categoria);
  }, [route.params?.categoria, categorias]);

  // Precarga el término de búsqueda recibido desde el buscador del TopNavbar.
  useEffect(() => {
    if (route.params?.busqueda !== undefined) {
      setBusqueda(route.params.busqueda);
    }
  }, [route.params?.busqueda]);

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
      Alert.alert('Error', 'No se pudo actualizar favoritos, intenta de nuevo.');
    }
  }

  const coloresDisponibles = useMemo(
    () => [...new Set(stock.map((s) => s.color))].filter(Boolean).sort(),
    [stock]
  );

  const tallasDisponibles = useMemo(() => {
    const unicas = [...new Set(stock.map((s) => s.tallas?.talla))].filter(Boolean) as string[];
    return unicas.sort((a, b) => Number(a) - Number(b));
  }, [stock]);

  const precioMinAbsoluto = productos.length > 0 ? Math.min(...productos.map((p) => Number(p.precio))) : 0;
  const precioMaxAbsoluto = productos.length > 0 ? Math.max(...productos.map((p) => Number(p.precio))) : 0;

  const variantesPorProducto = useMemo(() => {
    const mapa: Record<number, { colores: Set<string>; tallas: Set<string> }> = {};
    stock.forEach((s) => {
      if (!mapa[s.id_producto]) mapa[s.id_producto] = { colores: new Set(), tallas: new Set() };
      if (s.color) mapa[s.id_producto].colores.add(s.color);
      if (s.tallas?.talla) mapa[s.id_producto].tallas.add(s.tallas.talla);
    });
    return mapa;
  }, [stock]);

  function toggleColor(color: string) {
    setColoresSelec((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]));
  }

  function toggleTalla(talla: string) {
    setTallasSelec((prev) => (prev.includes(talla) ? prev.filter((t) => t !== talla) : [...prev, talla]));
  }

  function limpiarFiltros() {
    setColoresSelec([]);
    setTallasSelec([]);
    setPrecioMin(precioMinAbsoluto);
    setPrecioMax(precioMaxAbsoluto);
  }

  function limpiarTodosLosFiltros() {
    limpiarFiltros();
    setBusqueda('');
    setCategoriaActiva(null);
    setGeneroActivo(null);
  }

  const hayFiltrosActivos =
    coloresSelec.length > 0 || tallasSelec.length > 0 || precioMin > precioMinAbsoluto || precioMax < precioMaxAbsoluto;

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = categoriaActiva ? p.id_categoria === categoriaActiva : true;
      const coincideGenero = generoActivo ? p.genero === generoActivo || p.genero === 'unisex' : true;
      if (!coincideBusqueda || !coincideCategoria || !coincideGenero) return false;

      const precio = Number(p.precio);
      if (precio < precioMin || precio > precioMax) return false;

      const variantes = variantesPorProducto[p.id_producto];
      if (coloresSelec.length > 0) {
        const tieneColor = variantes && coloresSelec.some((c) => variantes.colores.has(c));
        if (!tieneColor) return false;
      }
      if (tallasSelec.length > 0) {
        const tieneTalla = variantes && tallasSelec.some((t) => variantes.tallas.has(t));
        if (!tieneTalla) return false;
      }
      return true;
    });
  }, [productos, busqueda, categoriaActiva, generoActivo, precioMin, precioMax, coloresSelec, tallasSelec, variantesPorProducto]);

  const categoriasConImagen = useCategoriasConImagen(categorias, productos);

  const categoriaActivaNombre = categorias.find((c) => c.id_categoria === categoriaActiva)?.nombre_categoria ?? null;

  const bannerTopImagen = categoriaActiva
    ? categoriasConImagen.find((c) => c.categoria.id_categoria === categoriaActiva)?.imagen ?? null
    : categoriasConImagen[0]?.imagen ?? null;

  function renderHeader() {
    return (
      <View>
        <View style={styles.bannerTop}>
          {bannerTopImagen ? (
            <Image source={{ uri: bannerTopImagen }} style={styles.bannerTopImg} resizeMode="cover" />
          ) : (
            <View style={styles.bannerTopImgPlaceholder}>
              <Feather name="image" size={36} color={colors.textMuted} />
            </View>
          )}
          <Text style={styles.bannerTopTitulo}>{categoriaActivaNombre ?? 'Colección completa'}</Text>
          <Text style={styles.bannerTopSubtitulo}>
            {categoriaActivaNombre
              ? `Todo lo nuevo en ${categoriaActivaNombre}`
              : 'Explora todo nuestro catálogo en un solo lugar'}
          </Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar productos..."
              placeholderTextColor={colors.textMuted}
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>
          <TouchableOpacity
            style={[styles.filtrosBtn, hayFiltrosActivos && styles.filtrosBtnActivo]}
            onPress={() => setFiltrosVisibles(true)}
          >
            <Feather name="filter" size={14} color={hayFiltrosActivos ? colors.primary : colors.text} />
            <Text style={[styles.filtrosBtnText, hayFiltrosActivos && { color: colors.primary }]}>Filtros</Text>
            {hayFiltrosActivos && <View style={styles.filtrosDot} />}
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillsRow}
          data={[{ label: 'Todos los géneros', value: null }, { label: 'Hombre', value: 'hombre' }, { label: 'Mujer', value: 'mujer' }]}
          keyExtractor={(item) => String(item.value)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.pill, generoActivo === item.value && styles.pillActive]}
              onPress={() => setGeneroActivo(item.value)}
            >
              <Text style={[styles.pillText, generoActivo === item.value && styles.pillTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillsRow}
          data={[{ id_categoria: null, nombre_categoria: 'Todos' } as any, ...categorias]}
          keyExtractor={(item) => String(item.id_categoria)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.pill, categoriaActiva === item.id_categoria && styles.pillActive]}
              onPress={() => setCategoriaActiva(item.id_categoria)}
            >
              <Text style={[styles.pillText, categoriaActiva === item.id_categoria && styles.pillTextActive]}>
                {item.nombre_categoria}
              </Text>
            </TouchableOpacity>
          )}
        />

        {cargando && (
          <View style={styles.skeletonGrid}>
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <View key={i} style={styles.skeletonCard} />
            ))}
          </View>
        )}
      </View>
    );
  }

  function renderProducto({ item: p }: { item: Producto }) {
    const esFavorito = favoritos.includes(p.id_producto);
    const imagen = obtenerImagenPrincipal(p.imagenes_producto);
    const esNuevo = esProductoNuevo(p.fecha_creacion);

    return (
      <TouchableOpacity
        style={styles.card}
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
            {esNuevo && <BadgeAcento texto="Nuevo" style={styles.cardBadge} />}
            <AnimatedHeartButton
              style={[styles.favBtn, esFavorito && styles.favBtnActive]}
              activo={esFavorito}
              onPress={() => toggleFavorito(p.id_producto)}
              size={16}
            />
            <TouchableOpacity style={styles.quickViewBtn} onPress={() => setQuickViewId(p.id_producto)}>
              <Feather name="eye" size={14} color={colors.onPrimary} />
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
      <TouchableOpacity style={[styles.menuBtn, { top: insets.top + spacing.sm }]} onPress={abrir}>
        <Feather name="menu" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.titulo, { marginTop: insets.top + spacing.xxl }]}>Catálogo</Text>

      <FlatList
        data={cargando ? [] : productosFiltrados}
        keyExtractor={(item) => String(item.id_producto)}
        numColumns={2}
        columnWrapperStyle={{ gap: CARD_GAP, paddingHorizontal: 24 }}
        contentContainerStyle={{ paddingBottom: 64, gap: CARD_GAP }}
        ListHeaderComponent={renderHeader}
        renderItem={renderProducto}
        ListEmptyComponent={
          !cargando && errorCarga ? (
            <View style={styles.emptyState}>
              <Feather name="wifi-off" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No se pudieron cargar los productos</Text>
              <Text style={styles.emptySubtitle}>Revisa tu conexión, o que el celular esté en la misma red que el servidor.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={cargarDatos}>
                <Text style={styles.emptyBtnText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : !cargando ? (
            <View style={styles.emptyState}>
              <Feather name="search" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No encontramos productos con estos filtros</Text>
              <Text style={styles.emptySubtitle}>Prueba ajustando la búsqueda, el precio o la categoría seleccionada.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={limpiarTodosLosFiltros}>
                <Text style={styles.emptyBtnText}>Limpiar filtros</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      <Modal visible={filtrosVisibles} animationType="slide" transparent onRequestClose={() => setFiltrosVisibles(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.filtrosPanel}>
            <View style={styles.filtrosPanelHeader}>
              <Text style={styles.filtrosPanelTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setFiltrosVisibles(false)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.filtroLabel}>Color</Text>
            <View style={styles.coloresWrap}>
              {coloresDisponibles.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorBtn, { backgroundColor: getColorHex(color) }, coloresSelec.includes(color) && styles.colorBtnActivo]}
                  onPress={() => toggleColor(color)}
                />
              ))}
            </View>

            <Text style={styles.filtroLabel}>Talla</Text>
            <View style={styles.tallasWrap}>
              {tallasDisponibles.map((talla) => (
                <TouchableOpacity
                  key={talla}
                  style={[styles.tallaBtn, tallasSelec.includes(talla) && styles.tallaBtnActivo]}
                  onPress={() => toggleTalla(talla)}
                >
                  <Text style={[styles.tallaBtnText, tallasSelec.includes(talla) && styles.tallaBtnTextActivo]}>{talla}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filtroLabel}>Rango de precios</Text>
            <Text style={styles.precioLabels}>
              ${Math.round(precioMin).toLocaleString()} — ${Math.round(precioMax).toLocaleString()}
            </Text>
            <Text style={styles.sliderCaption}>Mínimo</Text>
            <Slider
              minimumValue={precioMinAbsoluto}
              maximumValue={precioMaxAbsoluto}
              value={precioMin}
              onValueChange={(v) => setPrecioMin(Math.min(v, precioMax))}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <Text style={styles.sliderCaption}>Máximo</Text>
            <Slider
              minimumValue={precioMinAbsoluto}
              maximumValue={precioMaxAbsoluto}
              value={precioMax}
              onValueChange={(v) => setPrecioMax(Math.max(v, precioMin))}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />

            <View style={styles.filtroAcciones}>
              <TouchableOpacity style={styles.filtroLimpiarBtn} onPress={limpiarFiltros}>
                <Text style={styles.filtroLimpiarText}>Limpiar filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filtroAplicarBtn} onPress={() => setFiltrosVisibles(false)}>
                <Text style={styles.filtroAplicarText}>Ver {productosFiltrados.length} resultados</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <QuickViewModal idProducto={quickViewId} onClose={() => setQuickViewId(null)} onAgregado={setConfirmacion} />

      <AgregarCarritoModal
        item={confirmacion}
        onClose={() => setConfirmacion(null)}
        onIrCarrito={() => {
          setConfirmacion(null);
          (navigation as any).navigate('MainTabs', { screen: 'CarritoScreen' });
        }}
      />

      <Sidebar abierto={abierto} onCerrar={cerrar} usuario={usuario} onLogout={cerrarSesion} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  menuBtn: { position: 'absolute', left: 20, zIndex: 250 },
  titulo: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  bannerTop: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  bannerTopImg: { height: 120, width: '100%', backgroundColor: colors.backgroundInput },
  bannerTopImgPlaceholder: {
    height: 120,
    backgroundColor: colors.backgroundInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTopTitulo: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  bannerTopSubtitulo: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    paddingHorizontal: 16,
    paddingBottom: 14,
    marginTop: 4,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 50,
    paddingHorizontal: 16,
    height: 44,
  },
  searchInput: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 14 },
  filtrosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  filtrosBtnActivo: { borderColor: colors.primary },
  filtrosBtnText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  filtrosDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  pillsRow: { paddingLeft: 24, marginBottom: 12 },
  pill: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 10,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
  pillTextActive: { color: colors.onPrimary },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP, paddingHorizontal: 24 },
  skeletonCard: {
    width: CARD_WIDTH,
    height: 260,
    borderRadius: 12,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    ...shadow.card,
  },
  cardBody: { borderRadius: 12, overflow: 'hidden' },
  cardBadge: { position: 'absolute', top: 8, left: 8 },
  cardImgWrap: { height: 160, backgroundColor: colors.backgroundInput },
  cardImg: { width: '100%', height: '100%' },
  cardImgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  quickViewBtn: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.overlayStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickViewText: { color: colors.onPrimary, fontSize: 11, fontWeight: '500' },
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
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '600', textAlign: 'center', marginTop: 12 },
  emptySubtitle: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 6 },
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
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  filtrosPanel: {
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  filtrosPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  filtrosPanelTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  filtroLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 10, marginTop: 8 },
  coloresWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: colors.border },
  colorBtnActivo: { borderColor: colors.primary },
  tallasWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tallaBtn: {
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tallaBtnActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tallaBtnText: { color: colors.text, fontSize: 13 },
  tallaBtnTextActivo: { color: colors.onPrimary },
  precioLabels: { color: colors.textMuted, fontSize: 13, marginBottom: 4 },
  sliderCaption: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  filtroAcciones: { flexDirection: 'row', gap: 10, marginTop: 16 },
  filtroLimpiarBtn: {
    flex: 1,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filtroLimpiarText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  filtroAplicarBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  filtroAplicarText: { color: colors.onPrimary, fontSize: 13, fontWeight: '700' },
});
