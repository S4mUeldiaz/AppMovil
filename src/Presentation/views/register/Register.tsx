import React from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, StyleSheet, Image, TextInput, ToastAndroid, Touchable, TouchableOpacity } from 'react-native';
import RoundedButton from "../../components/RoundedButton"; 
import { StackNavigationProp } from "@react-navigation/Stack";
import { RootStackParamList } from '../../../../App';

export const RegisterScreen = () => {
    return (
     <View style={styles.container}>
       <Image
        source={require('../../../../assets/chef.jpg')}
        style={styles.imageBackground}/>

      <View style={styles.logoContainer}>
        <Image
          source={require('../../../../assets/user_image.png')}
          style={styles.logoImage}/>
        <Text style={styles.logoText}>SELECCIONA UNA IMAGEN</Text>
      </View>

      <View style={styles.form}>
        
        <Text style={styles.formText}>REGISTRARSE</Text>

        <View style={styles.formInput}>
          <Image
            style={styles.formIcon}
            source={require('../../../../assets/user.png')}
            />

          <TextInput
            style={styles.formTextInput}
            placeholder= 'Nombres'
            keyboardType= 'default'
            />
        </View>

        <View style={styles.formInput}>
          <Image
            style={styles.formIcon}
            source={require('../../../../assets/my_user.png')}/>

        <TextInput
            style={styles.formTextInput}
            placeholder= "Apellidos"
            keyboardType= "default"
            secureTextEntry= {true}
            />
        </View>

        <View style={styles.formInput}>
          <Image
            style={styles.formIcon}
            source={require('../../../../assets/email.png')}/>

          <TextInput
            style={styles.formTextInput}
            placeholder= 'Correo Electronico'
            keyboardType="email-address"
            secureTextEntry={true}
            />
        </View>

        <View style={styles.formInput}>
          <Image
            style={styles.formIcon}
            source={require('../../../../assets/phone.png')}/>

          <TextInput
            style={styles.formTextInput}
            placeholder= "telefono"
            keyboardType="numeric"
            secureTextEntry={true}
            />
        </View>

          <View style={styles.formInput}>
          <Image
            style={styles.formIcon}
            source={require('../../../../assets/password.png')}/>

            <TextInput
            style={styles.formTextInput}
            placeholder= "contraseña"
            keyboardType="default"
            secureTextEntry={true}
            />
        </View>


          <View style={styles.formInput}>
          <Image
            style={styles.formIcon}
            source={require('../../../../assets/confirm_password.png')}/>

            <TextInput
            style={styles.formTextInput}
            placeholder= " confirmar contraseña"
            keyboardType="default"
            secureTextEntry={true}
            />
        </View>

        <View style={{marginTop: 30 }}>
          <RoundedButton text ='CONFIRMAR' onPress={() => ToastAndroid.show(
            'HOLA',ToastAndroid.SHORT)}/>
            </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    imageBackground: {
        width: '100%',
        height: '100%',
        opacity: 0.7,
        bottom: '30%'
    },
    form: {
        width: '100%',
        height: '75%',
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        borderTopLeftRadius: 40,
        borderBottomRightRadius: 40,
        padding: 30,
    },
    formText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    formIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
        tintColor: 'orange',
        resizeMode: 'contain',
    },
    formInput: {
        flexDirection: 'row',
        marginTop: 30,
    },
    formTextInput: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#AAAAAA',
        marginLeft: 15,
    },
    formRegister: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    formRegisterText: {
        marginLeft: 5,
        color: 'orange',
        fontWeight: 'bold',
        fontSize: 16,
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
    },
    logoText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
        marginTop: 10,
        fontWeight: 'bold',
    },

});
