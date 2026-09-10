import axios from 'axios';

const ApiDelivery = axios.create({
    baseURL: 'http://172.20.10.18:3001/api',   headers: {
        'Content-Type': 'application/json'
    }
});

export {ApiDelivery};