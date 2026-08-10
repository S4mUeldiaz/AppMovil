import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TextInput, ToastAndroid, TouchableOpacity } from 'react-native';
import RoundedButton from "../../components/RoundedButton"; 
import { StackNavigationProp } from "@react-navigation/Stack";
import { RootStackParamList } from '../../../../App';
import { useNavigation } from "@react-navigation/native";
import useViewModel from './viewModel'

export const HomeScreen = () => {

    const {email, password, onChange } = useViewModel();

    const navigation =
    useNavigation <StackNavigationProp<RootStackParamList>>();

return(

    <View style={styles.container}>
      <Image
        source={require('../../../../assets/chef.jpg')}
        style={styles.imageBackground}
        />

      <View style={styles.logoContainer}>
        <Image
          source={require('../../../../assets/logo.png')}
          style={styles.logoImage}
          />
        <Text style={styles.logoText}>FOOD APP</Text>
      </View>

      <View style={styles.form}>

        <Text style={styles.formTitle}>
          INGRESAR
        </Text>

        <View style={styles.formInput}>
          <Image
            style={styles.formIcon}
            source={require('../../../../assets/email.png')}
            />

          <TextInput
            style={styles.formTextInput}
            placeholder="Correo Electrónico"
            keyboardType="email-address"
            value={email}
            onChangeText={ text => onChange('email', text)}
            />
        </View>

        <View style={styles.formInput}>
          <Image
            style={styles.formIcon}
            source={require('../../../../assets/password.png')}
            />

          <TextInput
            style={styles.formTextInput}
            placeholder="Contraseña"
            keyboardType="default"
            secureTextEntry={true}
            value={password}
            onChangeText={ text => onChange('password', text)}
            />
        </View>

        <View style={{marginTop: 30 }}>
          <RoundedButton text = 'ENTRAR' onPress={() => ToastAndroid.show('HOLA',
            ToastAndroid.SHORT)}/>
        </View>

        <View style={styles.formRegister}>
            <Text>No tienes cuenta?</Text>
            <TouchableOpacity onPress={() =>
                navigation.navigate('RegisterScreen')}>
                    <Text style={styles.formRegisterText}>Registrate</Text>
                </TouchableOpacity>

        </View>

      </View>
    </View>
  );
}


const styles = StyleSheet.create({
    
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    imageBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.7,
    },
    logoContainer: {
        position: 'absolute',
        top: '15%',
        alignSelf: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    logoText: {
        marginTop: 10,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    form: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '50%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 30,
        paddingTop: 35,
    },
    formTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 25,
    },
    formInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
        marginBottom: 15,
    },
    formIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
        tintColor: 'orange',
        resizeMode: 'contain',
    },
    formTextInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    RoundeButtonContainer: {
        marginTop: 15,
    },
    formRegister: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 25,
    },
    registerNormal: {
        fontSize: 16,
        color: '#333',
    },
    formRegisterText: {
        marginLeft: 5,
        color: 'orange',
        fontWeight: 'bold',
        fontSize: 16,
    },  
});

export default HomeScreen;