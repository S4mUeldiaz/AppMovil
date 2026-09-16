import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { useFonts, InriaSerif_400Regular, InriaSerif_700Bold } from '@expo-google-fonts/inria-serif';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { colors } from './src/Presentation/theme/AppTheme';
import { ItemCarrito } from './src/Data/sources/local/CarritoStorage';
import { obtenerUsuarioActual } from './src/Data/sources/remote/api/Authapi';
import { TabNavigator } from './src/Presentation/navigation/TabNavigator';
import { AdminNavigator } from './src/Presentation/navigation/AdminNavigator';
import { RegisterScreen } from './src/Presentation/views/register/Register';
import { LoginScreen } from './src/Presentation/views/login/Login';
import { DetalleProductoScreen } from './src/Presentation/views/detalleProducto/DetalleProductoScreen';
import { ComprobanteScreen } from './src/Presentation/views/comprobante/ComprobanteScreen';
import { PedidosScreen } from './src/Presentation/views/pedidos/PedidosScreen';


// HomeScreen, CatalogoScreen, CarritoScreen, FavoritosScreen y PerfilScreen ahora
// viven dentro de TabNavigator (bottom tabs), y Usuarios/Pedidos/Inventario admin
// dentro de AdminNavigator. Se mantienen como tipos aquí porque el resto de la app
// navega hacia ellas por nombre: React Navigation resuelve automáticamente screens
// con nombre único dentro de navegadores anidados.
export type RootStackParamList = {
  MainTabs: undefined;
  AdminTabs: undefined;
  HomeScreen: undefined;
  RegisterScreen: undefined;
  LoginScreen: undefined;
  PerfilScreen: undefined;
  CarritoScreen: undefined;
  FavoritosScreen: undefined;
  CatalogoScreen: { categoria?: string; busqueda?: string } | undefined;
  DetalleProductoScreen: { id_producto: number };
  ComprobanteScreen: {
    referencias: string[];
    items: ItemCarrito[];
    metodoPago: string;
    direccionTexto: string;
    total: number;
  };
  PedidosScreen: undefined;
}


const Stack = createNativeStackNavigator<RootStackParamList>();

const App =  () => {
  const [fontsLoaded] = useFonts({
    InriaSerif_400Regular,
    InriaSerif_700Bold,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Determina a qué stack entra un usuario con sesión persistida (admin vs cliente)
  // antes de montar la navegación, para que reabrir la app no mande a un admin a MainTabs.
  const [initialRoute, setInitialRoute] = useState<'MainTabs' | 'AdminTabs' | null>(null);

  useEffect(() => {
    obtenerUsuarioActual().then((usuario) => {
      setInitialRoute(usuario?.nombre_rol === 'admin' ? 'AdminTabs' : 'MainTabs');
    });
  }, []);

  if (!fontsLoaded || !initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  return (
  <SafeAreaProvider>
  <NavigationContainer>
    <Stack.Navigator id='RootStack' initialRouteName={initialRoute} screenOptions= {{
      headerShown: false
    }}>

    <Stack.Screen
      name='MainTabs'
      component={TabNavigator}
      />

    <Stack.Screen
      name='AdminTabs'
      component={AdminNavigator}
      />

    <Stack.Screen
    name='RegisterScreen'
    component={RegisterScreen}
    />

    <Stack.Screen
    name='LoginScreen'
    component={LoginScreen}
    />

    <Stack.Screen
    name='DetalleProductoScreen'
    component={DetalleProductoScreen}
    />

    <Stack.Screen
    name='ComprobanteScreen'
    component={ComprobanteScreen}
    />

    <Stack.Screen
    name='PedidosScreen'
    component={PedidosScreen}
    />

    </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
  );
};

export default App;
