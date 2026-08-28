import React, { useEffect, useState } from 'react';
import { LoginAuthUseCase } from '../../../Domain/UseCases/auth/Login.Auth';
import { SaveUserLocalUseCase } from '../../../Domain/UseCases/userLocal/SaveUserLocal';
import { GetUserLocalUseCase } from '../../../Domain/UseCases/userLocal/GetUserLocal';
import { useUserLocal } from '../../hooks/useUserLocal'

const HomeViewModel = () => {
    const [errorMessage, setErrorMessage] = useState( '' );
    const [values, setValues] = useState({
        email:'',
        password:'',
    });

    const { user, getUserSession } = useUserLocal();
     console.log('Usuario: ' + JSON.stringify(user));


     useEffect(() => {
        getUserSession();
    }, []);

    const onChange = (property: string, value: any) => {
        setValues({... values, [property]: value});
    }

    const login = async () => {
        if (!isValidForm()) return false;

        const response = await LoginAuthUseCase(values.email, values.password);
        console.log('Respuesta: ' + JSON.stringify(response));
        if(!response.success){
            setErrorMessage(response.message);
            return false;
        }

        await SaveUserLocalUseCase(response.data);
        return true;
    };

    const isValidForm = () => {
        if(values.email === '') {
            setErrorMessage('El email es requerido');
            return false;
        }
        if(values.password === '') {
            setErrorMessage('La contraseña es requerida');
            return false;
        }
    return true;
    }
    
    return {
       ...values,
        user,
        onChange,
        login,
        errorMessage
    }
};
export default HomeViewModel;