import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
    console.warn(
        'EXPO_PUBLIC_API_URL no está definida. Copia .env.example a .env.local y pon la IP LAN de tu PC.'
    );
}

const ApiDelivery = axios.create({
    baseURL: API_URL ?? 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export {ApiDelivery};