import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const AUTH_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const API = axios.create({
    baseURL: API_BASE_URL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT || 20000),
    withCredentials: true
});

API.interceptors.request.use((req) => {
    const userInfo = localStorage.getItem('userInfo');
    console.log('Interceptor: userInfo from localStorage:', userInfo);
    if (userInfo) {
        try {
            const { token } = JSON.parse(userInfo);
            console.log('Interceptor: Token found:', token);
            req.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
            console.error('Interceptor: Error parsing userInfo JSON:', error);
        }
    } else {
        console.log('Interceptor: No userInfo found in localStorage.');
    }
    return req;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Response Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            detail: error.response?.data?.detail || error.response?.data?.message
        });
        return Promise.reject(error);
    }
);

export default API;
