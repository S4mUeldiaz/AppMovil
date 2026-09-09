import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { HomeScreen  } from './src/Presentation/views/home/home';
import { RegisterScreen } from './src/Presentation/views/register/Register';
import { ProfileInfoScreen } from './src/Presentation/views/profile/info/ProfileInfo';
import { ProductsScreen } from './src/Presentation/views/products/Products'
import { LoginScreen } from './src/Presentation/views/login/Login';


export type RootStackParamList = {
  HomeScreen: undefined;
  RegisterScreen: undefined;
  LoginScreen: undefined;
  ProfileInfoScreen: undefined;
  ProductsScreen: undefined;
}


const Stack = createNativeStackNavigator<RootStackParamList>();

const App =  () => {
  return (
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
    name='ProfileInfoScreen'
    component={ProfileInfoScreen}
    />
    <Stack.Screen
    name='ProductsScreen'
    component={ProductsScreen}
    />

    <Stack.Screen
    name='LoginScreen'
    component={LoginScreen}
    />

    </Stack.Navigator>
    </NavigationContainer> 
  );
};

export default App;
