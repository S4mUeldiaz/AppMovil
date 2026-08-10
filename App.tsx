import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { HomeScreen  } from './src/views/home/home'
import { RegisterScreen} from './src/views/register/Register'


const Stack = createNativeStackNavigator();

const App =  () => {
  return (
  <NavigationContainer>
    <Stack.Navigator screenOptions= {{
      headerShown: false
    }}>   

    <Stack.Screen
      name= 'HomeScreen'
      component={HomeScreen}
      />

      <Stack.Screen
      name= "RegisterScreen"
      component= {RegisterScreen}
      options={{
        headerShown: true,
        title: 'Nuevo Usuario'
      }} />

    </Stack.Navigator>
    </NavigationContainer> 
  );
};

export default App;
