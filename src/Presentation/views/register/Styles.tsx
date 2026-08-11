import { StyleSheet } from "react-native/";



const RegisterStyles = StyleSheet.create({
    
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
    formText:{
        fontWeight:'bold',
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
        resizeMode: 'contain',
    },
    logoText: {
        marginTop: 10,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    formRegister: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 25,
    },
    formRegisterText: {
        marginLeft: 5,
        color: 'orange',
        fontWeight: 'bold',
        fontSize: 16,
    },  
    formTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 25,
    },
});

export default RegisterStyles;
