import { useState } from 'react';
import API from '../api/axiosConfig';
import { AuthContext } from './AuthContext';

const loadStoredUser = () => {
    try {
        const storedUser = localStorage.getItem('userInfo');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        localStorage.removeItem('userInfo');
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(loadStoredUser);
    const [loading, setLoading] = useState(false);

    const persistUser = (data) => {
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
    };

    const login = async (email, password) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            persistUser(data);
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const loginUser = async (credentials) => {
        try {
            const { data } = await API.post('/auth/login', credentials);
            persistUser(data);
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const socialLogin = async (token) => {
        try {
            if (!token) {
                return { success: false, message: 'Missing social login token' };
            }

            localStorage.setItem('userInfo', JSON.stringify({ token }));
            const { data } = await API.get('/auth/me');
            const session = { ...data, token };
            persistUser(session);
            return { success: true, data: session };
        } catch (error) {
            localStorage.removeItem('userInfo');
            setUser(null);
            return { success: false, message: error.response?.data?.message || 'Social login failed' };
        }
    };

    const registerUser = async (payload) => {
        try {
            const { data } = await API.post('/auth/register', payload);
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, loginUser, socialLogin, registerUser, logout, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
