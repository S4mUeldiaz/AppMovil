import * as React from 'react';
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
import { HomeScreen  } from './src/Presentation/views/home/home';
import { RegisterScreen } from './src/Presentation/views/register/Register';
import { PerfilScreen } from './src/Presentation/views/perfil/PerfilScreen';
import { CarritoScreen } from './src/Presentation/views/carrito/CarritoScreen';
import { FavoritosScreen } from './src/Presentation/views/favoritos/FavoritosScreen';
import { LoginScreen } from './src/Presentation/views/login/Login';
import { DetalleProductoScreen } from './src/Presentation/views/detalleProducto/DetalleProductoScreen';
import { ComprobanteScreen } from './src/Presentation/views/comprobante/ComprobanteScreen';
import { PedidosScreen } from './src/Presentation/views/pedidos/PedidosScreen';
import { CatalogoScreen } from './src/Presentation/views/catalogo/CatalogoScreen';


export type RootStackParamList = {
  HomeScreen: undefined;
  RegisterScreen: undefined;
  LoginScreen: undefined;
  PerfilScreen: undefined;
  CarritoScreen: undefined;
  FavoritosScreen: undefined;
  CatalogoScreen: { categoria?: string } | undefined;
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

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  return (
  <SafeAreaProvider>
  <NavigationContainer>
    <Stack.Navigator id='RootStack' initialRouteName='HomeScreen' screenOptions= {{
      headerShown: false
    }}>

    <Stack.Screen
      name='HomeScreen'
      component={HomeScreen}
      />

    <Stack.Screen
    name='RegisterScreen'
    component={RegisterScreen}
    />

    <Stack.Screen
    name='PerfilScreen'
    component={PerfilScreen}
    />

    <Stack.Screen
    name='CarritoScreen'
    component={CarritoScreen}
    />

    <Stack.Screen
    name='FavoritosScreen'
    component={FavoritosScreen}
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

    <Stack.Screen
    name='CatalogoScreen'
    component={CatalogoScreen}
    />

    </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
  );
};

export default App;
