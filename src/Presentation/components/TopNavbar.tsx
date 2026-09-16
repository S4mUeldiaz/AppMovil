import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UsuarioSesion } from '../../Data/sources/remote/api/Authapi';
import { colors, fonts, spacing } from '../theme/AppTheme';

interface TopNavbarProps {
  onAbrirMenu: () => void;
  /** Texto fijo (ej. "Mi carrito"). Si se pasa `usuario`, este prop se ignora y se muestra un saludo. */
  titulo?: string;
  /** Cuando se pasa (incluso null), la barra muestra un saludo personalizado en vez de `titulo`. */
  usuario?: UsuarioSesion | null;
}

export function TopNavbar({ onAbrirMenu, titulo, usuario }: TopNavbarProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const modoSaludo = usuario !== undefined;
  const [buscando, setBuscando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const inputRef = useRef<TextInput>(null);

  function abrirBusqueda() {
    setBuscando(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function cerrarBusqueda() {
    setBuscando(false);
    setBusqueda('');
  }

  function buscar() {
    const query = busqueda.trim();
    if (!query) return;
    (navigation.navigate as any)('CatalogoScreen', { busqueda: query });
    cerrarBusqueda();
  }

  if (buscando) {
    return (
      <View style={[styles.wrapper, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor={colors.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
            onSubmitEditing={buscar}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={cerrarBusqueda}>
          <Feather name="x" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + spacing.sm }]}>
      <TouchableOpacity style={styles.iconBtn} onPress={onAbrirMenu}>
        <Feather name="menu" size={22} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.centro}>
        {modoSaludo ? (
          <Text style={styles.saludo} numberOfLines={1}>
            {usuario ? `Hola, ${usuario.nombre}` : 'Hola 👋'}
          </Text>
        ) : (
          <Text style={styles.titulo} numberOfLines={1}>
            {titulo}
          </Text>
        )}
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity style={styles.iconBtn} onPress={abrirBusqueda}>
          <Feather name="search" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    zIndex: 250,
  },
  iconBtn: { padding: spacing.xs },
  centro: { flex: 1, paddingHorizontal: spacing.sm },
  saludo: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.text },
  titulo: { fontFamily: fonts.display, fontSize: 18, color: colors.text },
  acciones: { flexDirection: 'row', gap: spacing.sm },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 50,
    paddingHorizontal: spacing.lg,
    height: 40,
    marginRight: spacing.sm,
  },
  searchInput: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 14, padding: 0 },
});
