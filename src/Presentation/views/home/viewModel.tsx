import React, { useState } from 'react'

const HomeViewModel = ( ) => {
    const [values, setvalues] = useState({
        email:'',
        password:'',
    });

    const onChange = (property: string, value: any) => {
        setvalues({...values, [property]: value});
    } 

    return{
        ...values,
        onChange
    }
}

export default HomeViewModel;