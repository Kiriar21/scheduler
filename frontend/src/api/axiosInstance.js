import axios from 'axios';
import { checkTokenExpiration } from '../utils/checkTokenExpiration';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || '',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const isTokenValid = checkTokenExpiration();
        if (!isTokenValid) {
            window.location.href = '/login'; // Przekierowanie na logowanie
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
