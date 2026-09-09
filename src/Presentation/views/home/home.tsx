import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { obtenerUsuarioActual, UsuarioSesion } from '../../../Data/sources/remote/api/Authapi';
import {
  getProductos,
  getCategorias,
  getProductoPorId,
  Producto,
  Categoria,
} from '../../../Data/sources/remote/api/ProductosApi';
import { getStock, Stock, getStockPorProducto } from '../../../Data/sources/remote/api/StockApi';
import {
  getFavoritos,
  agregarFavorito,
  eliminarFavorito,
} from '../../../Data/sources/remote/api/FavoritosApi';
import { obtenerImagenPrincipal } from '../../utils/imagenes';
import { getColorHex } from '../../utils/colores';
import { colors } from '../../theme/AppTheme';

const HERO_SCROLL_RANGE = 320;
const SKELETON_COUNT = 8;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 24 * 2 - CARD_GAP) / 2;
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList) as any;

export function HomeScreen() {
  const navigation = useNavigation();

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
  const [quickViewId, setQuickViewId] = useState<number | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Recargar usuario y favoritos cada vez que la pantalla recibe foco
  // (por si el usuario acaba de iniciar sesión o cerrarla en otra pantalla).
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
            // La API devuelve { productos: { id_producto, ... } } anidado,
            // no un id_producto plano.
            setFavoritos(favs.map((f: any) => f.productos?.id_producto).filter(Boolean));
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

  useEffect(() => {
    async function cargarDatos() {
      const [prods, cats, st] = await Promise.all([
        getProductos(),
        getCategorias(),
        getStock(),
      ]);
      setProductos(prods);
      setCategorias(cats);
      setStock(st);

      if (prods.length > 0) {
        const precios = prods.map((p) => Number(p.precio));
        setPrecioMin(Math.min(...precios));
        setPrecioMax(Math.max(...precios));
      }
      setCargando(false);
    }
    cargarDatos();
  }, []);

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
    coloresSelec.length > 0 ||
    tallasSelec.length > 0 ||
    precioMin > precioMinAbsoluto ||
    precioMax < precioMaxAbsoluto;

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

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, HERO_SCROLL_RANGE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const heroScale = scrollY.interpolate({
    inputRange: [0, HERO_SCROLL_RANGE],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, HERO_SCROLL_RANGE],
    outputRange: [0, -40],
    extrapolate: 'clamp',
  });

  function renderHeader() {
    return (
      <View>
        {/* HERO */}
        <ImageBackground
          source={require('../../../../assets/zapato_home.webp')}
          style={styles.hero}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.55)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Animated.Text
            style={[
              styles.heroLogo,
              {
                opacity: heroOpacity,
                transform: [{ translateY: heroTranslateY }, { scale: heroScale }],
              },
            ]}
          >
            VELYSH
          </Animated.Text>
          <Animated.Text style={[styles.heroSub, { opacity: heroOpacity }]}>
            Nueva colección 2026
          </Animated.Text>
          <Animated.View style={{ opacity: heroOpacity }}>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() =>
                Alert.alert('Próximamente', 'El catálogo completo todavía está en construcción.')
              }
            >
              <Text style={styles.heroBtnText}>Ver catálogo →</Text>
            </TouchableOpacity>
          </Animated.View>
        </ImageBackground>

        {/* BÚSQUEDA + FILTROS */}
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
            <Feather
              name="filter"
              size={14}
              color={hayFiltrosActivos ? colors.error : colors.text}
            />
            <Text style={[styles.filtrosBtnText, hayFiltrosActivos && { color: colors.error }]}>
              Filtros
            </Text>
            {hayFiltrosActivos && <View style={styles.filtrosDot} />}
          </TouchableOpacity>
        </View>

        {/* GÉNERO */}
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
              <Text style={[styles.pillText, generoActivo === item.value && styles.pillTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* CATEGORÍAS */}
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
              <Text
                style={[styles.pillText, categoriaActiva === item.id_categoria && styles.pillTextActive]}
              >
                {item.nombre_categoria}
              </Text>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.sectionTitle}>Productos destacados</Text>

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

    return (
      <View style={styles.card}>
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
            <Feather
              name="heart"
              size={16}
              color={esFavorito ? colors.bg : colors.primary}
            />
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
          <Text style={styles.cardNombre} numberOfLines={1}>{p.nombre}</Text>
          <Text style={styles.cardMarca} numberOfLines={1}>{p.marca}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrecio}>${Number(p.precio).toLocaleString()}</Text>
            <TouchableOpacity style={styles.cardBtn} onPress={() => setQuickViewId(p.id_producto)}>
              <Feather name="shopping-bag" size={12} color={colors.bg} />
              <Text style={styles.cardBtnText}>Ver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <AnimatedFlatList
        data={cargando ? [] : productosFiltrados}
        keyExtractor={(item: Producto) => String(item.id_producto)}
        numColumns={2}
        columnWrapperStyle={{ gap: CARD_GAP, paddingHorizontal: 24 }}
        contentContainerStyle={{ paddingBottom: 64, gap: CARD_GAP }}
        ListHeaderComponent={renderHeader}
        renderItem={renderProducto}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        ListEmptyComponent={
          !cargando ? (
            <View style={styles.emptyState}>
              <Feather name="search" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No encontramos productos con estos filtros</Text>
              <Text style={styles.emptySubtitle}>
                Prueba ajustando la búsqueda, el precio o la categoría seleccionada.
              </Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={limpiarTodosLosFiltros}>
                <Text style={styles.emptyBtnText}>Limpiar filtros</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* PANEL DE FILTROS AVANZADOS */}
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
                  style={[
                    styles.colorBtn,
                    { backgroundColor: getColorHex(color) },
                    coloresSelec.includes(color) && styles.colorBtnActivo,
                  ]}
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
                  <Text
                    style={[styles.tallaBtnText, tallasSelec.includes(talla) && styles.tallaBtnTextActivo]}
                  >
                    {talla}
                  </Text>
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
              minimumTrackTintColor={colors.error}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.error}
            />
            <Text style={styles.sliderCaption}>Máximo</Text>
            <Slider
              minimumValue={precioMinAbsoluto}
              maximumValue={precioMaxAbsoluto}
              value={precioMax}
              onValueChange={(v) => setPrecioMax(Math.max(v, precioMin))}
              minimumTrackTintColor={colors.error}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.error}
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

      {/* QUICK VIEW */}
      <QuickViewModal idProducto={quickViewId} onClose={() => setQuickViewId(null)} />
    </View>
  );
}

