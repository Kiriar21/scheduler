/**
 * Tworzy instancję Axios z ustawionym adresem bazowym i interceptorami do obsługi tokenów.
 * @module axiosInstance
 */
import axios from 'axios';
import { checkTokenExpiration } from '../utils/checkTokenExpiration';

//Pobiera base url do serwera
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || '',
});

//Sprawdzaj przy kazdym zapytaniu czy token jest wazny
axiosInstance.interceptors.request.use(
    (config) => {
        const isTokenValid = checkTokenExpiration();
        const currentPath = window.location.pathname;

        if (!isTokenValid && currentPath !== '/login') {
            localStorage.removeItem('token'); // Usuń nieważny token
            window.location.href = '/login'; // Przekierowanie na stronę logowania
            return Promise.reject(new Error('Token wygasł.'));
        }

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
