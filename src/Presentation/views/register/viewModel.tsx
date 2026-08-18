import React, { useState } from "react";
import { ApiDelivery } from "../../../Data/sources/remote/api/ApiDelivery";
import { RegisterAuthUseCase } from "../../../Domain/UseCases/auth/RegisterAuth";

const RegisterViewModel = () => {
    const [errorMessage, setErrorMessage] = useState('')
    const [values, setValues] = useState({
        name: '',
        lastname: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const onChange = (property: string, value: any) => {
        setValues({ ...values, [property]: value });
    }

    const register = async () => {
        if(!isValidForm()) {
        const response = await RegisterAuthUseCase(values);
        console.log('Result' + JSON.stringify(response));
        }
    }

    const isValidForm = (): boolean => {
        if (values.name === '') {
            setErrorMessage('El nombre es requerido');
            return false;
        }
        if(values.lastname === '') {
            setErrorMessage('El apellido es requerido');
            return false;
        }
        if(values.email === '') {
            setErrorMessage('El correo es requerido');
            return false;
        }
        if(values.phone === '') {
            setErrorMessage('El telefono es requerido');
            return false;
        }
        if(values.password === '') {
            setErrorMessage('La contraseña es requerida');
            return false;
        }
        if(values.confirmPassword === '') {
            setErrorMessage('La confirmacion de contraseña es requerida');
            return false;
        }
        if(values.password === values.confirmPassword) {
            return false;
        }else {
            setErrorMessage('Las contraseñas no coinciden');
            return true;
        };
    }

    return {
        ...values,
        onChange,
        register,
        errorMessage
    }
}

export default RegisterViewModel;