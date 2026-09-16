import React, { useCallback, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../views/home/home';
import { CatalogoScreen } from '../views/catalogo/CatalogoScreen';
import { CarritoScreen } from '../views/carrito/CarritoScreen';
import { FavoritosScreen } from '../views/favoritos/FavoritosScreen';
import { PerfilScreen } from '../views/perfil/PerfilScreen';
import { obtenerCarrito } from '../../Data/sources/local/CarritoStorage';
import { colors, fonts } from '../theme/AppTheme';
import type { RootStackParamList } from '../../../App';

export type MainTabParamList = {
  HomeScreen: undefined;
  CatalogoScreen: { categoria?: string; busqueda?: string } | undefined;
  CarritoScreen: undefined;
  FavoritosScreen: undefined;
  PerfilScreen: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONOS: Record<keyof MainTabParamList, keyof typeof Feather.glyphMap> = {
  HomeScreen: 'home',
  CatalogoScreen: 'grid',
  CarritoScreen: 'shopping-bag',
  FavoritosScreen: 'heart',
  PerfilScreen: 'user',
};

type Props = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

export function TabNavigator({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [carritoCount, setCarritoCount] = useState(0);

  const refrescarCarrito = useCallback(async () => {
    const items = await obtenerCarrito();
    setCarritoCount(items.reduce((acc, i) => acc + i.cantidad, 0));
  }, []);

  useEffect(() => {
    refrescarCarrito();
    return navigation.addListener('focus', refrescarCarrito);
  }, [navigation, refrescarCarrito]);

  return (
    <Tab.Navigator
      screenListeners={{ focus: refrescarCarrito }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodySemiBold, fontSize: 10 },
        tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.background, fontSize: 10 },
        tabBarIcon: ({ color, size, focused }) => (
          <Feather name={ICONOS[route.name as keyof MainTabParamList]} size={focused ? size + 1 : size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="CatalogoScreen" component={CatalogoScreen} options={{ title: 'Catálogo' }} />
      <Tab.Screen
        name="CarritoScreen"
        component={CarritoScreen}
        options={{ title: 'Carrito', tabBarBadge: carritoCount > 0 ? carritoCount : undefined }}
      />
      <Tab.Screen name="FavoritosScreen" component={FavoritosScreen} options={{ title: 'Favoritos' }} />
      <Tab.Screen name="PerfilScreen" component={PerfilScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