function QuickViewModal({ idProducto, onClose }: { idProducto: number | null; onClose: () => void }) {
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
  const stockSelec = stockVariantes.find(
    (s) => s.color === colorSelec && s.tallas?.talla === tallaSelec
  );

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.quickViewCard}>
          <TouchableOpacity style={styles.quickViewClose} onPress={onClose}>
            <Feather name="x" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {cargando || !producto ? (
            <Text style={styles.quickViewLoading}>Cargando...</Text>
          ) : (
            <>
              <Text style={styles.quickViewNombre}>{producto.nombre}</Text>
              <Text style={styles.quickViewPrecio}>${Number(producto.precio).toLocaleString()}</Text>

              {coloresVariante.length > 0 && (
                <>
                  <Text style={styles.filtroLabel}>Color</Text>
                  <View style={styles.coloresWrap}>
                    {coloresVariante.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.colorBtn,
                          { backgroundColor: getColorHex(c) },
                          colorSelec === c && styles.colorBtnActivo,
                        ]}
                        onPress={() => setColorSelec(c)}
                      />
                    ))}
                  </View>
                </>
              )}

              {tallasVariante.length > 0 && (
                <>
                  <Text style={styles.filtroLabel}>Talla</Text>
                  <View style={styles.tallasWrap}>
                    {tallasVariante.map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.tallaBtn, tallaSelec === t && styles.tallaBtnActivo]}
                        onPress={() => setTallaSelec(t)}
                      >
                        <Text style={[styles.tallaBtnText, tallaSelec === t && styles.tallaBtnTextActivo]}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {stockSelec && stockSelec.stock_actual <= stockSelec.stock_minimo && stockSelec.stock_actual > 0 && (
                <View style={styles.stockBajoRow}>
                  <Feather name="alert-triangle" size={14} color="#d4a72c" />
                  <Text style={styles.stockBajoText}>¡Solo quedan {stockSelec.stock_actual} unidades!</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.quickViewCartBtn}
                onPress={() =>
                  Alert.alert('Próximamente', 'El carrito de compras todavía está en construcción.')
                }
              >
                <Text style={styles.quickViewCartText}>Añadir al carrito</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  Alert.alert('Próximamente', 'El detalle completo del producto todavía está en construcción.');
                }}
              >
                <Text style={styles.quickViewDetalleLink}>Ver detalle completo</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.bg },
  hero: {
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroLogo: {
    fontFamily: 'InriaSerif_400Regular',
    fontSize: 56,
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
    borderRadius: 50,
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
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 50,
    paddingHorizontal: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  filtrosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  filtrosBtnActivo: {
    borderColor: colors.error,
  },
  filtrosBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  filtrosDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
  },
  pillsRow: {
    paddingLeft: 24,
    marginBottom: 12,
  },
  pill: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 10,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  pillTextActive: {
    color: colors.bg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    paddingHorizontal: 24,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    height: 260,
    borderRadius: 12,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImgWrap: {
    height: 160,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  cardCategoria: {
    fontSize: 10,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
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
  cardBtnText: { color: colors.bg, fontSize: 11, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  emptyBtn: {
    marginTop: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  emptyBtnText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  filtrosPanel: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  filtrosPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtrosPanelTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  filtroLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 10, marginTop: 8 },
  coloresWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: colors.border },
  colorBtnActivo: { borderColor: colors.error },
  tallasWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tallaBtn: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tallaBtnActivo: { backgroundColor: colors.error, borderColor: colors.error },
  tallaBtnText: { color: colors.text, fontSize: 13 },
  tallaBtnTextActivo: { color: '#fff' },
  precioLabels: { color: colors.textMuted, fontSize: 13, marginBottom: 4 },
  sliderCaption: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  filtroAcciones: { flexDirection: 'row', gap: 10, marginTop: 16 },
  filtroLimpiarBtn: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filtroLimpiarText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  filtroAplicarBtn: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filtroAplicarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  quickViewCard: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  quickViewClose: { alignSelf: 'flex-end', marginBottom: 8 },
  quickViewLoading: { color: colors.textMuted, textAlign: 'center', paddingVertical: 40 },
  quickViewNombre: { color: colors.text, fontSize: 18, fontWeight: '700', fontFamily: 'InriaSerif_400Regular' },
  quickViewPrecio: { color: colors.primary, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  stockBajoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  stockBajoText: { color: '#d4a72c', fontSize: 12, fontWeight: '600' },
  quickViewCartBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  quickViewCartText: { color: colors.bg, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  quickViewDetalleLink: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 14,
  },
});