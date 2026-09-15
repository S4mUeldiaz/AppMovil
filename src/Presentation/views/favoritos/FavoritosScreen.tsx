import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFavoritos, eliminarFavorito, Favorito } from '../../../Data/sources/remote/api/FavoritosApi';
import { obtenerImagenPrincipal } from '../../utils/imagenes';
import { Sidebar } from '../../components/Sidebar';
import { useSidebar } from '../../hooks/useSidebar';
import { colors, fonts, spacing } from '../../theme/AppTheme';

const SKELETON_COUNT = 4;

export function FavoritosScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { abierto, abrir, cerrar, usuario, cerrarSesion } = useSidebar();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
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
          const favs = await getFavoritos(usuario.numero_documento);
          if (activo) setFavoritos(favs);
        } catch {
          if (activo) setFavoritos([]);
        } finally {
          if (activo) setCargando(false);
        }
      })();
      return () => {
        activo = false;
      };
    }, [usuario])
  );

  async function quitarFavorito(id_producto: number) {
    if (!usuario) return;
    try {
      await eliminarFavorito(usuario.numero_documento, id_producto);
      setFavoritos((prev) => prev.filter((f) => f.productos?.id_producto !== id_producto));
    } catch {
      Alert.alert('Error', 'No se pudo quitar de favoritos, intenta de nuevo.');
    }
  }

  function renderItem({ item }: { item: Favorito }) {
    const p = item.productos;
    if (!p) return null;
    const imagen = obtenerImagenPrincipal(p.imagenes_producto);

    return (
      <View style={styles.card}>
        <View style={styles.cardImgWrap}>
          {imagen ? (
            <Image source={{ uri: imagen }} style={styles.cardImg} resizeMode="contain" />
          ) : (
            <Feather name="image" size={24} color={colors.textMuted} />
          )}
          <TouchableOpacity style={styles.favBtn} onPress={() => quitarFavorito(p.id_producto)}>
            <Feather name="heart" size={14} color={colors.background} />
          </TouchableOpacity>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNombre} numberOfLines={1}>
            {p.nombre}
          </Text>
          <Text style={styles.cardPrecio}>${Number(p.precio).toLocaleString()}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={[styles.menuBtn, { top: insets.top + spacing.sm }]} onPress={abrir}>
        <Feather name="menu" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.titulo, { marginTop: insets.top + spacing.xxl }]}>Mis favoritos</Text>

      {!usuario ? (
        <View style={styles.emptyState}>
          <Feather name="heart" size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Inicia sesión para ver tus favoritos</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('LoginScreen' as never)}>
            <Text style={styles.emptyBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      ) : cargando ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <View key={i} style={styles.skeletonCard} />
          ))}
        </View>
      ) : favoritos.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="heart" size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Aún no tienes favoritos</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('HomeScreen' as never)}>
            <Text style={styles.emptyBtnText}>Explorar catálogo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(f) => String(f.id_favorito)}
          numColumns={2}
          columnWrapperStyle={styles.columna}
          contentContainerStyle={styles.lista}
          renderItem={renderItem}
        />
      )}

      <Sidebar abierto={abierto} onCerrar={cerrar} usuario={usuario} onLogout={cerrarSesion} />
    </View>
  );
}

const CARD_WIDTH = '48%' as const;

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  menuBtn: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  titulo: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  columna: { gap: 12, paddingHorizontal: 24 },
  lista: { paddingBottom: 40, gap: 12 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImgWrap: {
    height: 140,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImg: { width: '80%', height: '80%' },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { padding: 12 },
  cardNombre: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4 },
  cardPrecio: { fontSize: 14, fontWeight: '700', color: colors.text },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 24,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
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
