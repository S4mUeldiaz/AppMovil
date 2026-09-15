import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

  function irABuscar() {
    (navigation.navigate as any)('CatalogoScreen');
  }

  function irAPerfil() {
    if (!usuario) {
      navigation.navigate('LoginScreen' as never);
      return;
    }
    navigation.navigate('PerfilScreen' as never);
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
        <TouchableOpacity style={styles.iconBtn} onPress={irABuscar}>
          <Feather name="search" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={irAPerfil}>
          <Feather name="user" size={20} color={colors.text} />
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
});
