import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminUsuariosScreen } from '../views/admin/usuarios/UsuariosScreen';
import { AdminPedidosScreen } from '../views/admin/pedidos/PedidosScreen';
import { AdminInventarioScreen } from '../views/admin/inventario/InventarioScreen';
import { colors, fonts } from '../theme/AppTheme';

export type AdminTabParamList = {
  AdminUsuariosScreen: undefined;
  AdminPedidosScreen: undefined;
  AdminInventarioScreen: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

const ICONOS: Record<keyof AdminTabParamList, keyof typeof Feather.glyphMap> = {
  AdminUsuariosScreen: 'users',
  AdminPedidosScreen: 'package',
  AdminInventarioScreen: 'box',
};

export function AdminNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
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
        tabBarIcon: ({ color, size, focused }) => (
          <Feather name={ICONOS[route.name as keyof AdminTabParamList]} size={focused ? size + 1 : size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="AdminUsuariosScreen" component={AdminUsuariosScreen} options={{ title: 'Usuarios' }} />
      <Tab.Screen name="AdminPedidosScreen" component={AdminPedidosScreen} options={{ title: 'Pedidos' }} />
      <Tab.Screen name="AdminInventarioScreen" component={AdminInventarioScreen} options={{ title: 'Inventario' }} />
    </Tab.Navigator>
  );
}
