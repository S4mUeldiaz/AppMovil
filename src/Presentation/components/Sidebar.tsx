import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCategorias, Categoria } from '../../Data/sources/remote/api/ProductosApi';
import { logout, UsuarioSesion } from '../../Data/sources/remote/api/Authapi';
import { colors, spacing } from '../theme/AppTheme';

const SIDEBAR_WIDTH = 280;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SidebarProps {
  abierto: boolean;
  onCerrar: () => void;
  usuario: UsuarioSesion | null;
  onLogout: () => void;
}

export function Sidebar({ abierto, onCerrar, usuario, onLogout }: SidebarProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: abierto ? 0 : -SIDEBAR_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: abierto ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [abierto]);

  function irACategoria(id_categoria: number) {
    onCerrar();
    (navigation.navigate as any)('CatalogoScreen', { categoria: id_categoria });
  }

  function irAInicio() {
    onCerrar();
    navigation.navigate('HomeScreen' as never);
  }

  function irACatalogo() {
    onCerrar();
    (navigation.navigate as any)('CatalogoScreen');
  }

  function irACarrito() {
    onCerrar();
    navigation.navigate('CarritoScreen' as never);
  }

  function irAFavoritos() {
    onCerrar();
    if (!usuario) {
      navigation.navigate('LoginScreen' as never);
      return;
    }
    navigation.navigate('FavoritosScreen' as never);
  }

  function irAPedidos() {
    onCerrar();
    if (!usuario) {
      navigation.navigate('LoginScreen' as never);
      return;
    }
    navigation.navigate('PedidosScreen' as never);
  }

  async function handleLogout() {
    await logout();
    onLogout();
    onCerrar();
  }

  return (
    <>
      <Animated.View
        pointerEvents={abierto ? 'auto' : 'none'}
        style={[styles.overlay, { opacity: overlayOpacity }]}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onCerrar} />
      </Animated.View>

      <Animated.View
        style={[styles.sidebar, { paddingTop: insets.top + spacing.xl, transform: [{ translateX }] }]}
      >
        <TouchableOpacity style={styles.closeBtn} onPress={onCerrar}>
          <Feather name="x" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.nav}>
          <TouchableOpacity style={styles.link} onPress={irAInicio}>
            <Text style={styles.linkText}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link} onPress={irACatalogo}>
            <Text style={styles.linkText}>Catálogo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link} onPress={irACarrito}>
            <Text style={styles.linkText}>Carrito</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link} onPress={irAFavoritos}>
            <Text style={styles.linkText}>Favoritos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link} onPress={irAPedidos}>
            <Text style={styles.linkText}>Mis pedidos</Text>
          </TouchableOpacity>

          <View style={styles.navDivider} />

          {categorias.map((c) => (
            <TouchableOpacity
              key={c.id_categoria}
              style={styles.link}
              onPress={() => irACategoria(c.id_categoria)}
            >
              <Text style={styles.linkText}>{c.nombre_categoria}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          {usuario ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  onCerrar();
                  navigation.navigate('PerfilScreen' as never);
                }}
              >
                <Text style={styles.footerLink}>Mi perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Feather name="log-out" size={14} color={colors.primary} />
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  onCerrar();
                  navigation.navigate('LoginScreen' as never);
                }}
              >
                <Text style={styles.footerLink}>Iniciar sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onCerrar();
                  Alert.alert('Próximamente', 'La página de contacto todavía está en construcción.');
                }}
              >
                <Text style={styles.footerLink}>Contáctanos</Text>
              </TouchableOpacity>
              <Text style={styles.email}>velysh329@gmail.com</Text>
            </>
          )}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 200,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.backgroundCard,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    zIndex: 300,
    padding: 24,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  nav: {
    flex: 1,
    gap: 4,
  },
  link: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  linkText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  navDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 24,
    gap: 12,
  },
  footerLink: {
    fontSize: 14,
    color: colors.textMuted,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    color: colors.primary,
  },
  email: {
    fontSize: 12,
    color: colors.textMuted,
  },
});