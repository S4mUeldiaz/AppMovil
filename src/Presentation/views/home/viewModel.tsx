import React, { useState } from 'react'
import {ApiDelivery } from '../../../Data/sources/remote/api/ApiDelivery';

const HomeViewModel = ( ) => {
    const [values, setvalues] = useState({
        name: '',
        lastname: '',
        phone: '',
        email:'',
        password:'',
        confirmPassword: '',
    });

    const onChange = (property: string, value: any) => {
        setvalues({...values, [property]: value});
    } 

    const register = async () => {
        try {
            const response = await ApiDelivery.post('/users/create', values);
            console.log('RESPONSE: ' + JSON.stringify(response));
        } catch (error) {
            console.log('ERROR: ' + error);
        }
    }
    return{
        ...values,
        onChange,
        register
    }
}

export default HomeViewModel;