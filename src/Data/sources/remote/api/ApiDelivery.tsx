import axios from 'axios';

const ApiDelivery = axios.create({
    baseURL: 'http://10.1.223.37:3001/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export {ApiDelivery};